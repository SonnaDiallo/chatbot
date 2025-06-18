// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAvhJSQSSaWTQ_UzcopkqU5GbPnDGPIK1g",
//   authDomain: "chatbot-app-6994c.firebaseapp.com",
//   projectId: "chatbot-app-6994c",
//   storageBucket: "chatbot-app-6994c.firebasestorage.app",
//   messagingSenderId: "269893264578",
//   appId: "1:269893264578:web:65d23167bb954fa2ac875b",
//   measurementId: "G-9LM27JBPVD"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Exporter les services et fonctions Firebase
// export { 
//   auth, 
//   db, 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword,
//   doc,
//   setDoc,
//   getDoc
// };

// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAvhJSQSSaWTQ_UzcopkqU5GbPnDGPIK1g",
  authDomain: "chatbot-app-6994c.firebaseapp.com",
  projectId: "chatbot-app-6994c",
  storageBucket: "chatbot-app-6994c.firebasestorage.app",
  messagingSenderId: "269893264578",
  appId: "1:269893264578:web:65d23167bb954fa2ac875b",
  measurementId: "G-9LM27JBPVD"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Fonction pour sauvegarder un utilisateur localement
function saveUserToLocal(userData) {
  localStorage.setItem("currentUser", JSON.stringify(userData));
}

// Fonction pour récupérer l'utilisateur local
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// Export
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  saveUserToLocal,
  getCurrentUser
};
