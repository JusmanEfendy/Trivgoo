import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, Image, ActivityIndicator, StyleSheet, StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { getHotelDetail } from '../services/api';
import { formatDate, calculateNights } from '../utils/helpers';
import RoomCard from '../components/RoomCard';

const HotelDetailScreen = ({ route, navigation }) => {
    const { hotelId, checkIn, checkOut, guests } = route.params;
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const nights = calculateNights(checkIn, checkOut);

    useEffect(() => {
        loadHotel();
    }, []);

    const loadHotel = async () => {
        try {
            const data = await getHotelDetail(hotelId, { checkIn, checkOut, guests });
            setHotel(data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat detail hotel');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !hotel) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorEmoji}>😞</Text>
                <Text style={styles.errorText}>{error || 'Hotel tidak ditemukan'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hotel Image */}
                <Image
                    source={{ uri: hotel.image_url || 'https://placehold.co/600x400?text=Hotel' }}
                    style={styles.heroImage}
                    resizeMode="cover"
                />

                {/* Hotel Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.hotelName}>{hotel.name}</Text>
                    <View style={styles.locationRow}>
                        <Text style={styles.icon}>📍</Text>
                        <Text style={styles.address}>{hotel.address}</Text>
                    </View>
                    {hotel.description && (
                        <Text style={styles.description}>{hotel.description}</Text>
                    )}
                </View>

                {/* Stay Info */}
                <View style={styles.stayInfo}>
                    <View style={styles.stayItem}>
                        <Text style={styles.stayLabel}>Check-in</Text>
                        <Text style={styles.stayValue}>{formatDate(checkIn)}</Text>
                    </View>
                    <View style={styles.stayDivider} />
                    <View style={styles.stayItem}>
                        <Text style={styles.stayLabel}>Check-out</Text>
                        <Text style={styles.stayValue}>{formatDate(checkOut)}</Text>
                    </View>
                    <View style={styles.stayDivider} />
                    <View style={styles.stayItem}>
                        <Text style={styles.stayLabel}>Durasi</Text>
                        <Text style={styles.stayValue}>{nights} malam</Text>
                    </View>
                </View>

                {/* Room List */}
                <View style={styles.roomsSection}>
                    <Text style={styles.sectionTitle}>
                        Kamar Tersedia ({hotel.rooms?.length || 0})
                    </Text>
                    <Text style={styles.sectionSub}>Untuk {guests} tamu</Text>

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
                            <Text style={styles.noRoomsText}>Tidak ada kamar tersedia</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.lg },
    errorEmoji: { fontSize: 48, marginBottom: SIZES.md },
    errorText: { fontSize: SIZES.fontMd, color: COLORS.danger, textAlign: 'center' },
    heroImage: { width: '100%', height: 250, backgroundColor: COLORS.borderLight },
    infoCard: {
        backgroundColor: COLORS.surface,
        margin: SIZES.md,
        padding: SIZES.lg,
        borderRadius: SIZES.borderRadius,
        ...SHADOWS.medium,
    },
    hotelName: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.text, marginBottom: SIZES.sm },
    locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.sm },
    icon: { fontSize: 14, marginRight: 6, marginTop: 2 },
    address: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
    description: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, lineHeight: 22, marginTop: SIZES.sm },
    stayInfo: {
        flexDirection: 'row',
        backgroundColor: COLORS.primaryLight,
        marginHorizontal: SIZES.md,
        borderRadius: SIZES.borderRadiusSm,
        padding: SIZES.md,
        marginBottom: SIZES.md,
    },
    stayItem: { flex: 1, alignItems: 'center' },
    stayLabel: { fontSize: SIZES.fontXs, color: COLORS.primary, marginBottom: 4 },
    stayValue: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.primaryDark },
    stayDivider: { width: 1, backgroundColor: COLORS.primary, opacity: 0.2 },
    roomsSection: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.xxl },
    sectionTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    sectionSub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginBottom: SIZES.md },
    noRooms: { alignItems: 'center', padding: SIZES.xl },
    noRoomsIcon: { fontSize: 36, marginBottom: SIZES.sm },
    noRoomsText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
});

export default HotelDetailScreen;
