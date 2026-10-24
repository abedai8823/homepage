
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const message = document.getElementById("message");

// ログイン状態を確認
onAuthStateChanged(auth, (user) => {
  if (user) {
    message.textContent = `ログイン中：${user.email}`;
    loginButton.textContent = "ログアウト";
    passwordInput.disabled = true;
    emailInput.disabled = true;
  } else {
    message.textContent = "";
    loginButton.textContent = "ログイン";
    passwordInput.disabled = false;
    emailInput.disabled = false;
  }
});

// ログイン・ログアウト処理
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;

  try {
    if (auth.currentUser) {
      await signOut(auth);
      message.textContent = "ログアウトしました。";
      passwordInput.value = "";
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    await signInWithEmailAndPassword(auth, email, password);
window.location.href = "admin.html";
  } catch (error) {
    console.error("ログインエラー:", error);

    const messages = {
      "auth/invalid-credential": "メールアドレスまたはパスワードが違います。",
      "auth/invalid-email": "メールアドレスの形式を確認してください。",
      "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってください。",
      "auth/network-request-failed": "通信に失敗しました。接続を確認してください。"
    };

    message.textContent =
      messages[error.code] || `ログインに失敗しました：${error.code || error.message}`;
  } finally {
    loginButton.disabled = false;
  }
});
