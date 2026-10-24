
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById("article-form");
const userMessage = document.getElementById("admin-user");
const message = document.getElementById("admin-message");
const saveButton = document.getElementById("save-button");

let isLoggedIn = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    isLoggedIn = true;
    userMessage.textContent = `ログイン中：${user.email}`;
    form.hidden = false;
  } else {
    isLoggedIn = false;
    form.hidden = true;
    userMessage.textContent = "記事編集には管理者ログインが必要です。";
    message.textContent = "ログインページからログインしてください。";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isLoggedIn || !auth.currentUser) {
    message.textContent = "ログインしてから保存してください。";
    return;
  }

  saveButton.disabled = true;
  message.textContent = "保存しています...";


const photos = Array.from(
  document.querySelectorAll("#photo-list .photo-url")
)
  .map((input) => input.value.trim())
  .filter((url) => url !== "");

const article = {
  title: document.getElementById("title").value.trim(),
  country: document.getElementById("country").value.trim(),
  date: document.getElementById("date").value,
  description: document.getElementById("description").value.trim(),
  content: document.getElementById("content").value.trim(),
  photos: photos,
  status: document.getElementById("status").value,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};


  try {
    if (
      !article.title ||
      !article.country ||
      !article.date ||
      !article.content
    ) {
      message.textContent = "タイトル・国や地域・日付・本文を入力してください。";
      return;
    }

    await addDoc(collection(db, "articles"), article);

    message.textContent =
      article.status === "published"
        ? "記事を保存し、公開しました！"
        : "記事を下書き保存しました！";

    form.reset();
  } catch (error) {
    console.error("記事保存エラー:", error);
    message.textContent =
      "保存に失敗しました。ログイン状態とFirestoreのセキュリティルールを確認してください。";
  } finally {
    saveButton.disabled = false;
  }
});

const photoList = document.getElementById("photo-list");
const addPhotoButton = document.getElementById("add-photo-button");

if (photoList && addPhotoButton) {
  // 写真のURLを入力したときにプレビューを表示
  photoList.addEventListener("input", (event) => {
    if (!event.target.classList.contains("photo-url")) return;

    const item = event.target.closest(".photo-item");
    const preview = item.querySelector(".photo-preview");
    const container = item.querySelector(".photo-preview-container");
    const url = event.target.value.trim();

    preview.onerror = () => {
      container.hidden = true;
    };

    preview.onload = () => {
      container.hidden = false;
    };

    if (url) {
      preview.src = url;
    } else {
      preview.removeAttribute("src");
      container.hidden = true;
    }
  });

  // 「写真を追加」を押すと入力欄を増やす
  addPhotoButton.addEventListener("click", () => {
    const count = photoList.querySelectorAll(".photo-item").length + 1;

    const item = document.createElement("div");
    item.className = "photo-item";

    item.innerHTML = `
      <hr>
      <label>
        写真${count}のURL
        <input
          type="url"
          class="photo-url"
          placeholder="https://example.com/photo${count}.jpg"
        >
      </label>
      <div class="photo-preview-container" hidden>
        <img
          class="photo-preview"
          alt="写真${count}のプレビュー"
          style="max-width: 100%; max-height: 300px;"
        >
      </div>
      <button type="button" class="remove-photo">
        この写真を削除
      </button>
    `;

    photoList.appendChild(item);
  });

  // 写真を削除する
  photoList.addEventListener("click", (event) => {
    const button = event.target.closest(".remove-photo");
    if (!button) return;

    const items = photoList.querySelectorAll(".photo-item");

    // 最後の1枠は残す
    if (items.length === 1) {
      const input = items[0].querySelector(".photo-url");
      const preview = items[0].querySelector(".photo-preview");
      const container = items[0].querySelector(".photo-preview-container");

      input.value = "";
      preview.removeAttribute("src");
      container.hidden = true;
      return;
    }

    button.closest(".photo-item").remove();

    // 写真番号を振り直す
    photoList.querySelectorAll(".photo-item").forEach((item, index) => {
      const label = item.querySelector("label");
      label.childNodes[0].textContent = `写真${index + 1}のURL`;
      item.querySelector(".photo-preview").alt =
        `写真${index + 1}のプレビュー`;
    });
  });
}
