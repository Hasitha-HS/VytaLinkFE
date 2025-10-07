import React from 'react';
import { View, Text } from 'react-native';
import {
  Home,
  Person,
  Notifications,
  History,
  Settings,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Check,
  Close,
  ArrowBack,
  ArrowForward,
  ArrowUpward,
  ArrowDownward,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Login,
  Logout,
  Email,
  Phone,
  Message,
  Call,
  LocationOn,
  Map,
  Place,
  AccessTime,
  Event,
  CalendarToday,
  Bloodtype,
  Favorite,
  Warning,
  Emergency,
  Alert,
  PriorityHigh,
  Search,
  FilterList,
  Sort,
  Description,
  Download,
  Upload,
  Print,
  Share,
  ThumbUp,
  ThumbDown,
  Sync,
  Update,
  Menu,
  MoreHoriz,
  MoreVert,
  FiberManualRecord,
  RadioButtonUnchecked,
  Help
} from '@mui/icons-material';

// Material UI Icon component for React Native
const MaterialIcon = ({ 
  name, 
  size = 24, 
  color = '#000', 
  ...props 
}) => {
  const iconProps = {
    sx: { 
      fontSize: size, 
      color: color,
      ...props.sx 
    },
    ...props
  };

  // Fallback component for when icons don't load
  const FallbackIcon = () => (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        color: color,
        fontSize: size * 0.6,
        fontWeight: 'bold',
      }}>
        ?
      </Text>
    </View>
  );

  try {
    switch (name) {
      // Navigation Icons
      case 'home': return <Home {...iconProps} />;
      case 'person': return <Person {...iconProps} />;
      case 'notifications': return <Notifications {...iconProps} />;
      case 'history': return <History {...iconProps} />;
      case 'settings': return <Settings {...iconProps} />;
      
      // Action Icons
      case 'add': return <Add {...iconProps} />;
      case 'edit': return <Edit {...iconProps} />;
      case 'delete': return <Delete {...iconProps} />;
      case 'save': return <Save {...iconProps} />;
      case 'cancel': return <Cancel {...iconProps} />;
      case 'check': return <Check {...iconProps} />;
      case 'close': return <Close {...iconProps} />;
      
      // Arrow Icons
      case 'arrow-back': return <ArrowBack {...iconProps} />;
      case 'arrow-forward': return <ArrowForward {...iconProps} />;
      case 'arrow-up': return <ArrowUpward {...iconProps} />;
      case 'arrow-down': return <ArrowDownward {...iconProps} />;
      case 'arrow-left': return <ArrowLeft {...iconProps} />;
      case 'arrow-right': return <ArrowRight {...iconProps} />;
      
      // Status Icons
      case 'check-circle': return <CheckCircle {...iconProps} />;
      case 'error': return <Error {...iconProps} />;
      case 'info': return <Info {...iconProps} />;
      case 'refresh': return <Refresh {...iconProps} />;
      
      // User Icons
      case 'login': return <Login {...iconProps} />;
      case 'logout': return <Logout {...iconProps} />;
      
      // Communication Icons
      case 'email': return <Email {...iconProps} />;
      case 'phone': return <Phone {...iconProps} />;
      case 'message': return <Message {...iconProps} />;
      case 'call': return <Call {...iconProps} />;
      
      // Location Icons
      case 'location': return <LocationOn {...iconProps} />;
      case 'map': return <Map {...iconProps} />;
      case 'place': return <Place {...iconProps} />;
      
      // Time Icons
      case 'time': return <AccessTime {...iconProps} />;
      case 'date': return <Event {...iconProps} />;
      case 'calendar': return <CalendarToday {...iconProps} />;
      
      // Blood/Medical Icons
      case 'bloodtype': return <Bloodtype {...iconProps} />;
      case 'favorite': return <Favorite {...iconProps} />;
      
      // Emergency Icons
      case 'warning': return <Warning {...iconProps} />;
      case 'emergency': return <Emergency {...iconProps} />;
      case 'alert': return <Alert {...iconProps} />;
      case 'priority-high': return <PriorityHigh {...iconProps} />;
      
      // Search Icons
      case 'search': return <Search {...iconProps} />;
      case 'filter': return <FilterList {...iconProps} />;
      case 'sort': return <Sort {...iconProps} />;
      
      // File Icons
      case 'file': return <Description {...iconProps} />;
      case 'download': return <Download {...iconProps} />;
      case 'upload': return <Upload {...iconProps} />;
      case 'print': return <Print {...iconProps} />;
      
      // Social Icons
      case 'share': return <Share {...iconProps} />;
      case 'thumb-up': return <ThumbUp {...iconProps} />;
      case 'thumb-down': return <ThumbDown {...iconProps} />;
      
      // System Icons
      case 'sync': return <Sync {...iconProps} />;
      case 'update': return <Update {...iconProps} />;
      
      // Menu Icons
      case 'menu': return <Menu {...iconProps} />;
      case 'more-horiz': return <MoreHoriz {...iconProps} />;
      case 'more-vert': return <MoreVert {...iconProps} />;
      
      // Status Indicators
      case 'fiber-manual-record': return <FiberManualRecord {...iconProps} />;
      case 'radio-button-unchecked': return <RadioButtonUnchecked {...iconProps} />;
      
      // Help
      case 'help': return <Help {...iconProps} />;
      
      default:
        console.warn(`Material icon "${name}" not found, using fallback`);
        return <FallbackIcon />;
    }
  } catch (error) {
    console.warn(`Material icon "${name}" failed to load:`, error);
    return <FallbackIcon />;
  }
};

export default MaterialIcon;
