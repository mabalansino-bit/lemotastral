import Link from "next/link";

export default function Regles() {
  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/">Jouer</Link><Link href="/resultats">Résultats</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/contact">Contact</Link>
      </nav>
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases">◐  ◑  ●  ◒  ◓</div>
      <section className="content-page">
        <h1>Règles du jeu</h1>
        <p>Chaque jour, l’Oracle cache un mot mystère.</p>
        <p>Votre objectif est de le découvrir en proposant des mots. La définition se révèle progressivement : les mots exacts apparaissent en doré, les pistes approchantes en lavande.</p>
        <p>La grande lune indique l’alignement général des astres : plus elle se remplit, plus vous avancez vers la révélation.</p>
        <p>Lorsque vous trouvez le mot du jour, il apparaît au cœur de la lune et vous pouvez partager votre résultat.</p>
      </section>
    </main>
  );
}
