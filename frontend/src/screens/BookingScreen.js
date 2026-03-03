import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, StyleSheet, ActivityIndicator, Alert, StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { createBooking } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const BookingScreen = ({ route, navigation }) => {
    const { hotel, room, checkIn, checkOut, guests, nights } = route.params;
    const totalPrice = room.price_per_night * nights;

    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleBooking = async () => {
        if (!guestName.trim()) {
            setError('Masukkan nama lengkap');
            return;
        }
        if (!guestEmail.trim() || !guestEmail.includes('@')) {
            setError('Masukkan email yang valid');
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
            if (err.response?.status === 409) {
                Alert.alert('Kamar Tidak Tersedia', 'Kamar sudah dipesan orang lain. Silakan pilih kamar lain.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Booking Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.sectionTitle}>Ringkasan Pesanan</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Hotel</Text>
                        <Text style={styles.summaryValue}>{hotel.name}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Kamar</Text>
                        <Text style={styles.summaryValue}>{room.room_type}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Check-in</Text>
                        <Text style={styles.summaryValue}>{formatDate(checkIn)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Check-out</Text>
                        <Text style={styles.summaryValue}>{formatDate(checkOut)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Durasi</Text>
                        <Text style={styles.summaryValue}>{nights} malam</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tamu</Text>
                        <Text style={styles.summaryValue}>{guests} orang</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Harga/malam</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(room.price_per_night)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
                    </View>
                </View>

                {/* Guest Form */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Data Tamu</Text>

                    <Text style={styles.formLabel}>Nama Lengkap</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan nama lengkap"
                        placeholderTextColor={COLORS.textLight}
                        value={guestName}
                        onChangeText={setGuestName}
                        autoCapitalize="words"
                    />

                    <Text style={styles.formLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="contoh@email.com"
                        placeholderTextColor={COLORS.textLight}
                        value={guestEmail}
                        onChangeText={setGuestEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Book Button */}
                <TouchableOpacity
                    style={[styles.bookBtn, loading && styles.bookBtnDisabled]}
                    onPress={handleBooking}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.textWhite} />
                    ) : (
                        <Text style={styles.bookBtnText}>Konfirmasi Booking</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.md, paddingBottom: SIZES.xxl },
    summaryCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.lg,
        marginBottom: SIZES.md,
        ...SHADOWS.medium,
    },
    sectionTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SIZES.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryLabel: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
    summaryValue: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SIZES.sm,
    },
    totalRow: {
        paddingVertical: SIZES.sm,
    },
    totalLabel: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.text },
    totalValue: { fontSize: SIZES.fontLg, fontWeight: '800', color: COLORS.secondary },
    formCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.lg,
        marginBottom: SIZES.lg,
        ...SHADOWS.medium,
    },
    formLabel: {
        fontSize: SIZES.fontSm,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 6,
        marginTop: SIZES.sm,
    },
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
    errorText: {
        color: COLORS.danger,
        fontSize: SIZES.fontSm,
        marginTop: SIZES.sm,
        textAlign: 'center',
    },
    bookBtn: {
        backgroundColor: COLORS.success,
        borderRadius: SIZES.borderRadiusSm,
        paddingVertical: 16,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    bookBtnDisabled: { opacity: 0.7 },
    bookBtnText: {
        color: COLORS.textWhite,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
    },
});

export default BookingScreen;
