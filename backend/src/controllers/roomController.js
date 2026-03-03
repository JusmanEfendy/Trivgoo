const Room = require('../models/Room');
const { z } = require('zod');

const roomSchema = z.object({
    hotel_id: z.coerce.number().int().min(1, 'Hotel ID is required'),
    room_type: z.string().min(1, 'Room type is required'),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    price_per_night: z.coerce.number().min(0, 'Price must be positive'),
    description: z.string().optional().default(''),
});

const roomUpdateSchema = z.object({
    room_type: z.string().min(1, 'Room type is required'),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    price_per_night: z.coerce.number().min(0, 'Price must be positive'),
    description: z.string().optional().default(''),
});

const roomController = {
    /**
     * GET /api/admin/hotels/:hotelId/rooms
     */
    async listByHotel(req, res, next) {
        try {
            const rooms = await Room.findByHotelId(req.params.hotelId);
            res.json({ success: true, data: rooms });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/rooms
     */
    async create(req, res, next) {
        try {
            const data = roomSchema.parse(req.body);
            const room = await Room.create(data);
            res.status(201).json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/rooms/:id
     */
    async update(req, res, next) {
        try {
            const existing = await Room.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            const data = roomUpdateSchema.parse(req.body);
            const room = await Room.update(req.params.id, data);
            res.json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/rooms/:id
     */
    async delete(req, res, next) {
        try {
            const deleted = await Room.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }
            res.json({ success: true, message: 'Room deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = roomController;
