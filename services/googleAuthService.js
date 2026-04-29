import { Alert } from 'react-native';

/**
 * Google Sign-In placeholder.
 *
 * Full Google Sign-In requires a custom Expo dev-client (not Expo Go) with
 * a native Google SDK like @react-native-google-signin/google-signin.
 *
 * This shows an informative alert for now.
 */
export const signInWithGoogle = (navigation) => {
  Alert.alert(
    'Google Sign-In',
    'Google Sign-In is not available in Expo Go.\n\nPlease use email/password login, or build a custom dev-client to enable Google Sign-In.',
    [{ text: 'OK' }]
  );
};
