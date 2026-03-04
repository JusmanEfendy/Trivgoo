import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { formatCurrency } from '../utils/helpers';

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
    surface: '#FFFFFF',
    bgPage: '#F8F9FA',
    border: 'rgba(28,28,30,0.08)',
    inputBg: '#F0F2F5',
};

const FONT = {
    display: Platform.select({ ios: 'Georgia', android: 'serif' }),
    body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

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
        backgroundColor: D.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: D.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    type: {
        fontFamily: FONT.display,
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
        flex: 1,
    },
    capacityBadge: {
        backgroundColor: D.brandLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    capacityText: {
        fontSize: 12,
        color: D.brand,
        fontWeight: '800',
    },
    description: {
        fontFamily: FONT.body,
        fontSize: 13,
        color: D.textMid,
        marginBottom: 12,
        lineHeight: 20,
    },
    priceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1.5,
        borderTopColor: D.border,
    },
    pricePerNight: {
        fontSize: 16,
        fontWeight: '800',
        color: D.textDark,
    },
    perNight: {
        fontSize: 12,
        fontWeight: '500',
        color: D.textLight,
    },
    totalPrice: {
        fontSize: 13,
        color: D.darkLight,
        fontWeight: '600',
        marginTop: 4,
    },
    bookBtn: {
        backgroundColor: D.brand,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: D.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    bookBtnText: {
        color: D.white,
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 0.3,
    },
});

export default RoomCard;
