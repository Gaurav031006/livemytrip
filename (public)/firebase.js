// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfFV5cI5NiJEGxVOmoIrqS7cMFXVDRszI",
  authDomain: "livemytrip-3a468.firebaseapp.com",
  projectId: "livemytrip-3a468",
  storageBucket: "livemytrip-3a468.firebasestorage.app",
  messagingSenderId: "1038216294197",
  appId: "1:1038216294197:web:cd4d258a2bfa469e97a67c",
  measurementId: "G-L9Q0JR01G1"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
window.provider = provider;

window.auth = auth;
window.provider = provider;

window.signInWithPopup = signInWithPopup;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;