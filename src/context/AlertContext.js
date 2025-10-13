import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import EmergencyAlertService from '../services/EmergencyAlertService';
import { AuthContext } from './AuthContext';

export const AlertContext = createContext({
  alerts: [],
  isLoading: false,
  refreshAlerts: () => {},
  createAlert: () => {},
  respondToAlert: () => {},
});

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const pollTimerRef = useRef(null);

  console.log('AlertProvider rendering, user:', user);

  // Start/stop polling based on auth state
  useEffect(() => {
    // Clear any existing timer
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    // Load alerts for both authenticated and unauthenticated users
    // Emergency alerts are critical and should be visible to everyone
    loadAlerts();
    pollTimerRef.current = setInterval(loadAlerts, 60000); // poll every 60s

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [user]);

  const loadAlerts = async () => {
    try {
      console.log('Loading alerts...');
      setIsLoading(true);
      
      // Only load alerts if user is authenticated and has donor information
      if (!user) {
        console.log('No user logged in, skipping alert loading');
        setAlerts([]);
        return;
      }

      // Check if user has donor information (blood type)
      if (!user.bloodType) {
        console.log('User is not a registered donor, skipping alert loading');
        setAlerts([]);
        return;
      }

      const response = await EmergencyAlertService.getActiveAlerts();
      console.log('Alerts response:', response);
      
      // Filter alerts by user's blood type
      const userBloodType = user.bloodType;
      const filteredAlerts = Array.isArray(response) 
        ? response.filter(alert => {
            // Check if alert blood type matches user's blood type
            // or if user's blood type is compatible (O- can donate to anyone, etc.)
            return isBloodTypeCompatible(userBloodType, alert.bloodType);
          })
        : [];
      
      console.log(`Filtered ${filteredAlerts.length} alerts for blood type ${userBloodType}`);
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Don't clear alerts on error, keep existing ones
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check blood type compatibility
  const isBloodTypeCompatible = (donorBloodType, requiredBloodType) => {
    // O- can donate to anyone
    if (donorBloodType === 'O_NEGATIVE') return true;
    
    // O+ can donate to O+ and AB+
    if (donorBloodType === 'O_POSITIVE') {
      return requiredBloodType === 'O_POSITIVE' || requiredBloodType === 'AB_POSITIVE';
    }
    
    // A- can donate to A-, A+, AB-, AB+
    if (donorBloodType === 'A_NEGATIVE') {
      return requiredBloodType.includes('A') || requiredBloodType.includes('AB');
    }
    
    // A+ can donate to A+ and AB+
    if (donorBloodType === 'A_POSITIVE') {
      return requiredBloodType === 'A_POSITIVE' || requiredBloodType === 'AB_POSITIVE';
    }
    
    // B- can donate to B-, B+, AB-, AB+
    if (donorBloodType === 'B_NEGATIVE') {
      return requiredBloodType.includes('B') || requiredBloodType.includes('AB');
    }
    
    // B+ can donate to B+ and AB+
    if (donorBloodType === 'B_POSITIVE') {
      return requiredBloodType === 'B_POSITIVE' || requiredBloodType === 'AB_POSITIVE';
    }
    
    // AB- can donate to AB- and AB+
    if (donorBloodType === 'AB_NEGATIVE') {
      return requiredBloodType.includes('AB');
    }
    
    // AB+ can only donate to AB+
    if (donorBloodType === 'AB_POSITIVE') {
      return requiredBloodType === 'AB_POSITIVE';
    }
    
    // Exact match fallback
    return donorBloodType === requiredBloodType;
  };

  const refreshAlerts = async () => {
    await loadAlerts();
  };

  const createAlert = async (alertData) => {
    try {
      const response = await EmergencyAlertService.createAlert(alertData);
      
      if (response.id) {
        // Add new alert to the beginning of the list
        setAlerts(prevAlerts => [response, ...prevAlerts]);
        return { success: true, alert: response };
      }
      
      return { success: false, message: 'Failed to create alert' };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to create alert. Please try again.' 
      };
    }
  };

  const respondToAlert = async (alertId, donorId, response) => {
    try {
      const result = await EmergencyAlertService.respondToAlert(alertId, donorId, response);
      
      // Update the alert in the local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => {
          if (alert.id === alertId) {
            // Add or update the response in the alert's responses array
            const updatedResponses = alert.responses || [];
            const existingResponseIndex = updatedResponses.findIndex(r => r.donorId === donorId);
            
            if (existingResponseIndex >= 0) {
              updatedResponses[existingResponseIndex] = {
                ...updatedResponses[existingResponseIndex],
                response,
                respondedAt: new Date().toISOString()
              };
            } else {
              updatedResponses.push({
                donorId,
                response,
                respondedAt: new Date().toISOString(),
                status: 'RESPONDED'
              });
            }
            
            return {
              ...alert,
              responses: updatedResponses
            };
          }
          return alert;
        })
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error responding to alert:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to submit response. Please try again.' 
      };
    }
  };

  const getAlertById = (alertId) => {
    return alerts.find(alert => alert.id === alertId);
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => alert.status === 'ACTIVE');
  };

  const getCriticalAlerts = () => {
    return alerts.filter(alert => 
      alert.status === 'ACTIVE' && alert.urgencyLevel === 'CRITICAL'
    );
  };

  const getAlertsByBloodType = (bloodType) => {
    return alerts.filter(alert => 
      alert.status === 'ACTIVE' && alert.bloodType === bloodType
    );
  };

  const updateAlertStatus = (alertId, newStatus) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: newStatus }
          : alert
      )
    );
  };

  const confirmDonorForAlert = async (responseId, appointmentDate, appointmentTime) => {
    try {
      const result = await EmergencyAlertService.confirmDonor(responseId, appointmentDate, appointmentTime);
      
      // Update the response status in local state
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => ({
          ...alert,
          responses: alert.responses?.map(response => 
            response.id === responseId 
              ? { 
                  ...response, 
                  status: 'CONFIRMED',
                  confirmedAt: new Date().toISOString(),
                  appointmentDate,
                  appointmentTime
                }
              : response
          ) || []
        }))
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error confirming donor:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to confirm donor. Please try again.' 
      };
    }
  };

  // Test functions for development
  const simulateEmergency = async () => {
    try {
      // await EmergencyAlertService.simulateEmergency(); // This method doesn't exist in the new service
      await refreshAlerts();
      return { success: true };
    } catch (error) {
      console.error('Error simulating emergency:', error);
      return { success: false, message: error.message };
    }
  };

  const testEmergencyNotification = async (fcmToken, bloodType) => {
    try {
      // await EmergencyAlertService.testEmergencyNotification(fcmToken, bloodType); // This method doesn't exist in the new service
      return { success: true };
    } catch (error) {
      console.error('Error testing notification:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    alerts,
    isLoading,
    refreshAlerts,
    createAlert,
    respondToAlert,
    getAlertById,
    getActiveAlerts,
    getCriticalAlerts,
    getAlertsByBloodType,
    updateAlertStatus,
    confirmDonorForAlert,
    simulateEmergency,
    testEmergencyNotification,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};


