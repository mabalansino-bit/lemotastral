import Link from "next/link";

const signs = ["Capricorne", "Balance", "Poissons", "Lion", "Vierge", "Scorpion", "Sagittaire", "Taureau", "Verseau", "Cancer", "Bélier", "Gémeaux"];
const words = ["Intuition", "Oracle", "Aura", "Éclipse", "Saturne", "Vénus", "Jupiter", "Mercure", "Lune", "Soleil", "Destin", "Mystère", "Révélation", "Harmonie", "Alignement"];

function rows() {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return {
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
      word: words[i % words.length],
      sign: signs[i % signs.length],
    };
  });
}

export default function Resultats() {
  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/">Jouer</Link><Link href="/regles">Règles du jeu</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/contact">Contact</Link>
      </nav>
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases">◐  ◑  ●  ◒  ◓</div>
      <section className="content-page">
        <h1>Résultats des 30 derniers jours</h1>
        <p>Cette page est prête pour afficher automatiquement les mots joués et le signe gagnant dès que la base de données sera branchée.</p>
        <div className="results-list">
          {rows().map((r, i) => (
            <div className="result-row" key={i}>
              <strong>{r.date}</strong><span>{r.word}</span><span>{r.sign}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
