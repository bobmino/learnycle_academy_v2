# Configuration du Compte Professeur

## Problème
Le compte professeur (`teacher@learncycle.com` / `teacher123`) n'est pas créé automatiquement au démarrage.

## Solutions

### Solution 1: Créer via l'endpoint API (Recommandé)
Appelez l'endpoint suivant pour créer le compte professeur :

```bash
POST https://learncycle-academy.vercel.app/api/auth/create-teacher
```

Ou depuis le navigateur, ouvrez la console et exécutez :
```javascript
fetch('/api/auth/create-teacher', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data));
```

### Solution 2: Création automatique
Le compte sera créé automatiquement lors de la prochaine connexion à la base de données (au prochain appel API).

### Solution 3: Via MongoDB directement
Si vous avez accès à MongoDB, créez le compte directement :
```javascript
db.users.insertOne({
  name: "Teacher User",
  email: "teacher@learncycle.com",
  password: "$2a$10$...", // Hash bcrypt de "teacher123"
  role: "teacher"
})
```

## Credentials
- **Email:** `teacher@learncycle.com`
- **Password:** `teacher123`

