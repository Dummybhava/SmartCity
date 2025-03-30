import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const enTranslations = {
  header: {
    search: 'Search...',
    language: 'Language',
    selectLanguage: 'Select language',
    profile: 'Profile',
    settings: 'Settings',
    signOut: 'Sign out'
  },
  navigation: {
    dashboard: 'Dashboard',
    attractions: 'Attractions',
    events: 'Events',
    transportation: 'Transportation',
    feedback: 'Feedback',
    profile: 'Profile'
  },
  dashboard: {
    welcome: 'Welcome to Smart City!',
    subtitle: 'Your smart guide to navigate around the city',
    takeTour: 'Take a Tour',
    cityMap: 'Interactive City Map',
    mapDescription: 'Explore Smart City\'s attractions, transportation routes, and points of interest',
    recentActivity: 'Recent Activity',
    upcomingEvents: 'Upcoming Events',
    viewAll: 'View all'
  },
  attractions: {
    title: 'Attractions',
    searchPlaceholder: 'Search attractions...',
    noAttractions: 'No attractions found',
    categories: {
      all: 'All',
      food: 'Food & Beverage',
      retail: 'Retail',
      education: 'Education',
      entertainment: 'Entertainment'
    }
  },
  events: {
    title: 'Events',
    searchPlaceholder: 'Search events...',
    noEvents: 'No events found',
    timeFilters: {
      all: 'All Events',
      today: 'Today',
      week: 'This Week',
      month: 'This Month'
    },
    status: {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      past: 'Past'
    }
  },
  transportation: {
    title: 'Transportation',
    types: {
      all: 'All',
      prt: 'PRT',
      shuttle: 'Shuttles',
      bus: 'Buses'
    },
    details: {
      route: 'Route',
      nextStop: 'Next Stop',
      estimatedArrival: 'Estimated Arrival',
      capacity: 'Capacity',
      status: {
        active: 'Active',
        delayed: 'Delayed',
        inactive: 'Inactive'
      }
    }
  },
  feedback: {
    title: 'Feedback',
    newFeedback: 'New Feedback',
    history: 'Feedback History',
    submitTitle: 'Submit Your Feedback',
    submitDescription: 'Share your thoughts, suggestions, or report an issue about Smart City',
    subject: 'Subject',
    message: 'Message',
    subjectPlaceholder: 'Brief description of your feedback',
    messagePlaceholder: 'Please provide detailed information about your feedback',
    submit: 'Submit Feedback',
    submitting: 'Submitting...',
    historyTitle: 'Your Feedback History',
    historyDescription: 'View the status and responses to your previous feedback submissions',
    noFeedback: 'No feedback submissions yet',
    feedbackWillAppear: 'Your feedback submissions will appear here once you submit them',
    status: {
      pending: 'Pending Review',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      acknowledged: 'Acknowledged'
    },
    response: 'Response'
  },
  profile: {
    title: 'Profile',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    username: 'Username',
    role: 'Role',
    language: 'Language Preferences',
    preferredLanguage: 'Preferred Language',
    notifications: 'Notification Preferences',
    eventsNotification: 'Event notifications',
    eventsDescription: 'Receive notifications about upcoming events and activities',
    transportationNotification: 'Transportation updates',
    transportationDescription: 'Get notified about transportation changes and delays',
    feedbackNotification: 'Feedback responses',
    feedbackDescription: 'Receive notifications when your feedback gets a response',
    promotionalNotification: 'Promotional notifications',
    promotionalDescription: 'Get updates about special offers and promotions',
    privacy: 'Privacy Settings',
    locationSharing: 'Location sharing',
    locationDescription: 'Allow the app to access your location for better services',
    dataCollection: 'Data collection',
    dataDescription: 'Allow anonymous data collection to improve services',
    saveChanges: 'Save changes',
    saving: 'Saving changes...'
  },
  auth: {
    login: 'Login',
    register: 'Register',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    orContinueWith: 'Or continue with',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: 'Don\'t have an account?',
    signInInstead: 'Sign in instead',
    createNewAccount: 'Create a new account',
    agreeToTerms: 'I agree to the Terms of Service and Privacy Policy'
  },
  notifications: {
    title: 'Notifications',
    empty: 'No new notifications',
    viewAll: 'View all notifications'
  }
};

// Spanish translations
const esTranslations = {
  header: {
    search: 'Buscar...',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    profile: 'Perfil',
    settings: 'Configuración',
    signOut: 'Cerrar sesión'
  },
  navigation: {
    dashboard: 'Panel',
    attractions: 'Atracciones',
    events: 'Eventos',
    transportation: 'Transporte',
    feedback: 'Comentarios',
    profile: 'Perfil'
  },
  dashboard: {
    welcome: '¡Bienvenido a Ciudad Inteligente!',
    subtitle: 'Tu guía inteligente para navegar por la ciudad',
    takeTour: 'Hacer un recorrido',
    cityMap: 'Mapa interactivo de la ciudad',
    mapDescription: 'Explora las atracciones, rutas de transporte y puntos de interés de Ciudad Inteligente',
    recentActivity: 'Actividad reciente',
    upcomingEvents: 'Próximos eventos',
    viewAll: 'Ver todo'
  },
  notifications: {
    title: 'Notificaciones',
    empty: 'No hay nuevas notificaciones',
    viewAll: 'Ver todas las notificaciones'
  }
};

// French translations
const frTranslations = {
  header: {
    search: 'Rechercher...',
    language: 'Langue',
    selectLanguage: 'Sélectionner la langue',
    profile: 'Profil',
    settings: 'Paramètres',
    signOut: 'Déconnexion'
  },
  navigation: {
    dashboard: 'Tableau de bord',
    attractions: 'Attractions',
    events: 'Événements',
    transportation: 'Transport',
    feedback: 'Commentaires',
    profile: 'Profil'
  },
  notifications: {
    title: 'Notifications',
    empty: 'Pas de nouvelles notifications',
    viewAll: 'Voir toutes les notifications'
  }
};

// German translations
const deTranslations = {
  header: {
    search: 'Suchen...',
    language: 'Sprache',
    selectLanguage: 'Sprache auswählen',
    profile: 'Profil',
    settings: 'Einstellungen',
    signOut: 'Abmelden'
  },
  navigation: {
    dashboard: 'Dashboard',
    attractions: 'Attraktionen',
    events: 'Veranstaltungen',
    transportation: 'Transport',
    feedback: 'Feedback',
    profile: 'Profil'
  },
  notifications: {
    title: 'Benachrichtigungen',
    empty: 'Keine neuen Benachrichtigungen',
    viewAll: 'Alle Benachrichtigungen anzeigen'
  }
};

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
    fr: { translation: frTranslations },
    de: { translation: deTranslations }
  },
  lng: 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already safes from XSS
  }
});

export default i18n;
