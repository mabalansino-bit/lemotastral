import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Sparkles, Moon, Telescope, Flame, Gem, Cat, ScrollText, Trophy, Info, Home, HelpCircle } from 'lucide-react'
import './styles.css'

const WORD = {
  answer: 'INTUITION',
  category: 'Faculté mentale',
  definitionTokens: [
    ['Nom',['nom'],'exact'], ['féminin',['féminin','feminin'],'exact'], ['—',[], 'punct'],
    ['Connaissance',['connaissance','savoir'],'near'], ['immédiate',['immédiate','immediate','instantanée','instinctive'],'near'],
    ['d’une',['dune','d’une'],'exact'], ['vérité',['vérité','verite','vrai'],'near'], ['ou',['ou'],'exact'],
    ['d’une',['dune','d’une'],'exact'], ['situation',['situation','contexte'],'near'], [',',[], 'punct'],
    ['sans',['sans'],'exact'], ['recours',['recours','usage'],'near'], ['au',['au'],'exact'], ['raisonnement',['raisonnement','raison','logique'],'near'], ['.',[], 'punct']
  ],
  answerHints: ['intuition','intuitif','pressentiment','instinct','ressenti','sixième sens','sixieme sens']
}

const SIGNS = [
  ['Bélier','♈',42,'Les Béliers attaquent la grille sans trembler.'], ['Taureau','♉',37,'Les Taureaux avancent lentement mais sûrement.'],
  ['Gémeaux','♊',45,'Les Gémeaux multiplient les hypothèses.'], ['Cancer','♋',39,'Les Cancers sentent les mots cachés.'],
  ['Lion','♌',48,'Les Lions veulent reprendre la couronne.'], ['Vierge','♍',51,'Les Vierges excellent dans les détails.'],
  ['Balance','♎',33,'Les Balances cherchent le mot juste.'], ['Scorpion','♏',58,'Les Scorpions dominent encore l’oracle.'],
  ['Sagittaire','♐',36,'Les Sagittaires visent la bonne piste.'], ['Capricorne','♑',40,'Les Capricornes gravissent la définition.'],
  ['Verseau','♒',46,'Les Verseaux trouvent par éclairs.'], ['Poissons','♓',44,'Les Poissons devinent dans le flou cosmique.']
]

function normalize(v){return v.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[’']/g,'').trim()}
function ZodiacGlyph({sign,large=false}){return <div className={large?'zodiacGlyph large':'zodiacGlyph'}><span>{sign}</span></div>}

function DecorativeScene(){return <>
  <div className="constellation c1"><span></span><span></span><span></span><span></span></div><div className="constellation c2"><span></span><span></span><span></span></div>
  <div className="orb orbOne"></div><div className="orb orbTwo"></div>
  <div className="leftAltar"><div className="catFigure"><Cat size={52}/><Sparkles size={16}/></div><div className="crystals"><Gem size={28}/><Gem size={20}/><Gem size={24}/></div><div className="candles"><Flame size={18}/><Flame size={23}/><Flame size={15}/></div></div>
  <div className="rightAltar"><div className="armillary"><div></div><div></div><div></div></div><Telescope className="scope" size={74}/></div>
  <div className="cosmicWoman"><div className="hair"></div><div className="face"></div><div className="body"></div><div className="starCrown">✦ ✧ ✦</div></div>
</>}

function MoonProgress({progress}){return <div className="moonWrap"><div className="moonHalo"></div><div className="moonDisk"><div className="moonFill" style={{clipPath:`inset(${100-progress}% 0 0 0)`}}></div><div className="moonShade"></div><div className="moonCraters"><i></i><i></i><i></i></div></div><div className="moonCaption">L’oracle se révèle</div></div>}

function GamePage(){
  const [guess,setGuess]=useState(''); const [guesses,setGuesses]=useState([]); const [won,setWon]=useState(false)
  const normalizedGuesses=useMemo(()=>new Set(guesses.map(normalize)),[guesses])
  const revealedCount=WORD.definitionTokens.filter(([text,reveals,type])=>type!=='punct' && reveals.some(r=>normalizedGuesses.has(normalize(r)))).length
  const answerProgress=WORD.answer.split('').map((l,i)=> won ? l : (guesses.some(g=>normalize(g)===normalize(l)) || (guesses.some(g=>WORD.answerHints.includes(normalize(g))) && i<2) ? l : '•'))
  const progress=Math.min(100,Math.round(((revealedCount+(won?6:0))/16)*100))
  function submit(e){e.preventDefault(); const clean=guess.trim(); if(!clean)return; setGuesses(prev=>prev.includes(clean)?prev:[clean,...prev].slice(0,12)); if(normalize(clean)===normalize(WORD.answer))setWon(true); setGuess('')}
  return <section className="page gamePage"><div className="heroGrid">
    <div className="introPanel glass"><div className="eyebrow"><Sparkles size={16}/> Jeu quotidien d’oracle lexical</div><h1>Le Mot Astral</h1><p className="tagline">Découvrez le mot caché en remplissant peu à peu la définition céleste.</p><div className="yesterdayBanner"><ZodiacGlyph sign="♏"/><div><strong>Hier, les Scorpions ont été les plus intuitifs.</strong><span>Quel signe brillera aujourd’hui avec le mot du jour ?</span></div></div><MoonProgress progress={progress}/></div>
    <div className="oraclePanel glass"><div className="categoryPill">{WORD.category}</div><div className="mysteryWord">{answerProgress.map((c,i)=><span key={i} className={c==='•'?'':'foundLetter'}>{c}</span>)}</div><div className="definitionBox">{WORD.definitionTokens.map(([text,reveals,type],i)=>{if(type==='punct')return <span key={i} className="punctuation">{text}</span>; const revealed=reveals.some(r=>normalizedGuesses.has(normalize(r))); const exact=revealed && normalizedGuesses.has(normalize(text)); return <span key={i} className={revealed ? `revealedWord ${exact?'exact':'near'}` : 'maskBlock'}>{revealed?text:'██████'}</span>})}</div>{won&&<div className="winCard"><Sparkles size={18}/>Bravo, vous avez percé l’oracle : <strong>{WORD.answer}</strong>.</div>}<form className="oracleForm" onSubmit={submit}><input value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Consultez l’oracle..." autoComplete="off"/><button>Révéler</button></form><div className="attempts"><span>Dernières tentatives</span><div>{guesses.length===0?<em>Essayez : féminin, vérité, instinct…</em>:guesses.map(g=><b key={g}>{g}</b>)}</div></div></div>
  </div></section>
}

function RulesPage(){const rules=[['Un indice visible','La catégorie du mot apparaît dès le départ : émotion, astre, pratique, objet, faculté mentale…'],['Un mot matérialisé','Le mot mystère est représenté par des points, comme une constellation à compléter.'],['Une définition à révéler','Les mots de la définition sont cachés par des barres. Ils se dévoilent quand vous les trouvez.'],['Des mots proches','Si votre proposition est proche d’un mot de la définition, il peut apparaître en violet.'],['La lune progresse','Plus vous révélez d’éléments, plus la lune se remplit.']]; return <section className="page contentPage"><div className="sectionHeader"><ScrollText size={30}/><h2>Règles du jeu</h2><p>Le Mot Astral se joue comme une consultation : chaque tentative éclaire un fragment de la définition.</p></div><div className="ruleGrid">{rules.map((r,i)=><article className="ruleCard glass" key={r[0]}><div className="ruleNumber">{String(i+1).padStart(2,'0')}</div><h3>{r[0]}</h3><p>{r[1]}</p></article>)}</div><div className="sample glass"><span className="categoryPill">Faculté mentale</span><div className="mysteryWord small"><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span><span>•</span></div><p><mark>Nom féminin</mark> — █████████ immédiate d’une <mark className="nearMark">vérité</mark> ou d’une situation.</p></div></section>}
function ResultsPage(){const sorted=[...SIGNS].sort((a,b)=>b[2]-a[2]); return <section className="page contentPage"><div className="sectionHeader"><Trophy size={30}/><h2>Les signes dans l’arène astrale</h2><p>Chaque partie défend un signe. Les constellations gardent la mémoire des victoires récentes.</p></div><div className="winnerCard glass"><ZodiacGlyph sign="♏" large/><div><span>Signe de la veille</span><h3>Scorpion</h3><p>Les Scorpions ont été les plus intuitifs hier. Les Lions et les Vierges remontent dangereusement.</p></div></div><div className="rankingGrid">{sorted.map((s,i)=><article className="signCard glass" key={s[0]}><div className="rank">#{i+1}</div><ZodiacGlyph sign={s[1]}/><h3>{s[0]}</h3><strong>{s[2]} éclats</strong><p>{s[3]}</p></article>)}</div></section>}
function AboutPage(){return <section className="page contentPage aboutPage"><div className="sectionHeader"><Info size={30}/><h2>À propos</h2><p>Le Mot Astral est un jeu quotidien de mots, d’intuition et de signes astrologiques.</p></div><div className="glass aboutCard"><p>Chaque jour, un nouveau mot est caché dans une définition. Les joueurs révèlent peu à peu l’oracle, puis portent leur signe vers le classement collectif.</p><p>L’objectif : créer un rendez-vous simple, beau, compétitif et légèrement mystérieux.</p></div></section>}
function App(){const [page,setPage]=useState('accueil'); const nav=[['accueil','Accueil',Home],['regles','Règles',HelpCircle],['resultats','Résultats',Trophy],['apropos','À propos',Info]]; return <main className="appShell"><DecorativeScene/><header className="topNav glass"><button className="brand" onClick={()=>setPage('accueil')}><Moon size={21}/><span>Le Mot Astral</span></button><nav>{nav.map(([key,label,Icon])=><button key={key} className={page===key?'active':''} onClick={()=>setPage(key)}><Icon size={15}/>{label}</button>)}</nav></header>{page==='accueil'&&<GamePage/>}{page==='regles'&&<RulesPage/>}{page==='resultats'&&<ResultsPage/>}{page==='apropos'&&<AboutPage/>}<footer>Le Mot Astral, inspiré librement de Pédantix.</footer></main>}

createRoot(document.getElementById('root')).render(<App />)
