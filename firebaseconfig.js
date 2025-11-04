import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_API_KEY,
  authDomain: import.meta.env.VITE_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_APP_PROJECT_ID,
  storageBucket: import.meta.env.VITE_APP_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_APP_ID,
  measurementId: import.meta.env.VITE_APP_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// ========================================
// 🛡️ CRITICAL FIX: Safe Firebase Messaging initialization
// ========================================
// iOS in-app browsers (FB, IG, etc.) don't support Firebase Messaging
// Even though isSupported() may return true, getMessaging() will throw
// We need to wrap this in a try/catch to prevent app crash

let messaging = null;

try {
  messaging = getMessaging(app);
  console.log("✅ Firebase Messaging initialized");
} catch (error) {
  console.warn("⚠️ Firebase Messaging failed to initialize:", error.message);
  // messaging remains null - app will continue without push notifications
}

export { messaging };

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    if (!messaging) {
      console.warn("⚠️ Firebase Messaging not available - cannot listen for messages");
      reject(new Error("Firebase Messaging not supported in this browser"));
      return;
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

const requestPermission = async () => {
  // Check if messaging is available
  if (!messaging) {
    console.warn("⚠️ Firebase Messaging not available - cannot request permission");
    return null;
  }

  //requesting permission using Notification API
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_APP_VAPID_KEY,
    });
    console.log(token, "firebaseee tokennn");
    return token;
  } else if (permission === "denied") {
    console.log("User Permission Denied.");
  }
};

export { auth, googleProvider, signInWithPopup, requestPermission };
