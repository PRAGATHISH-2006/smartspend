// Interactive Visual Calendar Picker Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  title?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  title,
}) => {
  const initialDate = selectedDate ? parseISO(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    isNaN(initialDate.getTime()) ? new Date() : initialDate
  );

  const selectedParsed = selectedDate ? parseISO(selectedDate) : null;
  const minParsed = minDate ? parseISO(minDate) : null;
  const maxParsed = maxDate ? parseISO(maxDate) : null;

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <CalendarIcon size={16} color={THEME.colors.primary} />
          <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
        </View>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handlePrevMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleNextMonth}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ChevronRight size={18} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayCol}>
            <Text
              style={[
                styles.dayLabel,
                index === 0 || index === 6 ? styles.weekendLabel : null,
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const isCurrentMonthDay = isSameMonth(day, monthStart);
        const isSelected = selectedParsed ? isSameDay(day, selectedParsed) : false;
        const isTodayDate = isToday(day);

        let isDisabled = false;
        if (minParsed && isBefore(day, minParsed) && !isSameDay(day, minParsed)) {
          isDisabled = true;
        }
        if (maxParsed && isBefore(maxParsed, day)) {
          isDisabled = true;
        }

        days.push(
          <TouchableOpacity
            key={formattedDate}
            style={[
              styles.cell,
              !isCurrentMonthDay && styles.outsideMonthCell,
              isSelected && styles.selectedCell,
              isTodayDate && !isSelected && styles.todayCell,
              isDisabled && styles.disabledCell,
            ]}
            disabled={isDisabled}
            onPress={() => onSelectDate(formattedDate)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.cellText,
                !isCurrentMonthDay && styles.outsideMonthText,
                isTodayDate && !isSelected && styles.todayText,
                isSelected && styles.selectedText,
                isDisabled && styles.disabledText,
              ]}
            >
              {format(day, 'd')}
            </Text>
          </TouchableOpacity>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <View key={day.toISOString()} style={styles.weekRow}>
          {days}
        </View>
      );
      days = [];
    }

    return <View style={styles.grid}>{rows}</View>;
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.pickerTitle}>{title}</Text> : null}
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      {selectedDate ? (
        <View style={styles.selectedFooter}>
          <Text style={styles.selectedFooterLabel}>Selected Target Date:</Text>
          <Text style={styles.selectedFooterValue}>
            {format(parseISO(selectedDate), 'EEE, MMM d, yyyy')}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  weekendLabel: {
    color: '#94a3b8',
  },
  grid: {
    gap: 4,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  outsideMonthCell: {
    opacity: 0.35,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    backgroundColor: 'rgba(5, 150, 105, 0.06)',
  },
  selectedCell: {
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCell: {
    opacity: 0.25,
  },
  cellText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  outsideMonthText: {
    color: '#94a3b8',
  },
  todayText: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  disabledText: {
    color: '#cbd5e1',
  },
  selectedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  selectedFooterLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  selectedFooterValue: {
    fontSize: 12,
    color: THEME.colors.primary,
    fontWeight: '700',
  },
});
