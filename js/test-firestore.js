
import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

async function testFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "articles"));

    console.log("Firestore接続成功！");
    snapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
    });
  } catch (error) {
    console.error("Firestore読み込みエラー:", error);
  }
}

testFirestore();
