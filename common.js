/* Web-KTV-Cast 共用邏輯：Firebase 即時同步 + 歌曲解析工具 */

(function () {
  const CFG = window.WKTV_CONFIG;
  const ROOM = CFG.ROOM_ID || "home-ktv";

  // ---------- Firebase 初始化 ----------
  firebase.initializeApp(CFG.FIREBASE_CONFIG);
  const db = firebase.database();
  const roomRef = db.ref("rooms/" + ROOM);
  const queueRef = roomRef.child("queue");
  const stateRef = roomRef.child("state"); // { currentId, isPlaying, updatedAt }

  const WKTV = {};

  // ---------- 歌曲網址解析 ----------
  WKTV.parseYouTubeId = function (url) {
    try {
      const u = new URL(url.trim());
      if (u.hostname.includes("youtu.be")) {
        return u.pathname.replace("/", "");
      }
      if (u.hostname.includes("youtube.com")) {
        if (u.pathname === "/watch") return u.searchParams.get("v");
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
        if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
      }
    } catch (e) {}
    return null;
  };

  // 用 YouTube 官方 oEmbed（免金鑰）抓標題 / 上傳者名稱，當作「歌手」欄位的預設值
  WKTV.fetchYouTubeMeta = async function (videoId) {
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) throw new Error("oEmbed failed");
      const data = await res.json();
      return { title: data.title || "", artist: data.author_name || "" };
    } catch (e) {
      return { title: "", artist: "" };
    }
  };

  // ---------- 歌單（queue）操作 ----------
  // 歌曲物件: { id, type: 'youtube'|'external', videoId, url, title, artist, thumb, addedAt }

  WKTV.addSong = function (song) {
    const newRef = queueRef.push();
    const item = Object.assign(
      { id: newRef.key, addedAt: Date.now() },
      song
    );
    return newRef.set(item).then(() => item);
  };

  WKTV.removeSong = function (id) {
    return queueRef.child(id).remove();
  };

  WKTV.moveSong = function (orderedIds) {
    // 用時間戳重寫 addedAt 來達成排序（Firebase 無原生 array reorder）
    const updates = {};
    orderedIds.forEach((id, idx) => {
      updates[id + "/addedAt"] = idx;
    });
    return queueRef.update(updates);
  };

  WKTV.onQueueChange = function (cb) {
    queueRef.on("value", (snap) => {
      const val = snap.val() || {};
      const list = Object.values(val).sort((a, b) => a.addedAt - b.addedAt);
      cb(list);
    });
  };

  // ---------- 播放狀態（誰在播、播放/暫停） ----------
  WKTV.setState = function (partial) {
    return stateRef.update(Object.assign({ updatedAt: Date.now() }, partial));
  };

  WKTV.onStateChange = function (cb) {
    stateRef.on("value", (snap) => cb(snap.val() || {}));
  };

  // 播完/切歌：把目前這首從佇列移除，並把 currentId 指向下一首（若有）
  WKTV.playNext = async function () {
    const snap = await queueRef.once("value");
    const val = snap.val() || {};
    const list = Object.values(val).sort((a, b) => a.addedAt - b.addedAt);
    const stateSnap = await stateRef.once("value");
    const state = stateSnap.val() || {};
    const curIdx = list.findIndex((s) => s.id === state.currentId);

    // 移除目前這首（已唱完）
    if (curIdx >= 0) {
      await queueRef.child(list[curIdx].id).remove();
      list.splice(curIdx, 1);
    }
    const next = list[0];
    return WKTV.setState({ currentId: next ? next.id : null, isPlaying: !!next });
  };

  // 手動指定播放某首（點清單中的「插播」）
  WKTV.playSongNow = function (id) {
    return WKTV.setState({ currentId: id, isPlaying: true });
  };

  // ---------- YouTube 搜尋（有金鑰才可用） ----------
  WKTV.hasYouTubeSearch = !!CFG.YOUTUBE_API_KEY;

  WKTV.searchYouTube = async function (query) {
    if (!CFG.YOUTUBE_API_KEY) return [];
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12` +
      `&q=${encodeURIComponent(query + " 伴唱 OR karaoke OR MV")}` +
      `&key=${CFG.YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("YouTube search failed: " + res.status);
    const data = await res.json();
    return (data.items || []).map((it) => ({
      videoId: it.id.videoId,
      title: it.snippet.title,
      artist: it.snippet.channelTitle,
      thumb: it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url
    }));
  };

  window.WKTV = WKTV;
})();
