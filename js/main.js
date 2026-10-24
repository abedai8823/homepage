
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// HTMLに文字列を安全に表示する
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// 公開済みの記事をFirestoreから取得する
async function loadArticles() {
  const articleList = document.getElementById("article-list");
  const latestArticle = document.getElementById("latest-article");
const pickupList = document.getElementById("pickup-list");
  try {
    const articlesQuery = query(
      collection(db, "articles"),
      where("status", "==", "published")
    );

    const snapshot = await getDocs(articlesQuery);

    const articles = snapshot.docs
      .map((document) => ({
        id: document.id,
        ...document.data()
      }))
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    // 公開記事がない場合
    if (articles.length === 0) {
      if (articleList) {
        articleList.innerHTML =
          '<p>公開中の記事はまだありません。</p>';
      }

      if (latestArticle) {
        latestArticle.innerHTML =
          '<p>新しい記事を準備中です。</p>';
      }

      console.log("公開済みの記事はまだありません。");
      return;
    }

    // BOX5：記事一覧
    // サイドバー：Pick up
if (pickupList) {
  pickupList.innerHTML = articles.slice(0, 5).map((article) => `
    <li>
      <a href="#article-${encodeURIComponent(article.id)}">
        ${escapeHTML(article.title || "無題の記事")}
      </a>
    </li>
  `).join("");
}
    if (articleList) {
      articleList.innerHTML = articles.map((article) => `
        <article class="article-card">
          <p class="article-country">
            ${escapeHTML(article.country || "")}
          </p>
          <h3>
            <a href="#article-${encodeURIComponent(article.id)}">
              ${escapeHTML(article.title || "無題の記事")}
            </a>
          </h3>
          <p class="article-date">${escapeHTML(article.date || "")}</p>
          <p>${escapeHTML(article.description || "")}</p>
        </article>
      `).join("");
    }

    // BOX3：最新記事
    if (latestArticle) {
      const latest = articles[0];

      latestArticle.innerHTML = `
        <p class="article-country">
          ${escapeHTML(latest.country || "")}
        </p>
        <h1>${escapeHTML(latest.title || "無題の記事")}</h1>
        <p class="article-date">${escapeHTML(latest.date || "")}</p>
        <p class="article-description">
          ${escapeHTML(latest.description || "")}
        </p>
        <div class="article-content"></div>
      `;

      // 本文は文字列として表示し、HTMLを実行させない
      const contentArea = latestArticle.querySelector(".article-content");
      contentArea.textContent = latest.content || "本文はまだありません。";
      contentArea.style.whiteSpace = "pre-wrap";
    }

    console.log(`Firestoreから公開記事を${articles.length}件読み込みました。`);

  } catch (error) {
    console.error("記事の読み込みエラー:", error);

    if (articleList) {
      articleList.textContent =
        "記事を読み込めませんでした。時間をおいて再度お試しください。";
    }

    if (latestArticle) {
      latestArticle.textContent = "記事の読み込みに失敗しました。";
    }
  }
}

loadArticles();




function shareOnX() {
  const url = window.location.href;
  const title = document.title;

  const shareUrl =
    "https://twitter.com/intent/tweet?url=" +
    encodeURIComponent(url) +
    "&text=" +
    encodeURIComponent(title);

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function shareOnFacebook() {
  const url = window.location.href;

  const shareUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" +
    encodeURIComponent(url);

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function shareOnLINE() {
  const url = window.location.href;
  const title = document.title;

  const shareUrl =
    "https://social-plugins.line.me/lineit/share?url=" +
    encodeURIComponent(url) +
    "&text=" +
    encodeURIComponent(title);

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}
