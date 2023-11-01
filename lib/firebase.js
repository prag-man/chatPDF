// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "chatpdf-3a5bd.firebaseapp.com",
  projectId: "chatpdf-3a5bd",
  storageBucket: "chatpdf-3a5bd.appspot.com",
  messagingSenderId: "830330687515",
  appId: "1:830330687515:web:a21c20adc9eeb575dee8be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app