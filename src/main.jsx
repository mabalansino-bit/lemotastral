import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Moon, Trophy, ScrollText, Home, HelpCircle } from 'lucide-react';
import './styles.css';

const WORDS = [
  {
    answer: 'intuition',
    category: 'Faculté mentale',
    definition: 'Nom féminin — Connaissance immédiate d’une vérité ou d’une situation, sans recours au raisonnement.',
    exact: ['nom','féminin','connaissance','immédiate','vérité','situation','sans','recours','raisonnement'],
    close: {
      instinct: ['connaissance','raisonnement'], pressentiment: ['connaissance','situation'], perception: ['connaissance'], ressentiment: ['situation'], sensation: ['connaissance'], idée: ['vérité']
    }
  },
  {
    answer: 'solstice',
    category: 'Phénomène astronomique',
    definition: 'Nom masculin — Moment de l’année où le Soleil atteint sa plus forte déclinaison apparente, marquant le jour le plus long ou le plus court.',
    exact: ['nom','masculin','moment','année','soleil','atteint','forte','déclinaison','apparente','jour','long','court'],
    close: { été: ['long'], hiver: ['court'], astre: ['soleil'], saison: ['année'], calendrier: ['année'], lumière: ['jour'] }
  },
  {
    answer: 'amulette',
    category: 'Objet symbolique',
    definition: 'Nom féminin — Petit objet porté sur soi auquel on attribue une vertu de protection ou de chance.',
    exact: ['nom','féminin','petit','objet','porté','soi','attribue','vertu','protection','chance'],
    close: { talisman: ['objet','protection'], 'porte bonheur': ['chance'], bijou: ['objet','porté'], magie: ['vertu'], 'gri gri': ['objet','chance'] }
  },
  {
    answer: 'oracle',
    category: 'Pratique divinatoire',
    definition: 'Nom masculin — Réponse ou message interprété comme venant d’une puissance mystérieuse, souvent consultée pour éclairer l’avenir.',
    exact: ['nom','masculin','réponse','message','interprété','venant','puissance','mystérieuse','consultée','éclairer','avenir'],
    close: { divination: ['avenir'], présage: ['message','avenir'], prophétie: ['message','avenir'], voyance: ['avenir'], mystère: ['mystérieuse'] }
  },
  {
    answer: 'aura',
    category: 'Rayonnement symbolique',
    definition: 'Nom féminin — Atmosphère invisible que l’on imagine entourer une personne, un lieu ou une œuvre.',
    exact: ['nom','féminin','atmosphère','invisible','imagine','entourer','personne','lieu','œuvre'],
    close: { halo: ['entourer'], rayonnement: ['atmosphère'], énergie: ['invisible'], présence: ['personne'], vibration: ['invisible'] }
  },
  {
    answer: 'équinoxe',
    category: 'Phénomène astronomique',
    definition: 'Nom masculin — Moment de l’année où la durée du jour est presque égale à celle de la nuit.',
    exact: ['nom','masculin','moment','année','durée','jour','presque','égale','nuit'],
    close: { saison: ['année'], printemps: ['année'], automne: ['année'], équilibre: ['égale'], lumière: ['jour'], obscurité: ['nuit'] }
  }
];

const SIGNS = [
  ['belier','Bélier','♈'], ['taureau','Taureau','♉'], ['gemeaux','Gémeaux','♊'], ['cancer','Cancer','♋'], ['lion','Lion','♌'], ['vierge','Vierge','♍'], ['balance','Balance','♎'], ['scorpion','Scorpion','♏'], ['sagittaire','Sagittaire','♐'], ['capricorne','Capricorne','♑'], ['verseau','Verseau','♒'], ['poissons','Poissons','♓']
];

function todayWord() {
  const start = new Date('2026-01-01T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000);
  return WORDS[Math.abs(diff) % WORDS.length];
}

const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9œæ\s-]/g,'').trim();
const tokenise = (text) => text.match(/[A-Za-zÀ-ÿŒœÆæ’'-]+/g) || [];
const isWord = (part) => /^[A-Za-zÀ-ÿŒœÆæ’'-]+$/.test(part);
const parts = (text) => text.split(/([A-Za-zÀ-ÿŒœÆæ’'-]+)/g);

function wordMask(answer, solved) {
  return [...answer].map((c, i) => c === ' ' ? <span key={i} className="space"/> : <span key={i} className={solved ? 'dot solved-dot' : 'dot'}>{solved ? c.toUpperCase() : ''}</span>);
}

function Definition({ word, revealed, closeRevealed }) {
  return <p className="definition-text">
    {parts(word.definition).map((p, i) => {
      if (!isWord(p)) return <span key={i}>{p}</span>;
      const n = normalize(p);
      if (revealed.has(n)) return <span key={i} className="revealed">{p}</span>;
      if (closeRevealed.has(n)) return <span key={i} className="revealed close">{p}</span>;
      return <span key={i} className="bar" style={{ width: `${Math.min(Math.max(p.length, 3), 12)}ch` }} />;
    })}
  </p>;
}

function MoonProgress({ progress }) {
  const angle = Math.round(progress * 360);
  return <div className="moon-wrap" aria-label={`Progression ${Math.round(progress*100)}%`}>
    <div className="moon-progress" style={{ background: `conic-gradient(var(--gold) ${angle}deg, rgba(255,255,255,.10) 0deg)` }}>
      <div className="moon-inner"><Moon size={42}/></div>
    </div>
    <span>{Math.round(progress*100)}%</span>
  </div>;
}

function SignIcon({ sign }) { return <span className="sign-icon">{sign}</span>; }

function Game() {
  const word = useMemo(() => todayWord(), []);
  const [input, setInput] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [closeRevealed, setCloseRevealed] = useState(new Set());
  const [message, setMessage] = useState('Entrez un mot pour interroger l’oracle.');

  const allTokens = useMemo(() => new Set(tokenise(word.definition).map(normalize).filter(Boolean)), [word]);
  const answerNorm = normalize(word.answer);
  const solved = guesses.some(g => normalize(g) === answerNorm);
  const progress = solved ? 1 : Math.min(.96, (revealed.size + closeRevealed.size * .7) / Math.max(1, allTokens.size));

  function submit(e) {
    e.preventDefault();
    const raw = input.trim();
    const guess = normalize(raw);
    if (!guess) return;
    setInput('');
    if (guesses.map(normalize).includes(guess)) { setMessage('Vous avez déjà consulté l’oracle avec ce mot.'); return; }
    setGuesses([raw, ...guesses]);
    if (guess === answerNorm) { setMessage('Révélation accomplie : vous avez trouvé le Mot Astral.'); setRevealed(new Set([...allTokens])); return; }
    if (allTokens.has(guess)) { const next = new Set(revealed); next.add(guess); setRevealed(next); setMessage('Mot exact révélé dans la définition.'); return; }
    const closeMap = Object.fromEntries(Object.entries(word.close || {}).map(([k,v]) => [normalize(k), v]));
    if (closeMap[guess]) {
      const next = new Set(closeRevealed);
      closeMap[guess].map(normalize).forEach(t => next.add(t));
      setCloseRevealed(next);
      setMessage('Mot proche : l’oracle révèle une piste en violet.'); return;
    }
    setMessage('L’oracle reste silencieux. Essayez un mot plus concret ou grammatical.');
  }

  return <section className="card game-card">
    <div className="card-ornament"><Sparkles size={18}/> Oracle du jour</div>
    <MoonProgress progress={progress} />
    <div className="category-pill">Indice : {word.category}</div>
    <div className="mystery-word">{wordMask(word.answer, solved)}</div>
    <Definition word={word} revealed={revealed} closeRevealed={closeRevealed}/>
    <form className="oracle-form" onSubmit={submit}>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Consultez l’oracle…" autoComplete="off" />
      <button>Proposer</button>
    </form>
    <div className="message">{message}</div>
    {guesses.length > 0 && <div className="guesses"><strong>Dernières tentatives</strong><div>{guesses.slice(0,12).map(g => <span key={g}>{g}</span>)}</div></div>}
  </section>;
}

function Rules() {
  return <section className="card rules-card">
    <div className="section-title"><HelpCircle/> Règles du jeu</div>
    <ol>
      <li>Chaque jour, un Mot Astral est à deviner.</li>
      <li>La catégorie est visible dès le départ : astre, émotion, objet, pratique, faculté mentale…</li>
      <li>Le mot mystère est matérialisé par des points au-dessus de la définition.</li>
      <li>La définition est masquée par des barres. Les mots de la définition ne montrent pas leur nombre de lettres.</li>
      <li>Si vous proposez un mot présent dans la définition, il se révèle.</li>
      <li>Si vous proposez un mot proche, une piste apparaît en violet.</li>
      <li>La nature grammaticale peut être cachée dans la définition : tentez « nom », « féminin », « adjectif »…</li>
      <li>La lune se remplit à mesure que vous avancez.</li>
    </ol>
  </section>;
}

function Results() {
  const scores = [92,87,81,78,75,70,66,61,57,53,49,44];
  const headlines = ['dominent l’oracle','remontent dans les étoiles','frappent fort aujourd’hui','gardent leur avance'];
  return <section className="card results-card">
    <div className="section-title"><Trophy/> Résultats astraux</div>
    <div className="winner">
      <SignIcon sign="♏"/><div><span>Signe en tête</span><strong>Scorpion</strong><p>Les Scorpions dominent l’oracle cette semaine.</p></div>
    </div>
    <div className="zodiac-grid">
      {SIGNS.map(([id, name, icon], i) => <div className={`zodiac-row ${i===0?'top':''}`} key={id}>
        <SignIcon sign={icon}/><div className="zodiac-name"><strong>{name}</strong><small>{name}s {headlines[i%headlines.length]}</small></div><div className="score">{scores[i]}</div>
      </div>)}
    </div>
  </section>;
}

function App() {
  const [page, setPage] = useState('jeu');
  return <main className="app">
    <div className="stars"/>
    <header className="hero">
      <div className="brand-mark">☾</div>
      <h1>Le Mot Astral</h1>
      <p>Un mot à deviner, une définition à révéler, une lune à remplir.</p>
      <nav>
        <button className={page==='jeu'?'active':''} onClick={()=>setPage('jeu')}><Home size={16}/> Jouer</button>
        <button className={page==='regles'?'active':''} onClick={()=>setPage('regles')}><ScrollText size={16}/> Règles</button>
        <button className={page==='resultats'?'active':''} onClick={()=>setPage('resultats')}><Trophy size={16}/> Résultats</button>
      </nav>
    </header>
    {page === 'jeu' && <Game/>}
    {page === 'regles' && <Rules/>}
    {page === 'resultats' && <Results/>}
    <footer>Le Mot Astral, inspiré librement de Pédantix.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
