

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyCLCKg5J3tNJhetAyxau-CyHEQ_RXbFUlY",

  authDomain: "rail-explorer-web.firebaseapp.com",

  projectId: "rail-explorer-web",

  storageBucket: "rail-explorer-web.firebasestorage.app",

  messagingSenderId: "120523902991",

  appId: "1:120523902991:web:8d049f1babcf159b6f137a",

  measurementId: "G-5V9V5M8XTG"

};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase接続ファイルの読み込み成功", {
  auth,
  db
});