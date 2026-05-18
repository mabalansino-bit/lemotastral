import Link from "next/link";

export default function Confidentialite() {
  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/">Jouer</Link><Link href="/regles">Règles du jeu</Link><Link href="/resultats">Résultats</Link><Link href="/contact">Contact</Link>
      </nav>
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases">◐  ◑  ●  ◒  ◓</div>
      <section className="content-page">
        <h1>Politique de confidentialité</h1>
        <p>Le Mot Astral ne demande pas la création d’un compte et ne collecte pas directement de données permettant d’identifier les joueurs.</p>
        <p>Des données de fréquentation peuvent être collectées afin de comprendre l’usage du site : nombre de visites, horaires de connexion, type d’appareil utilisé et pages consultées.</p>
        <p>Des données liées au jeu peuvent également être enregistrées : signe astrologique choisi, nombre de tentatives, réussite ou échec de la partie et date de jeu.</p>
        <p>Ces données sont utilisées uniquement pour améliorer Le Mot Astral et établir des statistiques globales. Elles ne sont pas vendues à des tiers.</p>
      </section>
    </main>
  );
}
