import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, FlatList, Alert,
    StyleSheet, ActivityIndicator, StatusBar, TextInput,
    Modal, ScrollView, Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import {
    getAdminHotels, createHotel, updateHotel, deleteHotel,
    getHotelRooms, createRoom, updateRoom, deleteRoom,
    getAdminBookings, cancelBooking,
} from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

// ─── Design Tokens (konsisten dengan semua screen sebelumnya) ─────────────────
const D = {
    brand: '#E55A4B',
    brandMid: '#D44C3E',
    brandLight: '#FCEBE9',
    dark: '#1C1C1E',
    darkLight: '#3A3A3C',
    white: '#FFFFFF',
    textDark: '#1C1C1E',
    textMid: '#5A5A5C',
    textLight: '#8A97A8',
    danger: '#E53E3E',
    dangerBg: '#FFF5F5',
    success: '#2D7A4F',
    successBg: '#EDF7F2',
    bgPage: '#F8F9FA',
    border: 'rgba(28,28,30,0.08)',
    inputBg: '#F8F9FA',
    overlay: 'rgba(28,28,30,0.6)',
};

const FONT = {
    display: Platform.select({ ios: 'Georgia', android: 'serif' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

// ─── Shared: Form Modal ───────────────────────────────────────────────────────
const FormModal = ({ visible, title, onClose, onSave, children }) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
                {/* Gold accent */}
                <View style={styles.modalAccent} />

                {/* Handle bar */}
                <View style={styles.modalHandle} />

                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
                        <Text style={styles.modalCloseBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalBody}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                        <Text style={styles.cancelBtnText}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                        <Text style={styles.saveBtnText}>Simpan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

// ─── Shared: Form Field ───────────────────────────────────────────────────────
const FormField = ({ label, value, onChangeText, placeholder, multiline, keyboardType, focused, onFocus, onBlur }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                multiline && styles.inputMultiline,
                focused && styles.inputFocused,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={D.textLight}
            multiline={multiline}
            keyboardType={keyboardType || 'default'}
            textAlignVertical={multiline ? 'top' : 'center'}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    </View>
);

// ─── Shared: Action Buttons ───────────────────────────────────────────────────
const RowActions = ({ onEdit, onDelete }) => (
    <View style={styles.rowActions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.75}>
            <Text style={styles.actionBtnIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.75}>
            <Text style={styles.actionBtnIcon}>🗑️</Text>
        </TouchableOpacity>
    </View>
);

// ─── Shared: Section Header ───────────────────────────────────────────────────
const TabSectionHeader = ({ title, count, onAction, actionLabel }) => (
    <View style={styles.sectionHeader}>
        <View>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>{count} data</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAction} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>{actionLabel}</Text>
        </TouchableOpacity>
    </View>
);

// ─── Loading View ─────────────────────────────────────────────────────────────
const LoadingSpinner = () => (
    <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={D.brand} />
        <Text style={styles.loadingText}>Memuat data…</Text>
    </View>
);

// ─── Empty View ───────────────────────────────────────────────────────────────
const EmptyView = ({ icon, text }) => (
    <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text style={styles.emptyText}>{text}</Text>
    </View>
);


// ============================================
// Tab: Hotels
// ============================================
const HotelsTab = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [form, setForm] = useState({ name: '', city: '', address: '', description: '' });
    const [focused, setFocused] = useState(null);

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
            <TabSectionHeader
                title="Daftar Hotel"
                count={hotels.length}
                actionLabel="+ Tambah"
                onAction={() => setShowForm(true)}
            />

            {loading ? <LoadingSpinner /> : (
                <FlatList
                    data={hotels}
                    keyExtractor={(i) => i.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyView icon="🏨" text="Belum ada hotel" />}
                    renderItem={({ item }) => (
                        <View style={styles.listCard}>
                            <View style={styles.listCardAccent} />
                            <View style={styles.listCardBody}>
                                <View style={styles.listCardInfo}>
                                    <Text style={styles.listCardTitle}>{item.name}</Text>
                                    <Text style={styles.listCardSub}>📍 {item.city}</Text>
                                </View>
                                <RowActions
                                    onEdit={() => handleEdit(item)}
                                    onDelete={() => handleDelete(item)}
                                />
                            </View>
                        </View>
                    )}
                />
            )}

            <FormModal
                visible={showForm}
                title={editingHotel ? 'Edit Hotel' : 'Tambah Hotel'}
                onClose={resetForm}
                onSave={handleSave}
            >
                {['name', 'city', 'address', 'description'].map((field) => (
                    <FormField
                        key={field}
                        label={field === 'name' ? 'Nama Hotel' : field === 'city' ? 'Kota' : field === 'address' ? 'Alamat' : 'Deskripsi'}
                        value={form[field]}
                        onChangeText={(val) => setForm({ ...form, [field]: val })}
                        placeholder={`Masukkan ${field}`}
                        multiline={field === 'description'}
                        focused={focused === field}
                        onFocus={() => setFocused(field)}
                        onBlur={() => setFocused(null)}
                    />
                ))}
            </FormModal>
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
    const [focused, setFocused] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await getAdminHotels();
                setHotels(data.data);
                if (data.data.length > 0) setSelectedHotel(data.data[0]);
            } catch (err) { console.error(err); }
        })();
    }, []);

    useEffect(() => { if (selectedHotel) loadRooms(); }, [selectedHotel]);

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
            {/* Hotel Selector chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
                contentContainerStyle={styles.chipScrollContent}
            >
                {hotels.map((h) => (
                    <TouchableOpacity
                        key={h.id}
                        style={[styles.hotelChip, selectedHotel?.id === h.id && styles.hotelChipActive]}
                        onPress={() => setSelectedHotel(h)}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.hotelChipText, selectedHotel?.id === h.id && styles.hotelChipTextActive]}>
                            {h.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TabSectionHeader
                title="Daftar Kamar"
                count={rooms.length}
                actionLabel="+ Tambah"
                onAction={() => setShowForm(true)}
            />

            {loading ? <LoadingSpinner /> : (
                <FlatList
                    data={rooms}
                    keyExtractor={(i) => i.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyView icon="🛏️" text="Belum ada kamar" />}
                    renderItem={({ item }) => (
                        <View style={styles.listCard}>
                            <View style={styles.listCardAccent} />
                            <View style={styles.listCardBody}>
                                <View style={styles.listCardInfo}>
                                    <Text style={styles.listCardTitle}>{item.room_type}</Text>
                                    <View style={styles.roomMeta}>
                                        <View style={styles.roomMetaPill}>
                                            <Text style={styles.roomMetaText}>👥 {item.capacity} tamu</Text>
                                        </View>
                                        <Text style={styles.roomPrice}>
                                            {formatCurrency(item.price_per_night)}<Text style={styles.roomPriceSub}>/mlm</Text>
                                        </Text>
                                    </View>
                                </View>
                                <RowActions
                                    onEdit={() => handleEdit(item)}
                                    onDelete={() => handleDelete(item)}
                                />
                            </View>
                        </View>
                    )}
                />
            )}

            <FormModal
                visible={showForm}
                title={editingRoom ? 'Edit Kamar' : 'Tambah Kamar'}
                onClose={resetForm}
                onSave={handleSave}
            >
                <FormField
                    label="Tipe Kamar"
                    value={form.room_type}
                    onChangeText={(v) => setForm({ ...form, room_type: v })}
                    placeholder="Contoh: Deluxe Room"
                    focused={focused === 'room_type'}
                    onFocus={() => setFocused('room_type')}
                    onBlur={() => setFocused(null)}
                />
                <FormField
                    label="Kapasitas (orang)"
                    value={form.capacity}
                    onChangeText={(v) => setForm({ ...form, capacity: v })}
                    placeholder="2"
                    keyboardType="number-pad"
                    focused={focused === 'capacity'}
                    onFocus={() => setFocused('capacity')}
                    onBlur={() => setFocused(null)}
                />
                <FormField
                    label="Harga per Malam (IDR)"
                    value={form.price_per_night}
                    onChangeText={(v) => setForm({ ...form, price_per_night: v })}
                    placeholder="1500000"
                    keyboardType="decimal-pad"
                    focused={focused === 'price'}
                    onFocus={() => setFocused('price')}
                    onBlur={() => setFocused(null)}
                />
                <FormField
                    label="Deskripsi"
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    placeholder="Deskripsi kamar"
                    multiline
                    focused={focused === 'desc'}
                    onFocus={() => setFocused('desc')}
                    onBlur={() => setFocused(null)}
                />
            </FormModal>
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

    const isCancelled = (status) => status === 'cancelled';

    return (
        <View style={styles.tab}>
            <TabSectionHeader
                title="Semua Booking"
                count={bookings.length}
                actionLabel="🔄 Refresh"
                onAction={load}
            />

            {loading ? <LoadingSpinner /> : (
                <FlatList
                    data={bookings}
                    keyExtractor={(i) => i.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<EmptyView icon="📭" text="Belum ada booking" />}
                    renderItem={({ item }) => (
                        <View style={[styles.bookingCard, isCancelled(item.status) && styles.bookingCardCancelled]}>
                            {/* Top row: ref + status */}
                            <View style={styles.bookingTopRow}>
                                <View style={styles.bookingRefWrap}>
                                    <Text style={styles.bookingRefLabel}>REF</Text>
                                    <Text style={styles.bookingRef}>#{item.booking_ref.slice(0, 8)}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    isCancelled(item.status) && styles.statusBadgeCancelled
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        isCancelled(item.status) && styles.statusTextCancelled,
                                    ]}>
                                        {isCancelled(item.status) ? '✕ Cancelled' : '✓ Confirmed'}
                                    </Text>
                                </View>
                            </View>

                            {/* Guest */}
                            <Text style={styles.bookingGuest}>{item.guest_name}</Text>

                            {/* Hotel & Room */}
                            <View style={styles.bookingHotelRow}>
                                <Text style={styles.bookingHotelName}>{item.hotel_name}</Text>
                                <View style={styles.bookingRoomPill}>
                                    <Text style={styles.bookingRoomText}>{item.room_type}</Text>
                                </View>
                            </View>

                            {/* Date banner */}
                            <View style={styles.bookingDateBanner}>
                                <Text style={styles.bookingDateText}>
                                    {formatDate(item.check_in_date)}
                                </Text>
                                <Text style={styles.bookingDateArrow}> → </Text>
                                <Text style={styles.bookingDateText}>
                                    {formatDate(item.check_out_date)}
                                </Text>
                            </View>

                            {/* Footer: price + cancel */}
                            <View style={styles.bookingFooter}>
                                <Text style={styles.bookingPrice}>
                                    {formatCurrency(item.total_price)}
                                </Text>
                                {!isCancelled(item.status) && (
                                    <TouchableOpacity
                                        style={styles.cancelLink}
                                        onPress={() => handleCancel(item)}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={styles.cancelLinkText}>Cancel Booking</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
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
        { key: 'hotels', label: 'Hotels', icon: '🏨' },
        { key: 'rooms', label: 'Rooms', icon: '🛏️' },
        { key: 'bookings', label: 'Bookings', icon: '📋' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={D.brand} />

            {/* ── Header ──────────────────────────────────────────────── */}
            <View style={styles.header}>
                <View style={styles.headerDeco1} />
                <View style={styles.headerDeco2} />
                <View style={styles.headerInner}>
                    <View>
                        <Text style={styles.headerEyebrow}>PANEL ADMIN</Text>
                        <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    </View>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>⚙️</Text>
                    </View>
                </View>
            </View>

            {/* ── Tab Bar ─────────────────────────────────────────────── */}
            <View style={styles.tabBar}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                        onPress={() => setActiveTab(tab.key)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.tabIcon}>{tab.icon}</Text>
                        <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                            {tab.label}
                        </Text>
                        {activeTab === tab.key && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* ── Tab Content ─────────────────────────────────────────── */}
            {activeTab === 'hotels' && <HotelsTab />}
            {activeTab === 'rooms' && <RoomsTab />}
            {activeTab === 'bookings' && <BookingsTab />}
        </View>
    );
};


// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: D.bgPage,
    },

    // Header
    header: {
        backgroundColor: D.brand,
        paddingTop: 52,
        paddingBottom: 20,
        overflow: 'hidden',
    },
    headerDeco1: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: D.white,
        top: -100,
        right: -60,
        opacity: 0.1,
    },
    headerDeco2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1.5,
        borderColor: D.white,
        bottom: -30,
        left: 20,
        opacity: 0.15,
    },
    headerInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        position: 'relative',
        zIndex: 1,
    },
    headerEyebrow: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    headerTitle: {
        fontFamily: FONT.display,
        fontSize: 26,
        fontWeight: '700',
        color: D.white,
    },
    headerBadge: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBadgeText: {
        fontSize: 20,
    },

    // Tab bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: D.white,
        borderBottomWidth: 1,
        borderBottomColor: D.border,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 4,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        position: 'relative',
    },
    tabItemActive: {},
    tabIcon: {
        fontSize: 18,
        marginBottom: 3,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: D.textLight,
        letterSpacing: 0.3,
    },
    tabLabelActive: {
        color: D.brand,
        fontWeight: '800',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 3,
        backgroundColor: D.brand,
        borderRadius: 2,
    },

    // Tab container
    tab: {
        flex: 1,
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
    },
    sectionCount: {
        fontSize: 12,
        color: D.textLight,
        marginTop: 2,
    },
    addBtn: {
        backgroundColor: D.brandLight,
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 10,
    },
    addBtnText: {
        color: D.brand,
        fontWeight: '800',
        fontSize: 13,
        letterSpacing: 0.3,
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },

    // List Card (Hotels & Rooms)
    listCard: {
        backgroundColor: D.white,
        borderRadius: 14,
        marginBottom: 10,
        overflow: 'hidden',
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: D.border,
    },
    listCardAccent: {
        height: 3,
        backgroundColor: D.brand,
    },
    listCardBody: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    listCardInfo: {
        flex: 1,
    },
    listCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: D.textDark,
        marginBottom: 4,
    },
    listCardSub: {
        fontSize: 12,
        color: D.textLight,
    },

    // Row actions
    rowActions: {
        flexDirection: 'row',
        gap: 6,
    },
    editBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: D.bgPage,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: D.border,
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF5F5',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(229,62,62,0.15)',
    },
    actionBtnIcon: {
        fontSize: 15,
    },

    // Room meta
    roomMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    roomMetaPill: {
        backgroundColor: D.bgPage,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: D.border,
    },
    roomMetaText: {
        fontSize: 11,
        color: D.textMid,
        fontWeight: '500',
    },
    roomPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: D.textDark,
    },
    roomPriceSub: {
        fontSize: 11,
        fontWeight: '400',
        color: D.textLight,
    },

    // Hotel chips (Rooms tab)
    chipScroll: {
        maxHeight: 52,
        paddingTop: 12,
    },
    chipScrollContent: {
        paddingHorizontal: 16,
        gap: 8,
        flexDirection: 'row',
    },
    hotelChip: {
        borderWidth: 1.5,
        borderColor: 'transparent',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: D.white,
        borderWidth: 1,
        borderColor: D.border,
    },
    hotelChipActive: {
        borderColor: 'transparent',
        backgroundColor: D.brand,
    },
    hotelChipText: {
        fontSize: 12,
        color: D.textMid,
        fontWeight: '600',
    },
    hotelChipTextActive: {
        color: D.white,
        fontWeight: '700',
    },

    // Booking Card
    bookingCard: {
        backgroundColor: D.white,
        borderRadius: 14,
        marginBottom: 10,
        padding: 16,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: D.brand,
        borderWidth: 1,
        borderColor: D.border,
    },
    bookingCardCancelled: {
        borderLeftColor: D.danger,
        opacity: 0.75,
    },
    bookingTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    bookingRefWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    bookingRefLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: D.textLight,
        letterSpacing: 1,
        backgroundColor: D.bgPage,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    bookingRef: {
        fontSize: 14,
        fontWeight: '800',
        color: D.textDark,
        letterSpacing: 0.5,
    },
    statusBadge: {
        backgroundColor: D.successBg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(45,122,79,0.2)',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: D.success,
    },
    statusBadgeCancelled: {
        backgroundColor: D.dangerBg,
        borderColor: 'rgba(229,62,62,0.2)',
    },
    statusTextCancelled: {
        color: D.danger,
    },
    bookingGuest: {
        fontSize: 16,
        fontWeight: '700',
        color: D.textDark,
        marginBottom: 8,
    },
    bookingHotelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    bookingHotelName: {
        fontSize: 13,
        color: D.textMid,
        fontWeight: '500',
        flex: 1,
    },
    bookingRoomPill: {
        backgroundColor: D.brandLight,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    bookingRoomText: {
        color: D.brand,
        fontSize: 10,
        fontWeight: '800',
    },
    bookingDateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: D.bgPage,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    bookingDateText: {
        fontSize: 12,
        fontWeight: '600',
        color: D.textDark,
    },
    bookingDateArrow: {
        color: D.textLight,
        fontSize: 14,
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: D.border,
        paddingTop: 12,
    },
    bookingPrice: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.brand,
    },
    cancelLink: {
        backgroundColor: D.dangerBg,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(229,62,62,0.2)',
    },
    cancelLinkText: {
        fontSize: 12,
        color: D.danger,
        fontWeight: '700',
    },

    // Loading / Empty
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 12,
    },
    loadingText: {
        fontSize: 13,
        color: D.textLight,
        marginTop: 8,
    },
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyIcon: {
        fontSize: 44,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 14,
        color: D.textLight,
        fontWeight: '500',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: D.overlay,
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: D.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        overflow: 'hidden',
    },
    modalAccent: {
        height: 4,
        backgroundColor: D.brand,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: D.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: D.border,
    },
    modalTitle: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
    },
    modalCloseBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: D.bgPage,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: D.border,
    },
    modalCloseBtnText: {
        fontSize: 13,
        color: D.textMid,
        fontWeight: '600',
    },
    modalBody: {
        padding: 20,
        paddingBottom: 8,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        padding: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: D.border,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: D.border,
        backgroundColor: D.bgPage,
    },
    cancelBtnText: {
        color: D.textMid,
        fontWeight: '700',
        fontSize: 14,
    },
    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: D.brand,
        shadowColor: D.brand,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    saveBtnText: {
        color: D.white,
        fontWeight: '800',
        fontSize: 14,
    },

    // Form fields
    fieldGroup: {
        marginBottom: 4,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: D.textLight,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: D.inputBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: D.textDark,
        borderWidth: 1.5,
        borderColor: 'transparent',
        fontFamily: FONT.body,
    },
    inputMultiline: {
        height: 88,
    },
    inputFocused: {
        borderColor: D.brand,
        backgroundColor: D.white,
    },
});

export default AdminDashboard;