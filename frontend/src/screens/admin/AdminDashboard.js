import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Alert,
    StyleSheet, ActivityIndicator, StatusBar, TextInput, Modal, ScrollView,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import {
    getAdminHotels, createHotel, updateHotel, deleteHotel,
    getHotelRooms, createRoom, updateRoom, deleteRoom,
    getAdminBookings, cancelBooking,
} from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

// ============================================
// Tab: Hotels
// ============================================
const HotelsTab = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [form, setForm] = useState({ name: '', city: '', address: '', description: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminHotels();
            setHotels(data.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, []);

    const resetForm = () => {
        setForm({ name: '', city: '', address: '', description: '' });
        setEditingHotel(null);
        setShowForm(false);
    };

    const handleSave = async () => {
        if (!form.name || !form.city || !form.address) {
            Alert.alert('Error', 'Nama, kota, dan alamat wajib diisi');
            return;
        }
        try {
            if (editingHotel) {
                await updateHotel(editingHotel.id, form);
            } else {
                await createHotel(form);
            }
            resetForm();
            load();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const handleEdit = (hotel) => {
        setForm({ name: hotel.name, city: hotel.city, address: hotel.address, description: hotel.description || '' });
        setEditingHotel(hotel);
        setShowForm(true);
    };

    const handleDelete = (hotel) => {
        Alert.alert('Hapus Hotel', `Hapus "${hotel.name}"?`, [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus', style: 'destructive', onPress: async () => {
                    try { await deleteHotel(hotel.id); load(); } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus');
                    }
                }
            },
        ]);
    };

    return (
        <View style={styles.tab}>
            <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Hotels ({hotels.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                    <Text style={styles.addBtnText}>+ Tambah</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={hotels}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemSub}>📍 {item.city}</Text>
                            </View>
                            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                                <Text style={styles.editBtnText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                <Text style={styles.deleteBtnText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            {/* Form Modal */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingHotel ? 'Edit Hotel' : 'Tambah Hotel'}</Text>
                        <ScrollView>
                            {['name', 'city', 'address', 'description'].map((field) => (
                                <View key={field}>
                                    <Text style={styles.formLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                                    <TextInput
                                        style={[styles.input, field === 'description' && { height: 80, textAlignVertical: 'top' }]}
                                        value={form[field]}
                                        onChangeText={(val) => setForm({ ...form, [field]: val })}
                                        placeholder={`Masukkan ${field}`}
                                        multiline={field === 'description'}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ============================================
// Tab: Rooms
// ============================================
const RoomsTab = () => {
    const [hotels, setHotels] = useState([]);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [form, setForm] = useState({ room_type: '', capacity: '', price_per_night: '', description: '' });

    useEffect(() => {
        (async () => {
            try {
                const data = await getAdminHotels();
                setHotels(data.data);
                if (data.data.length > 0) {
                    setSelectedHotel(data.data[0]);
                }
            } catch (err) { console.error(err); }
        })();
    }, []);

    useEffect(() => {
        if (selectedHotel) loadRooms();
    }, [selectedHotel]);

    const loadRooms = async () => {
        setLoading(true);
        try {
            const data = await getHotelRooms(selectedHotel.id);
            setRooms(data.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const resetForm = () => {
        setForm({ room_type: '', capacity: '', price_per_night: '', description: '' });
        setEditingRoom(null);
        setShowForm(false);
    };

    const handleSave = async () => {
        if (!form.room_type || !form.capacity || !form.price_per_night) {
            Alert.alert('Error', 'Tipe, kapasitas, dan harga wajib diisi');
            return;
        }
        try {
            if (editingRoom) {
                await updateRoom(editingRoom.id, {
                    room_type: form.room_type,
                    capacity: parseInt(form.capacity),
                    price_per_night: parseFloat(form.price_per_night),
                    description: form.description,
                });
            } else {
                await createRoom({
                    hotel_id: selectedHotel.id,
                    room_type: form.room_type,
                    capacity: parseInt(form.capacity),
                    price_per_night: parseFloat(form.price_per_night),
                    description: form.description,
                });
            }
            resetForm();
            loadRooms();
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const handleEdit = (room) => {
        setForm({
            room_type: room.room_type,
            capacity: String(room.capacity),
            price_per_night: String(room.price_per_night),
            description: room.description || '',
        });
        setEditingRoom(room);
        setShowForm(true);
    };

    const handleDelete = (room) => {
        Alert.alert('Hapus Kamar', `Hapus "${room.room_type}"?`, [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Hapus', style: 'destructive', onPress: async () => {
                    try { await deleteRoom(room.id); loadRooms(); } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || 'Gagal menghapus');
                    }
                }
            },
        ]);
    };

    return (
        <View style={styles.tab}>
            {/* Hotel Selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hotelPicker}>
                {hotels.map((h) => (
                    <TouchableOpacity
                        key={h.id}
                        style={[styles.hotelChip, selectedHotel?.id === h.id && styles.hotelChipActive]}
                        onPress={() => setSelectedHotel(h)}
                    >
                        <Text style={[styles.hotelChipText, selectedHotel?.id === h.id && styles.hotelChipTextActive]}>
                            {h.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Rooms ({rooms.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
                    <Text style={styles.addBtnText}>+ Tambah</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={rooms}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.listItem}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle}>{item.room_type}</Text>
                                <Text style={styles.itemSub}>👥 {item.capacity} | {formatCurrency(item.price_per_night)}/malam</Text>
                            </View>
                            <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                                <Text style={styles.editBtnText}>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                <Text style={styles.deleteBtnText}>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            {/* Form Modal */}
            <Modal visible={showForm} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingRoom ? 'Edit Room' : 'Tambah Room'}</Text>
                        <ScrollView>
                            <Text style={styles.formLabel}>Tipe Kamar</Text>
                            <TextInput style={styles.input} value={form.room_type} onChangeText={(v) => setForm({ ...form, room_type: v })} placeholder="Contoh: Deluxe Room" />
                            <Text style={styles.formLabel}>Kapasitas (orang)</Text>
                            <TextInput style={styles.input} value={form.capacity} onChangeText={(v) => setForm({ ...form, capacity: v })} keyboardType="number-pad" placeholder="2" />
                            <Text style={styles.formLabel}>Harga per Malam (IDR)</Text>
                            <TextInput style={styles.input} value={form.price_per_night} onChangeText={(v) => setForm({ ...form, price_per_night: v })} keyboardType="decimal-pad" placeholder="1500000" />
                            <Text style={styles.formLabel}>Deskripsi</Text>
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline placeholder="Deskripsi kamar" />
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                                <Text style={styles.cancelBtnText}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ============================================
// Tab: Bookings
// ============================================
const BookingsTab = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAdminBookings();
            setBookings(data.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, []);

    const handleCancel = (booking) => {
        Alert.alert('Cancel Booking', `Cancel booking ${booking.booking_ref.slice(0, 8)}...?`, [
            { text: 'Tidak', style: 'cancel' },
            {
                text: 'Cancel', style: 'destructive', onPress: async () => {
                    try { await cancelBooking(booking.booking_ref); load(); } catch (err) {
                        Alert.alert('Error', err.response?.data?.message || 'Gagal cancel');
                    }
                }
            },
        ]);
    };

    return (
        <View style={styles.tab}>
            <View style={styles.tabHeader}>
                <Text style={styles.tabTitle}>Bookings ({bookings.length})</Text>
                <TouchableOpacity style={styles.addBtn} onPress={load}>
                    <Text style={styles.addBtnText}>🔄 Refresh</Text>
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={bookings}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.bookingItem}>
                            <View style={styles.bookingHeader}>
                                <Text style={styles.bookingRef}>#{item.booking_ref.slice(0, 8)}</Text>
                                <View style={[styles.statusBadge, item.status === 'cancelled' && styles.statusCancelled]}>
                                    <Text style={[styles.statusText, item.status === 'cancelled' && styles.statusTextCancelled]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.bookingGuest}>{item.guest_name}</Text>
                            <Text style={styles.bookingSub}>{item.hotel_name} — {item.room_type}</Text>
                            <Text style={styles.bookingSub}>
                                {formatDate(item.check_in_date)} → {formatDate(item.check_out_date)}
                            </Text>
                            <View style={styles.bookingFooter}>
                                <Text style={styles.bookingPrice}>{formatCurrency(item.total_price)}</Text>
                                {item.status === 'confirmed' && (
                                    <TouchableOpacity onPress={() => handleCancel(item)}>
                                        <Text style={styles.cancelLink}>Cancel</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', padding: 40 }}>
                            <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
                            <Text style={styles.itemSub}>Belum ada booking</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

// ============================================
// Admin Dashboard (Main)
// ============================================
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('hotels');

    const tabs = [
        { key: 'hotels', label: '🏨 Hotels' },
        { key: 'rooms', label: '🛏️ Rooms' },
        { key: 'bookings', label: '📋 Bookings' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>

            {/* Tab Bar */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            {activeTab === 'hotels' && <HotelsTab />}
            {activeTab === 'rooms' && <RoomsTab />}
            {activeTab === 'bookings' && <BookingsTab />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primaryDark,
        paddingTop: SIZES.xxl + SIZES.md,
        paddingBottom: SIZES.md,
        paddingHorizontal: SIZES.lg,
    },
    headerTitle: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.textWhite },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabItemActive: { borderBottomColor: COLORS.primary },
    tabText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '600' },
    tabTextActive: { color: COLORS.primary },
    tab: { flex: 1 },
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SIZES.md,
    },
    tabTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.text },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm, borderRadius: SIZES.borderRadiusSm },
    addBtnText: { color: COLORS.textWhite, fontWeight: '700', fontSize: SIZES.fontSm },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SIZES.md,
        marginBottom: SIZES.sm,
        padding: SIZES.md,
        borderRadius: SIZES.borderRadiusSm,
        ...SHADOWS.small,
    },
    itemTitle: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.text },
    itemSub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 2 },
    editBtn: { padding: SIZES.sm, marginRight: 4 },
    editBtnText: { fontSize: 18 },
    deleteBtn: { padding: SIZES.sm },
    deleteBtnText: { fontSize: 18 },
    hotelPicker: { maxHeight: 50, paddingHorizontal: SIZES.md, paddingTop: SIZES.sm },
    hotelChip: {
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.borderRadiusFull,
        backgroundColor: COLORS.borderLight,
        marginRight: SIZES.sm,
    },
    hotelChipActive: { backgroundColor: COLORS.primary },
    hotelChipText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '600' },
    hotelChipTextActive: { color: COLORS.textWhite },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: SIZES.borderRadiusLg,
        borderTopRightRadius: SIZES.borderRadiusLg,
        padding: SIZES.lg,
        maxHeight: '80%',
    },
    modalTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
    formLabel: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: SIZES.sm },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.borderRadiusSm,
        paddingHorizontal: SIZES.md,
        paddingVertical: 12,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalActions: { flexDirection: 'row', marginTop: SIZES.lg, gap: SIZES.sm },
    cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: SIZES.borderRadiusSm, borderWidth: 1, borderColor: COLORS.border },
    cancelBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
    saveBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: SIZES.borderRadiusSm, backgroundColor: COLORS.primary },
    saveBtnText: { color: COLORS.textWhite, fontWeight: '700' },
    // Booking items
    bookingItem: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SIZES.md,
        marginBottom: SIZES.sm,
        padding: SIZES.md,
        borderRadius: SIZES.borderRadiusSm,
        ...SHADOWS.small,
    },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    bookingRef: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.primary },
    statusBadge: { backgroundColor: COLORS.successLight, paddingHorizontal: SIZES.sm, paddingVertical: 2, borderRadius: SIZES.borderRadiusFull },
    statusText: { fontSize: SIZES.fontXs, color: COLORS.success, fontWeight: '700' },
    statusCancelled: { backgroundColor: COLORS.dangerLight },
    statusTextCancelled: { color: COLORS.danger },
    bookingGuest: { fontSize: SIZES.fontMd, fontWeight: '600', color: COLORS.text },
    bookingSub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 2 },
    bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.sm, paddingTop: SIZES.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
    bookingPrice: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.secondary },
    cancelLink: { fontSize: SIZES.fontSm, color: COLORS.danger, fontWeight: '600' },
});

export default AdminDashboard;
