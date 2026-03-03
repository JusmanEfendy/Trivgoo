const { pool } = require('../config/database');

const Room = {
    /**
     * Get available rooms for a hotel with date/guest filtering
     */
    async findAvailable(hotelId, { checkIn, checkOut, guests }) {
        const query = `
      SELECT r.* FROM rooms r
      WHERE r.hotel_id = ?
      AND r.capacity >= ?
      AND r.id NOT IN (
        SELECT b.room_id FROM bookings b
        WHERE b.status != 'cancelled'
        AND b.check_in_date < ? AND b.check_out_date > ?
      )
      ORDER BY r.price_per_night ASC
    `;

        const [rows] = await pool.execute(query, [hotelId, guests, checkOut, checkIn]);
        return rows;
    },

    /**
     * Get all rooms for a hotel (admin)
     */
    async findByHotelId(hotelId) {
        const [rows] = await pool.execute(
            'SELECT * FROM rooms WHERE hotel_id = ? ORDER BY room_type ASC',
            [hotelId]
        );
        return rows;
    },

    /**
     * Get room by ID
     */
    async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM rooms WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * Check if room is available for given dates
     */
    async isAvailable(roomId, checkIn, checkOut) {
        const query = `
      SELECT COUNT(*) AS conflict_count FROM bookings
      WHERE room_id = ?
      AND status != 'cancelled'
      AND check_in_date < ? AND check_out_date > ?
    `;
        const [rows] = await pool.execute(query, [roomId, checkOut, checkIn]);
        return rows[0].conflict_count === 0;
    },

    /**
     * Create room
     */
    async create({ hotel_id, room_type, capacity, price_per_night, description }) {
        const [result] = await pool.execute(
            'INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES (?, ?, ?, ?, ?)',
            [hotel_id, room_type, capacity, price_per_night, description || null]
        );
        return { id: result.insertId, hotel_id, room_type, capacity, price_per_night, description };
    },

    /**
     * Update room
     */
    async update(id, { room_type, capacity, price_per_night, description }) {
        await pool.execute(
            'UPDATE rooms SET room_type = ?, capacity = ?, price_per_night = ?, description = ? WHERE id = ?',
            [room_type, capacity, price_per_night, description || null, id]
        );
        return this.findById(id);
    },

    /**
     * Delete room
     */
    async delete(id) {
        const [result] = await pool.execute('DELETE FROM rooms WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
};

module.exports = Room;
