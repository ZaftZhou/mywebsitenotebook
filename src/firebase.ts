import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: REPLACE WITH YOUR FIREBASE CONFIG
// You can find this in Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyC_QrT6W6A7W1eD9NoH46xcyygOy_iEEsU",
    authDomain: "mywebsite-39b94.firebaseapp.com",
    projectId: "mywebsite-39b94",
    storageBucket: "mywebsite-39b94.firebasestorage.app",
    messagingSenderId: "157996000004",
    appId: "1:157996000004:web:6ae854d44e570781652651",
    measurementId: "G-262B3YGD7B"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { getStorage } from "firebase/storage";
export const db = getFirestore(app, "mywebsite");
export const auth = getAuth(app);
export const storage = getStorage(app, "gs://mywebsite-39b94.firebasestorage.app");
