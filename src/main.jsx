
import React,{useState} from 'react'
import {createRoot} from 'react-dom/client'
import {Home,BookOpen,Trophy,Info,Share2} from 'lucide-react'
import './styles.css'

const ZODIAC=[['Bélier','♈'],['Taureau','♉'],['Gémeaux','♊'],['Cancer','♋'],['Lion','♌'],['Vierge','♍'],['Balance','♎'],['Scorpion','♏'],['Sagittaire','♐'],['Capricorne','♑'],['Verseau','♒'],['Poissons','♓']]

const WORDS=[
 {answer:'voyante',category:'Médiumnité',cardTitle:'La Passeuse',visual:'seer',clue:'Certains la considèrent comme un guide entre le monde des vivants et celui des esprits.',close:{clairvoyance:4,voyance:4,medium:4,médium:4,sorciere:3,sorcière:3,esprit:3,carte:3,tarot:3,oracle:3,lune:2,bougie:2,nuit:1}},
 {answer:'miroir',category:'Objets & Symboles occultes',cardTitle:'Le Reflet',visual:'mirror',clue:'Certains l’utilisent pour ouvrir un passage entre le visible et l’invisible.',close:{portail:4,passage:4,reflet:4,eau:3,vortex:3,seuil:3,cristal:2,lune:2,vision:3}},
 {answer:'vortex',category:'Portes & Passages',cardTitle:'Le Passage',visual:'vortex',clue:'Tout semble immobile, mais quelque chose aspire le regard vers un ailleurs.',close:{portail:4,spirale:4,tourbillon:4,passage:4,porte:3,seuil:3,cercle:2,energie:2,énergie:2,lumiere:2,lumière:2}},
 {answer:'aura',category:'Énergies invisibles',cardTitle:'Le Halo',visual:'aura',clue:'On ne la touche pas, mais certains disent qu’elle enveloppe les êtres.',close:{halo:4,energie:4,énergie:4,lumiere:3,lumière:3,vibration:3,âme:2,ame:2,corps:2,esprit:2,rayonnement:4}}
]

const HISTORY=[
 {date:'20 mai',card:'Le Passage',sign:'Scorpion',symbol:'♏',avg:'7,4'},
 {date:'19 mai',card:'Le Halo',sign:'Poissons',symbol:'♓',avg:'8,1'},
 {date:'18 mai',card:'Le Reflet',sign:'Vierge',symbol:'♍',avg:'6,8'},
 {date:'17 mai',card:'La Passeuse',sign:'Cancer',symbol:'♋',avg:'9,2'},
 {date:'16 mai',card:'Le Seuil',sign:'Lion',symbol:'♌',avg:'7,9'},
 {date:'15 mai',card:'La Flamme',sign:'Balance',symbol:'♎',avg:'8,7'},
 {date:'14 mai',card:'Le Cercle',sign:'Capricorne',symbol:'♑',avg:'6,5'}
]

const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[’']/g,'').trim()
function todayWord(){const start=new Date('2026-01-01T00:00:00');const now=new Date();const diff=Math.floor((now-start)/86400000);return WORDS[Math.abs(diff)%WORDS.length]}
function AstralSign({symbol,small=false}){return <span className={small?'astral-sign small':'astral-sign'}><span>{symbol}</span></span>}
function Nav({view,setView}){return <nav className="menu"><button className={view==='play'?'active':''} onClick={()=>setView('play')}><Home size={17}/>Accueil</button><button className={view==='rules'?'active':''} onClick={()=>setView('rules')}><BookOpen size={17}/>Règles</button><button className={view==='results'?'active':''} onClick={()=>setView('results')}><Trophy size={17}/>Résultats</button><button className={view==='about'?'active':''} onClick={()=>setView('about')}><Info size={17}/>À propos</button></nav>}

function SignChoice({onChoose}){return <main className="page sign-choice-page"><section className="sign-choice-card"><div className="sign-star">✦</div><h1>Choisissez votre signe</h1><p>Il représentera votre intuition dans l’oracle.</p><div className="sign-options">{ZODIAC.map(([name,symbol])=><button key={name} onClick={()=>onChoose(name)}><AstralSign symbol={symbol}/><strong>{name}</strong></button>)}</div></section></main>}

function OracleCard({daily}){return <section className={'oracle-card '+daily.visual}><div className="card-border"><div className="card-stars">✦ ✧ ✦</div><div className="card-scene"><div className="moon-card"></div><div className="portal-glow"></div><div className="altar-line"></div><div className="card-object"></div><div className="spark s1">✦</div><div className="spark s2">✧</div><div className="spark s3">✶</div></div><div className="card-title">{daily.cardTitle}</div></div></section>}

function ProximityMoons({score,won}){return <div className={won?'proximity won':'proximity'}>{[1,2,3,4,5].map(i=><span key={i} className={i<=score?'lit':''}>{i<=score?'●':'○'}</span>)}</div>}

function Game(){
 const daily=todayWord()
 const [view,setView]=useState('play')
 const [selectedSign,setSelectedSign]=useState(()=>localStorage.getItem('motAstralSign')||'')
 const [guess,setGuess]=useState('')
 const [guesses,setGuesses]=useState([])
 const [lastScore,setLastScore]=useState(0)
 const [won,setWon]=useState(false)
 const [copied,setCopied]=useState(false)

 if(!selectedSign)return <><div className="sky"></div><SignChoice onChoose={(s)=>{localStorage.setItem('motAstralSign',s);setSelectedSign(s)}}/></>

 function scoreGuess(raw){const g=norm(raw);if(g===norm(daily.answer))return 5;return daily.close[g]||0}
 function submit(e){e.preventDefault();const clean=guess.trim();if(!clean)return;const score=scoreGuess(clean);setLastScore(score);setGuesses(prev=>prev.map(x=>norm(x.text)).includes(norm(clean))?prev:[{text:clean,score},...prev].slice(0,18));if(norm(clean)===norm(daily.answer))setWon(true);setGuess('')}
 function share(){const n=guesses.length||1;const text=`Le Mot Astral ✨\n${selectedSign} a percé l’Oracle en ${n} tentative${n>1?'s':''}.\nSaurez-vous interpréter la carte du jour ?\n${window.location.origin}`;if(navigator.share){navigator.share({title:'Le Mot Astral',text}).catch(()=>{})}else{navigator.clipboard?.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),2200)}}

 if(view==='rules')return <><div className="sky"></div><main className="page content"><Nav view={view} setView={setView}/><h1>Règles du jeu</h1><div className="rules-text"><p>Défends ton signe astrologique et découvre le mot du jour dans l’univers de l’ésotérisme et de l’astrologie en un minimum de tentatives.</p><p>Interprète la carte-oracle du jour et son indice, puis propose des mots pour t’approcher du mystère.</p><p>À chaque tentative, les lunes t’indiquent si ton intuition s’approche de la réponse.</p><p>Tentatives illimitées.</p><p>Une fois le mot découvert, partage ton score et fais briller ton signe.</p></div></main><Footer/></>
 if(view==='results')return <><div className="sky"></div><main className="page content"><Nav view={view} setView={setView}/><h1>Résultats</h1><p className="results-note">Le résultat du jour apparaît à minuit, au changement de carte.</p><div className="results-table"><div className="results-row head"><span>Date</span><span>Carte</span><span>Signe vainqueur</span><span>Moyenne</span></div>{HISTORY.map(item=><div className="results-row" key={item.date}><span>{item.date}</span><strong>{item.card}</strong><span className="winner-sign"><AstralSign symbol={item.symbol} small/>{item.sign}</span><span>{item.avg} tentatives</span></div>)}</div></main><Footer/></>
 if(view==='about')return <><div className="sky"></div><main className="page content"><Nav view={view} setView={setView}/><h1>À propos</h1><p className="about">Le Mot Astral est un jeu quotidien d’intuition visuelle : une carte, un indice, des tentatives et des lunes pour guider votre signe.</p></main><Footer/></>

 return <><div className="sky"></div><main className="page"><Nav view={view} setView={setView}/><section className="yesterday"><AstralSign symbol="♏" small/><div><strong>Hier, les Scorpions ont été les plus intuitifs.</strong><span>Quel signe brillera aujourd’hui ?</span></div></section><h1 className="brand-title">Le Mot Astral</h1><div className="little-planets"><i></i><i></i><i></i><i></i><i></i></div><section className="oracle-intro"><p>Interprétez la carte du jour</p><small>Catégorie : {daily.category}</small></section><OracleCard daily={daily}/><section className="clue-card"><span>Indice</span><p>{daily.clue}</p></section><form className="guess-form" onSubmit={submit}><input value={guess} onChange={e=>setGuess(e.target.value)} placeholder="Consultez l’oracle..." autoComplete="off"/><button>Proposer 🔮</button></form><ProximityMoons score={won?5:lastScore} won={won}/>{lastScore>0&&!won&&<p className="oracle-feedback">{lastScore>=4?'Votre intuition brûle très fort.':lastScore>=3?'L’oracle s’éveille.':'Une lueur apparaît.'}</p>}{lastScore===0&&guesses.length>0&&!won&&<p className="oracle-feedback muted">Les astres restent silencieux.</p>}{won&&<section className="victory"><div className="fireworks">✦ ✧ ✶ ✦ ✧</div><p>Les astres se sont alignés</p><h2>{daily.answer.toUpperCase()}</h2><button onClick={share}><Share2 size={18}/> 📸 💬 Partager mes résultats</button>{copied&&<em>Résultat copié.</em>}</section>}<section className="attempts"><h3>Vos tentatives</h3><div>{guesses.length?guesses.map(g=><span key={g.text} className={'score-'+g.score}>{g.text}</span>):<em>Aucune tentative pour le moment.</em>}</div></section></main><Footer/></>
}

function Footer(){return <footer>Le Mot Astral, inspiré librement de Pédantix.</footer>}
createRoot(document.getElementById('root')).render(<Game/>)
