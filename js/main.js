// rail explorer のサンプル記事

const articles = [
    {
        title: "スリランカの鉄道旅",
        country: "Sri Lanka",
        date: "2026-10-24",
        description: "美しい海岸線を走る列車の旅を記録。",
        content: `
            <h2>インド洋沿いを走る列車</h2>
            <p>スリランカの鉄道旅が始まる。車窓からは美しいインド洋が見え、列車は海岸線に沿って走っていく。</p>

            <h2>現地の駅を訪ねて</h2>
            <p>駅ごとに異なる雰囲気があり、現地の人々の暮らしや鉄道文化を感じることができる。</p>

            <p>これから訪れた場所や乗車した列車について、写真とともに詳しく記録していく。</p>
        `,
        url: "#"
    },
    {
        title: "タンザニアの鉄道を訪ねて",
        country: "Tanzania",
        date: "2026-10-20",
        description: "アフリカの鉄道風景と現地での体験。",
        content: `
            <h2>アフリカの鉄道風景</h2>
            <p>タンザニアの鉄道と、旅の中で出会った風景を記録する。</p>
        `,
        url: "#"
    },
    {
        title: "ヨーロッパ鉄道の記録",
        country: "Europe",
        date: "2026-10-15",
        description: "ヨーロッパで出会った鉄道を紹介。",
        content: `
            <h2>ヨーロッパの鉄道を巡る</h2>
            <p>ヨーロッパで出会った列車や駅の風景を紹介する。</p>
        `,
        url: "#"
    }
];


// 日付の新しい順に並べる
articles.sort((a, b) => new Date(b.date) - new Date(a.date));

// BOX5の記事一覧に表示する
const articleList = document.getElementById("article-list");

if (articleList) {
    articleList.innerHTML = articles.map(article => `
        <article class="article-card">
            <p class="article-country">${article.country}</p>
            <h3><a href="${article.url}">${article.title}</a></h3>
            <p class="article-date">${article.date}</p>
            <p>${article.description}</p>
        </article>
    `).join("");
}

// BOX3に最新記事の全文を表示する
const latestArticle = document.getElementById("latest-article");

if (latestArticle && articles.length > 0) {
    const latest = articles[0];

    latestArticle.innerHTML = `
        <p class="article-country">${latest.country}</p>
        <h1>${latest.title}</h1>
        <p class="article-date">${latest.date}</p>
        <p class="article-description">${latest.description}</p>
        <div class="article-content">
            ${latest.content}
        </div>
    `;
}