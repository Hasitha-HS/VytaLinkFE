// Text-based icon fallback system
export const TextIcons = {
  // Navigation Icons
  home: '🏠',
  profile: '👤',
  notifications: '🔔',
  history: '📋',
  settings: '⚙️',
  news: '📰',
  
  // Blood Donation Icons
  bloodDrop: '🩸',
  heart: '❤️',
  heartOutline: '🤍',
  medicalBag: '🏥',
  hospital: '🏥',
  
  // Emergency Icons
  emergency: '🚨',
  alert: '⚠️',
  warning: '⚠️',
  urgent: '🔴',
  
  // Action Icons
  add: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  cancel: '❌',
  check: '✅',
  close: '❌',
  
  // Navigation Icons
  back: '⬅️',
  forward: '➡️',
  up: '⬆️',
  down: '⬇️',
  left: '⬅️',
  right: '➡️',
  
  // Status Icons
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  loading: '🔄',
  
  // User Icons
  user: '👤',
  userAdd: '👥',
  userRemove: '👤',
  login: '🔑',
  logout: '🚪',
  
  // Communication Icons
  email: '📧',
  phone: '📞',
  message: '💬',
  call: '📞',
  
  // Location Icons
  location: '📍',
  map: '🗺️',
  pin: '📍',
  
  // Time Icons
  time: '⏰',
  date: '📅',
  calendar: '📅',
  
  // Blood Type Icons
  bloodTypeA: '🅰️',
  bloodTypeB: '🅱️',
  bloodTypeAB: '🆎',
  bloodTypeO: '🅾️',
  
  // Donation Icons
  donation: '💉',
  donationHistory: '📊',
  eligibility: '✅',
  
  // Menu Icons
  menu: '☰',
  more: '⋯',
  moreVert: '⋮',
  
  // Search Icons
  search: '🔍',
  filter: '🔽',
  sort: '🔄',
  
  // File Icons
  file: '📄',
  download: '⬇️',
  upload: '⬆️',
  print: '🖨️',
  
  // Social Icons
  share: '📤',
  like: '👍',
  dislike: '👎',
  
  // System Icons
  refresh: '🔄',
  sync: '🔄',
  update: '🔄',
  settings: '⚙️',
  
  // Status Indicators
  online: '🟢',
  offline: '🔴',
  active: '🟢',
  inactive: '🔴',
};

// Helper function to get text icon
export const getTextIcon = (iconKey) => {
  return TextIcons[iconKey] || '?';
};

export default TextIcons;
