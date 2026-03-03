-- =============================================
-- Booking Engine - Database Migration
-- =============================================

-- Create database
CREATE DATABASE IF NOT EXISTS booking_engine;
USE booking_engine;

-- =============================================
-- TABLE: hotels
-- =============================================
CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: rooms
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id INT NOT NULL,
  room_type VARCHAR(100) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  price_per_night DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_hotel_id (hotel_id),
  INDEX idx_capacity (capacity),
  INDEX idx_price (price_per_night),
  
  CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) 
    REFERENCES hotels(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLE: bookings
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  booking_ref VARCHAR(36) NOT NULL UNIQUE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status ENUM('confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_booking_ref (booking_ref),
  INDEX idx_room_dates (room_id, check_in_date, check_out_date),
  INDEX idx_status (status),
  INDEX idx_guest_email (guest_email),
  
  CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) 
    REFERENCES rooms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
  -- Constraint: check_out must be after check_in
  CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================
-- SEED DATA
-- =============================================

-- Hotels
INSERT INTO hotels (name, city, address, description, image_url) VALUES
('Grand Hyatt Bali', 'Bali', 'Jl. Nusa Dua Selatan, Nusa Dua, Bali', 'Hotel bintang 5 di kawasan Nusa Dua dengan pemandangan laut yang spektakuler, kolam renang infinity, dan akses langsung ke pantai.', 'https://placehold.co/600x400?text=Grand+Hyatt+Bali'),
('The Mulia Resort', 'Bali', 'Jl. Raya Nusa Dua Selatan, Kawasan BTDC, Bali', 'Resort mewah all-suite di tepi pantai Nusa Dua dengan spa kelas dunia dan 6 restoran pilihan.', 'https://placehold.co/600x400?text=Mulia+Resort'),
('Hotel Indonesia Kempinski', 'Jakarta', 'Jl. MH Thamrin No.1, Jakarta Pusat', 'Hotel ikonik di jantung Jakarta dengan arsitektur megah, rooftop pool, dan lokasi strategis di Bundaran HI.', 'https://placehold.co/600x400?text=Hotel+Indonesia'),
('Shangri-La Jakarta', 'Jakarta', 'Jl. Jend. Sudirman Kav. 1, Jakarta Pusat', 'Hotel premium di pusat bisnis Jakarta menawarkan kamar luas, executive lounge, dan restoran fine dining.', 'https://placehold.co/600x400?text=Shangri-La+Jakarta'),
('Padma Resort Ubud', 'Bali', 'Banjar Carik, Desa Puhu, Payangan, Ubud, Bali', 'Resort tropis di tengah lembah sungai Ayung dengan infinity pool sepanjang 89 meter dan pemandangan hutan.', 'https://placehold.co/600x400?text=Padma+Ubud'),
('Tugu Hotel Malang', 'Malang', 'Jl. Tugu No.3, Klojen, Malang, Jawa Timur', 'Hotel bersejarah dengan koleksi seni Indonesia yang luar biasa, restoran heritage, dan suasana kolonial.', 'https://placehold.co/600x400?text=Tugu+Malang'),
('Ayana Resort Bali', 'Bali', 'Jl. Karang Mas Sejahtera, Jimbaran, Bali', 'Resort di tebing Jimbaran dengan Rock Bar terkenal, 12 restoran, dan akses ke pantai privat.', 'https://placehold.co/600x400?text=Ayana+Bali');

-- Rooms for Grand Hyatt Bali (hotel_id = 1)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(1, 'Standard Room', 2, 1500000.00, 'Kamar standar dengan pemandangan taman, luas 36 sqm, king bed'),
(1, 'Deluxe Ocean View', 2, 2500000.00, 'Kamar deluxe dengan pemandangan laut, luas 42 sqm, balkon privat'),
(1, 'Grand Suite', 4, 5000000.00, 'Suite mewah dengan ruang tamu terpisah, luas 72 sqm, pemandangan laut'),
(1, 'Family Room', 4, 3500000.00, 'Kamar keluarga luas dengan 2 queen beds, luas 56 sqm');

-- Rooms for The Mulia Resort (hotel_id = 2)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(2, 'The Mulia Suite', 2, 4000000.00, 'Suite premium dengan butler service, luas 108 sqm'),
(2, 'Earl Suite', 3, 6000000.00, 'Suite eksklusif dengan jacuzzi privat dan pemandangan laut'),
(2, 'Marquess Suite', 4, 8500000.00, 'Suite terbesar dengan 2 kamar tidur, ruang tamu, dan teras luas');

-- Rooms for Hotel Indonesia Kempinski (hotel_id = 3)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(3, 'Superior Room', 2, 2000000.00, 'Kamar modern di jantung Jakarta, luas 40 sqm'),
(3, 'Deluxe Room', 2, 2800000.00, 'Kamar deluxe dengan city view, luas 48 sqm'),
(3, 'Executive Suite', 3, 5500000.00, 'Suite eksekutif dengan akses lounge, luas 75 sqm'),
(3, 'Presidential Suite', 4, 15000000.00, 'Suite presiden dengan butler, ruang makan, dan panoramic view');

-- Rooms for Shangri-La Jakarta (hotel_id = 4)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(4, 'Deluxe Room', 2, 1800000.00, 'Kamar deluxe nyaman dengan city view, luas 38 sqm'),
(4, 'Executive Room', 2, 2500000.00, 'Kamar eksekutif dengan akses Horizon Club lounge'),
(4, 'Suite', 3, 4500000.00, 'Suite luas dengan ruang tamu terpisah, luas 68 sqm');

-- Rooms for Padma Resort Ubud (hotel_id = 5)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(5, 'Deluxe Room', 2, 2200000.00, 'Kamar dengan pemandangan lembah, luas 44 sqm'),
(5, 'Premier Room', 2, 3000000.00, 'Kamar premium dengan balkon dan valley view'),
(5, 'One Bedroom Villa', 2, 5500000.00, 'Villa privat dengan plunge pool dan pemandangan sungai'),
(5, 'Two Bedroom Villa', 4, 8000000.00, 'Villa besar dengan 2 kamar, private pool, dan living area');

-- Rooms for Tugu Hotel Malang (hotel_id = 6)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(6, 'Babah Suite', 2, 900000.00, 'Suite bertema Peranakan dengan furnitur antik'),
(6, 'Residence Suite', 3, 1200000.00, 'Suite heritage luas dengan seni tradisional'),
(6, 'Opa Suite', 2, 1500000.00, 'Suite premium dengan bathtub vintage dan teras privat');

-- Rooms for Ayana Resort Bali (hotel_id = 7)
INSERT INTO rooms (hotel_id, room_type, capacity, price_per_night, description) VALUES
(7, 'Resort View Room', 2, 2000000.00, 'Kamar dengan resort view, luas 38 sqm'),
(7, 'Ocean View Room', 2, 3000000.00, 'Kamar ocean view di tebing Jimbaran, luas 42 sqm'),
(7, 'Villa with Pool', 3, 7000000.00, 'Villa privat dengan infinity pool dan ocean view'),
(7, 'Two Bedroom Villa', 5, 12000000.00, 'Villa mewah dengan 2 kamar, pool, dan butler service');

-- Sample bookings
INSERT INTO bookings (room_id, booking_ref, guest_name, guest_email, check_in_date, check_out_date, total_price, status) VALUES
(1, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'John Smith', 'john@example.com', '2026-03-10', '2026-03-13', 4500000.00, 'confirmed'),
(5, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Jane Doe', 'jane@example.com', '2026-03-15', '2026-03-18', 12000000.00, 'confirmed'),
(8, 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Budi Santoso', 'budi@example.com', '2026-03-20', '2026-03-22', 4000000.00, 'confirmed');
