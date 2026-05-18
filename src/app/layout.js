import "./globals.css";

export const metadata = {
  title: "Le Mot Astral — L'Oracle du Jour",
  description: "Chaque jour, l'Oracle astral cache un mot. Testez votre savoir astrologique et ésotérique.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Crimson+Text:wght@400;600;700&display=swap" rel="stylesheet"/>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script dangerouslySetInnerHTML={{__html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
