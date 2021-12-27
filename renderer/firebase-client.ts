import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwBM6pEe6m09J8hLco4Dzsc_9bDkxrpwg",
  authDomain: "mate-h.firebaseapp.com",
  databaseURL: "https://mate-h-default-rtdb.firebaseio.com",
  projectId: "mate-h",
  storageBucket: "mate-h.appspot.com",
  messagingSenderId: "331430486427",
  appId: "1:331430486427:web:1b24ec743184126d84413e",
  measurementId: "G-CW0JYFHJ25"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);