import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  IconButton
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { Colors, getBloodTypeColor, getUrgencyColor } from '../../utils/Colors';
import { formatBloodType, formatDateTime } from '../../utils/Constants';

const AlertCard = ({ alert, onRespond, currentUser }) => {
  const urgencyColor = getUrgencyColor(alert.urgencyLevel);
  const bloodTypeColor = getBloodTypeColor(alert.bloodType);

  const handleAccept = () => {
    onRespond(alert.id, 'ACCEPTED');
  };

  const handleDecline = () => {
    onRespond(alert.id, 'DECLINED');
  };

  // Check if current user has already responded
  const userResponse = alert.responses?.find(r => r.donorId === currentUser?.id);
  const hasResponded = !!userResponse;

  return (
    <Card 
      style={[
        styles.card, 
        { borderLeftColor: urgencyColor, borderLeftWidth: 4 }
      ]}
      elevation={2}
    >
      <Card.Content>
        {/* Header with blood type and urgency */}
        <View style={styles.header}>
          <Chip
            mode="flat"
            style={[styles.bloodTypeChip, { backgroundColor: bloodTypeColor }]}
            textStyle={styles.bloodTypeText}
          >
            {formatBloodType(alert.bloodType)}
          </Chip>
          <Chip
            mode="outlined"
            style={[styles.urgencyChip, { borderColor: urgencyColor }]}
            textStyle={[styles.urgencyText, { color: urgencyColor }]}
          >
            {alert.urgencyLevel}
          </Chip>
        </View>

        {/* Hospital Information */}
        <Text variant="titleLarge" style={styles.hospitalName}>
          {alert.hospitalName}
        </Text>

        {/* Patient Information */}
        {alert.patientName && (
          <Text variant="bodyMedium" style={styles.patientName}>
            Patient: {alert.patientName}
          </Text>
        )}

        {/* Alert Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="water" size={16} color={Colors.gray[600]} />
            <Text variant="bodySmall" style={styles.detailText}>
              {alert.unitsNeeded} units needed
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color={Colors.gray[600]} />
            <Text variant="bodySmall" style={styles.detailText}>
              {formatDateTime(alert.createdAt)}
            </Text>
          </View>
        </View>

        {/* Required By Date */}
        {alert.requiredBy && (
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={Colors.warning} />
              <Text variant="bodySmall" style={[styles.detailText, { color: Colors.warning }]}>
                Required by: {formatDateTime(alert.requiredBy)}
              </Text>
            </View>
          </View>
        )}

        {/* Alert Message */}
        {alert.message && (
          <View style={styles.messageContainer}>
            <Text variant="bodySmall" style={styles.alertMessage}>
              "{alert.message}"
            </Text>
          </View>
        )}

        {/* Response Status or Action Buttons */}
        {hasResponded ? (
          <View style={styles.responseStatus}>
            <View style={styles.responseIndicator}>
              <Ionicons 
                name={userResponse.response === 'ACCEPTED' ? 'checkmark-circle' : 'close-circle'} 
                size={20} 
                color={userResponse.response === 'ACCEPTED' ? Colors.success : Colors.error}
              />
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.responseText,
                  { 
                    color: userResponse.response === 'ACCEPTED' ? Colors.success : Colors.error 
                  }
                ]}
              >
                You {userResponse.response.toLowerCase()} this request
              </Text>
            </View>
            {userResponse.status === 'CONFIRMED' && (
              <Text variant="bodySmall" style={styles.confirmedText}>
                ✓ Appointment confirmed
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.actionButtons}>
            {currentUser ? (
              <>
                <Button
                  mode="contained"
                  onPress={handleAccept}
                  style={[styles.actionButton, styles.acceptButton]}
                  buttonColor={Colors.success}
                  icon="check"
                  compact
                >
                  I Can Donate
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleDecline}
                  style={[styles.actionButton, styles.declineButton]}
                  textColor={Colors.error}
                  icon="close"
                  compact
                >
                  Not Available
                </Button>
              </>
            ) : (
              <View style={styles.loginPrompt}>
                <Text variant="bodyMedium" style={styles.loginPromptText}>
                  Please log in to respond to this emergency alert
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Response Statistics */}
        {alert.responses && alert.responses.length > 0 && (
          <View style={styles.statsContainer}>
            <Text variant="bodySmall" style={styles.statsText}>
              {alert.responses.filter(r => r.response === 'ACCEPTED').length} accepted • {' '}
              {alert.responses.filter(r => r.response === 'DECLINED').length} declined • {' '}
              {alert.notificationsSent || 0} notified
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodTypeChip: {
    paddingHorizontal: 4,
  },
  bloodTypeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  urgencyChip: {
    backgroundColor: 'transparent',
  },
  urgencyText: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  hospitalName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.gray[900],
  },
  patientName: {
    color: Colors.gray[700],
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginVertical: 2,
  },
  detailText: {
    marginLeft: 4,
    color: Colors.gray[600],
  },
  messageContainer: {
    backgroundColor: Colors.gray[50],
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  alertMessage: {
    fontStyle: 'italic',
    color: Colors.gray[700],
  },
  responseStatus: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.gray[50],
    borderRadius: 6,
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  confirmedText: {
    marginTop: 4,
    color: Colors.success,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  acceptButton: {
    marginRight: 4,
  },
  declineButton: {
    marginLeft: 4,
    borderColor: Colors.error,
  },
  statsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statsText: {
    color: Colors.gray[500],
    fontSize: 11,
  },
  loginPrompt: {
    padding: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 6,
    alignItems: 'center',
  },
  loginPromptText: {
    color: Colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AlertCard;


