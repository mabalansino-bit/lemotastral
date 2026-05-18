"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";

const ZODIAC_SIGNS = [
  { name: "Bélier", plural: "les Béliers", symbol: "♈" },
  { name: "Taureau", plural: "les Taureaux", symbol: "♉" },
  { name: "Gémeaux", plural: "les Gémeaux", symbol: "♊" },
  { name: "Cancer", plural: "les Cancers", symbol: "♋" },
  { name: "Lion", plural: "les Lions", symbol: "♌" },
  { name: "Vierge", plural: "les Vierges", symbol: "♍" },
  { name: "Balance", plural: "les Balances", symbol: "♎" },
  { name: "Scorpion", plural: "les Scorpions", symbol: "♏" },
  { name: "Sagittaire", plural: "les Sagittaires", symbol: "♐" },
  { name: "Capricorne", plural: "les Capricornes", symbol: "♑" },
  { name: "Verseau", plural: "les Verseaux", symbol: "♒" },
  { name: "Poissons", plural: "les Poissons", symbol: "♓" },
];

const WORDS = ["intuition", "oracle", "aura", "éclipse", "saturne", "vénus", "jupiter", "mercure", "neptune", "pluton", "lune", "soleil", "étoile", "cosmos", "zodiaque", "ascendant", "maison", "conjonction", "opposition", "trigone", "sextile", "rétrograde", "équinoxe", "solstice", "croissant", "nœud lunaire", "lilith", "chiron", "synchronicité", "karma", "destin", "hasard", "présage", "signe", "mystère", "révélation", "vision", "rêve", "songe", "miroir", "ombre", "lumière", "passage", "seuil", "cycle", "métamorphose", "transformation", "renaissance", "rituel", "intention", "autel", "bougie", "encens", "sauge", "lavande", "romarin", "armoise", "grimoire", "talisman", "amulette", "pendule", "chaudron", "potion", "sortilège", "protection", "purification", "bénédiction", "invocation", "manifestation", "ancrage", "vibration", "énergie", "magnétisme", "fluide", "souffle", "présence", "alignement", "équilibre", "harmonie", "résonance", "fréquence", "onde", "rayonnement", "éveil", "conscience", "sagesse", "silence", "méditation", "tarot", "arcane"];

const DEFINITIONS = {
  intuition: "Faculté de percevoir immédiatement une vérité sans recours au raisonnement.",
  oracle: "Réponse considérée comme inspirée par une puissance mystérieuse ou sacrée.",
  aura: "Atmosphère subtile qui semble entourer une personne, un lieu ou une chose.",
  éclipse: "Disparition apparente d'un astre lorsque sa lumière est masquée par un autre corps céleste.",
  saturne: "Planète du système solaire associée aux anneaux, au temps et à la structure.",
  vénus: "Planète brillante souvent associée à l'amour, à la beauté et au désir.",
  jupiter: "Plus grande planète du système solaire, souvent associée à l'expansion et à la chance.",
  mercure: "Planète proche du Soleil, associée au mouvement, à l'échange et au langage.",
  lune: "Astre naturel de la Terre dont les phases rythment les nuits et les cycles.",
  soleil: "Étoile autour de laquelle gravite la Terre et principale source de lumière du jour.",
  destin: "Suite d'événements qui semble orienter ou déterminer le cours d'une existence.",
  mystère: "Ce qui demeure caché, difficile à expliquer ou impossible à connaître entièrement.",
  révélation: "Action de faire apparaître ou connaître ce qui était jusque-là caché.",
  harmonie: "Accord équilibré entre des éléments différents formant un ensemble agréable.",
  alignement: "Disposition d'éléments placés sur une même ligne ou accordés dans une même direction.",
};

const APPROX = {
  appel: ["recours"], usage: ["recours"], aide: ["recours"], moyen: ["recours"],
  comprendre: ["percevoir"], ressentir: ["percevoir"], sentir: ["percevoir"], deviner: ["percevoir"],
  vrai: ["vérité"], connaissance: ["vérité"], pensée: ["raisonnement"], logique: ["raisonnement"], réflexion: ["raisonnement"],
  instantanément: ["immédiatement"], direct: ["immédiatement"], directe: ["immédiatement"],
};

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "'")
    .replace(/[^a-zœæ'\-\s]/g, "")
    .trim();
}

function todayIndex() {
  const start = new Date("2026-01-01T00:00:00+01:00");
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000);
  return ((diff % WORDS.length) + WORDS.length) % WORDS.length;
}

function tokenise(definition) {
  const parts = definition.match(/[A-Za-zÀ-ÿœŒæÆ'’\-]+|[^A-Za-zÀ-ÿœŒæÆ'’\-]+/g) || [];
  return parts.map((text, index) => ({
    text,
    index,
    isWord: /[A-Za-zÀ-ÿœŒæÆ]/.test(text),
    key: normalize(text),
  }));
}

function editDistance(a, b) {
  if (!a || !b) return 99;
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return m[a.length][b.length];
}

function getZodiac(signName) {
  return ZODIAC_SIGNS.find((s) => s.name === signName) || ZODIAC_SIGNS[9];
}

async function generateStory(nb, signName, word) {
  const sign = getZodiac(signName);
  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  function star(cx, cy, inner, outer, pts = 4, color = "#c79b43") {
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const a = (i * Math.PI / pts) - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      i === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#fffaf1");
  bg.addColorStop(.55, "#fff8ed");
  bg.addColorStop(1, "#f4e8f2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 22; i++) {
    const x = (i * 62) - 70;
    const y = H - 150 + Math.sin(i) * 30;
    const g = ctx.createRadialGradient(x, y, 10, x, y, 145);
    g.addColorStop(0, "rgba(206,184,221,.52)");
    g.addColorStop(1, "rgba(206,184,221,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, 145, 0, Math.PI * 2); ctx.fill();
  }

  star(168, 115, 8, 22);
  star(912, 220, 6, 18, 4, "#d7b15c");
  star(900, 1560, 7, 20, 4, "#c79b43");
  ctx.fillStyle = "#d9b65f";
  ctx.beginPath(); ctx.arc(905, 93, 48, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fffaf1";
  ctx.beginPath(); ctx.arc(928, 78, 49, 0, Math.PI * 2); ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#2f2432";
  ctx.font = "500 48px Cinzel, serif";
  ctx.fillText("LE MOT ASTRAL", W / 2, 118);
  ctx.fillStyle = "#9f72ad";
  ctx.font = "400 245px Cinzel, serif";
  ctx.fillText(String(nb), W / 2, 390);
  ctx.font = "600 73px Cinzel, serif";
  ctx.fillText("TENTATIVES", W / 2, 500);
  ctx.fillStyle = "#2f2432";
  ctx.font = "400 48px 'Crimson Text', serif";
  ctx.fillText("pour révéler", W / 2, 568);
  ctx.fillStyle = "#9f72ad";
  ctx.font = "600 68px Cinzel, serif";
  ctx.fillText(word.toUpperCase(), W / 2, 665);

  ctx.fillStyle = "#2f2432";
  ctx.font = "600 45px Cinzel, serif";
  ctx.fillText("JE JOUE POUR", W / 2, 805);
  ctx.fillStyle = "#9f72ad";
  ctx.font = "600 68px Cinzel, serif";
  ctx.fillText(sign.plural.toUpperCase(), W / 2, 905);
  ctx.strokeStyle = "rgba(199,155,67,.38)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(W / 2, 1130, 176, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = "#a97719";
  ctx.font = "400 215px 'Times New Roman', serif";
  ctx.fillText(sign.symbol, W / 2, 1200);
  ctx.fillStyle = "#2f2432";
  ctx.font = "400 44px 'Crimson Text', serif";
  ctx.fillText("Quel signe sera le plus intuitif ?", W / 2, 1505);
  ctx.fillStyle = "#9f72ad";
  ctx.font = "500 42px Cinzel, serif";
  ctx.fillText("LEMOTASTRAL.FR", W / 2, 1605);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], `le-mot-astral-${nb}-tentatives.png`, { type: "image/png" });
  const shareText = `🌙 Le Mot Astral — ${word.toUpperCase()} révélé en ${nb} tentative${nb > 1 ? "s" : ""}.`;

  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: "Le Mot Astral", text: shareText }); return; } catch (e) {}
  }
  const link = document.createElement("a");
  link.download = file.name;
  link.href = URL.createObjectURL(blob);
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
}

export default function Home() {
  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [error, setError] = useState("");
  const [won, setWon] = useState(false);
  const [playerSign, setPlayerSign] = useState("Capricorne");
  const inputRef = useRef(null);

  const word = useMemo(() => WORDS[todayIndex()] || "intuition", []);
  const definition = DEFINITIONS[word] || `Mot associé à l'univers symbolique des astres, des cycles et de l'intuition.`;
  const tokens = useMemo(() => tokenise(definition), [definition]);
  const wordTokens = tokens.filter(t => t.isWord && t.key.length > 1);

  useEffect(() => {
    const savedSign = localStorage.getItem("lemotastral_sign");
    if (savedSign) setPlayerSign(savedSign);
  }, []);

  function updatePlayerSign(sign) {
    setPlayerSign(sign);
    localStorage.setItem("lemotastral_sign", sign);
  }

  const revealed = useMemo(() => {
    const map = new Map();
    for (const g of guesses) {
      if (g.kind === "exact") map.set(g.target, { kind: "exact", text: g.word });
      if (g.kind === "near" && !map.has(g.target)) map.set(g.target, { kind: "near", text: g.word });
    }
    return map;
  }, [guesses]);

  const progress = useMemo(() => {
    const exact = guesses.filter(g => g.kind === "exact").length;
    const near = guesses.filter(g => g.kind === "near").length;
    const base = Math.min(92, Math.round(((exact + near * .45) / Math.max(1, wordTokens.length)) * 100));
    return won ? 100 : base;
  }, [guesses, wordTokens.length, won]);

  function classify(raw) {
    const guess = normalize(raw);
    if (guess === normalize(word)) return { kind: "victory", target: normalize(word), score: 100 };

    const exactToken = wordTokens.find(t => t.key === guess);
    if (exactToken) return { kind: "exact", target: exactToken.key, score: 100 };

    const directSyn = APPROX[guess] || [];
    const synTarget = wordTokens.find(t => directSyn.includes(t.key));
    if (synTarget) return { kind: "near", target: synTarget.key, score: 65 };

    const close = wordTokens.find(t => guess.length >= 5 && t.key.length >= 5 && editDistance(guess, t.key) <= 2);
    if (close) return { kind: "near", target: close.key, score: 55 };

    return { kind: "distant", target: null, score: 0 };
  }

  function launchVictory() {
    const burst = document.createElement("div");
    burst.className = "moon-burst";
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1500);
    for (let i = 0; i < 32; i++) {
      setTimeout(() => {
        const p = document.createElement("div");
        p.className = "particle";
        p.textContent = ["✦", "✨", "✧", "✶", "🌙"][Math.floor(Math.random() * 5)];
        p.style.cssText = `left:${18 + Math.random() * 64}vw;top:${24 + Math.random() * 30}vh;--dx:${(Math.random() - .5) * 420}px;--dy:${(Math.random() - .8) * 320}px;animation-duration:${1.4 + Math.random() * .9}s;font-size:${1 + Math.random() * 1.1}rem`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 2600);
      }, i * 36);
    }
  }

  function handleSubmit() {
    const raw = input.trim();
    if (!raw || won) return;
    const key = normalize(raw);
    if (guesses.some(g => normalize(g.word) === key)) { setError("Vous avez déjà consulté l'oracle pour ce mot."); return; }
    setError("");
    const result = classify(raw);
    const next = { word: raw, ...result };
    setGuesses(prev => [next, ...prev]);
    setInput("");
    if (result.kind === "victory") {
      setWon(true);
      setTimeout(launchVictory, 220);
    }
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function renderDefinition() {
    return tokens.map((t, i) => {
      if (!t.isWord || t.key.length <= 1) return <span key={i}>{t.text}</span>;
      const found = revealed.get(t.key);
      if (won || found?.kind === "exact") return <span key={i} className="def-word exact">{t.text}</span>;
      if (found?.kind === "near") return <span key={i} className="def-word near">{found.text}</span>;
      return <span key={i} className="def-mask">{"•".repeat(Math.min(Math.max(t.text.length, 3), 9))}</span>;
    });
  }

  const status = won
    ? { title: "Les astres se sont alignés", text: "Le mot du jour s'est révélé." }
    : progress > 70
      ? { title: "La révélation approche…", text: "Les contours du mot se dessinent dans le ciel." }
      : progress > 35
        ? { title: "Les astres s'alignent…", text: "Une piste se dessine dans le ciel." }
        : { title: "Le mystère demeure…", text: "Consultez l'oracle pour dévoiler la définition." };

  const attempts = guesses.length;

  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/regles">Règles du jeu</Link>
        <Link href="/resultats">Résultats</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/contact">Contact</Link>
      </nav>

      <div className="brand-clouds" aria-hidden="true" />
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases" aria-hidden="true">◐  ◑  ●  ◒  ◓</div>
      <p className="subtitle">L'ORACLE VOUS MET AU DÉFI</p>

      <section className="game-card">
        <div className="definition-card">
          <div className="section-title">Définition</div>
          <p className="definition-text">{renderDefinition()}</p>
        </div>

        <section className={`oracle-wrap ${won ? "is-won" : ""}`} style={{ "--progress": progress }}>
          <div className="progress-ring" aria-hidden="true" />
          <div className="orbit" aria-hidden="true" />
          <div className="orbit" aria-hidden="true" />
          <div className="moon">
            {won && <div className="moon-word">{word.toUpperCase()}</div>}
          </div>
        </section>

        <div className="oracle-status">
          <strong>{status.title}</strong>
          <span>{status.text}</span>
        </div>

        {won ? (
          <div className="victory-actions">
            <button className="share-btn" onClick={() => generateStory(attempts, playerSign, word)}>
              ✨ Partager mon résultat
            </button>
            <label className="sign-select">
              <span>Je joue pour</span>
              <select value={playerSign} onChange={e => updatePlayerSign(e.target.value)}>
                {ZODIAC_SIGNS.map(sign => <option key={sign.name} value={sign.name}>{sign.symbol} {sign.name}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <div className="guess-form">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Consultez l'oracle…"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button onClick={handleSubmit}>Proposer</button>
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </section>

      <section className="proposal-zone">
        <div className="preview-title">Vos propositions</div>
        {guesses.length === 0 ? (
          <p className="empty">Aucune consultation pour le moment.</p>
        ) : (
          <div className="guesses clean-list">
            {guesses.map((g, i) => (
              <div key={`${g.word}-${i}`} className={`guess-row2 ${g.kind}`}>
                <span>{g.word.toUpperCase()}</span>
                <em>{g.kind === "victory" ? "Mot révélé" : g.kind === "exact" ? "Mot de la définition" : g.kind === "near" ? "Piste approchante" : "Astres silencieux"}</em>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <span>Le Mot Astral, inspiré librement de Cemantix et Pédantix.</span>
        <Link href="/confidentialite">Confidentialité</Link>
      </footer>
    </main>
  );
}
