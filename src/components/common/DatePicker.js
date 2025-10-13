import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Modal, Portal } from 'react-native-paper';
import { Colors } from '../../utils/Colors';

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  minimumDate, 
  maximumDate, 
  error,
  style 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : new Date());

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const confirmDate = () => {
    onChange(selectedDate.toISOString().split('T')[0]);
    setShowPicker(false);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateInput = (type, currentValue, setValue) => (
    <View style={styles.dateInputContainer}>
      <Text variant="bodySmall" style={styles.dateInputLabel}>
        {type === 'year' ? 'Year' : type === 'month' ? 'Month' : 'Day'}
      </Text>
      <Button
        mode="outlined"
        onPress={() => {
          // Simple increment/decrement for demo
          const newValue = type === 'year' ? currentValue + 1 :
                          type === 'month' ? (currentValue % 12) + 1 :
                          (currentValue % 31) + 1;
          setValue(newValue);
        }}
        style={styles.dateInputButton}
      >
        {currentValue}
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>

      <Button
        mode="outlined"
        onPress={showDatePicker}
        style={[styles.button, error && styles.errorButton]}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {formatDisplayDate(value)}
      </Button>

      {error && (
        <Text variant="bodySmall" style={styles.errorText}>
          {error}
        </Text>
      )}

      {showPicker && (
        <Portal>
          <Modal
            visible={showPicker}
            onDismiss={() => setShowPicker(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.pickerContainer}>
              <Text variant="titleMedium" style={styles.modalTitle}>
                Select Date
              </Text>

              <View style={styles.dateInputsRow}>
                {getDateInput('year', selectedDate.getFullYear(), (year) =>
                  setSelectedDate(new Date(year, selectedDate.getMonth(), selectedDate.getDate()))
                )}
                {getDateInput('month', selectedDate.getMonth() + 1, (month) =>
                  setSelectedDate(new Date(selectedDate.getFullYear(), month - 1, selectedDate.getDate()))
                )}
                {getDateInput('day', selectedDate.getDate(), (day) =>
                  setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day))
                )}
              </View>

              <View style={styles.buttonRow}>
                <Button
                  mode="text"
                  onPress={() => setShowPicker(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={confirmDate}
                  style={styles.confirmButton}
                >
                  Confirm
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
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
    color: Colors.text.secondary,
  },
  button: {
    justifyContent: 'flex-start',
    borderColor: Colors.gray[400],
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
  },
  errorButton: {
    borderColor: Colors.error,
  },
  buttonContent: {
    justifyContent: 'flex-start',
    paddingLeft: 12,
  },
  buttonLabel: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: 'normal',
  },
  errorText: {
    color: Colors.error,
    marginTop: 4,
    marginLeft: 12,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  pickerContainer: {
    // Styles for the picker content
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.primary,
  },
  dateInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  dateInputContainer: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  dateInputLabel: {
    marginBottom: 8,
    color: Colors.gray[600],
  },
  dateInputButton: {
    minWidth: 60,
  },
});

export default DatePicker;