# Script de Réorganisation du Contenu

## 📋 Description

Le script de réorganisation (`server/utils/reorganizeContent.js`) transforme la structure actuelle du contenu selon la nouvelle architecture demandée.

## 🎯 Ce que fait le script

### 1. **Création du Module "Économie"**
   - Crée un nouveau module intitulé **"Module: Économie"**
   - Catégorie : "Économie" (créée automatiquement si elle n'existe pas)
   - Description : "Module complet d'économie et gestion de projet..."

### 2. **Conversion des Modules en Leçons**
   - Prend les **10 modules existants** (Module 1 à Module 10)
   - Convertit chaque module en une **leçon** dans le module Économie
   - Format des leçons : `Leçon X: [Titre du module]` (ex: "Leçon 1: Prospection Client")
   - Conserve le contenu et la description de chaque module
   - Intègre les leçons existantes du module dans le contenu de la nouvelle leçon

### 3. **Création des Études de Cas comme Projets**
   - Crée **3 projets d'études de cas** :
     - **Étude de Cas 1: Café** - Système de gestion pour un café
     - **Étude de Cas 2: Restaurant** - Application de gestion pour un restaurant
     - **Étude de Cas 3: Hôtel** - Système de réservation et gestion hôtelière
   - Chaque projet est lié au module Économie
   - Type : `case-study`
   - Catégorie : "Études de Cas"

### 4. **Création/Mise à jour de la Formation**
   - Crée ou met à jour la formation **"Projet clé en main"**
   - Assigne le module Économie à cette formation
   - Catégorie : "Économie"

## 📊 Structure Avant/Après

### ❌ AVANT (Structure actuelle)
```
- Module 1: Prospection Client
  └── Leçons du module 1
- Module 2: Définition des Besoins
  └── Leçons du module 2
- ...
- Module 10: Maintenance et Mise à Jour
  └── Leçons du module 10
```

### ✅ APRÈS (Nouvelle structure)
```
- Formation: Projet clé en main
  └── Module: Économie
      ├── Leçon 1: Prospection Client
      ├── Leçon 2: Définition des Besoins
      ├── ...
      └── Leçon 10: Maintenance et Mise à Jour

- Projets/Études de Cas:
  ├── Étude de Cas 1: Café
  ├── Étude de Cas 2: Restaurant
  └── Étude de Cas 3: Hôtel
```

## 🔧 Comment l'exécuter

### Option 1 : Via l'interface Admin
1. Connectez-vous en tant qu'admin
2. Allez sur le Dashboard Admin
3. Section "Réorganisation du Contenu"
4. Cliquez sur "Réorganiser le Contenu"
5. Confirmez l'action

### Option 2 : Via l'API
```bash
POST /api/admin/reorganize-content
Headers: Authorization: Bearer <admin_token>
```

### Option 3 : Via ligne de commande
```bash
node server/utils/reorganizeContent.js
```

## ⚠️ Points importants

1. **Les anciens modules ne sont PAS supprimés** - Ils restent dans la base de données mais ne sont plus utilisés dans la nouvelle structure
2. **Idempotent** - Le script peut être exécuté plusieurs fois sans créer de doublons
3. **Sécurisé** - Vérifie l'existence des utilisateurs (admin/teacher) avant de créer le contenu
4. **Assignation automatique** - Le contenu est assigné au teacher s'il existe, sinon à l'admin

## 📝 Résultat attendu

Après exécution, vous devriez avoir :
- ✅ 1 module "Économie" avec 10 leçons
- ✅ 3 projets d'études de cas
- ✅ 1 formation "Projet clé en main"
- ✅ Les anciens modules toujours présents (mais inactifs)

## 🔍 Vérification

Pour vérifier que tout s'est bien passé :
1. Allez dans "Modules" - Vous devriez voir le module "Économie"
2. Ouvrez le module - Vous devriez voir 10 leçons
3. Allez dans "Études de Cas/Projets" - Vous devriez voir les 3 études de cas
4. Vérifiez la formation "Projet clé en main"

