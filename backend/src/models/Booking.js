const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Booking = {
    /**
     * Create a booking with transaction (race condition prevention)
     */
    async create({ room_id, guest_name, guest_email, check_in_date, check_out_date, total_price }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Lock the room row to prevent race conditions
            const [conflicts] = await connection.execute(
                `SELECT COUNT(*) AS conflict_count FROM bookings
         WHERE room_id = ?
         AND status != 'cancelled'
         AND check_in_date < ? AND check_out_date > ?
         FOR UPDATE`,
                [room_id, check_out_date, check_in_date]
            );

            if (conflicts[0].conflict_count > 0) {
                await connection.rollback();
                const error = new Error('Room is no longer available for the selected dates');
                error.statusCode = 409;
                throw error;
            }

            const booking_ref = uuidv4();

            const [result] = await connection.execute(
                `INSERT INTO bookings (room_id, booking_ref, guest_name, guest_email, check_in_date, check_out_date, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
                [room_id, booking_ref, guest_name, guest_email, check_in_date, check_out_date, total_price]
            );

            await connection.commit();

            return {
                id: result.insertId,
                booking_ref,
                room_id,
                guest_name,
                guest_email,
                check_in_date,
                check_out_date,
                total_price,
                status: 'confirmed',
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Find booking by reference number
     */
    async findByRef(bookingRef) {
        const query = `
      SELECT b.*, r.room_type, r.hotel_id, h.name AS hotel_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE b.booking_ref = ?
    `;
        const [rows] = await pool.execute(query, [bookingRef]);
        return rows[0] || null;
    },

    /**
     * Get all bookings (admin) with pagination
     */
    async findAll({ page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const query = `
      SELECT b.*, r.room_type, r.hotel_id, h.name AS hotel_name
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN hotels h ON r.hotel_id = h.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const [rows] = await pool.execute(query, [String(limit), String(offset)]);

        const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM bookings');

        return {
            data: rows,
            pagination: {
                page,
                limit,
                total: countRows[0].total,
                totalPages: Math.ceil(countRows[0].total / limit),
            },
        };
    },

    /**
     * Cancel a booking
     */
    async cancel(bookingRef) {
        const [result] = await pool.execute(
            "UPDATE bookings SET status = 'cancelled' WHERE booking_ref = ? AND status = 'confirmed'",
            [bookingRef]
        );
        return result.affectedRows > 0;
    },
};

module.exports = Booking;
