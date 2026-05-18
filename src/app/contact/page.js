import Link from "next/link";

export default function Contact() {
  return (
    <main className="page">
      <nav className="top-menu">
        <Link href="/">Jouer</Link><Link href="/regles">Règles du jeu</Link><Link href="/resultats">Résultats</Link><Link href="/mentions-legales">Mentions légales</Link>
      </nav>
      <h1 className="logo">Le Mot Astral</h1>
      <div className="moon-phases">◐  ◑  ●  ◒  ◓</div>
      <section className="content-page">
        <h1>Contact</h1>
        <p>Une idée, une remarque ou un bug à signaler ? Ce formulaire est prêt visuellement. Il faudra le connecter à un service d’envoi avant la mise en ligne.</p>
        <form className="contact-form">
          <input type="text" placeholder="Votre nom" />
          <input type="email" placeholder="Votre e-mail" />
          <textarea placeholder="Votre message" />
          <button type="button">Envoyer</button>
        </form>
      </section>
    </main>
  );
}
