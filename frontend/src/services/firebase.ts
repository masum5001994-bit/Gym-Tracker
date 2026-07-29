import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  projectId: "bws-gym-tracker-app",
  appId: "1:298539970067:web:c269383f9a6de50d3b59e6",
  storageBucket: "bws-gym-tracker-app.firebasestorage.app",
  apiKey: "AIzaSyCnOZrdEFxmWvnqhEzwoiqdUUqokJotPlU",
  authDomain: "bws-gym-tracker-app.firebaseapp.com",
  messagingSenderId: "298539970067",
};

// Initialize Firebase App safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Safe Firestore initialization with fallback for all hosting environments
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const auth = getAuth(app);

// Authenticate user anonymously on load
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase Anonymous Auth Note:', err);
});
