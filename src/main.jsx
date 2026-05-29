
import React,{useMemo,useState} from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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

const ORACLE_DAYS = [{ word:"passage", image:"/cards/passage.png", clue:"Une porte s’ouvre quand l’heure est juste." }];

const PODIUM = [
  { sign:ZODIAC_SIGNS[7], level:92, aura:"dominant" },
  { sign:ZODIAC_SIGNS[4], level:76, aura:"strong" },
  { sign:ZODIAC_SIGNS[11], level:63, aura:"soft" },
];

const RESULT_HISTORY = [
  { date:"20 mai 2026", sign:ZODIAC_SIGNS[7], result:"3 visions" },
  { date:"19 mai 2026", sign:ZODIAC_SIGNS[11], result:"4 visions" },
  { date:"18 mai 2026", sign:ZODIAC_SIGNS[5], result:"4 visions" },
];

function normalize(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/g,"").trim();
}
function todayIndex(){
  const start = new Date("2026-01-01T00:00:00+01:00");
  const diff = Math.floor((new Date()-start)/86400000);
  return ((diff % ORACLE_DAYS.length)+ORACLE_DAYS.length)%ORACLE_DAYS.length;
}
function getYesterdayWinner(){ return ZODIAC_SIGNS[7]; }

function SignIcon({sign, small=false}){ return <span className={small ? "v10-sign small" : "v10-sign"}>{sign.symbol}</span> }

function SignalLive(){ return <span className="v14-live" aria-label="en direct"><i></i><b></b><em></em></span> }

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

function buildShareText(sign, attempts, won){
  const rows = attempts.map(attempt => attempt.result.map(cell => cell.status === "correct" ? "🌕" : cell.status === "present" ? "🌘" : "🌑").join("")).join("\n");
  const n = attempts.length;
  return `Le Mot Astral ✨
Signe : ${sign.name} ${sign.symbol}

${rows}

${won ? `J’ai percé l’Oracle en ${n} vision${n>1 ? "s" : ""}.` : "L’Oracle m’a résisté aujourd’hui."}

Sauras-tu faire mieux et faire briller ton signe ?

https://www.lemotastral.fr/`;
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

function Content({title, children, setView}){
  return <main className="page">
    <nav className="top-menu"><button onClick={()=>setView("home")}>Accueil</button><button onClick={()=>setView("rules")}>Règles du jeu</button><button onClick={()=>setView("results")}>Résultats</button><button onClick={()=>setView("about")}>À propos</button></nav>
    <h1 className="logo small-logo">{title}</h1>
    <section className="content-card">{children}</section>
  </main>
}

function Results({setView, selectedSign}){
  const player = ZODIAC_SIGNS.find(s=>s.name===selectedSign) || ZODIAC_SIGNS[0];
  return <main className="page">
    <nav className="top-menu"><button onClick={()=>setView("home")}>Accueil</button><button onClick={()=>setView("rules")}>Règles du jeu</button><button onClick={()=>setView("about")}>À propos</button></nav>
    <h1 className="logo small-logo">Résultats</h1>
    <section className="content-card"><h2>Historique</h2><div className="history-table">{RESULT_HISTORY.map(r=><div key={r.date}><span>{r.date}</span><em><SignIcon sign={r.sign} small/> {r.sign.name}</em><small>{r.result}</small></div>)}</div></section>
    <section className="v12-player-sign"><SignIcon sign={player}/><div><strong>Vous êtes {player.name}</strong><span>Chaque vision peut faire gagner votre signe.</span></div></section>
  </main>
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
  const [selectedSign,setSelectedSign] = useState(()=>localStorage.getItem("motAstralSign") || "");
  const daily = useMemo(()=>ORACLE_DAYS[todayIndex()],[]);
  const winner = getYesterdayWinner();
  const player = ZODIAC_SIGNS.find(s=>s.name===selectedSign) || ZODIAC_SIGNS[0];
  const target = normalize(daily.word);
  const won = attempts.some(attempt => normalize(attempt.word) === target);
  const lost = attempts.length >= 6 && !won;

  function chooseSign(signName){ setSelectedSign(signName); localStorage.setItem("motAstralSign", signName); }
  function handleSubmit(){
    if(won || lost) return;
    const guess = normalize(input);
    if(!guess) return;
    if(guess.length !== target.length){ setError(`Le mot mystère contient ${target.length} lettres.`); return; }
    if(attempts.some(a=>normalize(a.word)===guess)){ setError("Vous avez déjà proposé ce mot."); return; }
    setError("");
    setAttempts(prev=>[...prev,{word:guess,result:evaluateGuess(guess, target)}]);
    setInput("");
  }
  function shareResults(){
    const text = buildShareText(player, attempts, won);
    if(navigator.share) navigator.share({title:"Le Mot Astral", text}).catch(()=>{});
    else { navigator.clipboard?.writeText(text); setShareNotice("Résultat copié."); setTimeout(()=>setShareNotice(""),2200); }
  }

  if(!selectedSign) return <SignChoice onChoose={chooseSign}/>;
  if(view==="rules") return <Content title="Règles du jeu" setView={setView}>
    <p>Interprétez la carte du jour et trouvez le mot mystère en 6 visions.</p>
    <p>Une lettre dorée est bien placée. Une lettre violette est présente ailleurs. Une lettre sombre n’est pas dans le mot.</p>
    <p>Partagez votre score et faites briller votre signe.</p>
  </Content>;
  if(view==="results") return <Results setView={setView} selectedSign={selectedSign}/>;
  if(view==="about") return <Content title="À propos" setView={setView}><p>Le Mot Astral est un jeu quotidien d’intuition visuelle : une carte, un indice, 6 visions et une compétition entre signes.</p></Content>;

  return <main className="page">
    <nav className="top-menu"><button onClick={()=>setView("rules")}>Règles du jeu</button><button onClick={()=>setView("results")}>Résultats</button><button onClick={()=>setView("about")}>À propos</button><button onClick={()=>setView("home")}>Contact</button></nav>

    <section className="v16-astro-header">

      <div className="v16-yesterday-word">
        LE MOT D’HIER ÉTAIT « VOYANCE »
      </div>

      <div className="v16-congrats">
        bravo aux
      </div>

      <div className="v16-winning-sign">
        🏆 {winner.name.toUpperCase()} 🏆
      </div>

      <div className="v16-today-line">
        Quel signe brillera aujourd’hui ?
      </div>

      <div className="v16-live-podium">
        <h2>Podium astral — en direct <SignalLive /></h2>

        <div className="v16-podium-inline">
          {PODIUM.map((item,index)=>
            <div className="v16-podium-item" key={item.sign.name}>
              <strong>{["🥇","🥈","🥉"][index]}</strong>
              <span>{item.sign.name}</span>
            </div>
          )}
        </div>
      </div>

    </section>

    <section className="v16-player-sign">
      <span className="v16-player-symbol">{player.symbol}</span>
      <div>
        <strong>Vous êtes {player.name}</strong>
        <span>Défendez votre signe.</span>
      </div>
    </section>

    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <div className="moon-phases" aria-hidden="true">◐  ◑  ●  ◒  ◓</div>
    <section className="oracle-invite v10-oracle-title"><strong>Interprétez la carte du jour</strong><p>Trouvez le mot mystère en 6 visions.</p></section>
    <section className="v10-card-wrap"><img src={daily.image} alt="Carte oracle du jour" /></section>

    <WordGrid target={daily.word} attempts={attempts} current={input} />
    <div className="v14-vision-count"><span>{6-attempts.length}</span> vision{6-attempts.length>1 ? "s" : ""} restante{6-attempts.length>1 ? "s" : ""}</div>

    <div className="guess-form inline-guess"><input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder={`${target.length} lettres…`} maxLength={target.length} autoComplete="off" autoCorrect="off" spellCheck={false}/><button onClick={handleSubmit}>Proposer 🔮</button></div>
    {error && <p className="error">{error}</p>}
    {!won && !lost && <p className="v10-feedback">Les astres restent silencieux.</p>}

    {(won || lost) && <section className="victory-banner" aria-live="polite"><div className="star-fireworks" aria-hidden="true"><i>✦</i><i>✧</i><i>✶</i><i>✦</i><i>✧</i><i>✶</i></div><p>{won ? "Les astres se sont alignés" : "L’oracle garde son secret"}</p><h2>{daily.word.toUpperCase()}</h2><button onClick={shareResults}>📸 💬 Partager mes résultats</button>{shareNotice && <em>{shareNotice}</em>}</section>}
    <footer>Le Mot Astral</footer>
  </main>
}

createRoot(document.getElementById("root")).render(<Home />);
