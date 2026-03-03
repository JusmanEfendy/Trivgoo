const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { z } = require('zod');

const bookingSchema = z.object({
    room_id: z.coerce.number().int().min(1, 'Room ID is required'),
    guest_name: z.string().min(1, 'Guest name is required'),
    guest_email: z.string().email('Invalid email address'),
    check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

const bookingController = {
    /**
     * POST /api/bookings
     */
    async create(req, res, next) {
        try {
            const data = bookingSchema.parse(req.body);

            // Validate check_out > check_in
            if (new Date(data.check_out_date) <= new Date(data.check_in_date)) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-out date must be after check-in date',
                });
            }

            // Validate check_in is not in the past (timezone-safe)
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (data.check_in_date < todayStr) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-in date cannot be in the past',
                });
            }

            // Verify room exists
            const room = await Room.findById(data.room_id);
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            // Calculate total price
            const nights = Math.ceil(
                (new Date(data.check_out_date) - new Date(data.check_in_date)) / (1000 * 60 * 60 * 24)
            );
            const total_price = room.price_per_night * nights;

            // Create booking (with transaction & race condition prevention)
            const booking = await Booking.create({
                ...data,
                total_price,
            });

            res.status(201).json({
                success: true,
                data: {
                    ...booking,
                    hotel_name: undefined,
                    room_type: room.room_type,
                    nights,
                },
                message: `Booking confirmed! Reference: ${booking.booking_ref}`,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/bookings/:ref
     */
    async findByRef(req, res, next) {
        try {
            const booking = await Booking.findByRef(req.params.ref);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    },

    // ===== ADMIN =====

    /**
     * GET /api/admin/bookings
     */
    async list(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await Booking.findAll({ page, limit });
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/bookings/:ref/cancel
     */
    async cancel(req, res, next) {
        try {
            const cancelled = await Booking.cancel(req.params.ref);
            if (!cancelled) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or already cancelled',
                });
            }
            res.json({ success: true, message: 'Booking cancelled successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = bookingController;
