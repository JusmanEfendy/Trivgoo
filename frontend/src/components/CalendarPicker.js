import React, { useState, useMemo } from 'react';
import {
    View, Text, TouchableOpacity, Modal,
    StyleSheet, Platform, Dimensions,
} from 'react-native';

const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const toDateStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
};

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const CalendarPicker = ({ visible, onClose, onSelect, selectedDate, minimumDate, title }) => {
    const selected = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    const [viewYear, setViewYear] = useState(selected.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected.getMonth());

    const today = useMemo(() => {
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return t;
    }, []);

    const minDate = useMemo(() => {
        if (!minimumDate) return null;
        const d = new Date(minimumDate);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [minimumDate]);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1);
        const startDay = firstDay.getDay(); // 0=Sun
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        const cells = [];
        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            cells.push(null);
        }
        // Day cells
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(new Date(viewYear, viewMonth, d));
        }
        return cells;
    }, [viewYear, viewMonth]);

    const goToPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(y => y - 1);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(y => y + 1);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    const handleDayPress = (date) => {
        if (!date) return;
        if (minDate && date < minDate) return;
        onSelect(toDateStr(date));
        onClose();
    };

    const isDisabled = (date) => {
        if (!date) return true;
        if (minDate && date < minDate) return true;
        return false;
    };

    const isSelected = (date) => {
        if (!date) return false;
        return isSameDay(date, selected);
    };

    const isToday = (date) => {
        if (!date) return false;
        return isSameDay(date, today);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.container}
                    activeOpacity={1}
                    onPress={() => { }}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title || 'Pilih Tanggal'}</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.closeBtn}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Month navigator */}
                    <View style={styles.monthNav}>
                        <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
                            <Text style={styles.navBtnText}>‹</Text>
                        </TouchableOpacity>
                        <Text style={styles.monthLabel}>
                            {MONTHS_ID[viewMonth]} {viewYear}
                        </Text>
                        <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
                            <Text style={styles.navBtnText}>›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Day labels */}
                    <View style={styles.dayLabelsRow}>
                        {DAY_LABELS.map(label => (
                            <View key={label} style={styles.dayLabelCell}>
                                <Text style={[
                                    styles.dayLabelText,
                                    label === 'Min' && { color: '#E55A4B' },
                                ]}>{label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar grid */}
                    <View style={styles.grid}>
                        {calendarDays.map((date, idx) => {
                            const disabled = isDisabled(date);
                            const sel = isSelected(date);
                            const tod = isToday(date);

                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.dayCell,
                                        sel && styles.dayCellSelected,
                                        tod && !sel && styles.dayCellToday,
                                    ]}
                                    onPress={() => handleDayPress(date)}
                                    disabled={disabled}
                                    activeOpacity={0.6}
                                >
                                    {date ? (
                                        <Text style={[
                                            styles.dayText,
                                            disabled && styles.dayTextDisabled,
                                            sel && styles.dayTextSelected,
                                            tod && !sel && styles.dayTextToday,
                                        ]}>
                                            {date.getDate()}
                                        </Text>
                                    ) : null}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Selected date display */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Tanggal dipilih: {' '}
                            <Text style={styles.footerDate}>
                                {selected.getDate()} {MONTHS_ID[selected.getMonth()]} {selected.getFullYear()}
                            </Text>
                        </Text>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const CELL_SIZE = (Dimensions.get('window').width - 80) / 7;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    closeBtn: {
        fontSize: 18,
        color: '#8A97A8',
        fontWeight: '600',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    navBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F2F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBtnText: {
        fontSize: 22,
        color: '#1C1C1E',
        fontWeight: '600',
        lineHeight: 24,
    },
    monthLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    dayLabelsRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    dayLabelCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    dayLabelText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8A97A8',
        textTransform: 'uppercase',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    dayCellSelected: {
        backgroundColor: '#E55A4B',
    },
    dayCellToday: {
        backgroundColor: '#FCEBE9',
    },
    dayText: {
        fontSize: 15,
        color: '#1C1C1E',
        fontWeight: '500',
    },
    dayTextDisabled: {
        color: '#D0D5DD',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    dayTextToday: {
        color: '#E55A4B',
        fontWeight: '700',
    },
    footer: {
        marginTop: 16,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(28,28,30,0.06)',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#8A97A8',
    },
    footerDate: {
        color: '#E55A4B',
        fontWeight: '700',
    },
});

export default CalendarPicker;
