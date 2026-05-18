"use client";

export function getMoonPhase(score) {
  if (score >= 0.92) return { emoji:"🌕", label:"Pleine Lune !", color:"#f0c030", bar:"linear-gradient(90deg,#906000,#f0c030)", bg:"rgba(40,30,0,.5)" };
  if (score >= 0.70) return { emoji:"🌕", label:"Presque…",    color:"#d0a020", bar:"linear-gradient(90deg,#604800,#c09018)", bg:"rgba(35,22,0,.5)" };
  if (score >= 0.48) return { emoji:"🌔", label:"Quartier",    color:"#9090d8", bar:"linear-gradient(90deg,#282880,#6068c8)", bg:"rgba(8,8,30,.5)" };
  if (score >= 0.28) return { emoji:"🌒", label:"Croissant",   color:"#6068c0", bar:"linear-gradient(90deg,#181860,#4050b0)", bg:"rgba(5,5,22,.5)" };
  return                    { emoji:"🌑", label:"Nuit noire",  color:"#3a3860", bar:"#1a1838",                               bg:"rgba(4,4,14,.5)" };
}

export function MoonSVG({ score }) {
  if (score >= 0.92) return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{flexShrink:0,filter:"drop-shadow(0 0 14px rgba(255,210,30,.9))"}}>
      <defs>
        <radialGradient id="mfull" cx="38%" cy="33%" r="60%">
          <stop offset="0%" stopColor="#fff8c0"/><stop offset="35%" stopColor="#f8d040"/>
          <stop offset="70%" stopColor="#d09000"/><stop offset="100%" stopColor="#806000"/>
        </radialGradient>
        <filter id="mgf"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="22" cy="22" r="24" fill="rgba(255,210,30,.1)"/>
      <circle cx="22" cy="22" r="20" fill="url(#mfull)" stroke="rgba(255,220,80,.5)" strokeWidth="1.5" filter="url(#mgf)"/>
      <ellipse cx="13" cy="14" rx="6.5" ry="4" fill="rgba(255,255,200,.32)" transform="rotate(-30 13 14)"/>
      <circle cx="13" cy="29" r="2.5" fill="rgba(160,110,0,.3)"/>
      <circle cx="19" cy="22" r="2" fill="rgba(140,90,0,.55)"/>
      <circle cx="27" cy="22" r="2" fill="rgba(140,90,0,.55)"/>
      <path d="M17 29 Q22 35 28 29" stroke="rgba(140,90,0,.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );

  if (score >= 0.70) return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{flexShrink:0,filter:"drop-shadow(0 0 9px rgba(220,180,40,.65))"}}>
      <defs>
        <radialGradient id="maf" cx="38%" cy="33%" r="60%">
          <stop offset="0%" stopColor="#fff0c0"/><stop offset="40%" stopColor="#e8c040"/><stop offset="100%" stopColor="#806000"/>
        </radialGradient>
        <mask id="mam"><circle cx="22" cy="22" r="20" fill="white"/><circle cx="16" cy="22" r="7" fill="black"/></mask>
      </defs>
      <circle cx="22" cy="22" r="20" fill="#0a0818" stroke="rgba(200,160,40,.3)" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="20" fill="url(#maf)" mask="url(#mam)"/>
    </svg>
  );

  if (score >= 0.48) return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{flexShrink:0,filter:"drop-shadow(0 0 7px rgba(100,120,240,.45))"}}>
      <defs>
        <radialGradient id="mhf" cx="36%" cy="33%" r="62%">
          <stop offset="0%" stopColor="#e0e8ff"/><stop offset="45%" stopColor="#8090d8"/><stop offset="100%" stopColor="#3050b0"/>
        </radialGradient>
        <mask id="mhm"><circle cx="22" cy="22" r="20" fill="white"/><circle cx="21" cy="22" r="13" fill="black"/></mask>
      </defs>
      <circle cx="22" cy="22" r="20" fill="#070514" stroke="rgba(100,120,220,.25)" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="20" fill="url(#mhf)" mask="url(#mhm)"/>
    </svg>
  );

  if (score >= 0.28) return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{flexShrink:0,filter:"drop-shadow(0 0 5px rgba(60,80,200,.38))"}}>
      <defs>
        <radialGradient id="mcf" cx="32%" cy="33%" r="65%">
          <stop offset="0%" stopColor="#d0d8ff"/><stop offset="50%" stopColor="#6070c8"/><stop offset="100%" stopColor="#202880"/>
        </radialGradient>
        <mask id="mcm"><circle cx="22" cy="22" r="20" fill="white"/><circle cx="29" cy="22" r="16" fill="black"/></mask>
      </defs>
      <circle cx="22" cy="22" r="20" fill="#060412" stroke="rgba(70,90,180,.2)" strokeWidth="1.2"/>
      <circle cx="22" cy="22" r="20" fill="url(#mcf)" mask="url(#mcm)"/>
    </svg>
  );

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{flexShrink:0}}>
      <defs>
        <radialGradient id="mnf" cx="40%" cy="35%" r="58%">
          <stop offset="0%" stopColor="#1c1a38"/><stop offset="100%" stopColor="#070616"/>
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#mnf)" stroke="rgba(60,55,110,.28)" strokeWidth="1.2"/>
      <circle cx="15" cy="27" r="3" fill="rgba(0,0,0,.25)"/>
      <circle cx="26" cy="17" r="2.2" fill="rgba(0,0,0,.2)"/>
    </svg>
  );
}
