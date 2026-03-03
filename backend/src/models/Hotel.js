const { pool } = require('../config/database');

const Hotel = {
    /**
     * Search hotels by city with available rooms for given dates and guests
     */
    async search({ city, checkIn, checkOut, guests, page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const query = `
      SELECT DISTINCT h.*,
        (SELECT MIN(r.price_per_night) FROM rooms r 
         WHERE r.hotel_id = h.id 
         AND r.capacity >= ?
         AND r.id NOT IN (
           SELECT b.room_id FROM bookings b
           WHERE b.status != 'cancelled'
           AND b.check_in_date < ? AND b.check_out_date > ?
         )
        ) AS min_price,
        (SELECT COUNT(*) FROM rooms r 
         WHERE r.hotel_id = h.id 
         AND r.capacity >= ?
         AND r.id NOT IN (
           SELECT b.room_id FROM bookings b
           WHERE b.status != 'cancelled'
           AND b.check_in_date < ? AND b.check_out_date > ?
         )
        ) AS available_rooms_count
      FROM hotels h
      WHERE h.city LIKE ?
      HAVING available_rooms_count > 0
      ORDER BY h.name ASC
      LIMIT ? OFFSET ?
    `;

        const [rows] = await pool.execute(query, [
            guests, checkOut, checkIn,
            guests, checkOut, checkIn,
            `%${city}%`,
            String(limit), String(offset),
        ]);

        // Count total
        const countQuery = `
      SELECT COUNT(DISTINCT h.id) AS total
      FROM hotels h
      WHERE h.city LIKE ?
      AND EXISTS (
        SELECT 1 FROM rooms r
        WHERE r.hotel_id = h.id
        AND r.capacity >= ?
        AND r.id NOT IN (
          SELECT b.room_id FROM bookings b
          WHERE b.status != 'cancelled'
          AND b.check_in_date < ? AND b.check_out_date > ?
        )
      )
    `;

        const [countRows] = await pool.execute(countQuery, [
            `%${city}%`, guests, checkOut, checkIn,
        ]);

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
     * Get hotel by ID
     */
    async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM hotels WHERE id = ?', [id]);
        return rows[0] || null;
    },

    /**
     * Get all hotels (admin)
     */
    async findAll() {
        const [rows] = await pool.execute('SELECT * FROM hotels ORDER BY created_at DESC');
        return rows;
    },

    /**
     * Create hotel
     */
    async create({ name, city, address, description, image_url }) {
        const [result] = await pool.execute(
            'INSERT INTO hotels (name, city, address, description, image_url) VALUES (?, ?, ?, ?, ?)',
            [name, city, address, description, image_url || null]
        );
        return { id: result.insertId, name, city, address, description, image_url };
    },

    /**
     * Update hotel
     */
    async update(id, { name, city, address, description, image_url }) {
        await pool.execute(
            'UPDATE hotels SET name = ?, city = ?, address = ?, description = ?, image_url = ? WHERE id = ?',
            [name, city, address, description, image_url || null, id]
        );
        return this.findById(id);
    },

    /**
     * Delete hotel
     */
    async delete(id) {
        const [result] = await pool.execute('DELETE FROM hotels WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
};

module.exports = Hotel;
