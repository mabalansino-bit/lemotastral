
import React,{useEffect,useMemo,useState} from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const CONTACT_EMAIL = ""; // À remplacer plus tard, ex : "bonjour@lemotastral.fr"

const ZODIAC_SIGNS = [
  { name:"Bélier", plural:"les Béliers", symbol:"♈︎" },
  { name:"Taureau", plural:"les Taureaux", symbol:"♉︎" },
  { name:"Gémeaux", plural:"les Gémeaux", symbol:"♊︎" },
  { name:"Cancer", plural:"les Cancers", symbol:"♋︎" },
  { name:"Lion", plural:"les Lions", symbol:"♌︎" },
  { name:"Vierge", plural:"les Vierges", symbol:"♍︎" },
  { name:"Balance", plural:"les Balances", symbol:"♎︎" },
  { name:"Scorpion", plural:"les Scorpions", symbol:"♏︎" },
  { name:"Sagittaire", plural:"les Sagittaires", symbol:"♐︎" },
  { name:"Capricorne", plural:"les Capricornes", symbol:"♑︎" },
  { name:"Verseau", plural:"les Verseaux", symbol:"♒︎" },
  { name:"Poissons", plural:"les Poissons", symbol:"♓︎" },
];

const ORACLE_DAYS = [
  { word:"passage", display:"PASSAGE", image:"/cards/passage.png", clue:"Une porte s’ouvre quand l’heure est juste." },
  { word:"destin", display:"DESTIN", image:"/cards/destin.png", clue:"Certains chemins semblent écrits d’avance." },
];

const FALLBACK_WINNERS = [7,11,5,3,4,6,9,1,10,2,8,0,12,14,13];

function normalize(s){
  return (s||"")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z]/g,"")
    .trim();
}

function dayKey(date = new Date()){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

function daysSinceStart(date = new Date()){
  const start = new Date("2026-01-01T00:00:00+01:00");
  return Math.floor((date-start)/86400000);
}

function dayIndex(date = new Date()){
  const diff = daysSinceStart(date);
  return ((diff % ORACLE_DAYS.length)+ORACLE_DAYS.length)%ORACLE_DAYS.length;
}

function formatDate(date){
  return date.toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
}

function loadLocalResults(){
  try { return JSON.parse(localStorage.getItem("motAstralResults") || "{}"); }
  catch { return {}; }
}

function saveLocalResult({signName, attempts, won}){
  const all = loadLocalResults();
  const key = dayKey();
  const previous = all[key] || [];
  const already = previous.findIndex(r => r.signName === signName);
  const result = { signName, attempts, won, points: won ? Math.max(10, 120 - attempts*20) : 0 };
  if(already >= 0) previous[already] = result;
  else previous.push(result);
  all[key] = previous;
  localStorage.setItem("motAstralResults", JSON.stringify(all));
}

function winnerForDate(date){
  const idx = dayIndex(date);
  const all = loadLocalResults();
  const records = all[dayKey(date)] || [];
  if(records.length){
    const bySign = {};
    records.forEach(r=>{
      if(!bySign[r.signName]) bySign[r.signName] = [];
      bySign[r.signName].push(r.points || 0);
    });
    const ranked = Object.entries(bySign).map(([signName, pts])=>({
      sign: ZODIAC_SIGNS.find(s=>s.name===signName) || ZODIAC_SIGNS[0],
      score: pts.reduce((a,b)=>a+b,0)/pts.length,
      plays: pts.length
    })).sort((a,b)=>b.score-a.score || b.plays-a.plays);
    return ranked[0].sign;
  }
  return ZODIAC_SIGNS[FALLBACK_WINNERS[idx] % ZODIAC_SIGNS.length];
}

function previousDate(daysBack=1){
  const d = new Date();
  d.setDate(d.getDate()-daysBack);
  return d;
}

function SignIcon({sign, small=false}){
  return <span className={small ? "v10-sign small" : "v10-sign"}>{sign.symbol}</span>
}

function evaluateGuess(guess, target){
  const g = normalize(guess);
  const t = normalize(target);
  const letters = Array.from(g);
  const targetLetters = Array.from(t);
  const result = letters.map(letter=>({letter, status:"absent"}));
  const used = new Array(targetLetters.length).fill(false);
  letters.forEach((letter, index)=>{
    if(letter === targetLetters[index]){
      result[index].status = "correct";
      used[index] = true;
    }
  });
  letters.forEach((letter, index)=>{
    if(result[index].status === "correct") return;
    const found = targetLetters.findIndex((targetLetter, targetIndex)=>targetLetter === letter && !used[targetIndex]);
    if(found !== -1){
      result[index].status = "present";
      used[found] = true;
    }
  });
  return result;
}

function buildShareText(sign, attempts, won, daily){
  const n = attempts.length;
  return `Le Mot Astral ✨
Signe : ${sign.name} ${sign.symbol}

${won ? `J’ai trouvé le mot du jour en ${n} tentative${n>1 ? "s" : ""}.` : `L’Oracle m’a résisté aujourd’hui.`}

Sauras-tu faire briller ton signe ?

https://www.lemotastral.fr/`;
}


function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
  const words = String(text).split(" ");
  let line = "";
  for(let i=0;i<words.length;i++){
    const test = line ? line + " " + words[i] : words[i];
    if(ctx.measureText(test).width > maxWidth && line){
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
    } else line = test;
  }
  if(line) ctx.fillText(line, x, y);
  return y;
}

function drawStar(ctx, x, y, radius, points=8){
  ctx.save();
  ctx.translate(x,y);
  ctx.beginPath();
  for(let i=0;i<points*2;i++){
    const r = i%2===0 ? radius : radius*0.38;
    const a = -Math.PI/2 + i*Math.PI/points;
    const px = Math.cos(a)*r;
    const py = Math.sin(a)*r;
    if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function makeResultImageBlob(sign, attemptsCount){
  return new Promise((resolve)=>{
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    const bg = ctx.createLinearGradient(0,0,0,1920);
    bg.addColorStop(0,"#f8f0df");
    bg.addColorStop(1,"#efe0bf");
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,1080,1920);

    ctx.strokeStyle = "#c99a43";
    ctx.lineWidth = 6;
    ctx.strokeRect(58,58,964,1804);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(82,82,916,1756);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(201,154,67,.22)";
    ctx.beginPath(); ctx.arc(540,470,305,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(120,79,142,.10)";
    ctx.beginPath(); ctx.arc(540,470,220,0,Math.PI*2); ctx.fill();

    ctx.fillStyle = "#c99a43";
    drawStar(ctx,540,190,44,8);
    for(const [x,y,r] of [[190,250,10],[880,285,8],[160,1480,7],[910,1420,9],[840,1600,6],[230,1680,8],[150,820,6],[940,760,7]]){
      drawStar(ctx,x,y,r,6);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#4b245f";
    ctx.font = "700 58px Georgia, serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("LE MOT ASTRAL",540,315);

    ctx.fillStyle = "#c99a43";
    ctx.font = "700 250px Georgia, serif";
    ctx.fillText(sign.symbol.replace("︎", ""),540,560);

    ctx.fillStyle = "#4b245f";
    ctx.font = "700 70px Georgia, serif";
    ctx.fillText(`${attemptsCount} tentative${attemptsCount>1 ? "s" : ""}`,540,750);

    ctx.fillStyle = "#6f4a83";
    ctx.font = "44px Georgia, serif";
    wrapCanvasText(ctx, `Je joue pour ${sign.plural}.`, 540, 870, 780, 58);

    ctx.strokeStyle = "rgba(201,154,67,.65)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(230,1000); ctx.lineTo(850,1000); ctx.stroke();

    ctx.fillStyle = "#4b245f";
    ctx.font = "700 54px Georgia, serif";
    wrapCanvasText(ctx, "Défendez votre signe.", 540, 1135, 780, 64);

    ctx.fillStyle = "#6f4a83";
    ctx.font = "38px Georgia, serif";
    wrapCanvasText(ctx, "Un nouveau mot à trouver chaque jour.", 540, 1245, 790, 52);

    ctx.fillStyle = "#c99a43";
    ctx.font = "700 42px Georgia, serif";
    ctx.fillText("lemotastral.fr",540,1660);

    ctx.fillStyle = "#4b245f";
    ctx.font = "30px Georgia, serif";
    ctx.fillText("Partagez votre résultat en story",540,1722);

    canvas.toBlob(resolve,"image/png",0.95);
  });
}

async function downloadResultImage(sign, attemptsCount){
  const blob = await makeResultImageBlob(sign, attemptsCount);
  if(!blob) return;
  const fileName = `mot-astral-${sign.name.toLowerCase()}-${attemptsCount}-tentatives.png`;
  const file = new File([blob], fileName, {type:"image/png"});
  if(navigator.canShare && navigator.canShare({files:[file]}) && navigator.share){
    try {
      await navigator.share({files:[file], title:"Le Mot Astral", text:"J’ai joué au Mot Astral. Défendez votre signe."});
      return;
    } catch {}
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

function victoryMessage(count){
  if(count <= 2) return "Une intuition exceptionnelle.";
  if(count <= 4) return "Les astres vous étaient favorables.";
  return "Vous avez percé le mystère.";
}

function trackEvent(name, params={}){
  if(window.gtag) window.gtag("event", name, params);
}

function Nav({view,setView}){
  const items = [
    ["home","Accueil"],
    ["rules","Règles du jeu"],
    ["results","Résultats"],
    ["about","À propos"],
    ["contact","Contact"],
  ];
  return <nav className="top-menu">
    {items.map(([id,label])=>
      <button key={id} className={view===id ? "active" : ""} onClick={()=>setView(id)}>{label}</button>
    )}
  </nav>
}

function SignChoice({onChoose}){
  return <main className="page">
    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <section className="sign-choice">
      <h2>Choisissez votre signe</h2>
      <p>Il représentera votre intuition dans l’oracle.</p>
      <div className="sign-grid">{ZODIAC_SIGNS.map(sign => <button key={sign.name} onClick={()=>onChoose(sign.name)}><SignIcon sign={sign}/><span>{sign.name}</span></button>)}</div>
    </section>
  </main>
}

function Content({title, children, view, setView}){
  return <main className="page">
    <Nav view={view} setView={setView} />
    <h1 className="logo small-logo">{title}</h1>
    <section className="content-card">{children}</section>
  </main>
}

function Results({view,setView}){
  const rows = Array.from({length:7},(_,i)=>{
    const d = previousDate(i+1);
    const idx = dayIndex(d);
    return { date: formatDate(d), word: ORACLE_DAYS[idx].display, sign: winnerForDate(d) };
  });
  return <main className="page">
    <Nav view={view} setView={setView} />
    <h1 className="logo small-logo">Résultats</h1>
    <section className="content-card v19-results-card">
      <h2>Historique</h2>
      <div className="history-table v19-history">
        {rows.map(r=><div key={r.date}>
          <span>{r.date}</span>
          <em>🏆 {r.sign.name}</em>
          <strong>{r.word}</strong>
        </div>)}
      </div>
    </section>
  </main>
}

function Contact({view,setView}){
  const [sent,setSent] = useState(false);
  function submit(e){
    e.preventDefault();
    setSent(true);
  }
  return <Content title="Contact" view={view} setView={setView}>
    <p>Une question, une suggestion ou un bug à signaler ?</p>
    <form className="contact-form" onSubmit={submit}>
      <label>Votre nom<input type="text" name="name" placeholder="Votre nom" /></label>
      <label>Votre email<input type="email" name="email" placeholder="votre@email.fr" /></label>
      <label>Message<textarea name="message" rows="5" placeholder="Votre message..." /></label>
      <button type="submit">Envoyer</button>
    </form>
    {sent && <p className="muted">Le formulaire est prêt visuellement. Il sera activé dès que l’adresse mail du Mot Astral sera créée.</p>}
    {CONTACT_EMAIL && <p className="muted">Vous pouvez aussi écrire à {CONTACT_EMAIL}.</p>}
  </Content>
}

function WordGrid({target, attempts, current}){
  const targetLength = normalize(target).length;
  const rows = [];
  for(let i=0;i<6;i++){
    if(attempts[i]) rows.push({type:"done", cells:attempts[i].result});
    else if(i === attempts.length) {
      const currentLetters = Array.from(normalize(current)).slice(0,targetLength);
      rows.push({type:"current", cells:Array.from({length:targetLength},(_,idx)=>({letter:currentLetters[idx] || "", status:"empty"}))});
    } else rows.push({type:"empty", cells:Array.from({length:targetLength},()=>({letter:"", status:"empty"}))});
  }
  return <section className="v14-grid">{rows.map((row,rowIndex)=><div className={`v14-grid-row ${row.type}`} key={rowIndex}>{row.cells.map((cell,index)=><span className={`v14-letter ${cell.status}`} key={index}>{cell.letter}</span>)}</div>)}</section>
}

function Home(){
  const [view,setView] = useState("home");
  const [input,setInput] = useState("");
  const [attempts,setAttempts] = useState([]);
  const [error,setError] = useState("");
  const [shareNotice,setShareNotice] = useState("");
  const [overlayDismissed,setOverlayDismissed] = useState(false);
  const [selectedSign,setSelectedSign] = useState(()=>localStorage.getItem("motAstralSign") || "");
  const daily = useMemo(()=>ORACLE_DAYS[dayIndex()],[]);
  const yesterday = previousDate(1);
  const yesterdayDaily = ORACLE_DAYS[dayIndex(yesterday)];
  const winner = winnerForDate(yesterday);
  const player = ZODIAC_SIGNS.find(s=>s.name===selectedSign) || ZODIAC_SIGNS[0];
  const target = normalize(daily.word);
  const won = attempts.some(attempt => normalize(attempt.word) === target);
  const lost = attempts.length >= 6 && !won;
  const showOverlay = (won || lost) && !overlayDismissed;

  useEffect(()=>{
    setOverlayDismissed(false);
  },[won,lost,daily.word]);

  useEffect(()=>{
    if(!showOverlay) return;
    window.history.pushState({motAstralOverlay:true}, "");
    const closeOnBack = () => setOverlayDismissed(true);
    window.addEventListener("popstate", closeOnBack);
    return () => window.removeEventListener("popstate", closeOnBack);
  },[showOverlay]);

  function chooseSign(signName){
    setSelectedSign(signName);
    localStorage.setItem("motAstralSign", signName);
    trackEvent("choose_sign",{sign:signName});
  }

  function handleSubmit(){
    if(won || lost) return;
    const guess = normalize(input);
    if(!guess) return;
    if(guess.length !== target.length){ setError(`Le mot mystère contient ${target.length} lettres.`); return; }
    if(attempts.some(a=>normalize(a.word)===guess)){ setError("Vous avez déjà proposé ce mot."); return; }
    setError("");
    const next = [...attempts,{word:guess,result:evaluateGuess(guess, target)}];
    setAttempts(next);
    setInput("");
    trackEvent("guess_submitted",{word_length:target.length, attempt_number:next.length});
    if(guess === target){
      saveLocalResult({signName:player.name, attempts:next.length, won:true});
      trackEvent("word_found",{attempts:next.length, sign:player.name, word:daily.display});
    } else if(next.length >= 6){
      saveLocalResult({signName:player.name, attempts:6, won:false});
      trackEvent("word_failed",{sign:player.name, word:daily.display});
    }
  }

  function shareWhatsApp(){
    const text = buildShareText(player, attempts, won, daily);
    if(window.gtag) window.gtag("event","share_whatsapp",{sign:player.name, won, attempts:attempts.length});
    const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if(!win){
      navigator.clipboard?.writeText(text);
      setShareNotice("Texte copié pour WhatsApp.");
      setTimeout(()=>setShareNotice(""),2400);
    }
  }

  async function shareInstagram(){
    if(window.gtag) window.gtag("event","share_instagram",{sign:player.name, won, attempts:attempts.length});
    if(won){
      await downloadResultImage(player, attempts.length);
      setShareNotice("Image prête à publier en story.");
      setTimeout(()=>setShareNotice(""),2400);
      return;
    }
    const text = buildShareText(player, attempts, won, daily);
    if(navigator.share){
      navigator.share({title:"Le Mot Astral", text}).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text);
      setShareNotice("Résultat copié.");
      setTimeout(()=>setShareNotice(""),2400);
    }
  }

  async function saveVictoryImage(){
    if(!won) return;
    await downloadResultImage(player, attempts.length);
    setShareNotice("Image de victoire enregistrée.");
    setTimeout(()=>setShareNotice(""),2400);
  }

  function shareResults(){
    shareWhatsApp();
  }

  if(!selectedSign) return <SignChoice onChoose={chooseSign}/>;

  if(view==="rules") return <Content title="Règles du jeu" view={view} setView={setView}>
    <p>Interprétez la carte du jour et trouvez le mot mystère en 6 tentatives.</p>
    <p>Chaque proposition doit avoir le bon nombre de lettres.</p>
    <p>Une lettre dorée est bien placée. Une lettre bronze est présente ailleurs. Une lettre sombre n’est pas dans le mot.</p>
    <p>Une fois le mot découvert, partagez votre score et faites briller votre signe.</p>
  </Content>;

  if(view==="results") return <Results view={view} setView={setView}/>;

  if(view==="about") return <Content title="À propos" view={view} setView={setView}>
    <p>Le Mot Astral est un jeu quotidien d’intuition visuelle : une carte, un indice, 6 tentatives et une compétition entre signes.</p>
  </Content>;

  if(view==="contact") return <Contact view={view} setView={setView}/>;

  return <main className="page">
    <Nav view={view} setView={setView} />

    <section className="v17-final-header">
      <div className="v17-final-yesterday">
        LE MOT D’HIER ÉTAIT « {yesterdayDaily.display} »
      </div>
      <div className="v17-final-congrats">
        Bravo au signe vainqueur
      </div>
      <div className="v17-final-winner">
        🏆 {winner.name.toUpperCase()} 🏆
      </div>
      <div className="v17-final-question">
        Quel signe brillera aujourd’hui ?
      </div>
    </section>

    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <div className="moon-phases" aria-hidden="true">◐  ◑  ●  ◒  ◓</div>
    <section className="oracle-invite v10-oracle-title">
      <strong>Interprétez la carte du jour</strong>
      <p>Trouvez le mot mystère en 6 tentatives.</p>
      <em className="v18-player-line">{player.symbol} Vous jouez pour {player.plural}.</em>
    </section>
    <section className="v10-card-wrap"><img src={daily.image} alt="Carte oracle du jour" /></section>

    <WordGrid target={daily.word} attempts={attempts} current={input} />
    <div className="v14-tentative-count"><span>{6-attempts.length}</span> tentative{6-attempts.length>1 ? "s" : ""} restante{6-attempts.length>1 ? "s" : ""}</div>

    <div className="guess-form inline-guess">
      <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder={`${target.length} lettres…`} maxLength={target.length} autoComplete="off" autoCorrect="off" spellCheck={false}/>
      <button onClick={handleSubmit}>Proposer 🔮</button>
    </div>
    {error && <p className="error">{error}</p>}

    {showOverlay && <section className="v17-victory-overlay" aria-live="polite">
      <div className="v17-sparks" aria-hidden="true">
        <i>✦</i><i>✧</i><i>✶</i><i>✦</i><i>✧</i><i>✶</i><i>✦</i><i>✧</i>
      </div>

      <div className="v17-victory-card">
        {won && <p className="v17-bravo">✨ BRAVO ✨</p>}
        <h2>{daily.display}</h2>

        <p className="v17-performance">
          {won ? victoryMessage(attempts.length) : "L’oracle garde son secret."}
        </p>

        <p className="v17-sign-message">
          {player.symbol} Votre intuition renforce {player.plural} aujourd’hui.
        </p>

        <p className="v17-count">
          {won ? `Mot trouvé en ${attempts.length} tentative${attempts.length>1 ? "s" : ""}` : `Le mot était ${daily.display}`}
        </p>

        {won && <button className="v23-download-result" onClick={saveVictoryImage}>Télécharger mon image de victoire</button>}

        <div className="v22-share-buttons">
          <button className="v22-share-btn v22-instagram" onClick={shareInstagram}>
            <img src="/icons/instagram.png" alt="" />
            <span>Instagram</span>
          </button>
          <button className="v22-share-btn v22-whatsapp" onClick={shareWhatsApp}>
            <img src="/icons/whatsapp.png" alt="" />
            <span>WhatsApp</span>
          </button>
        </div>

        {shareNotice && <em>{shareNotice}</em>}
        <button className="v23-back-game" onClick={()=>setOverlayDismissed(true)}>Retour au jeu</button>
      </div>
    </section>}
  </main>
}

createRoot(document.getElementById("root")).render(<Home />);
