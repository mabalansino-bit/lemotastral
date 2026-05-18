import Link from "next/link";

export default function Mentions() {
  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/">Jouer</Link><Link href="/regles">Règles du jeu</Link><Link href="/resultats">Résultats</Link><Link href="/contact">Contact</Link>
      </nav>
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases">◐  ◑  ●  ◒  ◓</div>
      <section className="content-page">
        <h1>Mentions légales et confidentialité</h1>
        <h2>Éditeur</h2>
        <p>Le Mot Astral est un jeu quotidien en ligne. Les informations d’édition définitives pourront être complétées avant la mise en ligne publique.</p>
        <h2>Hébergement</h2>
        <p>Le site pourra être hébergé par Vercel et/ou Render selon la configuration retenue au déploiement.</p>
        <h2>Confidentialité</h2>
        <p>Le site ne demande pas la création d’un compte. Des données de fréquentation et de jeu peuvent être collectées à des fins statistiques : nombre de visites, tentatives, date de jeu, réussite ou échec et signe choisi.</p>
        <p>Ces données sont utilisées pour améliorer le jeu et établir des statistiques globales. Elles ne sont pas vendues à des tiers.</p>
        <p><Link href="/confidentialite">Voir la page confidentialité détaillée.</Link></p>
      </section>
    </main>
  );
}
