
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

const form = document.getElementById("article-form");
const userMessage = document.getElementById("admin-user");
const message = document.getElementById("admin-message");
const saveButton = document.getElementById("save-button");

const photoList = document.getElementById("photo-list");
const addPhotoButton = document.getElementById("add-photo-button");

let isLoggedIn = false;
let editingArticleId = null;
let articlesLoaded = false;

// 管理画面に記事一覧の表示場所を作る
let articleManager = document.getElementById("article-manager");

if (!articleManager && form) {
  articleManager = document.createElement("section");
  articleManager.id = "article-manager";
  articleManager.innerHTML = `
    <hr>
    <h2>投稿済み記事の管理</h2>
    <p>編集したい記事を選択してください。</p>
    <div id="admin-article-list">記事一覧を読み込んでいます...</div>
  `;
  form.parentNode.insertBefore(articleManager, form);
}

const articleList = document.getElementById("admin-article-list");

function setMessage(text) {
  if (message) message.textContent = text;
}

function setFormMode(isEditing) {
  if (saveButton) {
    saveButton.textContent = isEditing ? "変更を保存" : "新規記事を保存";
  }

  let cancelButton = document.getElementById("cancel-edit-button");

  if (isEditing && !cancelButton) {
    cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "cancel-edit-button";
    cancelButton.textContent = "編集をキャンセル";
    saveButton.insertAdjacentElement("afterend", cancelButton);

    cancelButton.addEventListener("click", () => {
      resetEditor();
    });
  }

  if (cancelButton) {
    cancelButton.hidden = !isEditing;
  }
}

function resetEditor() {
  editingArticleId = null;
  form.reset();
  clearExtraPhotos();
  setFormMode(false);
  setMessage("新規記事を作成できます。");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearExtraPhotos() {
  if (!photoList) return;

  const items = photoList.querySelectorAll(".photo-item");

  items.forEach((item, index) => {
    if (index > 0) item.remove();
  });

  const firstItem = photoList.querySelector(".photo-item");

  if (firstItem) {
    const input = firstItem.querySelector(".photo-url");
    const preview = firstItem.querySelector(".photo-preview");
    const container = firstItem.querySelector(".photo-preview-container");

    if (input) input.value = "";
    if (preview) preview.removeAttribute("src");
    if (container) container.hidden = true;
  }
}

function setField(id, value) {
  const field = document.getElementById(id);
  if (field) field.value = value ?? "";
}

function addPhotoField(url = "") {
  if (!photoList) return;

  const count = photoList.querySelectorAll(".photo-item").length + 1;
  const item = document.createElement("div");
  item.className = "photo-item";

  item.innerHTML = `
    <hr>
    <label>
      写真${count}のURL
      <input type="url" class="photo-url"
        placeholder="https://example.com/photo${count}.jpg">
    </label>
    <div class="photo-preview-container" hidden>
      <img class="photo-preview" alt="写真${count}のプレビュー"
        style="max-width:100%;max-height:300px;">
    </div>
    <button type="button" class="remove-photo">この写真を削除</button>
  `;

  photoList.appendChild(item);

  const input = item.querySelector(".photo-url");
  input.value = url;

  if (url) {
    const preview = item.querySelector(".photo-preview");
    const container = item.querySelector(".photo-preview-container");

    preview.onload = () => { container.hidden = false; };
    preview.onerror = () => { container.hidden = true; };
    preview.src = url;
  }
}

function fillPhotoFields(photos = []) {
  clearExtraPhotos();

  const urls = Array.isArray(photos) ? photos : [];
  const firstInput = photoList?.querySelector(".photo-url");

  if (!firstInput) return;

  if (urls.length === 0) {
    firstInput.value = "";
    return;
  }

  firstInput.value = urls[0];

  const firstItem = firstInput.closest(".photo-item");
  const firstPreview = firstItem?.querySelector(".photo-preview");
  const firstContainer = firstItem?.querySelector(".photo-preview-container");

  if (firstPreview && firstContainer) {
    firstPreview.onload = () => { firstContainer.hidden = false; };
    firstPreview.onerror = () => { firstContainer.hidden = true; };
    firstPreview.src = urls[0];
  }

  urls.slice(1).forEach(url => addPhotoField(url));
}

function collectPhotos() {
  if (!photoList) return [];

  return Array.from(photoList.querySelectorAll(".photo-url"))
    .map(input => input.value.trim())
    .filter(Boolean);
}

async function loadArticles() {
  if (!articleList || !isLoggedIn || !auth.currentUser) return;

  articleList.textContent = "記事一覧を読み込んでいます...";

  try {
    const articlesQuery = query(
      collection(db, "articles"),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(articlesQuery);

    articleList.replaceChildren();

    if (snapshot.empty) {
      articleList.textContent = "投稿済みの記事はありません。";
      articlesLoaded = true;
      return;
    }

    snapshot.forEach(documentSnapshot => {
      const article = documentSnapshot.data();
      const item = document.createElement("div");
      item.className = "admin-article-item";

      const title = document.createElement("strong");
      title.textContent = article.title || "無題の記事";

      const details = document.createElement("p");
      details.textContent =
        `${article.country || ""} / ${article.date || ""} / ` +
        `${article.status === "published" ? "公開中" : "下書き"}`;

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "この記事を編集";
      editButton.addEventListener("click", () => {
        editArticle(documentSnapshot.id, article);
      });
const deleteButton = document.createElement("button");
deleteButton.type = "button";
deleteButton.textContent = "この記事を削除";
deleteButton.style.marginLeft = "8px";
deleteButton.style.color = "#c62828";

deleteButton.addEventListener("click", async () => {
  const articleTitle = article.title || "無題の記事";

  if (!confirm(`「${articleTitle}」を本当に削除しますか？\nこの操作は取り消せません。`)) {
    return;
  }

  deleteButton.disabled = true;

  try {
    await deleteDoc(doc(db, "articles", documentSnapshot.id));

    if (editingArticleId === documentSnapshot.id) {
      resetEditor();
    }

    setMessage(`「${articleTitle}」を削除しました。`);
    await loadArticles();
  } catch (error) {
    console.error("記事削除エラー:", error);
    setMessage("削除に失敗しました。Firestoreのセキュリティルールを確認してください。");
    deleteButton.disabled = false;
  }
});
      item.append(title, details, editButton, deleteButton);
      item.style.cssText =
        "padding:14px;margin:12px 0;border:1px solid #ddd;border-radius:6px;";

      articleList.appendChild(item);
    });

    articlesLoaded = true;
  } catch (error) {
    console.error("記事一覧の読み込みエラー:", error);
    articleList.textContent =
      "記事一覧を読み込めませんでした。Firestoreのルールや接続を確認してください。";
  }
}

function editArticle(id, article) {
  editingArticleId = id;

  setField("title", article.title);
  setField("country", article.country);
  setField("date", article.date);
  setField("description", article.description);
  setField("content", article.content);
  setField("status", article.status || "draft");

  fillPhotoFields(article.photos || []);

  setFormMode(true);
  setMessage(`「${article.title || "無題の記事"}」を編集中です。`);

  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

onAuthStateChanged(auth, async user => {
  isLoggedIn = Boolean(user);

  if (user) {
    userMessage.textContent = `ログイン中：${user.email}`;
    form.hidden = false;
    await loadArticles();
  } else {
    form.hidden = true;
    userMessage.textContent = "記事編集には管理者ログインが必要です。";
    setMessage("ログインページからログインしてください。");

    if (articleList) {
      articleList.textContent = "ログインすると記事一覧を表示します。";
    }
  }
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!isLoggedIn || !auth.currentUser) {
    setMessage("ログインしてから保存してください。");
    return;
  }

  const article = {
    title: document.getElementById("title").value.trim(),
    country: document.getElementById("country").value.trim(),
    date: document.getElementById("date").value,
    description: document.getElementById("description").value.trim(),
    content: document.getElementById("content").value.trim(),
    photos: collectPhotos(),
    status: document.getElementById("status").value,
    updatedAt: serverTimestamp()
  };

  if (!article.title || !article.country || !article.date || !article.content) {
    setMessage("タイトル・国や地域・日付・本文を入力してください。");
    return;
  }

  saveButton.disabled = true;
  setMessage("保存しています...");

  try {
    if (editingArticleId) {
      await updateDoc(doc(db, "articles", editingArticleId), article);
      setMessage("記事の変更を保存しました！");
    } else {
      article.createdAt = serverTimestamp();
      await addDoc(collection(db, "articles"), article);
      setMessage(
        article.status === "published"
          ? "記事を保存し、公開しました！"
          : "記事を下書き保存しました！"
      );
    }

    editingArticleId = null;
    form.reset();
    clearExtraPhotos();
    setFormMode(false);
    await loadArticles();
  } catch (error) {
    console.error("記事保存エラー:", error);
    setMessage(
      "保存に失敗しました。Firestoreのセキュリティルールとログイン状態を確認してください。"
    );
  } finally {
    saveButton.disabled = false;
  }
});

if (photoList && addPhotoButton) {
  photoList.addEventListener("input", event => {
    if (!event.target.classList.contains("photo-url")) return;

    const item = event.target.closest(".photo-item");
    const preview = item.querySelector(".photo-preview");
    const container = item.querySelector(".photo-preview-container");
    const url = event.target.value.trim();

    preview.onload = () => { container.hidden = false; };
    preview.onerror = () => { container.hidden = true; };

    if (url) {
      preview.src = url;
    } else {
      preview.removeAttribute("src");
      container.hidden = true;
    }
  });

  addPhotoButton.addEventListener("click", () => addPhotoField());

  photoList.addEventListener("click", event => {
    const button = event.target.closest(".remove-photo");
    if (!button) return;

    const items = photoList.querySelectorAll(".photo-item");

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

    photoList.querySelectorAll(".photo-item").forEach((item, index) => {
      const label = item.querySelector("label");
      label.childNodes[0].textContent = `写真${index + 1}のURL`;
      item.querySelector(".photo-preview").alt =
        `写真${index + 1}のプレビュー`;
    });
  });
}
