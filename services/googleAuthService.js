import { Alert, Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { setDocument } from './firestoreService';
import googleServices from '../google-services.json';

const webClientId = googleServices.client?.[0]?.oauth_client?.find(
  (client) => client.client_type === 3
)?.client_id;

let googleConfigured = false;

function getGoogleSignInModule({ showAlert = true } = {}) {
  try {
    return require('@react-native-google-signin/google-signin');
  } catch (error) {
    if (showAlert) {
      Alert.alert(
        'Google Login Needs a Build',
        'Google login is installed, but it cannot run inside Expo Go. Please test it in a custom development build or APK.'
      );
    }
    return null;
  }
}

function configureGoogleSignin(GoogleSignin) {
  if (googleConfigured) return;

  if (!webClientId) {
    throw new Error('Missing Google web client ID in google-services.json.');
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    scopes: ['profile', 'email'],
  });
  googleConfigured = true;
}

function getReadableGoogleError(error) {
  if (error?.code === 'DEVELOPER_ERROR') {
    return 'Google rejected this build configuration. Check Firebase SHA-1 for the exact keystore used to build this APK, then download a fresh google-services.json.';
  }
  if (error?.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    return 'Google Play Services is missing or needs an update on this device.';
  }
  if (error?.message?.includes('RNGoogleSignin')) {
    return 'Google login requires a custom development build or APK. It will not work in Expo Go.';
  }
  return error?.message || 'Google login failed. Please try again.';
}

export const signInWithGoogle = async (navigation) => {
  const googleModule = getGoogleSignInModule();
  if (!googleModule) return;

  const { GoogleSignin, isSuccessResponse } = googleModule;

  try {
    configureGoogleSignin(GoogleSignin);

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return;

    let idToken = response.data?.idToken;
    if (!idToken) {
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens?.idToken;
    }

    if (!idToken) {
      throw new Error('Google did not return an ID token. Check the web client ID in google-services.json.');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    if (user?.uid) {
      await setDocument('users', user.uid, {
        fullName: user.displayName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        provider: 'google',
      });
    }

    navigation.replace('Home');
  } catch (error) {
    Alert.alert('Google Login Failed', getReadableGoogleError(error));
  }
};

export const signOutFromGoogle = async () => {
  const googleModule = getGoogleSignInModule({ showAlert: false });
  if (!googleModule) return;

  try {
    const { GoogleSignin } = googleModule;
    configureGoogleSignin(GoogleSignin);
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('[GoogleSignIn] Sign out skipped:', error?.message || error);
  }
};
