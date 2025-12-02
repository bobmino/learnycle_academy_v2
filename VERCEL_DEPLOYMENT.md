# Guide de Déploiement sur Vercel

Ce projet est configuré pour être déployé sur Vercel en tant que monorepo avec frontend et backend.

## Structure du Projet

- `client/` - Frontend React/Vite
- `server/` - Backend Express/Node.js
- `api/[...slug].js` - Handler Vercel serverless pour les routes API

## Configuration Vercel

### Variables d'Environnement Requises

Dans le dashboard Vercel, configurez les variables d'environnement suivantes:

#### Pour le Backend (dans les settings du projet):
```
NODE_ENV=production
MONGO_URI=votre_connection_string_mongodb_atlas
JWT_ACCESS_SECRET=votre_secret_access
JWT_REFRESH_SECRET=votre_secret_refresh
CLIENT_URL=https://votre-domaine.vercel.app
```

#### Pour le Frontend (dans les settings du projet):
```
VITE_API_URL=/api
```

**Note:** Sur Vercel, le frontend et le backend sont sur le même domaine, donc on utilise `/api` comme baseURL (chemin relatif).

## Déploiement

### Option 1: Via Vercel CLI

1. Installez Vercel CLI:
```bash
npm i -g vercel
```

2. Connectez-vous:
```bash
vercel login
```

3. Déployez:
```bash
vercel --prod
```

### Option 2: Via GitHub (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement la configuration depuis `vercel.json`
3. Configurez les variables d'environnement dans le dashboard
4. Le déploiement se fera automatiquement à chaque push

## Structure des Routes

- **Frontend:** Toutes les routes `/` (sauf `/api/*`) sont servies par le frontend React
- **Backend:** Toutes les routes `/api/*` sont routées vers les serverless functions

### Endpoints API Disponibles

- `GET /api/health` - Health check
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/auth/me` - Utilisateur actuel
- `POST /api/auth/logout` - Déconnexion
- `GET /api/modules` - Liste des modules
- `GET /api/lessons` - Liste des leçons
- ... (voir README.md pour la liste complète)

## Vérification du Déploiement

1. Vérifiez le health check:
```
https://votre-domaine.vercel.app/api/health
```

2. Vérifiez le frontend:
```
https://votre-domaine.vercel.app
```

## Dépannage

### Problème: Les routes API ne fonctionnent pas

- Vérifiez que `api/[...slug].js` existe et exporte correctement l'app Express
- Vérifiez que `vercel.json` a la bonne configuration de rewrites
- Vérifiez les logs dans le dashboard Vercel

### Problème: Erreur de connexion à la base de données

- Vérifiez que `MONGO_URI` est correctement configuré
- Vérifiez que MongoDB Atlas autorise les connexions depuis Vercel (whitelist 0.0.0.0/0)
- Vérifiez les logs pour voir les erreurs de connexion

### Problème: CORS errors

- Sur Vercel, le frontend et le backend sont sur le même domaine, donc CORS devrait fonctionner automatiquement
- Vérifiez que `CLIENT_URL` est configuré correctement

## Notes Importantes

1. **Base de données:** Utilisez MongoDB Atlas pour la production. La connexion est lazy et mise en cache pour les serverless functions.

2. **Fichiers statiques:** Les PDFs sont servis via `/docs`. Assurez-vous que les fichiers sont inclus dans le déploiement.

3. **Cookies:** Les cookies HttpOnly sont utilisés pour l'authentification. Sur Vercel, cela fonctionne car le frontend et le backend sont sur le même domaine.

4. **Build:** Le build du frontend se fait automatiquement via `vercel.json`. Le backend est déployé comme serverless functions.

