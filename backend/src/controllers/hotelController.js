const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { z } = require('zod');

// Validation schemas
const searchSchema = z.object({
    city: z.string().min(1, 'City is required'),
    check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    guests: z.coerce.number().int().min(1, 'At least 1 guest required'),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

const hotelSchema = z.object({
    name: z.string().min(1, 'Hotel name is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    description: z.string().optional().default(''),
    image_url: z.string().url().optional().nullable(),
});

const hotelController = {
    /**
     * GET /api/hotels/search?city=&check_in=&check_out=&guests=
     */
    async search(req, res, next) {
        try {
            const params = searchSchema.parse(req.query);

            // Validate check_out > check_in
            if (new Date(params.check_out) <= new Date(params.check_in)) {
                return res.status(400).json({
                    success: false,
                    message: 'Check-out date must be after check-in date',
                });
            }

            const result = await Hotel.search({
                city: params.city,
                checkIn: params.check_in,
                checkOut: params.check_out,
                guests: params.guests,
                page: params.page,
                limit: params.limit,
            });

            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/hotels/:id?check_in=&check_out=&guests=
     */
    async detail(req, res, next) {
        try {
            const hotel = await Hotel.findById(req.params.id);
            if (!hotel) {
                return res.status(404).json({ success: false, message: 'Hotel not found' });
            }

            let availableRooms = [];
            const { check_in, check_out, guests } = req.query;

            if (check_in && check_out && guests) {
                availableRooms = await Room.findAvailable(hotel.id, {
                    checkIn: check_in,
                    checkOut: check_out,
                    guests: parseInt(guests),
                });

                // Calculate total price for each room
                const nights = Math.ceil(
                    (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24)
                );
                availableRooms = availableRooms.map((room) => ({
                    ...room,
                    nights,
                    total_price: room.price_per_night * nights,
                }));
            } else {
                // If no dates, show all rooms
                availableRooms = await Room.findByHotelId(hotel.id);
            }

            res.json({
                success: true,
                data: { ...hotel, rooms: availableRooms },
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== ADMIN =====

    /**
     * GET /api/admin/hotels
     */
    async list(req, res, next) {
        try {
            const hotels = await Hotel.findAll();
            res.json({ success: true, data: hotels });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/hotels
     */
    async create(req, res, next) {
        try {
            const data = hotelSchema.parse(req.body);
            const hotel = await Hotel.create(data);
            res.status(201).json({ success: true, data: hotel });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/hotels/:id
     */
    async update(req, res, next) {
        try {
            const existing = await Hotel.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Hotel not found' });
            }

            const data = hotelSchema.parse(req.body);
            const hotel = await Hotel.update(req.params.id, data);
            res.json({ success: true, data: hotel });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/hotels/:id
     */
    async delete(req, res, next) {
        try {
            const deleted = await Hotel.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Hotel not found' });
            }
            res.json({ success: true, message: 'Hotel deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = hotelController;
