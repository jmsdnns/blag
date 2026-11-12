// Release pages: the big cover and the background follow the album art the
// player reads out of the MP3s, once it has loaded. The background isn't the
// art itself but a gradient made from its colors: the most common one
// underneath, and a few others glowing from the corners nearest to where
// they sit in the art, the most vivid first.
(function () {
  const art = document.querySelector('.release .mp-art img');
  const cover = document.getElementById('release-cover');
  const bg = document.getElementById('release-bg');
  if (!art || (!cover && !bg)) return;

  // Where the colors glow from, as percentages across and down the window.
  const SPOTS = [[12, 18], [88, 12], [85, 88], [15, 82]];

  function show() {
    if (cover) {
      cover.src = art.src;
      cover.hidden = false;
    }
    if (!bg) return;
    const colors = palette(art);
    if (!colors) return;

    const base = colors[0];
    const glows = colors.slice(1)
      .filter(function (c) { return c.share > 0.02; })
      .sort(function (a, b) { return vividness(b) - vividness(a); })
      .slice(0, SPOTS.length);

    const free = SPOTS.slice();
    const layers = glows.map(function (c) {
      free.sort(function (a, b) { return far(c, a) - far(c, b); });
      const spot = free.shift();
      const rgb = c.rgb.join(' ');
      const size = Math.round(45 + 60 * Math.sqrt(c.share));
      return 'radial-gradient(circle at ' + spot[0] + '% ' + spot[1] + '%, rgb(' + rgb + '), rgb(' + rgb + ' / 0) ' + size + 'vmax)';
    });

    bg.style.backgroundColor = 'rgb(' + base.rgb.join(' ') + ')';
    bg.style.backgroundImage = layers.join(', ');
    bg.hidden = false;
  }

  // A color's share of the art, weighted toward the colorful ones, so a
  // splash of pink beats a wide patch of gray.
  function vividness(c) {
    const chroma = (Math.max.apply(null, c.rgb) - Math.min.apply(null, c.rgb)) / 255;
    return c.share * (0.25 + chroma);
  }

  // How far a color's place in the art is from a spot in the window.
  function far(c, spot) {
    const dx = c.x * 100 - spot[0];
    const dy = c.y * 100 - spot[1];
    return dx * dx + dy * dy;
  }

  // The art's six main colors, most common first, from k-means over a 32×32
  // copy of it. Each comes with its share of the art and where in the art it
  // sits, on average (0–1 across and down).
  function palette(img) {
    const n = 32;
    const k = 6;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = n;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let data;
    try {
      ctx.drawImage(img, 0, 0, n, n);
      data = ctx.getImageData(0, 0, n, n).data;
    } catch (e) {
      return null;
    }

    const px = [];
    for (let i = 0; i < n * n; i++) {
      px.push([data[i * 4], data[i * 4 + 1], data[i * 4 + 2], (i % n + 0.5) / n, (Math.floor(i / n) + 0.5) / n]);
    }

    // Start from the pixel nearest the average color, then keep adding the
    // pixel farthest from every color picked so far.
    const avg = [0, 1, 2].map(function (j) {
      return px.reduce(function (sum, p) { return sum + p[j]; }, 0) / px.length;
    });
    let centers = [nearest(px, [avg]).p];
    while (centers.length < k) {
      let best = null;
      let bestDist = -1;
      px.forEach(function (p) {
        const d = nearest([p], centers).d;
        if (d > bestDist) { bestDist = d; best = p; }
      });
      if (bestDist === 0) break;
      centers.push(best);
    }

    let groups = [];
    for (let round = 0; round < 8; round++) {
      groups = centers.map(function () { return []; });
      px.forEach(function (p) { groups[nearest(centers, [p]).i].push(p); });
      groups = groups.filter(function (g) { return g.length; });
      centers = groups.map(function (g) {
        return [0, 1, 2, 3, 4].map(function (j) {
          return g.reduce(function (sum, p) { return sum + p[j]; }, 0) / g.length;
        });
      });
    }

    return groups.map(function (g, i) {
      const c = centers[i];
      return {
        rgb: [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])],
        share: g.length / px.length,
        x: c[3],
        y: c[4],
      };
    }).sort(function (a, b) { return b.share - a.share; });
  }

  // The closest pair between a list of colors and a list of targets: which
  // color (i, p) and how far, as squared distance in RGB.
  function nearest(colors, targets) {
    let best = { i: -1, p: null, d: Infinity };
    colors.forEach(function (c, i) {
      targets.forEach(function (t) {
        const d = (c[0] - t[0]) ** 2 + (c[1] - t[1]) ** 2 + (c[2] - t[2]) ** 2;
        if (d < best.d) best = { i: i, p: c, d: d };
      });
    });
    return best;
  }

  art.addEventListener('load', show);
  if (art.complete && art.naturalWidth) show();
})();
