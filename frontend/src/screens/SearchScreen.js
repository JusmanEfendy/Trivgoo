import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { searchHotels } from '../services/api';
import { getToday, getFutureDate } from '../utils/helpers';
import HotelCard from '../components/HotelCard';

const SearchScreen = ({ navigation }) => {
    const [city, setCity] = useState('');
    const [checkIn, setCheckIn] = useState(getToday());
    const [checkOut, setCheckOut] = useState(getFutureDate(1));
    const [guests, setGuests] = useState('2');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!city.trim()) {
            setError('Masukkan nama kota');
            return;
        }
        if (!checkIn || !checkOut) {
            setError('Masukkan tanggal check-in dan check-out');
            return;
        }
        if (new Date(checkOut) <= new Date(checkIn)) {
            setError('Tanggal check-out harus setelah check-in');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const data = await searchHotels({
                city: city.trim(),
                checkIn,
                checkOut,
                guests: parseInt(guests) || 2,
            });
            setResults(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mencari hotel. Pastikan server berjalan.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>🏨 TrivGoo</Text>
                    <Text style={styles.heroSub}>Temukan hotel terbaik untuk perjalanan Anda</Text>
                </View>

                {/* Search Form — now outside FlatList to prevent focus loss */}
                <View style={styles.searchCard}>
                    <Text style={styles.formLabel}>Kota Tujuan</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: Bali, Jakarta, Malang"
                        placeholderTextColor={COLORS.textLight}
                        value={city}
                        onChangeText={setCity}
                    />

                    <View style={styles.dateRow}>
                        <View style={styles.dateCol}>
                            <Text style={styles.formLabel}>Check-in</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textLight}
                                value={checkIn}
                                onChangeText={setCheckIn}
                            />
                        </View>
                        <View style={styles.dateSpacer} />
                        <View style={styles.dateCol}>
                            <Text style={styles.formLabel}>Check-out</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textLight}
                                value={checkOut}
                                onChangeText={setCheckOut}
                            />
                        </View>
                    </View>

                    <Text style={styles.formLabel}>Jumlah Tamu</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="2"
                        placeholderTextColor={COLORS.textLight}
                        value={guests}
                        onChangeText={setGuests}
                        keyboardType="number-pad"
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.textWhite} />
                        ) : (
                            <Text style={styles.searchBtnText}>🔍  Cari Hotel</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Results */}
                {results && (
                    <View>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>
                                {results.pagination.total} hotel ditemukan
                            </Text>
                            <Text style={styles.resultsSubtitle}>di "{city}"</Text>
                        </View>

                        {results.data && results.data.length > 0 ? (
                            <View>
                                {results.data.map((item) => (
                                    <View key={item.id} style={styles.cardWrapper}>
                                        <HotelCard
                                            hotel={item}
                                            onPress={() => navigation.navigate('HotelDetail', {
                                                hotelId: item.id,
                                                checkIn,
                                                checkOut,
                                                guests: parseInt(guests) || 2,
                                            })}
                                        />
                                    </View>
                                ))}
                            </View>
                        ) : !loading ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyIcon}>🏝️</Text>
                                <Text style={styles.emptyText}>Tidak ada hotel ditemukan</Text>
                                <Text style={styles.emptySubtext}>Coba cari di kota lain</Text>
                            </View>
                        ) : null}
                    </View>
                )}

                <View style={{ height: SIZES.xxl }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContent: {
        paddingBottom: SIZES.xxl,
    },
    hero: {
        backgroundColor: COLORS.primary,
        paddingTop: SIZES.xxl + SIZES.lg,
        paddingBottom: SIZES.xl,
        paddingHorizontal: SIZES.lg,
    },
    heroTitle: {
        fontSize: SIZES.fontTitle,
        fontWeight: '800',
        color: COLORS.textWhite,
        marginBottom: SIZES.xs,
    },
    heroSub: {
        fontSize: SIZES.fontMd,
        color: 'rgba(255,255,255,0.8)',
    },
    searchCard: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SIZES.md,
        marginTop: -SIZES.md,
        borderRadius: SIZES.borderRadiusLg,
        padding: SIZES.lg,
        ...SHADOWS.large,
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
    dateRow: {
        flexDirection: 'row',
    },
    dateCol: {
        flex: 1,
    },
    dateSpacer: {
        width: SIZES.sm,
    },
    errorText: {
        color: COLORS.danger,
        fontSize: SIZES.fontSm,
        marginTop: SIZES.sm,
        textAlign: 'center',
    },
    searchBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.borderRadiusSm,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: SIZES.lg,
    },
    searchBtnText: {
        color: COLORS.textWhite,
        fontSize: SIZES.fontMd,
        fontWeight: '700',
    },
    resultsHeader: {
        padding: SIZES.lg,
        paddingBottom: SIZES.sm,
    },
    resultsTitle: {
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.text,
    },
    resultsSubtitle: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cardWrapper: {
        paddingHorizontal: SIZES.md,
    },
    emptyBox: {
        alignItems: 'center',
        padding: SIZES.xxl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SIZES.md,
    },
    emptyText: {
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        color: COLORS.text,
    },
    emptySubtext: {
        fontSize: SIZES.fontSm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
});

export default SearchScreen;
