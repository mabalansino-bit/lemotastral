import React, { useMemo, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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

const DAILY_WORDS = [
  { word: "oracle", category: "pratique divinatoire", grammar: "Nom masculin", definition: "Réponse ou message attribué à une puissance divine consultée pour éclairer l'avenir." },
  { word: "aura", category: "énergie subtile", grammar: "Nom féminin", definition: "Rayonnement supposé entourer un être vivant, parfois associé à son état émotionnel ou spirituel." },
  { word: "éclipse", category: "phénomène céleste", grammar: "Nom féminin", definition: "Disparition apparente d'un astre lorsqu'un autre corps céleste se place devant lui." },
  { word: "solstice", category: "phénomène astronomique", grammar: "Nom masculin", definition: "Moment de l'année où le Soleil atteint sa plus grande déclinaison apparente." },
  { word: "rituel", category: "pratique symbolique", grammar: "Nom masculin", definition: "Ensemble de gestes ou de paroles accomplis selon un ordre précis et chargé de valeur symbolique." },
  { word: "présage", category: "signe annonciateur", grammar: "Nom masculin", definition: "Signe interprété comme l'annonce d'un événement à venir." },
  { word: "harmonie", category: "état d’équilibre", grammar: "Nom féminin", definition: "Accord équilibré entre plusieurs éléments formant un ensemble agréable ou cohérent." },
];

const APPROX = {
  appel: ["recours"], usage: ["recours"], aide: ["recours"], moyen: ["recours"],
  comprendre: ["percevoir"], ressentir: ["percevoir"], sentir: ["percevoir"], deviner: ["percevoir"],
  vrai: ["vérité"], connaissance: ["vérité"], pensée: ["raisonnement"], logique: ["raisonnement"], réflexion: ["raisonnement"],
  message: ["réponse"], reponse: ["réponse"], dieu: ["divine"], divin: ["divine"], avenir: ["avenir"], futur: ["avenir"],
  lumiere: ["rayonnement"], lumière: ["rayonnement"], halo: ["entourer"], energie: ["spirituel"], énergie: ["spirituel"],
  lune: ["astre"], soleil: ["astre"], ombre: ["disparition"], cache: ["disparition"],
  ceremonie: ["gestes"], cérémonie: ["gestes"], rite: ["gestes"], magie: ["symbolique"],
};

function normalize(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’']/g, "'").replace(/[^a-zœæ'\-\s]/g, "").trim();
}
function todayIndex() {
  const start = new Date("2026-01-01T00:00:00+01:00");
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000);
  return ((diff % DAILY_WORDS.length) + DAILY_WORDS.length) % DAILY_WORDS.length;
}
function tokenise(definition) {
  const parts = definition.match(/[A-Za-zÀ-ÿœŒæÆ'’\-]+|[^A-Za-zÀ-ÿœŒæÆ'’\-]+/g) || [];
  return parts.map((text, index) => ({ text, index, isWord: /[A-Za-zÀ-ÿœŒæÆ]/.test(text), key: normalize(text) }));
}
function editDistance(a, b) {
  if (!a || !b) return 99;
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}
function getYesterdayWinner(){ return ZODIAC_SIGNS[7]; }

function Home(){
  const [view,setView] = useState("home");
  const [input,setInput] = useState("");
  const [guesses,setGuesses] = useState([]);
  const [error,setError] = useState("");
  const [won,setWon] = useState(false);
  const inputRef = useRef(null);
  const daily = useMemo(()=>DAILY_WORDS[todayIndex()],[]);
  const word = daily.word;
  const definition = daily.definition;
  const tokens = useMemo(()=>tokenise(definition),[definition]);
  const wordTokens = tokens.filter(t=>t.isWord && t.key.length > 1);
  const winner = getYesterdayWinner();

  const revealed = useMemo(()=>{
    const map = new Map();
    for (const g of guesses){
      if(g.kind === "exact") map.set(g.target,{kind:"exact",text:g.word});
      if(g.kind === "near" && !map.has(g.target)) map.set(g.target,{kind:"near",text:g.word});
    }
    return map;
  },[guesses]);
  const progress = useMemo(()=>{
    const exact = guesses.filter(g=>g.kind==="exact").length;
    const near = guesses.filter(g=>g.kind==="near").length;
    const base = Math.min(92, Math.round(((exact + near*.45) / Math.max(1, wordTokens.length))*100));
    return won ? 100 : base;
  },[guesses, wordTokens.length, won]);

  function classify(raw){
    const guess = normalize(raw);
    if(guess === normalize(word)) return {kind:"victory", target:normalize(word), score:100};
    const exactToken = wordTokens.find(t=>t.key === guess);
    if(exactToken) return {kind:"exact", target:exactToken.key, score:100};
    const directSyn = APPROX[guess] || [];
    const synTarget = wordTokens.find(t=>directSyn.includes(t.key));
    if(synTarget) return {kind:"near", target:synTarget.key, score:65};
    const close = wordTokens.find(t=>guess.length>=5 && t.key.length>=5 && editDistance(guess,t.key)<=2);
    if(close) return {kind:"near", target:close.key, score:55};
    return {kind:"distant", target:null, score:0};
  }
  function handleSubmit(){
    const raw = input.trim();
    if(!raw || won) return;
    const key = normalize(raw);
    if(guesses.some(g=>normalize(g.word)===key)){ setError("Vous avez déjà consulté l'oracle pour ce mot."); return; }
    setError("");
    const result = classify(raw);
    setGuesses(prev=>[{word:raw,...result},...prev]);
    setInput("");
    if(result.kind === "victory") setWon(true);
    setTimeout(()=>inputRef.current?.focus(),80);
  }
  function renderDefinition(){
    return tokens.map((t,i)=>{
      if(!t.isWord || t.key.length <= 1) return <span key={i}>{t.text}</span>;
      const found = revealed.get(t.key);
      if(won || found?.kind === "exact") return <span key={i} className="def-word exact">{t.text}</span>;
      if(found?.kind === "near") return <span key={i} className="def-word near">{found.text}</span>;
      return <span key={i} className="def-mask v6bar">{"•".repeat(Math.min(Math.max(t.text.length,3),9))}</span>;
    });
  }
  const status = won ? {title:"Les astres se sont alignés", text:"Le mot du jour s'est révélé."} : progress > 70 ? {title:"La révélation approche…", text:"Les contours du mot se dessinent dans le ciel."} : progress > 35 ? {title:"Les astres s'alignent…", text:"Une piste se dessine dans le ciel."} : {title:"Le mystère demeure…", text:"Consultez l'oracle pour dévoiler la définition."};
  if(view==="rules") return <Content title="Règles du jeu" setView={setView}><p>La catégorie du mot est révélée dès le départ sous forme d’indice.</p><p>Le mot mystère apparaît sous forme de cercles, un cercle par lettre.</p><p>Chaque proposition peut révéler un mot de la définition. Les mots proches apparaissent en violet.</p><p>La lune se remplit à mesure que l’oracle se dévoile.</p></Content>;
  if(view==="results") return <Results setView={setView}/>;
  if(view==="about") return <Content title="À propos" setView={setView}><p>Le Mot Astral est un jeu quotidien de définition cachée, d’intuition et de compétition entre signes.</p></Content>;

  return <main className="page">
    <nav className="top-menu">
      <button onClick={()=>setView("rules")}>Règles du jeu</button>
      <button onClick={()=>setView("results")}>Résultats</button>
      <button onClick={()=>setView("about")}>À propos</button>
      <button onClick={()=>setView("home")}>Contact</button>
    </nav>
    <section className="yesterday-card">
      <div className="zodiac-medallion">{winner.symbol}</div>
      <div><strong>Hier, {winner.plural} ont été les plus intuitifs.</strong><span>Quel signe brillera aujourd’hui ?</span></div>
    </section>
    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <div className="moon-phases" aria-hidden="true">◐  ◑  ●  ◒  ◓</div>
    <p className="subtitle">L'ORACLE VOUS MET AU DÉFI</p>

    <section className="oracle-invite">
      <strong>Consultez l’Oracle<br/>pour dévoiler la définition</strong>
      <em>Indice : {daily.category}</em>
    </section>

    <div className="guess-form inline-guess">
      <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Consultez l'oracle…" autoComplete="off" autoCorrect="off" spellCheck={false}/>
      <button onClick={handleSubmit}>Proposer 🔮</button>
    </div>
    {error && <p className="error">{error}</p>}

    <div className="definition-heading">Définition</div>
    <section className="game-card">
      <div className="definition-card v6-card">
        <div className="mystery-dots" aria-label="Mot mystère">
          {Array.from(word).map((letter,i)=><i key={i}>{won ? letter.toUpperCase() : ""}</i>)}
        </div>
        <p className="definition-text"><span className="def-mask">{"•".repeat(Math.min(Math.max(daily.grammar.length,4),12))}</span> — {renderDefinition()}</p>
      </div>
      <section className={`oracle-wrap ${won ? "is-won" : ""}`} style={{"--progress":progress}}>
        <div className="progress-ring" aria-hidden="true" />
        <div className="orbit" aria-hidden="true" />
        <div className="orbit" aria-hidden="true" />
        <div className="moon">{won && <div className="moon-word">{word.toUpperCase()}</div>}</div>
      </section>
      <div className="oracle-status"><strong>{status.title}</strong><span>{status.text}</span></div>
    </section>

    <section className="proposal-zone">
      <div className="preview-title">Vos propositions</div>
      {guesses.length===0 ? <p className="empty">Aucune consultation pour le moment.</p> : <div className="guesses clean-list">{guesses.map((g,i)=><div key={`${g.word}-${i}`} className={`guess-row2 ${g.kind}`}><span>{g.word.toUpperCase()}</span><em>{g.kind==="victory"?"Mot révélé":g.kind==="exact"?"Mot de la définition":g.kind==="near"?"Piste approchante":"Astres silencieux"}</em></div>)}</div>}
    </section>
    <footer className="footer"><span>Le Mot Astral, inspiré librement de Pédantix.</span></footer>
  </main>;
}
function Content({title,children,setView}){return <main className="page"><nav className="top-menu"><button onClick={()=>setView("home")}>Accueil</button><button onClick={()=>setView("rules")}>Règles du jeu</button><button onClick={()=>setView("results")}>Résultats</button></nav><section className="content-page"><h1>{title}</h1>{children}<button className="back-home" onClick={()=>setView("home")}>Retour à l’oracle</button></section></main>}
function Results({setView}){return <main className="page"><nav className="top-menu"><button onClick={()=>setView("home")}>Accueil</button><button onClick={()=>setView("rules")}>Règles du jeu</button><button onClick={()=>setView("results")}>Résultats</button></nav><section className="content-page"><h1>Résultats</h1><p>Les signes les plus intuitifs de l’oracle.</p><div className="results-sign-list">{ZODIAC_SIGNS.map((s,i)=><div className="result-sign-row" key={s.name}><div className="zodiac-medallion">{s.symbol}</div><span>{s.name}</span><em>{24-i} éclats</em></div>)}</div><button className="back-home" onClick={()=>setView("home")}>Retour à l’oracle</button></section></main>}

createRoot(document.getElementById("root")).render(<Home/>);
