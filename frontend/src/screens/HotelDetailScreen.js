import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, ScrollView, Image, ActivityIndicator,
    StyleSheet, StatusBar, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getHotelDetail } from '../services/api';
import { formatDate, calculateNights } from '../utils/helpers';
import RoomCard from '../components/RoomCard';

// ─── Design Tokens (sama persis dengan SearchScreen) ─────────────────────────
const D = {
    brand: '#E55A4B',      // Coral Red from logo
    brandMid: '#D44C3E',
    brandLight: '#FCEBE9',
    dark: '#1C1C1E',       // Black/Dark from text
    darkLight: '#3A3A3C',
    white: '#FFFFFF',
    textDark: '#1C1C1E',
    textMid: '#5A5A5C',
    textLight: '#8A97A8',
    danger: '#E53E3E',
    surface: '#FFFFFF',
    bgPage: '#F8F9FA',
    border: 'rgba(28,28,30,0.08)',
    inputBg: '#F0F2F5',
};

const FONT = {
    display: Platform.select({ ios: 'Georgia', android: 'serif' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

// ─── Loading State ────────────────────────────────────────────────────────────
const LoadingView = () => (
    <View style={styles.center}>
        <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={D.brand} />
            <Text style={styles.loadingText}>Memuat detail hotel…</Text>
        </View>
    </View>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorView = ({ message }) => (
    <View style={styles.center}>
        <View style={styles.errorBox}>
            <Text style={styles.errorEmoji}>😞</Text>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{message}</Text>
        </View>
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HotelDetailScreen = ({ route, navigation }) => {
    const { hotelId, checkIn, checkOut, guests } = route.params;
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(24)).current;

    const nights = calculateNights(checkIn, checkOut);

    useEffect(() => { loadHotel(); }, []);

    const loadHotel = async () => {
        try {
            const data = await getHotelDetail(hotelId, { checkIn, checkOut, guests });
            setHotel(data.data);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 420, useNativeDriver: true }),
            ]).start();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat detail hotel');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingView />;
    if (error || !hotel) return <ErrorView message={error || 'Hotel tidak ditemukan'} />;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={D.brand} />

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Hero Image ──────────────────────────────────────────── */}
                <View style={styles.heroWrap}>
                    <Image
                        source={{ uri: hotel.image_url || 'https://placehold.co/600x400?text=Hotel' }}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                    {/* Gradient overlay */}
                    <View style={styles.heroOverlay} />

                    {/* Back button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backBtnText}>←</Text>
                    </TouchableOpacity>

                    {/* Hero label chip */}
                    <View style={styles.heroChip}>
                        <Text style={styles.heroChipText}>⭐ Pilihan Terbaik</Text>
                    </View>
                </View>

                {/* ── Hotel Info Card ─────────────────────────────────────── */}
                <Animated.View style={[
                    styles.infoCard,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    {/* Decorative top bar */}
                    <View style={styles.infoAccent} />

                    <Text style={styles.hotelName}>{hotel.name}</Text>

                    <View style={styles.locationRow}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.address}>{hotel.address}</Text>
                    </View>

                    {hotel.description && (
                        <Text style={styles.description}>{hotel.description}</Text>
                    )}
                </Animated.View>

                {/* ── Stay Info Banner ────────────────────────────────────── */}
                <Animated.View style={[
                    styles.stayBanner,
                    { opacity: fadeAnim }
                ]}>
                    <StayItem label="Check-in" value={formatDate(checkIn)} />
                    <View style={styles.stayArrow}>
                        <Text style={styles.stayArrowText}>→</Text>
                    </View>
                    <StayItem label="Check-out" value={formatDate(checkOut)} />
                    <View style={styles.stayDivider} />
                    <StayItem
                        label="Durasi"
                        value={`${nights} malam`}
                        highlight
                    />
                </Animated.View>

                {/* ── Rooms Section ───────────────────────────────────────── */}
                <Animated.View style={[
                    styles.roomsSection,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    {/* Section header */}
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>
                                Kamar Tersedia
                            </Text>
                            <Text style={styles.sectionSub}>
                                {hotel.rooms?.length || 0} pilihan · {guests} tamu
                            </Text>
                        </View>
                        <View style={styles.sectionBadge}>
                            <Text style={styles.sectionBadgeText}>
                                {hotel.rooms?.length || 0}
                            </Text>
                        </View>
                    </View>

                    {hotel.rooms && hotel.rooms.length > 0 ? (
                        hotel.rooms.map((room) => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                nights={nights}
                                onPress={() => navigation.navigate('Booking', {
                                    hotel,
                                    room,
                                    checkIn,
                                    checkOut,
                                    guests,
                                    nights,
                                })}
                            />
                        ))
                    ) : (
                        <View style={styles.noRooms}>
                            <Text style={styles.noRoomsIcon}>🚫</Text>
                            <Text style={styles.noRoomsTitle}>Tidak Ada Kamar</Text>
                            <Text style={styles.noRoomsSub}>
                                Tidak ada kamar tersedia untuk tanggal yang dipilih
                            </Text>
                        </View>
                    )}
                </Animated.View>

                <View style={{ height: 48 }} />
            </ScrollView>
        </View>
    );
};

// ─── Stay Item Sub-component ──────────────────────────────────────────────────
const StayItem = ({ label, value, highlight }) => (
    <View style={styles.stayItem}>
        <Text style={styles.stayLabel}>{label}</Text>
        <Text style={[styles.stayValue, highlight && styles.stayValueHighlight]}>
            {value}
        </Text>
    </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: D.bgPage,
    },

    // Loading / Error
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: D.bgPage,
        padding: SIZES.lg,
    },
    loadingBox: {
        alignItems: 'center',
        gap: 14,
    },
    loadingText: {
        fontSize: 14,
        color: D.textLight,
        fontFamily: FONT.body,
        marginTop: 12,
    },
    errorBox: {
        alignItems: 'center',
        backgroundColor: D.white,
        borderRadius: 20,
        padding: 32,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 8,
    },
    errorEmoji: { fontSize: 48, marginBottom: 12 },
    errorTitle: { fontFamily: FONT.display, fontSize: 20, fontWeight: '700', color: D.textDark, marginBottom: 8 },
    errorText: { fontSize: 14, color: D.textLight, textAlign: 'center', lineHeight: 20 },

    // Hero
    heroWrap: {
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: 280,
        backgroundColor: D.brandMid,
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
        // Simulated gradient via opacity layering
        backgroundColor: D.brand,
        opacity: 0.35,
    },
    backBtn: {
        position: 'absolute',
        top: 48,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtnText: {
        color: D.white,
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 24,
    },
    heroChip: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: D.white,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    heroChipText: {
        color: D.brand,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    // Info Card
    infoCard: {
        backgroundColor: D.white,
        marginHorizontal: 16,
        marginTop: -20,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 0,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 10,
        overflow: 'hidden',
    },
    infoAccent: {
        height: 4,
        backgroundColor: D.brand,
        marginHorizontal: -20,
        marginBottom: 18,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    hotelName: {
        fontFamily: FONT.display,
        fontSize: 24,
        fontWeight: '700',
        color: D.textDark,
        marginBottom: 10,
        lineHeight: 32,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 6,
        marginTop: 2,
    },
    address: {
        flex: 1,
        fontSize: 13,
        color: D.textMid,
        lineHeight: 20,
    },
    description: {
        fontSize: 13,
        color: D.textLight,
        lineHeight: 22,
        borderTopWidth: 1,
        borderTopColor: D.border,
        paddingTop: 12,
        marginTop: 4,
    },

    // Stay Banner
    stayBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: D.brand,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    stayItem: {
        flex: 1,
        alignItems: 'center',
    },
    stayLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    stayValue: {
        fontSize: 13,
        fontWeight: '700',
        color: D.white,
    },
    stayValueHighlight: {
        color: D.white,
        fontSize: 15,
        textDecorationLine: 'underline',
    },
    stayArrow: {
        paddingHorizontal: 4,
    },
    stayArrowText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 16,
    },
    stayDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 4,
    },

    // Rooms Section
    roomsSection: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: FONT.display,
        fontSize: 20,
        fontWeight: '700',
        color: D.textDark,
    },
    sectionSub: {
        fontSize: 12,
        color: D.textLight,
        marginTop: 2,
    },
    sectionBadge: {
        backgroundColor: D.brandLight,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    sectionBadgeText: {
        color: D.brand,
        fontWeight: '800',
        fontSize: 14,
    },

    // No rooms
    noRooms: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: D.white,
        borderRadius: 16,
        paddingHorizontal: 24,
    },
    noRoomsIcon: { fontSize: 40, marginBottom: 12 },
    noRoomsTitle: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
        marginBottom: 6,
    },
    noRoomsSub: {
        fontSize: 13,
        color: D.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default HotelDetailScreen;