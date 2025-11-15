// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGSlBbaEfcKdUicegh-lpLbj-HtQ9_ehU",
  authDomain: "uniflow-753ba.firebaseapp.com",
  projectId: "uniflow-753ba",
  storageBucket: "uniflow-753ba.firebasestorage.app",
  messagingSenderId: "857859590055",
  appId: "1:857859590055:web:721bea85374988dd619882",
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export {auth,googleProvider};