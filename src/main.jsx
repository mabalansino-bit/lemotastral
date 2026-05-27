
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

const ORACLE_DAYS = [
  {
    word:"voyance",
    image:"/cards/voyance.png",
    clue:"Certains messages ne passent pas par les mots.",
    close:{ voyante:5, clairvoyance:4, medium:4, médium:4, tarot:3, oracle:3, intuition:3, esprit:3, carte:2, lune:2, boule:2 }
  },
];

const RESULT_HISTORY = [
  { date:"20 mai 2026", carte:"Le Passage", sign:ZODIAC_SIGNS[7], avg:"7,4" },
  { date:"19 mai 2026", carte:"Le Halo", sign:ZODIAC_SIGNS[11], avg:"8,1" },
  { date:"18 mai 2026", carte:"Le Reflet", sign:ZODIAC_SIGNS[5], avg:"6,8" },
  { date:"17 mai 2026", carte:"La Passeuse", sign:ZODIAC_SIGNS[3], avg:"9,2" },
  { date:"16 mai 2026", carte:"La Flamme", sign:ZODIAC_SIGNS[4], avg:"7,9" },
  { date:"15 mai 2026", carte:"Le Cercle", sign:ZODIAC_SIGNS[6], avg:"8,7" },
  { date:"14 mai 2026", carte:"Les Arcanes", sign:ZODIAC_SIGNS[9], avg:"6,5" },
];

const PODIUM = [
  { sign:ZODIAC_SIGNS[7], score:84 },
  { sign:ZODIAC_SIGNS[9], score:76 },
  { sign:ZODIAC_SIGNS[4], score:68 },
];

function normalize(s){
  return (s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"'").replace(/[^a-zœæ'\-\s]/g,"").trim();
}
function todayIndex(){
  const start = new Date("2026-01-01T00:00:00+01:00");
  const now = new Date();
  const diff = Math.floor((now-start)/86400000);
  return ((diff % ORACLE_DAYS.length)+ORACLE_DAYS.length)%ORACLE_DAYS.length;
}
function getYesterdayWinner(){ return ZODIAC_SIGNS[7]; }

function SignIcon({sign, small=false}){
  return <span className={small ? "v10-sign small" : "v10-sign"}>{sign.symbol}</span>
}

function SignChoice({onChoose}){
  return <main className="page">
    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <section className="sign-choice">
      <h2>Choisissez votre signe</h2>
      <p>Il représentera votre intuition dans l’oracle.</p>
      <div className="sign-grid">
        {ZODIAC_SIGNS.map(sign => (
          <button key={sign.name} onClick={()=>onChoose(sign.name)}>
            <SignIcon sign={sign} />
            <span>{sign.name}</span>
          </button>
        ))}
      </div>
    </section>
  </main>
}

function Content({title, children, setView}){
  return <main className="page">
    <nav className="top-menu">
      <button onClick={()=>setView("home")}>Accueil</button>
      <button onClick={()=>setView("rules")}>Règles du jeu</button>
      <button onClick={()=>setView("results")}>Résultats</button>
      <button onClick={()=>setView("about")}>À propos</button>
    </nav>
    <h1 className="logo small-logo">{title}</h1>
    <section className="content-card">{children}</section>
  </main>
}

function Results({setView, selectedSign}){
  const player = ZODIAC_SIGNS.find(s=>s.name===selectedSign) || ZODIAC_SIGNS[9];
  return <main className="page">
    <nav className="top-menu">
      <button onClick={()=>setView("home")}>Accueil</button>
      <button onClick={()=>setView("rules")}>Règles du jeu</button>
      <button onClick={()=>setView("about")}>À propos</button>
    </nav>
    <h1 className="logo small-logo">Résultats</h1>
    <section className="podium-card">
      <h2>Podium astral en direct</h2>
      {PODIUM.map((item, index)=>(
        <div className="podium-row" key={item.sign.name}>
          <strong>{index+1}</strong>
          <SignIcon sign={item.sign} small />
          <span>{item.sign.name}</span>
          <i style={{width:item.score+"%"}} />
        </div>
      ))}
      <div className="player-rank">
        <SignIcon sign={player} small />
        <p>Votre signe : <strong>{player.name}</strong><br/>Encore quelques intuitions pour rejoindre le podium astral.</p>
      </div>
    </section>
    <section className="content-card">
      <h2>Historique sur 7 jours</h2>
      <p className="muted">Le résultat du jour apparaît à minuit, au changement de carte.</p>
      <div className="history-table">
        {RESULT_HISTORY.map(r=>(
          <div key={r.date}>
            <span>{r.date}</span>
            <strong>{r.carte}</strong>
            <em><SignIcon sign={r.sign} small /> {r.sign.name}</em>
            <small>{r.avg} tentatives</small>
          </div>
        ))}
      </div>
    </section>
  </main>
}

function Home(){
  const [view,setView] = useState("home");
  const [input,setInput] = useState("");
  const [guesses,setGuesses] = useState([]);
  const [won,setWon] = useState(false);
  const [score,setScore] = useState(0);
  const [error,setError] = useState("");
  const [shareNotice,setShareNotice] = useState("");
  const [selectedSign,setSelectedSign] = useState(()=>localStorage.getItem("motAstralSign") || "");
  const daily = useMemo(()=>ORACLE_DAYS[todayIndex()],[]);
  const winner = getYesterdayWinner();

  function chooseSign(signName){
    setSelectedSign(signName);
    localStorage.setItem("motAstralSign", signName);
  }

  function classify(raw){
    const g = normalize(raw);
    if(g === normalize(daily.word)) return 5;
    return daily.close[g] || 0;
  }

  function handleSubmit(){
    const raw = input.trim();
    if(!raw || won) return;
    if(guesses.some(g=>normalize(g.word)===normalize(raw))){
      setError("Vous avez déjà consulté l’oracle pour ce mot.");
      return;
    }
    setError("");
    const s = classify(raw);
    setScore(s);
    setGuesses(prev=>[{word:raw,score:s},...prev]);
    setInput("");
    if(s===5) setWon(true);
  }

  function shareResults(){
    const sign = ZODIAC_SIGNS.find(s=>s.name===selectedSign) || ZODIAC_SIGNS[9];
    const n = Math.max(1, guesses.length);
    const text = `Le Mot Astral ✨
Signe : ${sign.name} ${sign.symbol}

J’ai percé l’Oracle en ${n} tentative${n>1 ? "s" : ""}.

Sauras-tu faire mieux et faire briller ton signe ?

https://www.lemotastral.fr/`;
    if(navigator.share){
      navigator.share({title:"Le Mot Astral", text}).catch(()=>{});
    } else {
      navigator.clipboard?.writeText(text);
      setShareNotice("Résultat copié.");
      setTimeout(()=>setShareNotice(""),2200);
    }
  }

  if(!selectedSign) return <SignChoice onChoose={chooseSign} />;

  if(view==="rules") return <Content title="Règles du jeu" setView={setView}>
    <p>Défends ton signe astrologique et découvre le mot du jour dans l’univers de l’ésotérisme et de l’astrologie en un minimum de tentatives.</p>
    <p>Interprète la carte-oracle du jour et son indice, puis propose des mots pour t’approcher du mystère.</p>
    <p>À chaque tentative, les lunes t’indiquent si ton intuition s’approche de la réponse.</p>
    <p>Tentatives illimitées.</p>
    <p>Une fois le mot découvert, partage ton score et fais briller ton signe.</p>
  </Content>;

  if(view==="results") return <Results setView={setView} selectedSign={selectedSign} />;

  if(view==="about") return <Content title="À propos" setView={setView}>
    <p>Le Mot Astral est un jeu quotidien d’intuition visuelle : une carte, un indice, des tentatives et des lunes pour guider votre signe.</p>
  </Content>;

  return <main className="page">
    <nav className="top-menu">
      <button onClick={()=>setView("rules")}>Règles du jeu</button>
      <button onClick={()=>setView("results")}>Résultats</button>
      <button onClick={()=>setView("about")}>À propos</button>
      <button onClick={()=>setView("home")}>Contact</button>
    </nav>

    <section className="yesterday-card">
      <SignIcon sign={winner} small />
      <div><strong>Hier, {winner.plural} ont été les plus intuitifs.</strong><span>Quel signe brillera aujourd’hui ?</span></div>
    </section>

    <div className="brand-clouds" aria-hidden="true" />
    <h1 className="logo">Le Mot Astral</h1>
    <div className="moon-phases" aria-hidden="true">◐  ◑  ●  ◒  ◓</div>
    <p className="subtitle">L'ORACLE VOUS MET AU DÉFI</p>

    <section className="oracle-invite v10-oracle-title">
      <strong>Interprétez la carte du jour</strong>
      <em>{daily.clue}</em>
    </section>

    <section className="v10-card-wrap">
      <img src={daily.image} alt="Carte oracle du jour" />
    </section>

    <div className="guess-form inline-guess">
      <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder="Consultez l'oracle…" autoComplete="off" autoCorrect="off" spellCheck={false}/>
      <button onClick={handleSubmit}>Proposer 🔮</button>
    </div>
    {error && <p className="error">{error}</p>}

    <section className="v10-moons" aria-label="Proximité de votre proposition">
      {[1,2,3,4,5].map(i=><span key={i} className={(won || score>=i) ? "lit" : ""}>{(won || score>=i) ? "●" : "○"}</span>)}
    </section>
    {guesses.length>0 && !won && <p className="v10-feedback">{score>=4 ? "Votre intuition brûle très fort." : score>=3 ? "L’oracle s’éveille." : score>0 ? "Une lueur apparaît." : "Les astres restent silencieux."}</p>}

    {won && <section className="victory-banner" aria-live="polite">
      <div className="star-fireworks" aria-hidden="true"><i>✦</i><i>✧</i><i>✶</i><i>✦</i><i>✧</i><i>✶</i></div>
      <p>Les astres se sont alignés</p>
      <h2>{daily.word.toUpperCase()}</h2>
      <button onClick={shareResults}>📸 💬 Partager mes résultats</button>
      {shareNotice && <em>{shareNotice}</em>}
    </section>}

    <section className="attempts">
      <h2>Vos tentatives</h2>
      <div>{guesses.length ? guesses.map(g=><span key={g.word} className={`try-score-${g.score}`}>{g.word}</span>) : <em>Aucune tentative pour le moment.</em>}</div>
    </section>
    <footer>Le Mot Astral, inspiré librement de Pédantix.</footer>
  </main>
}

createRoot(document.getElementById("root")).render(<Home />);
