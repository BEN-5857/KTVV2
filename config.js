/**
 * ====== Web-KTV-Cast 設定檔 ======
 * 部署前請務必填好以下設定，這是「唯一」需要修改的檔案。
 *
 * 1. FIREBASE_CONFIG：讓手機（點歌端）跟電視（播放端）能跨裝置即時同步歌單。
 *    → 免費申請教學請看 README.md「步驟一」。
 *    → Firebase 的 web config 本來就是公開設計，寫在前端程式碼裡是官方建議做法，不是密鑰外洩。
 *
 * 2. YOUTUBE_API_KEY（選填）：填了之後，手機端「語音搜尋 / 文字搜尋」會直接列出
 *    YouTube 影片清單讓你點選加入歌單；不填的話，系統會改成幫你開一個 YouTube
 *    搜尋結果分頁，你自己找到影片後用「複製網址」的方式加入歌單（一樣可用，只是多一步）。
 *    → 免費申請教學請看 README.md「步驟二」。
 */

window.WKTV_CONFIG = {
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyCjTsEPZhKHYfWkP0gmpsJZNeFzD6tl06I",
    authDomain: "ktvv2-bd1c4.firebaseapp.com",
    databaseURL: "https://ktvv2-bd1c4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ktvv2-bd1c4",
    storageBucket: "ktvv2-bd1c4.firebasestorage.app",
    messagingSenderId: "190390874995",
    appId: "1:190390874995:web:f8e05e16fafb03d366cb06"
  },

  // 選填。留空字串 "" 即代表不使用 YouTube Data API。
  YOUTUBE_API_KEY: "AIzaSyCjTsEPZhKHYfWkP0gmpsJZNeFzD6tl06I",

  // 同一場 KTV 的房間代碼。家人朋友都用同一組代碼，資料就會同步在一起。
  // 若你家有多台電視/多個房間要各自獨立點歌，改成不同代碼即可。
  ROOM_ID: "home-ktv"
};
