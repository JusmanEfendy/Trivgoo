import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, ActivityIndicator,
    StatusBar, Image, Animated, Platform
} from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { searchHotels } from '../services/api';
import { getToday, getFutureDate } from '../utils/helpers';
import HotelCard from '../components/HotelCard';
import CalendarPicker from '../components/CalendarPicker';

// ─── Design Tokens ────────────────────────────────────────────────────────────
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

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const QUICK_CITIES = ['Bali', 'Jakarta', 'Yogyakarta', 'Surabaya', 'Malang'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Pilih tanggal';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = DAYS[d.getDay()];
    return `${day}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const toDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
};

const SearchScreen = ({ navigation }) => {
    const [city, setCity] = useState('');
    const [checkIn, setCheckIn] = useState(getToday());
    const [checkOut, setCheckOut] = useState(getFutureDate(1));
    const [guests, setGuests] = useState('2');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(null);
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const onCheckInSelect = (dateStr) => {
        setCheckIn(dateStr);
        // auto-bump checkout if it's before the new checkin
        if (new Date(checkOut + 'T00:00:00') <= new Date(dateStr + 'T00:00:00')) {
            const next = new Date(dateStr + 'T00:00:00');
            next.setDate(next.getDate() + 1);
            setCheckOut(toDateStr(next));
        }
    };

    const onCheckOutSelect = (dateStr) => {
        setCheckOut(dateStr);
    };

    const handleSearch = async () => {
        if (!city.trim()) { setError('Masukkan nama kota tujuan'); return; }
        if (!checkIn || !checkOut) { setError('Lengkapi tanggal perjalanan'); return; }
        if (new Date(checkOut) <= new Date(checkIn)) {
            setError('Tanggal check-out harus setelah check-in');
            return;
        }
        setError('');
        setLoading(true);
        setResults(null);
        try {
            const data = await searchHotels({
                city: city.trim(), checkIn, checkOut,
                guests: parseInt(guests) || 2,
            });
            setResults(data);
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mencari hotel. Pastikan server berjalan.');
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scroll}
            >
                {/* ── Hero ───────────────────────────────────────────────────── */}
                <View style={styles.hero}>
                    {/* Decorative circles */}
                    <View style={styles.decoCircle1} />
                    <View style={styles.decoCircle2} />

                    <View style={styles.heroInner}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.heroHeadline}>
                            Liburan Nyaman,{'\n'}Mulai dari Sini
                        </Text>
                        <Text style={styles.heroSub}>
                            Pesan hotel dan penginapan murah hanya di TrivGoo
                        </Text>

                        {/* Trust badges */}
                        <View style={styles.badgeRow}>
                            {['✓ Harga Terjamin', '✓ Bayar Fleksibel', '✓ Dukungan 24/7'].map(b => (
                                <View key={b} style={styles.badge}>
                                    <Text style={styles.badgeText}>{b}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* ── Search Card ─────────────────────────────────────────────── */}
                <View style={styles.card}>

                    {/* City */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldIcon}>📍</Text>
                        <View style={styles.fieldBody}>
                            <Text style={styles.fieldLabel}>Kota Tujuan</Text>
                            <TextInput
                                style={inputStyle('city')}
                                placeholder="Contoh: Bali, Jakarta, Malang"
                                placeholderTextColor={D.textLight}
                                value={city}
                                onChangeText={setCity}
                                onFocus={() => setFocused('city')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>

                    {/* Quick city chips */}
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        style={styles.chipsScroll}
                        contentContainerStyle={styles.chipsContent}
                    >
                        {QUICK_CITIES.map(c => (
                            <TouchableOpacity
                                key={c}
                                style={[styles.chip, city === c && styles.chipActive]}
                                onPress={() => setCity(c)}
                                activeOpacity={0.75}
                            >
                                <Text style={[styles.chipText, city === c && styles.chipTextActive]}>
                                    {c}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Date row */}
                    <View style={styles.dateRow}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.fieldIcon}>📅</Text>
                            <View style={styles.fieldBody}>
                                <Text style={styles.fieldLabel}>Check-in</Text>
                                <TouchableOpacity
                                    style={styles.dateBtn}
                                    onPress={() => setShowCheckInPicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dateBtnText}>
                                        {formatDateDisplay(checkIn)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.dateArrow}>
                            <Text style={styles.dateArrowText}>→</Text>
                        </View>

                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.fieldIcon}>📅</Text>
                            <View style={styles.fieldBody}>
                                <Text style={styles.fieldLabel}>Check-out</Text>
                                <TouchableOpacity
                                    style={styles.dateBtn}
                                    onPress={() => setShowCheckOutPicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.dateBtnText}>
                                        {formatDateDisplay(checkOut)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Calendar Picker Modals */}
                    <CalendarPicker
                        visible={showCheckInPicker}
                        onClose={() => setShowCheckInPicker(false)}
                        onSelect={onCheckInSelect}
                        selectedDate={checkIn}
                        minimumDate={new Date()}
                        title="Pilih Tanggal Check-in"
                    />
                    <CalendarPicker
                        visible={showCheckOutPicker}
                        onClose={() => setShowCheckOutPicker(false)}
                        onSelect={onCheckOutSelect}
                        selectedDate={checkOut}
                        minimumDate={new Date(checkIn + 'T00:00:00')}
                        title="Pilih Tanggal Check-out"
                    />

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Guests */}
                    <View style={styles.guestRow}>
                        <View style={[styles.fieldGroup, { flex: 1 }]}>
                            <Text style={styles.fieldIcon}>👥</Text>
                            <View style={styles.fieldBody}>
                                <Text style={styles.fieldLabel}>Jumlah Tamu</Text>
                                <TextInput
                                    style={inputStyle('guests')}
                                    placeholder="2"
                                    placeholderTextColor={D.textLight}
                                    value={guests}
                                    onChangeText={setGuests}
                                    keyboardType="number-pad"
                                    onFocus={() => setFocused('guests')}
                                    onBlur={() => setFocused(null)}
                                />
                            </View>
                        </View>

                        {/* Stepper */}
                        <View style={styles.stepper}>
                            <TouchableOpacity
                                style={styles.stepBtn}
                                onPress={() => setGuests(g => String(Math.max(1, parseInt(g || '1') - 1)))}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.stepBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepCount}>{guests || '1'}</Text>
                            <TouchableOpacity
                                style={[styles.stepBtn, styles.stepBtnPlus]}
                                onPress={() => setGuests(g => String(Math.min(10, parseInt(g || '1') + 1)))}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.stepBtnText, { color: D.white }]}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠️  {error}</Text>
                        </View>
                    ) : null}

                    {/* Search button */}
                    <TouchableOpacity
                        style={styles.searchBtn}
                        onPress={handleSearch}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={D.white} />
                        ) : (
                            <Text style={styles.searchBtnText}>Cari Hotel Sekarang</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Results ─────────────────────────────────────────────────── */}
                {results && (
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Results header */}
                        <View style={styles.resultsHeader}>
                            <View>
                                <Text style={styles.resultsTitle}>
                                    {results.pagination.total} Hotel Tersedia
                                </Text>
                                <Text style={styles.resultsSub}>
                                    di kota "{city}"
                                </Text>
                            </View>
                            <View style={styles.resultsBadge}>
                                <Text style={styles.resultsBadgeText}>
                                    {results.pagination.total}
                                </Text>
                            </View>
                        </View>

                        {/* Cards */}
                        {results.data && results.data.length > 0 ? (
                            results.data.map((item) => (
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
                            ))
                        ) : !loading ? (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyIcon}>🏝️</Text>
                                <Text style={styles.emptyTitle}>Tidak Ada Hotel</Text>
                                <Text style={styles.emptySub}>
                                    Coba cari di kota lain atau ubah tanggal
                                </Text>
                            </View>
                        ) : null}
                    </Animated.View>
                )}

                <View style={{ height: 48 }} />
            </ScrollView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

    // Layout
    root: {
        flex: 1,
        backgroundColor: D.bgPage,
    },
    scroll: {
        paddingBottom: 0,
    },

    // Hero
    hero: {
        backgroundColor: D.brand,
        paddingBottom: 48,
        overflow: 'hidden',
    },
    heroInner: {
        paddingTop: 56,
        paddingHorizontal: 24,
    },
    decoCircle1: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: D.white,
        top: -80,
        right: -80,
        opacity: 0.1,
    },
    decoCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1.5,
        borderColor: D.white,
        bottom: 10,
        right: 24,
        opacity: 0.15,
    },
    logo: {
        height: 54,
        width: 160,
        marginBottom: 16,
        marginLeft: -8, // slight offset to align properly with text
    },
    heroHeadline: {
        fontFamily: FONT.display,
        fontSize: 32,
        fontWeight: '700',
        color: D.white,
        lineHeight: 42,
        letterSpacing: 0.3,
        marginBottom: 10,
    },
    heroSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 20,
        letterSpacing: 0.2,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: D.white,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    // Card
    card: {
        backgroundColor: D.white,
        marginHorizontal: 16,
        marginTop: -28,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        shadowColor: D.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 10,
    },

    // Field group
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
        fontSize: 11,
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
        paddingVertical: 11,
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

    // Quick chips
    chipsScroll: {
        marginTop: 10,
        marginLeft: 28,
    },
    chipsContent: {
        paddingRight: 16,
        gap: 8,
        flexDirection: 'row',
    },
    chip: {
        borderWidth: 1.5,
        borderColor: D.border,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: D.inputBg,
    },
    chipActive: {
        borderColor: D.brand,
        backgroundColor: D.brand,
    },
    chipText: {
        fontSize: 13,
        color: D.textMid,
        fontWeight: '500',
    },
    chipTextActive: {
        color: D.white,
        fontWeight: '700',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: D.border,
        marginVertical: 14,
        marginHorizontal: -4,
    },

    // Dates
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateArrow: {
        paddingTop: 14,
        paddingHorizontal: 4,
    },
    dateArrowText: {
        color: D.textLight,
        fontSize: 18,
    },
    dateBtn: {
        backgroundColor: D.inputBg,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    dateBtnText: {
        fontSize: 14,
        color: D.textDark,
        fontWeight: '500',
        fontFamily: FONT.body,
    },

    // Guests
    guestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingTop: 14,
    },
    stepBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: D.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: D.white,
    },
    stepBtnPlus: {
        backgroundColor: D.brand,
        borderColor: D.brand,
    },
    stepBtnText: {
        fontSize: 18,
        color: D.textDark,
        lineHeight: 22,
        fontWeight: '600',
    },
    stepCount: {
        fontSize: 18,
        fontWeight: '700',
        color: D.textDark,
        minWidth: 24,
        textAlign: 'center',
    },

    // Error
    errorBox: {
        backgroundColor: '#FFF5F5',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        borderLeftWidth: 3,
        borderLeftColor: D.danger,
    },
    errorText: {
        color: D.danger,
        fontSize: 13,
        fontWeight: '500',
    },

    // Search button
    searchBtn: {
        backgroundColor: D.brand,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 18,
        shadowColor: D.brand,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    searchBtnText: {
        color: D.white,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.4,
    },

    // Results
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 12,
    },
    resultsTitle: {
        fontFamily: FONT.display,
        fontSize: 20,
        fontWeight: '700',
        color: D.textDark,
    },
    resultsSub: {
        fontSize: 13,
        color: D.textLight,
        marginTop: 2,
    },
    resultsBadge: {
        backgroundColor: D.brandLight,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    resultsBadgeText: {
        color: D.brand,
        fontWeight: '800',
        fontSize: 14,
    },
    cardWrapper: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },

    // Empty
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        fontSize: 52,
        marginBottom: 16,
    },
    emptyTitle: {
        fontFamily: FONT.display,
        fontSize: 20,
        fontWeight: '700',
        color: D.textDark,
        marginBottom: 6,
    },
    emptySub: {
        fontSize: 14,
        color: D.textLight,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default SearchScreen;