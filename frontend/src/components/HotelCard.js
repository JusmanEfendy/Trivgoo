import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/helpers';

const HotelCard = ({ hotel, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <Image
                source={{ uri: hotel.image_url || 'https://placehold.co/600x400?text=Hotel' }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={1}>{hotel.name}</Text>
                <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.city} numberOfLines={1}>{hotel.city}</Text>
                </View>
                {hotel.available_rooms_count !== undefined && (
                    <Text style={styles.availability}>
                        {hotel.available_rooms_count} kamar tersedia
                    </Text>
                )}
                {hotel.min_price && (
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Mulai dari</Text>
                        <Text style={styles.price}>{formatCurrency(hotel.min_price)}</Text>
                        <Text style={styles.perNight}>/malam</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        marginBottom: SIZES.md,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.borderLight,
    },
    content: {
        padding: SIZES.md,
    },
    name: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    locationIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    city: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
    },
    availability: {
        fontSize: SIZES.fontSm,
        color: COLORS.success,
        fontWeight: '600',
        marginBottom: SIZES.sm,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    priceLabel: {
        fontSize: SIZES.fontXs,
        color: COLORS.textLight,
        marginRight: 6,
    },
    price: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.secondary,
    },
    perNight: {
        fontSize: SIZES.fontXs,
        color: COLORS.textLight,
        marginLeft: 4,
    },
});

export default HotelCard;
