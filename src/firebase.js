import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBhnj9bC3hMDMfnr0IY3D7r-wFtVbgzbUY",
  authDomain: "dossier1431.firebaseapp.com",
  databaseURL: "https://dossier1431-default-rtdb.europe-west1.firebasedatabase.app", // ← verschijnt na aanmaken database
  projectId: "dossier1431",
  storageBucket: "dossier1431.firebasestorage.app",
  messagingSenderId: "799138104637",
  appId: "1:799138104637:web:2f1575d1fc3603c97bf154",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue };