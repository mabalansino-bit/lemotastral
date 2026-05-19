🌙 Le Mot Astral
> Chaque jour, l'Oracle astral cache un mot.  
> Testez votre savoir astrologique et ésotérique.
---
Architecture
```
motastral/
├── frontend/          → Next.js  (déployé sur Vercel)
│   ├── src/app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css
│   ├── src/components/
│   │   └── Moon.jsx
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── backend/           → FastAPI Python (déployé sur Render)
    ├── main.py
    └── requirements.txt
```
---
Lancement en local
1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
> ⚠️ Le premier lancement télécharge le modèle NLP (~120 Mo). Patientez.
2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Ouvrez http://localhost:3000
---
Déploiement
Backend → Render (gratuit)
Créez un compte sur https://render.com
New → Web Service → connectez votre repo GitHub
Configurez :
Root directory : `backend`
Build command : `pip install -r requirements.txt`
Start command : `uvicorn main:app --host 0.0.0.0 --port $PORT`
Instance type : Free
Notez l'URL (ex: `https://lemotastral-api.onrender.com`)
Frontend → Vercel (gratuit)
Créez un compte sur https://vercel.com
Importez votre repo GitHub
Root directory : `frontend`
Ajoutez la variable d'environnement :
`NEXT_PUBLIC_API_URL` = URL de votre backend Render
Déployez !
---
Changer les mots du mois
Ouvrez `backend/main.py` et modifiez `MOTS_DU_MOIS` :
```python
MOTS_DU_MOIS = [
    "intuition",   # jour 1
    "eclipse",     # jour 2
    # ...
]
```
---
Moteur sémantique
paraphrase-multilingual-MiniLM-L12-v2 (Hugging Face)
✅ Gratuit et open source
✅ Multilingue (français natif)
✅ ~120 Mo
✅ Très bonne précision
---
Site indépendant — Culture cosmique et ésotérique
Le Mot Astral
Le Mot Astral V2
Version V2 intégrant :
mot mystère matérialisé par points ;
catégorie visible ;
définition à barres ;
révélation de mots exacts ;
indices proches en violet ;
lune comme progression ;
règles actualisées ;
footer « inspiré librement de Pédantix » ;
page résultats plus compétitive par signes astrologiques.
Déploiement
Remplacer les fichiers de l’ancien dépôt GitHub par ceux-ci.
Faire `Commit changes`.
Vercel redéploiera automatiquement.
Pour tester localement :
```bash
npm install
npm run dev
```
