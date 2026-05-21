
import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const signs=[["♏","Scorpion"],["♍","Vierge"],["♌","Lion"]];
const answer="ORACLE";

function App(){
 const [tries,setTries]=useState([]);
 const [input,setInput]=useState("");

 const submit=(e)=>{
   e.preventDefault();
   if(!input.trim()) return;
   setTries([input,...tries]);
   setInput("");
 }

 return <div className="app">
  <div className="menu">
    <span>Accueil</span>
    <span>Règles</span>
    <span>Résultats</span>
    <span>À propos</span>
  </div>

  <div className="winner">
    <div className="sign">♏</div>
    <div>
      <strong>Hier, les Scorpions ont été les plus intuitifs.</strong>
      <p>Quel signe brillera aujourd’hui ?</p>
    </div>
  </div>

  <h1>LE MOT ASTRAL</h1>

  <div className="planets">
    <span></span><span></span><span></span><span></span><span></span>
  </div>

  <div className="oracleTitle">
    Consultez l’Oracle pour dévoiler la définition
    <small>Indice : pratique divinatoire</small>
  </div>

  <form className="search" onSubmit={submit}>
    <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Consultez l’oracle..."/>
    <button>Proposer 🔮</button>
  </form>

  <div className="letters">
   {answer.split("").map((l,i)=><div key={i}></div>)}
  </div>

  <div className="definition">
    <h2>Définition</h2>
    <p>
      <span className="hidden">██████</span> ou message attribué à une puissance divine consultée pour éclairer l’avenir.
    </p>
  </div>

  <div className="moonZone">
    <div className="orbit orbit1"></div>
    <div className="orbit orbit2"></div>
    <div className="moon"></div>
  </div>

  <div className="tries">
    <h3>Vos tentatives</h3>
    <div className="chips">
      {tries.map((t,i)=><span key={i}>{t}</span>)}
    </div>
  </div>

 </div>
}

createRoot(document.getElementById("root")).render(<App />);
