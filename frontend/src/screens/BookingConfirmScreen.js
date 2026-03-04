import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Animated, Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency, formatDate } from '../utils/helpers';

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
    success: '#2D7A4F',
    successBg: '#EDF7F2',
    bgPage: '#F8F9FA',
    border: 'rgba(28,28,30,0.08)',
};

const FONT = {
    display: Platform.select({ ios: 'Georgia', android: 'serif' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

// ─── Detail Row Sub-component ─────────────────────────────────────────────────
const DetailRow = ({ label, value, last }) => (
    <View style={[styles.row, !last && styles.rowBorder]}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BookingConfirmScreen = ({ route, navigation }) => {
    const { booking, hotel, room, nights } = route.params;

    // Entrance animations
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkOpacity = useRef(new Animated.Value(0)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(32)).current;

    useEffect(() => {
        // Check circle pop-in
        Animated.sequence([
            Animated.delay(150),
            Animated.parallel([
                Animated.spring(checkScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(checkOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Content fade + slide
        Animated.sequence([
            Animated.delay(400),
            Animated.parallel([
                Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(contentSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={D.brand} />

            {/* ── Hero Header ───────────────────────────────────────────── */}
            <View style={styles.hero}>
                <View style={styles.heroDeco1} />
                <View style={styles.heroDeco2} />

                {/* Animated check circle */}
                <Animated.View style={[
                    styles.checkCircleWrap,
                    { opacity: checkOpacity, transform: [{ scale: checkScale }] }
                ]}>
                    <View style={styles.checkCircleOuter}>
                        <View style={styles.checkCircleInner}>
                            <Text style={styles.checkIcon}>✓</Text>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: checkOpacity, alignItems: 'center' }}>
                    <Text style={styles.heroTitle}>Booking Berhasil! 🎉</Text>
                    <Text style={styles.heroSub}>Pesanan Anda telah dikonfirmasi</Text>
                </Animated.View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{
                    opacity: contentFade,
                    transform: [{ translateY: contentSlide }],
                }}>
                    {/* ── Booking Reference Card ──────────────────────────── */}
                    <View style={styles.refCard}>
                        <View style={styles.refCardTop}>
                            <View style={styles.refTextCol}>
                                <Text style={styles.refLabel}>NOMOR REFERENSI</Text>
                                <Text style={styles.refNumber} selectable>
                                    {booking.booking_ref}
                                </Text>
                            </View>
                            <View style={styles.refQrBox}>
                                <Text style={styles.refQrIcon}>🎫</Text>
                            </View>
                        </View>
                        <View style={styles.refDividerDashed} />
                        <Text style={styles.refHint}>
                            📌  Simpan nomor ini untuk keperluan check-in
                        </Text>
                    </View>

                    {/* ── Date Banner ─────────────────────────────────────── */}
                    <View style={styles.dateBanner}>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>CHECK-IN</Text>
                            <Text style={styles.dateItemValue}>
                                {formatDate(booking.check_in_date)}
                            </Text>
                        </View>
                        <View style={styles.dateBannerArrow}>
                            <Text style={styles.dateBannerArrowText}>→</Text>
                        </View>
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>CHECK-OUT</Text>
                            <Text style={styles.dateItemValue}>
                                {formatDate(booking.check_out_date)}
                            </Text>
                        </View>
                        <View style={styles.dateBannerDivider} />
                        <View style={styles.dateItem}>
                            <Text style={styles.dateItemLabel}>DURASI</Text>
                            <Text style={[styles.dateItemValue, styles.dateItemHighlight]}>
                                {nights} malam
                            </Text>
                        </View>
                    </View>

                    {/* ── Detail Card ─────────────────────────────────────── */}
                    <View style={styles.card}>
                        <View style={styles.cardAccent} />

                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle}>Detail Booking</Text>
                            {/* Status badge */}
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Confirmed ✓</Text>
                            </View>
                        </View>

                        {/* Hotel & Room block */}
                        <View style={styles.hotelBlock}>
                            <Text style={styles.hotelBlockName}>{hotel.name}</Text>
                            <View style={styles.roomPill}>
                                <Text style={styles.roomPillText}>{room.room_type}</Text>
                            </View>
                        </View>

                        {/* Detail rows */}
                        <View style={styles.detailRows}>
                            <DetailRow label="Nama Tamu" value={booking.guest_name} />
                            <DetailRow label="Email" value={booking.guest_email} />
                            <DetailRow label="Durasi" value={`${nights} malam`} last />
                        </View>

                        {/* Total block */}
                        <View style={styles.totalBlock}>
                            <View>
                                <Text style={styles.totalBlockLabel}>Total Pembayaran</Text>
                                <Text style={styles.totalBlockSub}>Sudah termasuk semua biaya</Text>
                            </View>
                            <Text style={styles.totalBlockValue}>
                                {formatCurrency(booking.total_price)}
                            </Text>
                        </View>
                    </View>

                    {/* ── CTA Button ──────────────────────────────────────── */}
                    <TouchableOpacity
                        style={styles.homeBtn}
                        onPress={() => navigation.popToTop()}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.homeBtnText}>🔍  Cari Hotel Lagi</Text>
                    </TouchableOpacity>

                    <View style={{ height: 48 }} />
                </Animated.View>
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

    // Hero
    hero: {
        backgroundColor: D.brand,
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: 44,
        overflow: 'hidden',
    },
    heroDeco1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: D.white,
        top: -100,
        right: -80,
        opacity: 0.1,
    },
    heroDeco2: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 1.5,
        borderColor: D.white,
        bottom: -40,
        left: -40,
        opacity: 0.15,
    },

    // Check circle
    checkCircleWrap: {
        marginBottom: 20,
    },
    checkCircleOuter: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkCircleInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: D.white,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    checkIcon: {
        fontSize: 32,
        color: D.brand,
        fontWeight: '800',
        lineHeight: 38,
    },
    heroTitle: {
        fontFamily: FONT.display,
        fontSize: 24,
        fontWeight: '700',
        color: D.white,
        marginBottom: 6,
        letterSpacing: 0.2,
    },
    heroSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },

    // Scroll
    scroll: {
        padding: 16,
        paddingTop: 20,
    },

    // Reference Card
    refCard: {
        backgroundColor: D.white,
        borderRadius: 18,
        padding: 20,
        marginBottom: 14,
        overflow: 'hidden',
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 4,
        borderWidth: 1,
        borderColor: D.border,
    },
    refCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    refTextCol: {
        flex: 1,
        paddingRight: 12,
    },
    refLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: D.textLight,
        letterSpacing: 1,
        marginBottom: 8,
    },
    refNumber: {
        fontFamily: FONT.display,
        fontSize: 17, // Dikurangi dari 22 jadi 17 agar pas untuk UUID
        fontWeight: '700',
        color: D.brand,
        letterSpacing: 1,
    },
    refQrBox: {
        width: 52,
        height: 52,
        borderRadius: 12,
        backgroundColor: D.brandLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    refQrIcon: {
        fontSize: 26,
    },
    refDividerDashed: {
        height: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: D.border,
        marginBottom: 14,
    },
    refHint: {
        fontSize: 12,
        color: D.textMid,
        fontWeight: '500',
    },

    // Date banner (identik dengan HotelDetailScreen & BookingScreen)
    dateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: D.brand,
        borderRadius: 14,
        paddingVertical: 15,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    dateItem: {
        flex: 1,
        alignItems: 'center',
    },
    dateItemLabel: {
        fontSize: 9,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
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

    // Detail Card
    card: {
        backgroundColor: D.white,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 0,
        marginBottom: 16,
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
    statusBadge: {
        backgroundColor: D.successBg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(45,122,79,0.2)',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: D.success,
    },

    // Hotel block
    hotelBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: D.bgPage,
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    hotelBlockName: {
        fontSize: 14,
        fontWeight: '700',
        color: D.textDark,
        flex: 1,
        marginRight: 8,
    },
    roomPill: {
        backgroundColor: D.brandLight,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    roomPillText: {
        color: D.brand,
        fontSize: 11,
        fontWeight: '800',
    },

    // Detail rows
    detailRows: {
        marginBottom: 14,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 9,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: D.border,
    },
    rowLabel: {
        fontSize: 13,
        color: D.textLight,
    },
    rowValue: {
        fontSize: 13,
        fontWeight: '600',
        color: D.textDark,
        maxWidth: '60%',
        textAlign: 'right',
    },

    // Total block
    totalBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: D.bgPage,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1.5,
        borderColor: D.border,
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

    // CTA Button
    homeBtn: {
        backgroundColor: D.brand,
        borderRadius: 14,
        paddingVertical: 17,
        alignItems: 'center',
        shadowColor: D.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.38,
        shadowRadius: 14,
        elevation: 7,
    },
    homeBtnText: {
        color: D.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.4,
    },
});

export default BookingConfirmScreen;