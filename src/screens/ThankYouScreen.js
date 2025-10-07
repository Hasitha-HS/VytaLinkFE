import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/Colors';
import Icon from '../components/common/Icon';
import { getIcon } from '../utils/Icons';

const ThankYouScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { donorData } = route.params || {};

  const handleDone = () => {
    // Navigate to home or login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleDownloadCertificate = () => {
    // Implement certificate download functionality
    console.log('Download certificate');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Header */}
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Icon {...getIcon('success', 64, Colors.success)} />
            </View>
            <Text variant="headlineMedium" style={styles.successTitle}>
              Thank You!
            </Text>
            <Text variant="titleMedium" style={styles.successSubtitle}>
              Registration Successful
            </Text>
          </Card.Content>
        </Card>

        {/* Donor Information */}
        <Card style={styles.infoCard}>
          <Card.Title 
            title="Your Registration Details" 
            left={(props) => <Icon {...getIcon('user', 24, Colors.primary)} />}
          />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.donorName}>
              {donorData?.name || 'Donor'}
            </Text>
            <Text variant="bodyMedium" style={styles.donorMessage}>
              You are now registered as a blood donor with VyTaLink.
            </Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Icon {...getIcon('bloodDrop', 20, Colors.primary)} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  Blood Type: {donorData?.bloodType?.replace('_', ' ') || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon {...getIcon('phone', 20, Colors.primary)} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  Phone: {donorData?.phone || 'Not provided'}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon {...getIcon('success', 20, Colors.success)} />
                <Text variant="bodyMedium" style={styles.detailText}>
                  Status: Eligible to donate
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* What's Next */}
        <Card style={styles.nextCard}>
          <Card.Title 
            title="What's Next?" 
            left={(props) => <Icon {...getIcon('info', 24, Colors.primary)} />}
          />
          <Card.Content>
            <View style={styles.nextItem}>
              <Icon {...getIcon('notifications', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.nextText}>
                You will receive notifications for emergency blood requests
              </Text>
            </View>
            
            <View style={styles.nextItem}>
              <Icon {...getIcon('heart', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.nextText}>
                You can help save lives by responding to urgent blood needs
              </Text>
            </View>
            
            <View style={styles.nextItem}>
              <Icon {...getIcon('time', 20, Colors.primary)} />
              <Text variant="bodyMedium" style={styles.nextText}>
                Remember to maintain your health for future donations
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Important Information */}
        <Card style={styles.importantCard}>
          <Card.Title 
            title="Important Information" 
            left={(props) => <Icon {...getIcon('warning', 24, Colors.warning)} />}
          />
          <Card.Content>
            <Text variant="bodySmall" style={styles.importantText}>
              • You must be in good health to donate blood{'\n'}
              • Wait at least 8 weeks between donations{'\n'}
              • Contact us if your health status changes{'\n'}
              • Keep your contact information updated{'\n'}
              • You can opt out of notifications anytime
            </Text>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleDownloadCertificate}
            style={styles.certificateButton}
            icon="download"
          >
            Download Certificate
          </Button>
          
          <Button
            mode="contained"
            onPress={handleDone}
            style={styles.doneButton}
            icon="check"
          >
            Done
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: 'bold',
    color: Colors.success,
    marginBottom: 8,
  },
  successSubtitle: {
    color: Colors.gray[700],
  },
  infoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  donorName: {
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  donorMessage: {
    color: Colors.gray[700],
    marginBottom: 16,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: Colors.gray[700],
  },
  nextCard: {
    marginBottom: 16,
    elevation: 2,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nextText: {
    marginLeft: 12,
    color: Colors.gray[700],
    flex: 1,
  },
  importantCard: {
    marginBottom: 24,
    elevation: 2,
    backgroundColor: Colors.warning + '10',
  },
  importantText: {
    color: Colors.gray[700],
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  certificateButton: {
    flex: 1,
    marginRight: 8,
  },
  doneButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.primary,
  },
});

export default ThankYouScreen;
