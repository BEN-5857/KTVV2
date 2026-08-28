# Web-KTV-Cast 🎤📺

家庭 KTV 點歌系統。手機/平板當遙控器點歌，Google 電視盒（TV Bro 瀏覽器）當播放端，歌單即時同步、播完自動接下一首。純靜態網頁，部署在 GitHub Pages 免費使用。

## 功能

- **兩個網址即可運作**：`remote.html`（手機用）／`tv.html`（電視用），透過 Firebase 即時同步歌單，不需要自己架後端伺服器。
- **找歌方式**
  - 語音搜尋（手機麥克風說歌名 → 自動搜尋 YouTube）
  - 文字搜尋 YouTube（有設定 API 金鑰時，直接列出結果點選加入；沒設定時，改開 YouTube 搜尋分頁讓你手動複製網址回來加）
  - 嵌入「台灣點歌王」(song.corp.com.tw) 查詢最新歌單，用它的分享功能複製歌曲網址回來貼上加入
  - 手動貼上任何 YouTube／點歌王網址：內建「一鍵貼上」按鈕，若手機瀏覽器限制自動讀取剪貼簿，會提示你手動長按貼上（已知限制，見下方說明）
- **KTV 播放功能**：待播清單（歌名＋歌手）、播放/暫停、下一首、插播（跳到指定歌曲）、刪除、播完自動接續下一首
- **電視畫面**：主畫面播放伴唱影片，旁邊常駐待播清單側欄

## 架構說明（為什麼需要 Firebase）

GitHub Pages 只能放靜態檔案，本身不能讓「手機」跟「電視」這兩台不同裝置即時互通資料。因此使用 Google 的 **Firebase Realtime Database**（免費額度對家庭 KTV 使用完全足夠）當作兩端之間的「共用歌單黑板」：手機寫入歌單，電視即時讀到並更新畫面，反過來也一樣。Firebase 的網頁端設定值本來就是公開資訊（不是密鑰），寫在程式碼裡是官方建議做法。

---

## 部署步驟

### 步驟一：申請免費 Firebase（約 5 分鐘，必要）

1. 前往 https://console.firebase.google.com ，用 Google 帳號登入，點「新增專案」，專案名稱隨意（例如 `home-ktv`）。
2. 專案建立後，左側選單找到 **Build → Realtime Database**，點「建立資料庫」。
   - 位置選離你最近的（例如 `asia-southeast1`）。
   - 安全性規則先選「**測試模式**」（方便上手；正式使用建議之後依下方「安全性建議」加強）。
3. 回到左側「專案總覽」，點網頁圖示 `</>` 新增一個 Web App，名稱隨意，**不需要**勾選 Firebase Hosting。
4. 建立後畫面會顯示一段 `firebaseConfig = {...}` 的物件，把裡面 6~7 個欄位複製貼到本專案的 `config.js` 對應位置。

```js
FIREBASE_CONFIG: {
  apiKey: "AIzaSy...",
  authDomain: "home-ktv-xxxxx.firebaseapp.com",
  databaseURL: "https://home-ktv-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-ktv-xxxxx",
  storageBucket: "home-ktv-xxxxx.appspot.com",
  messagingSenderId: "...",
  appId: "..."
}
```

> `databaseURL` 在建立 Realtime Database 後，於資料庫頁面最上方就能看到，記得也要複製進去（新建 Web App 的設定物件有時不會自動包含它）。

### 步驟二：YouTube API 金鑰（選填，但強烈建議）

不設定也能用（會改成幫你開 YouTube 搜尋分頁，自己複製網址回來貼），但設定後手機端可以直接搜尋、看縮圖、點一下加入，體驗好很多：

1. 前往 https://console.cloud.google.com/apis/library/youtube.googleapis.com ，選同一個（或新建一個）Google Cloud 專案，點「啟用」。
2. 左側「憑證」→「建立憑證」→「API 金鑰」，複製產生的金鑰。
3. 建議點該金鑰進去設定「應用程式限制」為 HTTP 參照網址，只允許你的 GitHub Pages 網域，避免被盜用。
4. 貼到 `config.js` 的 `YOUTUBE_API_KEY` 欄位。

YouTube Data API 每日有免費配額（一般家庭使用量遠低於額度上限）。

### 步驟三：部署到 GitHub Pages

1. 建一個新的 GitHub Repository（例如 `web-ktv-cast`），把本專案所有檔案上傳（`index.html`、`remote.html`、`tv.html`、`config.js`、`common.js`、`style.css`）。
2. Repository 的 **Settings → Pages**，Source 選 `Deploy from a branch`，Branch 選 `main` / `root`，儲存。
3. 幾分鐘後會產生網址，例如：`https://你的帳號.github.io/web-ktv-cast/`
4. 手機打開 `.../remote.html`，電視盒 TV Bro 瀏覽器打開 `.../tv.html`。

### 步驟四：實際使用

- 電視盒：TV Bro 打開 `tv.html`，可長按網址列「加到主畫面」方便下次快速開啟。
- 手機：打開 `remote.html`，Chrome 選單「加入主畫面」可變成類似 App 的圖示。
- 全家共用同一個 `ROOM_ID`（`config.js` 內設定），大家的手機都能同時點歌、排進同一個佇列。

---

## 已知限制與說明

- **手機瀏覽器剪貼簿限制**：部分手機瀏覽器（尤其非使用者主動點擊觸發、或跨 App 切換後）會擋掉 `navigator.clipboard.readText()` 自動讀取。系統已改為「按鈕觸發＋失敗提示手動長按貼上」的組合，這是目前手機瀏覽器安全機制下最穩定的做法。
- **台灣點歌王嵌入**：頁面內嘗試用 iframe 直接嵌入 `song.corp.com.tw`，若對方網站設定了 `X-Frame-Options` 禁止嵌入，畫面會空白，此時請改用「開啟新分頁」按鈕瀏覽，找到歌曲後用網址加入歌單即可（功能仍可正常使用，只是少了嵌入預覽）。
- **非 YouTube 網址（例如點歌王自家連結）**：加入歌單後，電視端會用 iframe 嘗試播放該網址；但因為不是 YouTube 影片，系統無法偵測「播放結束」，需要手動按「下一首」切歌。純 YouTube 網址則完全支援播完自動接續。
- **語音搜尋**：使用瀏覽器內建 Web Speech API，Android Chrome 支援度最好；部分瀏覽器（含大多數 iOS 瀏覽器）不支援，此時麥克風按鈕會自動停用，仍可用文字搜尋。

## 安全性建議（正式長期使用時）

Realtime Database 若一直開著「測試模式」，代表任何知道你資料庫網址的人都能讀寫。家庭短期使用風險很低，但若想更安全，可到 Firebase 主控台的 Realtime Database → 規則，改成類似：

```json
{
  "rules": {
    "rooms": {
      "$room": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

並定期到主控台清空不用的 room 資料即可。
