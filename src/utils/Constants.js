export const API_BASE_URL = 'http://192.168.1.50:8080';

export const BLOOD_TYPES = [
  'O_POSITIVE',
  'O_NEGATIVE', 
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE'
];

export const URGENCY_LEVELS = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL'
];

export const GENDER_OPTIONS = [
  'MALE',
  'FEMALE',
  'OTHER'
];

export const USER_ROLES = [
  'ADMIN',
  'STAFF',
  'CAMP_ORGANIZER',
  'DONOR',
  'USER'
];

export const RESPONSE_TYPES = [
  'ACCEPTED',
  'DECLINED',
  'NO_RESPONSE'
];

export const ALERT_STATUS = [
  'ACTIVE',
  'FULFILLED',
  'EXPIRED',
  'CANCELLED'
];

export const ELIGIBILITY_STATUS = [
  'ELIGIBLE',
  'TEMPORARILY_DEFERRED',
  'PERMANENTLY_DEFERRED'
];

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  FCM_TOKEN: 'fcmToken'
};

export const formatBloodType = (bloodType) => {
  return bloodType ? bloodType.replace('_', ' ') : 'Unknown';
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};


