// Music player. Reads ID3 tags (v2.2/v2.3/v2.4) directly from the MP3 files
// using HTTP range requests, so the files themselves are the only source of
// metadata and album art. Wires up the Media Session API so lock screens,
// notification shades, and headset buttons control playback.
(function() {
  'use strict';

  // ---------- ID3 tag reading ----------

  const FRAME_KEYS = {
    TT2: 'title', TIT2: 'title',
    TP1: 'artist', TPE1: 'artist',
    TAL: 'album', TALB: 'album',
    PIC: 'art', APIC: 'art',
  };

  function syncsafe(b, i) {
    return (b[i] << 21) | (b[i + 1] << 14) | (b[i + 2] << 7) | b[i + 3];
  }

  function be32(b, i) {
    return (b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3];
  }

  // Byte reader over a URL. Fetches ranges on demand and keeps the last
  // window around, so walking a tag costs a few small requests instead of
  // downloading megabytes of embedded art. Falls back to a single full
  // download if the server ignores Range headers.
  function createReader(url) {
    const CHUNK = 16384;
    let full = null;
    let win = null;

    async function fetchRange(start, length) {
      const res = await fetch(url, {
        headers: { Range: 'bytes=' + start + '-' + (start + length - 1) },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (res.status !== 206) full = bytes;
      return bytes;
    }

    return async function read(start, length) {
      if (full) return full.subarray(start, start + length);
      if (win && start >= win.start && start + length <= win.start + win.bytes.length) {
        return win.bytes.subarray(start - win.start, start - win.start + length);
      }
      const bytes = await fetchRange(start, Math.max(length, CHUNK));
      if (full) return full.subarray(start, start + length);
      win = { start: start, bytes: bytes };
      return bytes.subarray(0, length);
    };
  }

  // Text frame body: first byte picks the encoding, the rest is the string.
  function decodeText(body) {
    if (!body.length) return '';
    const label = { 0: 'windows-1252', 1: 'utf-16', 2: 'utf-16be', 3: 'utf-8' }[body[0]] || 'utf-8';
    try {
      return new TextDecoder(label).decode(body.subarray(1)).replace(/^\0+|\0+$/g, '');
    } catch (e) {
      return '';
    }
  }

  // Index just past a null terminator (two bytes for UTF-16 encodings).
  function afterTerminator(buf, start, wide) {
    if (wide) {
      for (let i = start; i + 1 < buf.length; i += 2) {
        if (buf[i] === 0 && buf[i + 1] === 0) return i + 2;
      }
    } else {
      for (let i = start; i < buf.length; i++) {
        if (buf[i] === 0) return i + 1;
      }
    }
    return start;
  }

  // Walks the ID3v2 frames of an MP3 and returns { title, artist, album, art }.
  // Text frames are fetched; the (often multi-megabyte) picture frame is only
  // located, so loadArt() can fetch it later if it's actually needed.
  async function readId3(url) {
    const read = createReader(url);
    const meta = {};
    const h = await read(0, 10);
    if (h.length < 10 || h[0] !== 0x49 || h[1] !== 0x44 || h[2] !== 0x33) return meta; // "ID3"
    const version = h[3];
    if (version < 2 || version > 4) return meta;
    if (h[5] & 0x80) return meta; // unsynchronised tag, not worth supporting
    const idLen = version === 2 ? 3 : 4;
    const headLen = version === 2 ? 6 : 10;
    const tagEnd = 10 + syncsafe(h, 6);
    let pos = 10;
    if (version > 2 && (h[5] & 0x40)) { // skip extended header
      const ext = await read(pos, 4);
      pos += version === 4 ? syncsafe(ext, 0) : be32(ext, 0) + 4;
    }
    while (pos + headLen <= tagEnd) {
      const fh = await read(pos, headLen);
      if (fh[0] === 0) break; // padding
      const id = String.fromCharCode.apply(null, fh.subarray(0, idLen));
      const size = version === 2 ? ((fh[3] << 16) | (fh[4] << 8) | fh[5])
        : version === 4 ? syncsafe(fh, 4)
        : be32(fh, 4);
      if (size <= 0 || pos + headLen + size > tagEnd) break;
      const bodyStart = pos + headLen;
      const key = FRAME_KEYS[id];
      if (key === 'art' && !meta.art) {
        meta.art = { read: read, start: bodyStart, size: size, v22: version === 2 };
      } else if (key && key !== 'art' && !meta[key]) {
        meta[key] = decodeText(await read(bodyStart, Math.min(size, 2048)));
      }
      pos = bodyStart + size;
    }
    return meta;
  }

  // Fetches the image bytes for an art frame located by readId3.
  // PIC (v2.2):  encoding, 3-char format, type, description\0, data
  // APIC (v2.3+): encoding, mime\0, type, description\0, data
  async function loadArt(art) {
    const head = await art.read(art.start, Math.min(art.size, 512));
    const wide = head[0] === 1 || head[0] === 2;
    let mime, descStart;
    if (art.v22) {
      const fmt = String.fromCharCode(head[1], head[2], head[3]).toUpperCase();
      mime = fmt.indexOf('PNG') !== -1 ? 'image/png' : 'image/jpeg';
      descStart = 5;
    } else {
      let i = 1;
      while (i < head.length && head[i] !== 0) i++;
      mime = String.fromCharCode.apply(null, head.subarray(1, i)) || 'image/jpeg';
      descStart = i + 2; // past the mime terminator and the picture type byte
    }
    const dataStart = afterTerminator(head, descStart, wide);
    const bytes = await art.read(art.start + dataStart, art.size - dataStart);
    return { blob: new Blob([bytes], { type: mime }), type: mime };
  }

  // ---------- player ----------

  const allPlayers = [];
  let activePlayer = null;

  function fmtTime(s) {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  // The most recently played player owns the (global) media session.
  function claimMediaSession(player, handlers) {
    activePlayer = player;
    if (!('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    ms.setActionHandler('play', handlers.play);
    ms.setActionHandler('pause', handlers.pause);
    ms.setActionHandler('previoustrack', handlers.prev);
    ms.setActionHandler('nexttrack', handlers.next);
    try {
      ms.setActionHandler('seekto', handlers.seekto);
    } catch (e) { /* not supported everywhere */ }
  }

  function initPlayer(root) {
    const audio = root.querySelector('audio');
    const artImg = root.querySelector('.mp-art img');
    const titleEl = root.querySelector('.mp-title');
    const artistEl = root.querySelector('.mp-artist');
    const playBtn = root.querySelector('.mp-play');
    const seekEl = root.querySelector('.mp-seekbar');
    const elapsedEl = root.querySelector('.mp-elapsed');
    const durationEl = root.querySelector('.mp-duration');

    const tracks = Array.prototype.map.call(
      root.querySelectorAll('.mp-tracklist [data-src]'),
      function(btn) {
        return {
          src: btn.getAttribute('data-src'),
          name: btn.getAttribute('data-name'),
          btn: btn,
          meta: null,
          art: null,
          artLoading: false,
        };
      }
    );

    let current = 0;
    let scrubbing = false;
    const player = { audio: audio };
    allPlayers.push(player);

    function trackTitle(t) {
      return (t.meta && t.meta.title) || t.name;
    }

    function updateSeekFill() {
      const max = +seekEl.max;
      const pct = max > 0 ? (seekEl.value / max) * 100 : 0;
      seekEl.style.setProperty('--mp-fill', pct + '%');
    }

    // Names that overflow the card scroll sideways; the animation distance
    // and pace come from how far the text sticks out. Measured from the
    // span's own geometry, not the wrap's scrollWidth: with text-overflow:
    // ellipsis active, Safari reports scrollWidth as the clipped width.
    function refreshScroll(wrap) {
      const over = wrap.firstElementChild.getBoundingClientRect().width
        - wrap.getBoundingClientRect().width;
      if (over > 2) {
        wrap.style.setProperty('--mp-scroll-dist', over + 'px');
        wrap.style.setProperty('--mp-scroll-dur', (4 + over / 40).toFixed(1) + 's');
        wrap.classList.add('mp-scroll');
      } else {
        wrap.classList.remove('mp-scroll');
      }
    }

    function setScrollText(wrap, text) {
      wrap.firstElementChild.textContent = text;
      refreshScroll(wrap);
    }

    function updateMediaMetadata() {
      if (activePlayer !== player || !('mediaSession' in navigator)) return;
      const t = tracks[current];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: trackTitle(t),
        artist: (t.meta && t.meta.artist) || '',
        album: (t.meta && t.meta.album) || '',
        artwork: t.art ? [{ src: t.art.url, type: t.art.type }] : [],
      });
    }

    function updatePositionState() {
      if (activePlayer !== player || !('mediaSession' in navigator)) return;
      if (navigator.mediaSession.setPositionState && isFinite(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: Math.min(audio.currentTime, audio.duration),
        });
      }
    }

    function showArt(t) {
      if (t.art) {
        artImg.src = t.art.url;
        artImg.hidden = false;
        return;
      }
      artImg.hidden = true;
      artImg.removeAttribute('src');
      if (t.meta && t.meta.art && !t.artLoading) {
        t.artLoading = true;
        loadArt(t.meta.art).then(function(art) {
          t.art = { url: URL.createObjectURL(art.blob), type: art.type };
          if (tracks[current] === t) {
            artImg.src = t.art.url;
            artImg.hidden = false;
            updateMediaMetadata();
          }
        }).catch(function() { /* keep the placeholder */ });
      }
    }

    function showTrack() {
      const t = tracks[current];
      setScrollText(titleEl, trackTitle(t));
      setScrollText(artistEl, (t.meta && t.meta.artist) || '');
      tracks.forEach(function(o, i) {
        o.btn.classList.toggle('current', i === current);
      });
      showArt(t);
      updateMediaMetadata();
    }

    function load(i, autoplay) {
      current = (i + tracks.length) % tracks.length;
      audio.src = tracks[current].src;
      seekEl.value = 0;
      seekEl.max = 0;
      updateSeekFill();
      elapsedEl.textContent = '0:00';
      durationEl.textContent = '0:00';
      showTrack();
      if (autoplay) audio.play();
    }

    const handlers = {
      play: function() { audio.play(); },
      pause: function() { audio.pause(); },
      prev: tracks.length > 1 ? function() { load(current - 1, true); } : null,
      next: tracks.length > 1 ? function() { load(current + 1, true); } : null,
      seekto: function(details) {
        audio.currentTime = details.seekTime;
        updatePositionState();
      },
    };

    playBtn.addEventListener('click', function() {
      if (audio.paused) audio.play(); else audio.pause();
    });

    seekEl.addEventListener('input', function() {
      scrubbing = true;
      elapsedEl.textContent = fmtTime(+seekEl.value);
      updateSeekFill();
    });

    seekEl.addEventListener('change', function() {
      scrubbing = false;
      audio.currentTime = +seekEl.value;
    });

    tracks.forEach(function(t, i) {
      t.btn.addEventListener('click', function() {
        if (i === current) {
          if (audio.paused) audio.play(); else audio.pause();
        } else {
          load(i, true);
        }
      });
    });

    audio.addEventListener('play', function() {
      allPlayers.forEach(function(p) {
        if (p !== player) p.audio.pause();
      });
      claimMediaSession(player, handlers);
      updateMediaMetadata();
      root.classList.add('playing');
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    });

    audio.addEventListener('pause', function() {
      root.classList.remove('playing');
      if (activePlayer === player && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    });

    audio.addEventListener('ended', function() {
      if (current < tracks.length - 1) load(current + 1, true);
    });

    audio.addEventListener('durationchange', function() {
      seekEl.max = isFinite(audio.duration) ? audio.duration : 0;
      durationEl.textContent = fmtTime(audio.duration);
      updateSeekFill();
      updatePositionState();
    });

    audio.addEventListener('timeupdate', function() {
      if (!scrubbing) {
        seekEl.value = audio.currentTime;
        elapsedEl.textContent = fmtTime(audio.currentTime);
        updateSeekFill();
      }
      updatePositionState();
    });

    // Read tags for every track so the list shows real titles. The current
    // track's display refreshes when its metadata lands.
    tracks.forEach(function(track, i) {
      readId3(track.src)
        .then(function(meta) { track.meta = meta; })
        .catch(function() { track.meta = {}; })
        .then(function() {
          const span = track.btn.querySelector('.mp-track-title');
          if (span) span.textContent = trackTitle(track);
          if (i === current) showTrack();
        });

      const lengthEl = track.btn.querySelector('.mp-track-length');
      if (lengthEl) {
        const probe = new Audio();
        probe.preload = 'metadata';
        probe.addEventListener('loadedmetadata', function() {
          lengthEl.textContent = fmtTime(probe.duration);
        });
        probe.src = track.src;
      }
    });

    // Overflow depends on layout, so re-check when the fonts arrive and
    // whenever the card changes width.
    function remeasure() {
      refreshScroll(titleEl);
      refreshScroll(artistEl);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    window.addEventListener('resize', remeasure);

    load(0, false);
  }

  function init() {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // For testing the tag reader outside the browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { readId3: readId3, loadArt: loadArt };
  }
})();
