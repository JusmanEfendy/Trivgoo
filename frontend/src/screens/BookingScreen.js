import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, ActivityIndicator, Alert, StatusBar, Animated, Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { createBooking } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

// ─── Design Tokens (konsisten dengan SearchScreen & HotelDetailScreen) ────────
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
    success: '#E55A4B', // Using brand color for primary actions
    surface: '#FFFFFF',
    bgPage: '#F8F9FA',
    border: 'rgba(28,28,30,0.08)',
    inputBg: '#F0F2F5',
};

const FONT = {
    display: Platform.select({ ios: 'Georgia', android: 'serif' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

// ─── Summary Row Sub-component ────────────────────────────────────────────────
const SummaryRow = ({ label, value, small }) => (
    <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, small && styles.summaryValueSmall]}>
            {value}
        </Text>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BookingScreen = ({ route, navigation }) => {
    const { hotel, room, checkIn, checkOut, guests, nights } = route.params;
    const totalPrice = room.price_per_night * nights;

    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(null);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleBooking = async () => {
        if (!guestName.trim()) {
            setError('Masukkan nama lengkap');
            triggerShake();
            return;
        }
        if (!guestEmail.trim() || !guestEmail.includes('@')) {
            setError('Masukkan email yang valid');
            triggerShake();
            return;
        }

        setError('');
        setLoading(true);
        try {
            const result = await createBooking({
                roomId: room.id,
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim(),
                checkInDate: checkIn,
                checkOutDate: checkOut,
            });

            navigation.replace('BookingConfirm', {
                booking: result.data,
                hotel,
                room,
                nights,
            });
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal membuat booking';
            setError(msg);
            triggerShake();
            if (err.response?.status === 409) {
                Alert.alert(
                    'Kamar Tidak Tersedia',
                    'Kamar sudah dipesan orang lain. Silakan pilih kamar lain.',
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => [
        styles.input,
        focused === field && styles.inputFocused,
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={D.brand} />

            {/* ── Top Header Bar ────────────────────────────────────────── */}
            <View style={styles.header}>
                <View style={styles.headerDeco} />
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backBtnText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Konfirmasi Booking</Text>
                    <Text style={styles.headerSub}>{hotel.name}</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Booking Summary Card ──────────────────────────────── */}
                <View style={styles.card}>
                    {/* Gold accent bar */}
                    <View style={styles.cardAccent} />

                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>Ringkasan Pesanan</Text>
                        <View style={styles.cardTitleBadge}>
                            <Text style={styles.cardTitleBadgeText}>📋</Text>
                        </View>
                    </View>

                    {/* Hotel & Room info block */}
                    <View style={styles.hotelBlock}>
                        <Text style={styles.hotelBlockName}>{hotel.name}</Text>
                        <View style={styles.hotelBlockRoomPill}>
                            <Text style={styles.hotelBlockRoomText}>{room.room_type}</Text>
                        </View>
                    </View>

                    {/* Date banner (sama style dengan HotelDetailScreen) */}
                    <View style={styles.dateBanner}>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>CHECK-IN</Text>
                            <Text style={styles.dateItemValue}>{formatDate(checkIn)}</Text>
                        </View>
                        <View style={styles.dateBannerArrow}>
                            <Text style={styles.dateBannerArrowText}>→</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>CHECK-OUT</Text>
                            <Text style={styles.dateItemValue}>{formatDate(checkOut)}</Text>
                        </View>
                        <View style={styles.dateBannerDivider} />
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>DURASI</Text>
                            <Text style={[styles.dateItemValue, styles.dateItemHighlight]}>
                                {nights} malam
                            </Text>
                        </View>
                    </View>

                    {/* Detail rows */}
                    <View style={styles.detailRows}>
                        <SummaryRow label="Jumlah Tamu" value={`${guests} orang`} />
                        <SummaryRow label="Harga/malam" value={formatCurrency(room.price_per_night)} />
                    </View>

                    {/* Total price block */}
                    <View style={styles.totalBlock}>
                        <View>
                            <Text style={styles.totalBlockLabel}>Total Pembayaran</Text>
                            <Text style={styles.totalBlockSub}>
                                {nights} malam × {formatCurrency(room.price_per_night)}
                            </Text>
                        </View>
                        <Text style={styles.totalBlockValue}>
                            {formatCurrency(totalPrice)}
                        </Text>
                    </View>
                </View>

                {/* ── Guest Form Card ───────────────────────────────────── */}
                <Animated.View style={[
                    styles.card,
                    { transform: [{ translateX: shakeAnim }] },
                ]}>
                    <View style={styles.cardAccent} />

                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>Data Tamu</Text>
                        <View style={styles.cardTitleBadge}>
                            <Text style={styles.cardTitleBadgeText}>👤</Text>
                        </View>
                    </View>

                    {/* Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldIcon}>🪪</Text>
                        <View style={styles.fieldBody}>
                            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                            <TextInput
                                style={inputStyle('name')}
                                placeholder="Masukkan nama lengkap"
                                placeholderTextColor={D.textLight}
                                value={guestName}
                                onChangeText={setGuestName}
                                autoCapitalize="words"
                                onFocus={() => setFocused('name')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldIcon}>✉️</Text>
                        <View style={styles.fieldBody}>
                            <Text style={styles.fieldLabel}>Alamat Email</Text>
                            <TextInput
                                style={inputStyle('email')}
                                placeholder="contoh@email.com"
                                placeholderTextColor={D.textLight}
                                value={guestEmail}
                                onChangeText={setGuestEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️  {error}</Text>
                        </View>
                    ) : null}
                </Animated.View>

                {/* ── Security note ─────────────────────────────────────── */}
                <View style={styles.secureNote}>
                    <Text style={styles.secureNoteText}>
                        🔒  Data kamu aman dan terenkripsi
                    </Text>
                </View>

                {/* ── Confirm Button ────────────────────────────────────── */}
                <TouchableOpacity
                    style={[styles.bookBtn, loading && styles.bookBtnDisabled]}
                    onPress={handleBooking}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={D.white} />
                    ) : (
                        <>
                            <Text style={styles.bookBtnText}>Konfirmasi Booking</Text>
                            <Text style={styles.bookBtnSub}>{formatCurrency(totalPrice)}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 48 }} />
            </ScrollView>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 18,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    headerDeco: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: D.white,
        top: -80,
        right: -40,
        opacity: 0.1,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: {
        color: D.white,
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 22,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: FONT.display,
        fontSize: 17,
        fontWeight: '700',
        color: D.white,
        letterSpacing: 0.2,
    },
    headerSub: {
        fontSize: 11,
        color: D.white,
        marginTop: 2,
        fontWeight: '500',
        opacity: 0.8,
    },
    headerRight: {
        width: 38,
    },

    // Scroll
    scroll: {
        padding: 16,
        paddingTop: 20,
    },

    // Card
    card: {
        backgroundColor: D.white,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 0,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
    },
    cardAccent: {
        height: 4,
        backgroundColor: D.brand,
        marginHorizontal: -20,
        marginBottom: 18,
    },
    cardTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
    },
    cardTitleBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: D.bgPage,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitleBadgeText: {
        fontSize: 16,
    },

    // Hotel block
    hotelBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: D.bgPage,
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
    },
    hotelBlockName: {
        fontSize: 14,
        fontWeight: '700',
        color: D.textDark,
        flex: 1,
        marginRight: 8,
    },
    hotelBlockRoomPill: {
        backgroundColor: D.brandLight,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    hotelBlockRoomText: {
        color: D.brand,
        fontSize: 11,
        fontWeight: '800',
    },

    // Date banner
    dateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: D.brand,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
    },
    dateItemLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 0.8,
        marginBottom: 5,
    },
    dateItemValue: {
        fontSize: 12,
        fontWeight: '700',
        color: D.white,
    },
    dateItemHighlight: {
        color: D.white,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    dateBannerArrow: {
        paddingHorizontal: 2,
    },
    dateBannerArrowText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 14,
    },
    dateBannerDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 4,
    },

    // Detail rows
    detailRows: {
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: D.border,
    },
    summaryLabel: {
        fontSize: 13,
        color: D.textLight,
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: D.textDark,
        maxWidth: '60%',
        textAlign: 'right',
    },
    summaryValueSmall: {
        fontSize: 12,
    },

    // Total
    totalBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: D.bgPage,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1.5,
        borderColor: D.border,
        marginTop: 4,
    },
    totalBlockLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: D.textDark,
    },
    totalBlockSub: {
        fontSize: 11,
        color: D.textLight,
        marginTop: 2,
    },
    totalBlockValue: {
        fontFamily: FONT.display,
        fontSize: 20,
        fontWeight: '700',
        color: D.brand,
    },

    // Form fields
    fieldGroup: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        paddingVertical: 4,
    },
    fieldIcon: {
        fontSize: 18,
        marginTop: 18,
    },
    fieldBody: {
        flex: 1,
    },
    fieldLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: D.textLight,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 5,
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
    inputFocused: {
        borderColor: D.brandLight,
        backgroundColor: D.white,
    },

    // Error
    errorBox: {
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderLeftWidth: 3,
        borderLeftColor: D.danger,
    },
    errorText: {
        color: D.danger,
        fontSize: 13,
        fontWeight: '500',
    },

    // Secure note
    secureNote: {
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 4,
    },
    secureNoteText: {
        fontSize: 12,
        color: D.textLight,
        letterSpacing: 0.2,
    },

    // Book button
    bookBtn: {
        backgroundColor: D.brand,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: D.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
        elevation: 7,
    },
    bookBtnDisabled: {
        opacity: 0.65,
    },
    bookBtnText: {
        color: D.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
    bookBtnSub: {
        color: D.white,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 3,
        opacity: 0.9,
    },
});

export default BookingScreen;