// Icon mapping for consistent icon usage across the app
export const Icons = {
  // Navigation Icons
  home: { name: 'home', type: 'Ionicons' },
  profile: { name: 'person', type: 'Ionicons' },
  notifications: { name: 'notifications', type: 'Ionicons' },
  history: { name: 'time', type: 'Ionicons' },
  settings: { name: 'settings', type: 'Ionicons' },
  news: { name: 'newspaper', type: 'Ionicons' },
  
  // Tab Bar Icons (with focused/unfocused variants)
  tabHome: { name: 'home', type: 'Ionicons' },
  tabProfile: { name: 'person', type: 'Ionicons' },
  tabNotifications: { name: 'notifications', type: 'Ionicons' },
  
  // Blood Donation Icons
  bloodDrop: { name: 'water', type: 'Ionicons' },
  heart: { name: 'heart', type: 'Ionicons' },
  heartOutline: { name: 'heart-outline', type: 'Ionicons' },
  medicalBag: { name: 'medical-bag', type: 'MaterialCommunityIcons' },
  hospital: { name: 'hospital', type: 'MaterialCommunityIcons' },
  
  // Emergency Icons
  emergency: { name: 'warning', type: 'Ionicons' },
  alert: { name: 'alert-circle', type: 'Ionicons' },
  warning: { name: 'warning', type: 'Ionicons' },
  urgent: { name: 'alert', type: 'Ionicons' },
  
  // Action Icons
  add: { name: 'add', type: 'Ionicons' },
  edit: { name: 'create', type: 'Ionicons' },
  delete: { name: 'trash', type: 'Ionicons' },
  save: { name: 'save', type: 'Ionicons' },
  cancel: { name: 'close', type: 'Ionicons' },
  check: { name: 'checkmark', type: 'Ionicons' },
  close: { name: 'close', type: 'Ionicons' },
  
  // Navigation Icons
  back: { name: 'arrow-back', type: 'Ionicons' },
  forward: { name: 'arrow-forward', type: 'Ionicons' },
  up: { name: 'arrow-up', type: 'Ionicons' },
  down: { name: 'arrow-down', type: 'Ionicons' },
  left: { name: 'arrow-back', type: 'Ionicons' },
  right: { name: 'arrow-forward', type: 'Ionicons' },
  
  // Status Icons
  success: { name: 'checkmark-circle', type: 'Ionicons' },
  error: { name: 'close-circle', type: 'Ionicons' },
  info: { name: 'information-circle', type: 'Ionicons' },
  loading: { name: 'refresh', type: 'Ionicons' },
  
  // User Icons
  user: { name: 'person', type: 'Ionicons' },
  userAdd: { name: 'person-add', type: 'Ionicons' },
  userRemove: { name: 'person-remove', type: 'Ionicons' },
  login: { name: 'log-in', type: 'Ionicons' },
  logout: { name: 'log-out', type: 'Ionicons' },
  
  // Communication Icons
  email: { name: 'mail', type: 'Ionicons' },
  phone: { name: 'call', type: 'Ionicons' },
  message: { name: 'chatbubble', type: 'Ionicons' },
  call: { name: 'call', type: 'Ionicons' },
  
  // Location Icons
  location: { name: 'location', type: 'Ionicons' },
  map: { name: 'map', type: 'Ionicons' },
  pin: { name: 'location', type: 'Ionicons' },
  
  // Time Icons
  time: { name: 'time', type: 'Ionicons' },
  date: { name: 'calendar', type: 'Ionicons' },
  calendar: { name: 'calendar', type: 'Ionicons' },
  
  // Blood Type Icons
  bloodTypeA: { name: 'blood-type', type: 'MaterialIcons' },
  bloodTypeB: { name: 'blood-type', type: 'MaterialIcons' },
  bloodTypeAB: { name: 'blood-type', type: 'MaterialIcons' },
  bloodTypeO: { name: 'blood-type', type: 'MaterialIcons' },
  
  // Donation Icons
  donation: { name: 'favorite', type: 'MaterialIcons' },
  donationHistory: { name: 'history', type: 'MaterialIcons' },
  eligibility: { name: 'verified', type: 'MaterialIcons' },
  
  // Menu Icons
  menu: { name: 'menu', type: 'MaterialIcons' },
  more: { name: 'more-horiz', type: 'MaterialIcons' },
  moreVert: { name: 'more-vert', type: 'MaterialIcons' },
  
  // Search Icons
  search: { name: 'search', type: 'MaterialIcons' },
  filter: { name: 'filter-list', type: 'MaterialIcons' },
  sort: { name: 'sort', type: 'MaterialIcons' },
  
  // File Icons
  file: { name: 'description', type: 'MaterialIcons' },
  download: { name: 'download', type: 'MaterialIcons' },
  upload: { name: 'upload', type: 'MaterialIcons' },
  print: { name: 'print', type: 'MaterialIcons' },
  
  // Social Icons
  share: { name: 'share', type: 'MaterialIcons' },
  like: { name: 'thumb-up', type: 'MaterialIcons' },
  dislike: { name: 'thumb-down', type: 'MaterialIcons' },
  
  // System Icons
  refresh: { name: 'refresh', type: 'MaterialIcons' },
  sync: { name: 'sync', type: 'MaterialIcons' },
  update: { name: 'update', type: 'MaterialIcons' },
  settings: { name: 'settings', type: 'MaterialIcons' },
  
  // Status Indicators
  online: { name: 'circle', type: 'MaterialIcons' },
  offline: { name: 'radio-button-unchecked', type: 'MaterialIcons' },
  active: { name: 'fiber-manual-record', type: 'MaterialIcons' },
  inactive: { name: 'fiber-manual-record', type: 'MaterialIcons' },
};

// Helper function to get icon props
export const getIcon = (iconKey, size = 24, color = '#000') => {
  const icon = Icons[iconKey];
  if (!icon) {
    console.warn(`Icon "${iconKey}" not found, using default icon`);
    return { name: 'help', type: 'MaterialIcons', size, color };
  }
  return { ...icon, size, color };
};

export default Icons;
