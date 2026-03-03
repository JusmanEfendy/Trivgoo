import axios from 'axios';
import { Platform } from 'react-native';

// Auto-detect the correct API URL based on platform
// Web/iOS simulator: localhost works directly
// Android emulator: 10.0.2.2 maps to host machine's localhost
// Physical device: replace with your computer's local IP (e.g., 192.168.x.x)
const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===== PUBLIC APIs =====

export const searchHotels = async ({ city, checkIn, checkOut, guests, page = 1 }) => {
    const res = await api.get('/hotels/search', {
        params: { city, check_in: checkIn, check_out: checkOut, guests, page },
    });
    return res.data;
};

export const getHotelDetail = async (id, { checkIn, checkOut, guests }) => {
    const res = await api.get(`/hotels/${id}`, {
        params: { check_in: checkIn, check_out: checkOut, guests },
    });
    return res.data;
};

export const createBooking = async ({ roomId, guestName, guestEmail, checkInDate, checkOutDate }) => {
    const res = await api.post('/bookings', {
        room_id: roomId,
        guest_name: guestName,
        guest_email: guestEmail,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
    });
    return res.data;
};

export const getBookingByRef = async (ref) => {
    const res = await api.get(`/bookings/${ref}`);
    return res.data;
};

// ===== ADMIN APIs =====

export const getAdminHotels = async () => {
    const res = await api.get('/admin/hotels');
    return res.data;
};

export const createHotel = async (data) => {
    const res = await api.post('/admin/hotels', data);
    return res.data;
};

export const updateHotel = async (id, data) => {
    const res = await api.put(`/admin/hotels/${id}`, data);
    return res.data;
};

export const deleteHotel = async (id) => {
    const res = await api.delete(`/admin/hotels/${id}`);
    return res.data;
};

export const getHotelRooms = async (hotelId) => {
    const res = await api.get(`/admin/hotels/${hotelId}/rooms`);
    return res.data;
};

export const createRoom = async (data) => {
    const res = await api.post('/admin/rooms', data);
    return res.data;
};

export const updateRoom = async (id, data) => {
    const res = await api.put(`/admin/rooms/${id}`, data);
    return res.data;
};

export const deleteRoom = async (id) => {
    const res = await api.delete(`/admin/rooms/${id}`);
    return res.data;
};

export const getAdminBookings = async (page = 1) => {
    const res = await api.get('/admin/bookings', { params: { page } });
    return res.data;
};

export const cancelBooking = async (ref) => {
    const res = await api.put(`/admin/bookings/${ref}/cancel`);
    return res.data;
};

export default api;
