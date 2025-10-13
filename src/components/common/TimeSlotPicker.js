import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip, Card } from 'react-native-paper';
import { Colors } from '../../utils/Colors';

const TimeSlotPicker = ({ 
  label, 
  value, 
  onChange, 
  availableSlots = [],
  disabled = false,
  error,
  style 
}) => {
  const [selectedSlot, setSelectedSlot] = useState(value);

  // Default time slots if none provided
  const defaultTimeSlots = [
    { id: 'morning', label: 'Morning (8:00 AM - 12:00 PM)', startTime: '08:00', endTime: '12:00' },
    { id: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)', startTime: '12:00', endTime: '16:00' },
    { id: 'evening', label: 'Evening (4:00 PM - 8:00 PM)', startTime: '16:00', endTime: '20:00' },
  ];

  const timeSlots = availableSlots.length > 0 ? availableSlots : defaultTimeSlots;

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    onChange(slot);
  };

  const getSlotStatus = (slot) => {
    if (disabled) return 'disabled';
    if (slot.available === false) return 'unavailable';
    if (selectedSlot?.id === slot.id) return 'selected';
    return 'available';
  };

  const getSlotStyle = (status) => {
    switch (status) {
      case 'selected':
        return { backgroundColor: Colors.primary, borderColor: Colors.primary };
      case 'unavailable':
        return { backgroundColor: Colors.gray[200], borderColor: Colors.gray[300] };
      case 'disabled':
        return { backgroundColor: Colors.gray[100], borderColor: Colors.gray[200] };
      default:
        return { backgroundColor: Colors.white, borderColor: Colors.gray[400] };
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case 'selected':
        return Colors.white;
      case 'unavailable':
      case 'disabled':
        return Colors.gray[500];
      default:
        return Colors.text.primary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.slotsContainer}
      >
        {timeSlots.map((slot) => {
          const status = getSlotStatus(slot);
          const isDisabled = status === 'disabled' || status === 'unavailable';
          
          return (
            <Chip
              key={slot.id}
              selected={status === 'selected'}
              onPress={() => !isDisabled && handleSlotSelect(slot)}
              style={[styles.slotChip, getSlotStyle(status)]}
              textStyle={[styles.slotText, { color: getTextColor(status) }]}
              disabled={isDisabled}
            >
              {slot.label}
            </Chip>
          );
        })}
      </ScrollView>

      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}

      {selectedSlot && (
        <Card style={styles.selectedCard}>
          <Card.Content style={styles.selectedContent}>
            <Text variant="bodySmall" style={styles.selectedLabel}>
              Selected Time Slot:
            </Text>
            <Text variant="bodyMedium" style={styles.selectedValue}>
              {selectedSlot.label}
            </Text>
            <Text variant="bodySmall" style={styles.selectedTime}>
              {selectedSlot.startTime} - {selectedSlot.endTime}
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  slotsContainer: {
    paddingVertical: 8,
  },
  slotChip: {
    marginRight: 8,
    borderWidth: 1,
  },
  slotText: {
    fontSize: 12,
  },
  errorText: {
    color: Colors.error,
    marginTop: 4,
  },
  selectedCard: {
    marginTop: 12,
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  selectedContent: {
    paddingVertical: 8,
  },
  selectedLabel: {
    color: Colors.gray[600],
    marginBottom: 2,
  },
  selectedValue: {
    color: Colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedTime: {
    color: Colors.gray[600],
  },
});

export default TimeSlotPicker;
