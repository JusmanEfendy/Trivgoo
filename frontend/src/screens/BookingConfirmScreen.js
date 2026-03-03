import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency, formatDate } from '../utils/helpers';

const BookingConfirmScreen = ({ route, navigation }) => {
    const { booking, hotel, room, nights } = route.params;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Success Icon */}
                <View style={styles.successBox}>
                    <View style={styles.checkCircle}>
                        <Text style={styles.checkIcon}>✓</Text>
                    </View>
                    <Text style={styles.successTitle}>Booking Berhasil! 🎉</Text>
                    <Text style={styles.successSub}>Pesanan Anda telah dikonfirmasi</Text>
                </View>

                {/* Booking Reference */}
                <View style={styles.refCard}>
                    <Text style={styles.refLabel}>Nomor Referensi</Text>
                    <Text style={styles.refNumber} selectable>{booking.booking_ref}</Text>
                    <Text style={styles.refHint}>Simpan nomor ini untuk keperluan check-in</Text>
                </View>

                {/* Details */}
                <View style={styles.detailCard}>
                    <Text style={styles.sectionTitle}>Detail Booking</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Hotel</Text>
                        <Text style={styles.value}>{hotel.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Kamar</Text>
                        <Text style={styles.value}>{room.room_type}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tamu</Text>
                        <Text style={styles.value}>{booking.guest_name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{booking.guest_email}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Check-in</Text>
                        <Text style={styles.value}>{formatDate(booking.check_in_date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Check-out</Text>
                        <Text style={styles.value}>{formatDate(booking.check_out_date)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Durasi</Text>
                        <Text style={styles.value}>{nights} malam</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.totalLabel}>Total Bayar</Text>
                        <Text style={styles.totalValue}>{formatCurrency(booking.total_price)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Confirmed ✓</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                    style={styles.homeBtn}
                    onPress={() => navigation.popToTop()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.homeBtnText}>🔍 Cari Hotel Lagi</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SIZES.md, paddingBottom: SIZES.xxl },
    successBox: { alignItems: 'center', paddingVertical: SIZES.xl },
    checkCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: COLORS.successLight,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SIZES.md,
    },
    checkIcon: { fontSize: 32, color: COLORS.success, fontWeight: '700' },
    successTitle: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.text },
    successSub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 4 },
    refCard: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.lg,
        alignItems: 'center',
        marginBottom: SIZES.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
    },
    refLabel: { fontSize: SIZES.fontSm, color: COLORS.primary, fontWeight: '600' },
    refNumber: {
        fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.primaryDark,
        marginVertical: SIZES.sm, letterSpacing: 0.5,
    },
    refHint: { fontSize: SIZES.fontXs, color: COLORS.primary, opacity: 0.8 },
    detailCard: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.borderRadius,
        padding: SIZES.lg,
        marginBottom: SIZES.lg,
        ...SHADOWS.medium,
    },
    sectionTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
    label: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
    value: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.text, maxWidth: '60%', textAlign: 'right' },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.sm },
    totalLabel: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.text },
    totalValue: { fontSize: SIZES.fontLg, fontWeight: '800', color: COLORS.secondary },
    statusBadge: {
        backgroundColor: COLORS.successLight,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 4,
        borderRadius: SIZES.borderRadiusFull,
    },
    statusText: { fontSize: SIZES.fontXs, color: COLORS.success, fontWeight: '700' },
    homeBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.borderRadiusSm,
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeBtnText: { color: COLORS.textWhite, fontSize: SIZES.fontMd, fontWeight: '700' },
});

export default BookingConfirmScreen;
