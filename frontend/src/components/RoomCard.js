import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency } from '../utils/helpers';

const RoomCard = ({ room, nights, onPress }) => {
    const totalPrice = room.total_price || room.price_per_night * (nights || 1);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.type}>{room.room_type}</Text>
                <View style={styles.capacityBadge}>
                    <Text style={styles.capacityText}>👥 {room.capacity}</Text>
                </View>
            </View>

            {room.description && (
                <Text style={styles.description} numberOfLines={2}>{room.description}</Text>
            )}

            <View style={styles.priceSection}>
                <View>
                    <Text style={styles.pricePerNight}>
                        {formatCurrency(room.price_per_night)}<Text style={styles.perNight}>/malam</Text>
                    </Text>
                    {nights > 0 && (
                        <Text style={styles.totalPrice}>
                            Total {nights} malam: {formatCurrency(totalPrice)}
                        </Text>
                    )}
                </View>
                {onPress && (
                    <TouchableOpacity style={styles.bookBtn} onPress={onPress} activeOpacity={0.8}>
                        <Text style={styles.bookBtnText}>Pesan</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadiusSm,
        padding: SIZES.md,
        marginBottom: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    type: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.text,
        flex: 1,
    },
    capacityBadge: {
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: SIZES.borderRadiusFull,
    },
    capacityText: {
        fontSize: SIZES.fontXs,
        color: COLORS.primary,
        fontWeight: '600',
    },
    description: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginBottom: SIZES.sm,
        lineHeight: 20,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: SIZES.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    pricePerNight: {
        fontSize: SIZES.fontMd,
        fontWeight: '700',
        color: COLORS.text,
    },
    perNight: {
        fontSize: SIZES.fontXs,
        fontWeight: '400',
        color: COLORS.textLight,
    },
    totalPrice: {
        fontSize: SIZES.fontSm,
        color: COLORS.secondary,
        fontWeight: '600',
        marginTop: 2,
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.borderRadiusSm,
    },
    bookBtnText: {
        color: COLORS.textWhite,
        fontWeight: '700',
        fontSize: SIZES.fontSm,
    },
});

export default RoomCard;
