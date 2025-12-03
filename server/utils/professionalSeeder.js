const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Load env vars
dotenv.config();

// Only connect if not already connected (when running as script)
const connectIfNeeded = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle');
  }
};

/**
 * MODULE 1: PROSPECTION
 * Identifier et contacter les clients potentiels
 */
const module1 = {
  title: 'Module 1: Prospection Client',
  description: 'Apprenez à identifier, contacter et convertir des prospects en clients. Découvrez les techniques de prospection moderne et les outils essentiels.',
  caseStudyType: 'none',
  order: 1
};

const lessonsModule1 = [
  {
    title: '1.1 - Introduction à la Prospection',
    content: `# 🎯 Introduction à la Prospection

## 📚 Objectifs d'apprentissage
À la fin de cette leçon, vous serez capable de :
- ✅ Comprendre ce qu'est la prospection
- ✅ Identifier les différents types de prospects
- ✅ Connaître les objectifs de la prospection

## 🔍 Qu'est-ce que la Prospection ?

La **prospection** est l'action de rechercher et d'identifier de nouveaux clients potentiels pour votre activité.

### 📊 Les 3 Types de Prospects

1. **Prospect Froid** ❄️
   - Ne vous connaît pas
   - N'a pas exprimé de besoin
   - Nécessite une approche de sensibilisation

2. **Prospect Tiède** 🌤️
   - Vous connaît un peu
   - A un besoin potentiel
   - Nécessite une approche de qualification

3. **Prospect Chaud** 🔥
   - Vous connaît bien
   - A un besoin urgent
   - Prêt à acheter rapidement

## 🎯 Objectifs de la Prospection

| Objectif | Description | Indicateur |
|----------|-------------|------------|
| **Identifier** | Trouver des entreprises qui ont besoin de vos services | Nombre de prospects identifiés |
| **Qualifier** | Vérifier que le prospect correspond à votre cible | Taux de qualification |
| **Contacter** | Entrer en relation avec le prospect | Taux de réponse |
| **Convertir** | Transformer le prospect en client | Taux de conversion |

## 💡 Exemple Concret

**Scénario** : Vous êtes développeur freelance et vous cherchez des clients.

**Prospect Froid** : Une entreprise locale que vous découvrez sur Google Maps
**Prospect Tiède** : Une entreprise qui a visité votre site web
**Prospect Chaud** : Une entreprise qui vous a contacté directement

## 🎓 Points Clés à Retenir

> 💡 **Astuce Pro** : La prospection est un processus continu, pas un événement ponctuel. Planifiez des sessions régulières de prospection.

## ✅ Vérification des Connaissances

Avant de passer à la suite, assurez-vous de comprendre :
- [ ] La différence entre les 3 types de prospects
- [ ] Les 4 objectifs principaux de la prospection
- [ ] Pourquoi la prospection est importante pour votre activité

---
**Prochaine leçon** : Les Canaux de Prospection`,
    order: 1
  },
  {
    title: '1.2 - Les Canaux de Prospection',
    content: `# 📡 Les Canaux de Prospection

## 🎯 Objectifs
- Identifier les différents canaux de prospection
- Choisir les canaux adaptés à votre cible
- Optimiser votre présence sur chaque canal

## 🌐 Les 5 Canaux Principaux

### 1. LinkedIn 💼
**Pourquoi** : Réseau professionnel #1
**Comment** :
- Créez un profil professionnel complet
- Rejoignez des groupes de votre secteur
- Publiez du contenu de valeur
- Contactez directement les décideurs

**Exemple** :
\`\`\`
Message type sur LinkedIn :
"Bonjour [Nom],
J'ai remarqué que [Entreprise] cherche à [besoin identifié].
J'ai aidé des entreprises similaires à [résultat concret].
Seriez-vous ouvert à un échange de 15 minutes ?"
\`\`\`

### 2. Email Marketing 📧
**Pourquoi** : Contact direct et personnalisé
**Comment** :
- Construisez une base de données qualifiée
- Personnalisez chaque email
- Suivez les ouvertures et clics
- Automatisez les relances

**Template Email de Prospection** :
\`\`\`
Objet : [Solution] pour [Problème spécifique]

Bonjour [Nom],

J'ai remarqué que [Entreprise] [situation observée].

J'ai aidé [Entreprise similaire] à [résultat].

Seriez-vous intéressé par un échange de 15 minutes ?

Cordialement,
[Votre nom]
\`\`\`

### 3. Réseaux Sociaux 📱
**Pourquoi** : Visibilité et engagement
**Comment** :
- Twitter : Participez aux conversations de votre secteur
- Facebook : Rejoignez des groupes professionnels
- Instagram : Montrez vos réalisations
- TikTok : Créez du contenu éducatif

### 4. Événements et Networking 🤝
**Pourquoi** : Contact humain et confiance
**Comment** :
- Participez aux salons professionnels
- Assistez aux meetups tech
- Organisez vos propres événements
- Échangez des cartes de visite

### 5. Références et Partenariats 🤝
**Pourquoi** : Prospection la plus efficace
**Comment** :
- Demandez des recommandations à vos clients
- Créez des partenariats avec des complémentaires
- Rejoignez des programmes d'affiliation
- Participez à des communautés professionnelles

## 📊 Tableau Comparatif

| Canal | Coût | Efficacité | Temps | Meilleur Pour |
|-------|------|------------|-------|---------------|
| LinkedIn | Gratuit/Payant | ⭐⭐⭐⭐ | Moyen | B2B, Profils |
| Email | Gratuit | ⭐⭐⭐ | Faible | Suivi, Automatisation |
| Réseaux Sociaux | Gratuit | ⭐⭐ | Élevé | Visibilité, Branding |
| Événements | Payant | ⭐⭐⭐⭐⭐ | Élevé | Confiance, Relations |
| Références | Gratuit | ⭐⭐⭐⭐⭐ | Faible | Qualité, Conversion |

## 🎯 Stratégie Multi-Canal

**La meilleure approche** : Combinez plusieurs canaux !

**Exemple de workflow** :
1. Identifiez un prospect sur LinkedIn
2. Envoyez une demande de connexion personnalisée
3. Une fois connecté, envoyez un email de présentation
4. Suivez sur les réseaux sociaux
5. Proposez un appel découverte

## 💡 Checklist de Prospection

Avant de contacter un prospect, vérifiez :
- [ ] Vous avez identifié un besoin réel
- [ ] Vous connaissez le nom du décideur
- [ ] Vous avez personnalisé votre message
- [ ] Vous avez une proposition de valeur claire
- [ ] Vous avez préparé votre argumentaire

## ✅ Action Immédiate

**Cette semaine** :
1. Choisissez 2 canaux à tester
2. Identifiez 10 prospects sur chaque canal
3. Contactez-les avec un message personnalisé
4. Suivez les résultats

---
**Prochaine leçon** : Techniques de Prise de Contact`,
    order: 2
  },
  {
    title: '1.3 - Techniques de Prise de Contact',
    content: `# 📞 Techniques de Prise de Contact

## 🎯 Objectifs
- Maîtriser les techniques de premier contact
- Rédiger des messages percutants
- Augmenter votre taux de réponse

## 🎨 La Structure AIDA

**A**ttention → **I**ntérêt → **D**ésir → **A**ction

### Exemple d'Email avec AIDA

\`\`\`
Objet : Réduire vos coûts IT de 30% en 3 mois

Bonjour [Nom],

[ATTENTION] Savez-vous que 70% des entreprises 
surpayent leurs services IT ?

[INTÉRÊT] J'ai analysé votre secteur et j'ai 
identifié 3 opportunités d'optimisation.

[DÉSIR] Mes clients économisent en moyenne 30% 
sur leurs coûts IT tout en améliorant leurs performances.

[ACTION] Seriez-vous disponible pour un appel 
de 15 minutes cette semaine ?

Cordialement,
[Votre nom]
\`\`\`

## 📝 Les 5 Règles d'Or

### 1. Personnalisation Extrême 🎯
❌ **Mauvais** : "Bonjour, je vous contacte pour..."
✅ **Bon** : "Bonjour [Nom], j'ai vu que [Entreprise] vient de [événement récent]..."

### 2. Bénéfice Immédiat 💎
❌ **Mauvais** : "Je propose des services de développement"
✅ **Bon** : "J'aide les entreprises à réduire leurs coûts de 30%"

### 3. Call-to-Action Clair 🎯
❌ **Mauvais** : "Contactez-moi si intéressé"
✅ **Bon** : "Disponible pour un appel de 15 minutes mardi à 14h ?"

### 4. Preuve Sociale 📊
❌ **Mauvais** : "J'ai de l'expérience"
✅ **Bon** : "J'ai aidé [Entreprise] à [résultat concret avec chiffre]"

### 5. Urgence et Rareté ⏰
❌ **Mauvais** : "Quand vous voulez"
✅ **Bon** : "J'ai 3 créneaux disponibles cette semaine"

## 📧 Templates de Messages

### Template 1 : Email Froid
\`\`\`
Objet : [Solution] pour [Problème] - [Entreprise]

Bonjour [Nom],

Je développe des solutions [domaine] pour des entreprises 
comme [Entreprise similaire].

J'ai remarqué que [Entreprise] [situation observée].

J'ai aidé [Entreprise] à [résultat avec chiffre].

Seriez-vous ouvert à un échange de 15 minutes pour 
découvrir comment [bénéfice] ?

Disponible [jours/heures].

Cordialement,
[Votre nom]
[Votre site/LinkedIn]
\`\`\`

### Template 2 : LinkedIn Message
\`\`\`
Bonjour [Nom],

J'ai vu votre post sur [sujet]. Excellent point sur [détail] !

Je travaille avec des entreprises de votre secteur 
sur [domaine].

J'ai aidé [Entreprise] à [résultat].

Auriez-vous 15 minutes pour un échange cette semaine ?

Bonne journée,
[Votre nom]
\`\`\`

### Template 3 : Suivi après Non-Réponse
\`\`\`
Objet : RE: [Sujet précédent] - Une dernière tentative

Bonjour [Nom],

Je comprends que vous êtes très occupé.

Si ce n'est pas le bon moment, pas de problème.

Je reste disponible si vous souhaitez discuter de 
[problème spécifique] à l'avenir.

Bonne continuation,
[Votre nom]

PS : Si vous préférez ne plus recevoir mes emails, 
dites-le moi et je vous retire de ma liste.
\`\`\`

## 📊 Taux de Réponse Attendus

| Type de Contact | Taux de Réponse | Objectif |
|-----------------|-----------------|----------|
| Email Froid | 1-3% | Acceptable |
| Email Tiède | 5-10% | Bon |
| Email Chaud | 15-25% | Excellent |
| LinkedIn | 2-5% | Acceptable |
| Appel Téléphonique | 10-20% | Bon |

## ⚠️ Erreurs à Éviter

1. **Messages trop longs** ❌
   - Maximum 150 mots
   - 3 paragraphes max

2. **Manque de personnalisation** ❌
   - Toujours mentionner l'entreprise
   - Référencez un élément spécifique

3. **Pas de CTA clair** ❌
   - Toujours proposer une action concrète
   - Donnez des créneaux précis

4. **Trop de relances** ❌
   - Maximum 3 relances
   - Espacez de 3-5 jours

5. **Négliger le suivi** ❌
   - Suivez chaque contact
   - Notez les réponses dans un CRM

## 🎓 Exercice Pratique

**Mission** : Rédigez un email de prospection pour un prospect que vous avez identifié.

**Critères d'évaluation** :
- [ ] Personnalisation (mention de l'entreprise)
- [ ] Bénéfice clair
- [ ] Preuve sociale
- [ ] CTA précis
- [ ] Longueur < 150 mots

## ✅ Checklist de Contact

Avant d'envoyer votre message :
- [ ] J'ai personnalisé le message
- [ ] J'ai identifié un besoin réel
- [ ] J'ai un bénéfice clair à proposer
- [ ] J'ai une preuve sociale
- [ ] J'ai un CTA précis avec créneaux
- [ ] J'ai relu pour les fautes
- [ ] J'ai vérifié les liens

---
**Prochaine leçon** : Qualification des Prospects`,
    order: 3
  }
];

/**
 * MODULE 2: DÉFINITION DES BESOINS
 */
const module2 = {
  title: 'Module 2: Définition des Besoins',
  description: 'Apprenez à identifier, analyser et documenter les besoins réels de vos clients. Maîtrisez les techniques d\'écoute active et de questionnement.',
  caseStudyType: 'none',
  order: 2
};

const lessonsModule2 = [
  {
    title: '2.1 - L\'Écoute Active',
    content: `# 👂 L'Écoute Active

## 🎯 Objectifs
- Comprendre l'importance de l'écoute active
- Maîtriser les techniques d'écoute
- Identifier les besoins cachés

## 🧠 Qu'est-ce que l'Écoute Active ?

L'**écoute active** est la capacité à comprendre non seulement ce que dit votre interlocuteur, mais aussi ce qu'il ne dit pas explicitement.

### 📊 Écoute Passive vs Active

| Écoute Passive | Écoute Active |
|----------------|---------------|
| Entendre les mots | Comprendre le sens |
| Attendre son tour | Poser des questions |
| Juger rapidement | Suspendre le jugement |
| Préparer sa réponse | Se concentrer sur l'autre |

## 🎯 Les 5 Techniques d'Écoute Active

### 1. Reformulation 🔄
**Définition** : Répéter avec vos propres mots ce que vous avez compris.

**Exemple** :
- Client : "Notre système est lent"
- Vous : "Si je comprends bien, vous rencontrez des problèmes de performance avec votre système actuel ?"

### 2. Questionnement Ouvert ❓
**Définition** : Poser des questions qui encouragent l'explication.

**Questions à utiliser** :
- "Comment cela se manifeste-t-il concrètement ?"
- "Quelles sont les conséquences pour votre équipe ?"
- "Qu'est-ce qui vous préoccupe le plus ?"
- "Pouvez-vous me donner un exemple ?"

### 3. Clarification 🔍
**Définition** : Demander des précisions sur des points flous.

**Exemple** :
- "Quand vous dites 'souvent', pouvez-vous être plus précis ?"
- "Qu'entendez-vous exactement par 'problème' ?"

### 4. Validation ✅
**Définition** : Confirmer que vous avez bien compris.

**Exemple** :
- "Est-ce que j'ai bien compris que... ?"
- "Laissez-moi vérifier ma compréhension..."

### 5. Empathie 💙
**Définition** : Reconnaître les émotions de votre interlocuteur.

**Exemple** :
- "Je comprends que cela doit être frustrant"
- "Je vois que c'est important pour vous"

## 📝 Le Processus d'Écoute Active

\`\`\`
1. ÉCOUTER sans interrompre
   ↓
2. NOTER les points clés
   ↓
3. REFORMULER pour vérifier
   ↓
4. QUESTIONNER pour approfondir
   ↓
5. SYNTHÉTISER votre compréhension
\`\`\`

## 🎯 Les 3 Niveaux de Besoins

### Niveau 1 : Besoin Exprimé 🗣️
**Ce que le client dit** :
- "Je veux un site web"
- "J'ai besoin d'une application mobile"

### Niveau 2 : Besoin Réel 🎯
**Ce que le client veut vraiment** :
- "Je veux augmenter mes ventes en ligne"
- "Je veux améliorer l'expérience client"

### Niveau 3 : Besoin Caché 🔍
**Ce que le client ne dit pas** :
- "Je veux être plus compétitif"
- "Je veux impressionner mes investisseurs"
- "Je veux réduire mes coûts opérationnels"

## 💡 Exemple Concret

**Client** : "Je veux un site web"

**Questions d'écoute active** :
1. "Qu'est-ce qui vous pousse à vouloir un site web maintenant ?" (Besoin caché)
2. "Quels sont vos objectifs avec ce site web ?" (Besoin réel)
3. "Comment mesurez-vous le succès d'un site web ?" (Critères)
4. "Qu'est-ce qui vous a déçu dans vos expériences précédentes ?" (Problèmes passés)

**Résultat** : Vous découvrez que le client veut en fait :
- Augmenter ses ventes de 30% (besoin réel)
- Être présent sur mobile (besoin caché)
- Automatiser ses commandes (besoin caché)

## ⚠️ Erreurs à Éviter

1. **Interrompre** ❌
   - Laissez le client finir ses phrases
   - Prenez des notes si nécessaire

2. **Préparer sa réponse** ❌
   - Concentrez-vous sur l'écoute
   - La réponse viendra après

3. **Juger trop vite** ❌
   - Suspendre votre jugement
   - Cherchez à comprendre avant de juger

4. **Multi-tâches** ❌
   - Pas de téléphone pendant l'entretien
   - Regardez votre interlocuteur

5. **Donner des solutions trop tôt** ❌
   - Comprenez d'abord le problème
   - Proposez ensuite des solutions

## 🎓 Exercice Pratique

**Scénario** : Un client vous dit "Je veux moderniser mon système"

**Mission** : Utilisez l'écoute active pour découvrir :
- Le besoin réel
- Le besoin caché
- Les contraintes
- Les critères de succès

**Questions à préparer** :
1. _________________________________
2. _________________________________
3. _________________________________
4. _________________________________

## ✅ Checklist d'Écoute Active

Pendant votre entretien :
- [ ] J'écoute sans interrompre
- [ ] Je prends des notes
- [ ] Je reformule régulièrement
- [ ] Je pose des questions ouvertes
- [ ] Je cherche les besoins cachés
- [ ] Je valide ma compréhension
- [ ] Je montre de l'empathie

---
**Prochaine leçon** : Techniques de Questionnement`,
    order: 1
  },
  {
    title: '2.2 - Techniques de Questionnement',
    content: `# ❓ Techniques de Questionnement

## 🎯 Objectifs
- Maîtriser les différents types de questions
- Construire un questionnaire efficace
- Découvrir les besoins cachés

## 🔍 Les 5 Types de Questions

### 1. Questions Ouvertes 🌐
**Objectif** : Obtenir des informations détaillées

**Mots-clés** : Comment, Pourquoi, Quoi, Qui, Quand, Où

**Exemples** :
- "Comment gérez-vous actuellement ce processus ?"
- "Pourquoi est-ce important pour vous ?"
- "Quels sont vos principaux défis ?"

**Quand les utiliser** : Début d'entretien, exploration

### 2. Questions Fermées ✅
**Objectif** : Obtenir une confirmation ou un choix

**Mots-clés** : Est-ce que, Avez-vous, Êtes-vous

**Exemples** :
- "Avez-vous déjà utilisé une solution similaire ?"
- "Est-ce que le budget est validé ?"
- "Êtes-vous le décideur final ?"

**Quand les utiliser** : Validation, clarification rapide

### 3. Questions Hypothétiques 🤔
**Objectif** : Explorer des scénarios futurs

**Mots-clés** : Si, Imaginez, Supposons

**Exemples** :
- "Si vous aviez une solution parfaite, à quoi ressemblerait-elle ?"
- "Imaginez que le problème soit résolu, que changerait cela ?"
- "Supposons que vous ayez un budget illimité, que feriez-vous ?"

**Quand les utiliser** : Identifier les besoins idéaux

### 4. Questions de Clarification 🔍
**Objectif** : Approfondir un point spécifique

**Mots-clés** : Pouvez-vous préciser, Que voulez-vous dire par

**Exemples** :
- "Pouvez-vous être plus précis sur 'souvent' ?"
- "Que voulez-vous dire exactement par 'problème' ?"
- "Pouvez-vous me donner un exemple concret ?"

**Quand les utiliser** : Quand quelque chose n'est pas clair

### 5. Questions de Validation ✅
**Objectif** : Confirmer votre compréhension

**Mots-clés** : Si je comprends bien, Est-ce que j'ai raison de penser

**Exemples** :
- "Si je comprends bien, votre principal défi est... ?"
- "Est-ce que j'ai raison de penser que... ?"
- "Laissez-moi vérifier ma compréhension..."

**Quand les utiliser** : Après avoir écouté, avant de proposer

## 📋 Le Questionnaire BANT

**B**udget → **A**utorité → **N**eed → **T**imeline

### B - Budget 💰
**Questions** :
- "Quel est votre budget pour ce projet ?"
- "Avez-vous un budget alloué ?"
- "Quel serait votre investissement idéal ?"

**Objectif** : Vérifier la capacité financière

### A - Autorité 👔
**Questions** :
- "Qui prend la décision finale ?"
- "Êtes-vous le décideur ?"
- "Qui d'autre est impliqué dans la décision ?"

**Objectif** : Identifier le décideur

### N - Need 🎯
**Questions** :
- "Quel est votre besoin principal ?"
- "Quel problème cherchez-vous à résoudre ?"
- "Quelles sont les conséquences si vous ne faites rien ?"

**Objectif** : Comprendre le besoin réel

### T - Timeline ⏰
**Questions** :
- "Quand souhaitez-vous démarrer ?"
- "Quelle est votre échéance ?"
- "Y a-t-il une urgence ?"

**Objectif** : Définir les délais

## 🎯 Le Questionnaire STAR

**S**ituation → **T**âche → **A**ction → **R**ésultat

### S - Situation 📍
"Pouvez-vous me décrire la situation actuelle ?"

### T - Tâche 🎯
"Quelle est la tâche ou l'objectif à accomplir ?"

### A - Action ⚡
"Quelles actions avez-vous déjà tentées ?"

### R - Résultat 📊
"Quel résultat souhaitez-vous obtenir ?"

## 💡 Exemple d'Entretien Complet

**Vous** : "Bonjour, merci pour votre temps. Pour commencer, pouvez-vous me décrire votre situation actuelle ?" (Question ouverte)

**Client** : "Nous utilisons un système ancien qui ne répond plus à nos besoins."

**Vous** : "Je comprends. Pouvez-vous être plus précis sur 'ne répond plus' ? Qu'est-ce qui ne fonctionne plus exactement ?" (Question de clarification)

**Client** : "Il est lent, les données sont parfois perdues, et l'interface est dépassée."

**Vous** : "Quelles sont les conséquences concrètes pour votre équipe ?" (Question ouverte)

**Client** : "Nous perdons du temps, nos clients se plaignent, et nous risquons de perdre des contrats."

**Vous** : "Si je comprends bien, vous avez un problème urgent qui impacte votre business ?" (Question de validation)

**Client** : "Exactement."

**Vous** : "Quel serait votre scénario idéal si ce problème était résolu ?" (Question hypothétique)

**Client** : "Un système rapide, fiable, et moderne qui nous permettrait de gagner du temps et de satisfaire nos clients."

**Vous** : "Parfait. Avez-vous un budget alloué pour ce projet ?" (Question fermée - BANT)

**Client** : "Oui, nous avons prévu 50 000€."

**Vous** : "Qui prend la décision finale pour ce projet ?" (Question fermée - BANT)

**Client** : "C'est moi, avec validation du directeur."

**Vous** : "Quand souhaitez-vous démarrer ?" (Question fermée - BANT)

**Client** : "Dès que possible, idéalement dans le mois."

## 📊 Grille d'Analyse des Réponses

Pour chaque réponse, analysez :
- **Besoin exprimé** : Ce que le client dit
- **Besoin réel** : Ce qu'il veut vraiment
- **Besoin caché** : Ce qu'il ne dit pas
- **Urgence** : Niveau d'urgence (1-5)
- **Budget** : Capacité financière
- **Autorité** : Pouvoir de décision

## ⚠️ Erreurs à Éviter

1. **Trop de questions fermées** ❌
   - Commencez par des questions ouvertes
   - Utilisez les fermées pour valider

2. **Questions suggestives** ❌
   - "Vous voulez bien un système moderne, n'est-ce pas ?"
   - Laissez le client exprimer ses besoins

3. **Interroger sans écouter** ❌
   - Écoutez les réponses avant la prochaine question
   - Adaptez vos questions aux réponses

4. **Questions trop techniques** ❌
   - Adaptez votre langage au client
   - Évitez le jargon technique

5. **Oublier de noter** ❌
   - Prenez des notes pendant l'entretien
   - Vous ne vous souviendrez pas de tout

## 🎓 Exercice Pratique

**Mission** : Créez un questionnaire pour découvrir les besoins d'un client qui veut "moderniser son système".

**Structure** :
1. Question d'ouverture (ouverte)
2. Question de clarification (clarification)
3. Question sur le besoin (ouverte)
4. Question hypothétique (hypothétique)
5. Questions BANT (fermées)
6. Question de validation (validation)

## ✅ Checklist de Questionnement

Avant votre entretien :
- [ ] J'ai préparé mes questions d'ouverture
- [ ] J'ai préparé mes questions BANT
- [ ] J'ai préparé mes questions de clarification
- [ ] J'ai un support pour noter
- [ ] Je sais adapter mes questions aux réponses

Pendant l'entretien :
- [ ] Je commence par des questions ouvertes
- [ ] J'écoute avant de questionner
- [ ] Je clarifie les points flous
- [ ] Je valide ma compréhension
- [ ] Je note les informations importantes

---
**Prochaine leçon** : Documentation des Besoins`,
    order: 2
  },
  {
    title: '2.3 - Documentation des Besoins',
    content: `# 📝 Documentation des Besoins

## 🎯 Objectifs
- Créer une documentation claire et complète
- Structurer les besoins de manière professionnelle
- Éviter les malentendus futurs

## 📋 Le Cahier des Charges (CDC)

Le **Cahier des Charges** est le document de référence qui décrit tous les besoins et contraintes du projet.

### Structure d'un CDC Complet

\`\`\`
1. CONTEXTE ET OBJECTIFS
   - Présentation du client
   - Objectifs du projet
   - Contexte métier

2. BESOINS FONCTIONNELS
   - Liste des fonctionnalités
   - Priorités
   - Cas d'usage

3. BESOINS TECHNIQUES
   - Contraintes techniques
   - Environnement cible
   - Intégrations

4. CONTRAINTES
   - Budget
   - Délais
   - Ressources

5. CRITÈRES DE SUCCÈS
   - Indicateurs de performance
   - Objectifs mesurables
\`\`\`

## 🎨 Template de Documentation

### Section 1 : Contexte

**Client** : [Nom de l'entreprise]
**Projet** : [Nom du projet]
**Date** : [Date]
**Version** : 1.0

**Objectif Principal** :
[Description claire en 1-2 phrases]

**Contexte Métier** :
[Pourquoi ce projet est nécessaire]

### Section 2 : Besoins Fonctionnels

| ID | Fonctionnalité | Priorité | Description | Critères d'Acceptation |
|----|----------------|----------|-------------|------------------------|
| F1 | [Nom] | Haute | [Description] | [Critères] |
| F2 | [Nom] | Moyenne | [Description] | [Critères] |

**Priorités** :
- 🔴 **Haute** : Essentiel pour le projet
- 🟡 **Moyenne** : Important mais peut être reporté
- 🟢 **Basse** : Souhaitable mais non critique

### Section 3 : Besoins Techniques

**Environnement Cible** :
- Plateforme : [Web/Mobile/Desktop]
- Navigateurs : [Liste]
- Appareils : [Liste]

**Contraintes Techniques** :
- Performance : [Exigences]
- Sécurité : [Exigences]
- Compatibilité : [Exigences]

**Intégrations** :
- [Système 1] : [Description]
- [Système 2] : [Description]

### Section 4 : Contraintes

**Budget** : [Montant ou fourchette]
**Délai** : [Date de livraison souhaitée]
**Ressources** : [Équipe disponible]

### Section 5 : Critères de Succès

**Objectifs Mesurables** :
- [ ] Objectif 1 : [Métrique]
- [ ] Objectif 2 : [Métrique]
- [ ] Objectif 3 : [Métrique]

## 💡 Exemple Concret

**Projet** : Application de gestion de commandes pour restaurant

**Besoins Fonctionnels** :
1. **F1 - Prise de commande** (Priorité: Haute)
   - Description : Permettre aux serveurs de prendre des commandes via tablette
   - Critères : Commande enregistrée en < 30 secondes

2. **F2 - Gestion du menu** (Priorité: Haute)
   - Description : Permettre la modification du menu en temps réel
   - Critères : Mise à jour visible immédiatement

3. **F3 - Statistiques** (Priorité: Moyenne)
   - Description : Afficher les statistiques de vente
   - Critères : Données mises à jour quotidiennement

**Besoins Techniques** :
- Plateforme : Web (responsive)
- Navigateurs : Chrome, Safari, Firefox (dernières versions)
- Performance : Chargement < 2 secondes
- Intégration : Système de paiement Stripe

**Contraintes** :
- Budget : 15 000€
- Délai : 3 mois
- Équipe : 2 développeurs

**Critères de Succès** :
- Réduction de 50% du temps de prise de commande
- Satisfaction client > 4/5
- Disponibilité > 99%

## ⚠️ Erreurs à Éviter

1. **Documentation trop vague** ❌
   - "L'application doit être rapide"
   - ✅ "L'application doit charger en < 2 secondes"

2. **Oublier les contraintes** ❌
   - Documenter seulement les fonctionnalités
   - ✅ Inclure budget, délais, ressources

3. **Pas de validation client** ❌
   - Créer le CDC seul
   - ✅ Faire valider chaque section par le client

4. **Documentation non maintenue** ❌
   - Créer et oublier
   - ✅ Mettre à jour régulièrement

5. **Jargon technique excessif** ❌
   - Utiliser des termes techniques
   - ✅ Adapter le langage au client

## 🎓 Exercice Pratique

**Mission** : Créez un cahier des charges pour un projet de votre choix.

**Structure à suivre** :
1. Contexte et objectifs
2. 5 besoins fonctionnels minimum
3. Besoins techniques
4. Contraintes
5. Critères de succès

## ✅ Checklist de Documentation

Avant de finaliser votre documentation :
- [ ] Tous les besoins sont documentés
- [ ] Les priorités sont définies
- [ ] Les contraintes sont claires
- [ ] Les critères de succès sont mesurables
- [ ] Le client a validé le document
- [ ] Le document est à jour

---
**Prochaine leçon** : Validation avec le Client`,
    order: 3
  },
  {
    title: '2.4 - Validation avec le Client',
    content: `# ✅ Validation avec le Client

## 🎯 Objectifs
- Présenter efficacement votre documentation
- Obtenir la validation du client
- Gérer les retours et modifications

## 📊 Le Processus de Validation

\`\`\`
1. PRÉPARATION
   ↓
2. PRÉSENTATION
   ↓
3. DISCUSSION
   ↓
4. MODIFICATIONS
   ↓
5. VALIDATION FINALE
\`\`\`

## 🎯 Étape 1 : Préparation

### Avant la Réunion

**Checklist de Préparation** :
- [ ] Documentation complète et relue
- [ ] Support de présentation préparé
- [ ] Questions anticipées identifiées
- [ ] Alternatives préparées
- [ ] Ordre du jour défini

**Support de Présentation** :
- Résumé exécutif (1 page)
- Besoins principaux (diapositives)
- Exemples visuels
- Planning prévisionnel

## 🎤 Étape 2 : Présentation

### Structure de Présentation

**1. Introduction (5 min)**
- Rappel du contexte
- Objectifs de la réunion
- Ordre du jour

**2. Synthèse des Besoins (10 min)**
- Besoins identifiés
- Priorités
- Exemples concrets

**3. Proposition de Solution (15 min)**
- Approche proposée
- Fonctionnalités principales
- Planning prévisionnel

**4. Questions et Discussion (20 min)**
- Réponses aux questions
- Clarifications
- Ajustements

**5. Prochaines Étapes (5 min)**
- Actions à suivre
- Délais de validation
- Prochaine réunion

### Techniques de Présentation

**1. Storytelling** 📖
- Racontez l'histoire du projet
- Utilisez des exemples concrets
- Créez une vision claire

**2. Visualisation** 🎨
- Schémas et diagrammes
- Mockups et wireframes
- Exemples visuels

**3. Interaction** 💬
- Posez des questions
- Vérifiez la compréhension
- Encouragez les retours

## 💬 Étape 3 : Discussion

### Gérer les Questions

**Types de Questions** :

1. **Questions de Clarification** 🔍
   - "Pouvez-vous préciser... ?"
   - Réponse : Reformulez et clarifiez

2. **Questions de Doute** ❓
   - "Est-ce que cela va fonctionner ?"
   - Réponse : Rassurez avec des exemples

3. **Questions de Contrainte** ⚠️
   - "Et si le budget change ?"
   - Réponse : Proposez des alternatives

4. **Questions Hostiles** 😠
   - "Pourquoi c'est si cher ?"
   - Réponse : Restez calme, expliquez la valeur

### Techniques de Réponse

**Méthode STAR** :
- **S**ituation : Contexte de la question
- **T**âche : Ce qui est demandé
- **A**ction : Ce que vous proposez
- **R**ésultat : Bénéfice attendu

## 🔄 Étape 4 : Modifications

### Gérer les Retours

**Types de Modifications** :

1. **Modifications Majeures** 🔴
   - Impact sur le budget/délai
   - Nécessite une réévaluation
   - Action : Documenter et proposer un avenant

2. **Modifications Mineures** 🟡
   - Ajustements simples
   - Pas d'impact majeur
   - Action : Intégrer directement

3. **Nouvelles Demandes** 🟢
   - Fonctionnalités supplémentaires
   - Impact à évaluer
   - Action : Proposer en phase 2

### Processus de Modification

\`\`\`
1. ÉCOUTER le retour
   ↓
2. COMPRENDRE le besoin réel
   ↓
3. ÉVALUER l'impact
   ↓
4. PROPOSER une solution
   ↓
5. DOCUMENTER la modification
\`\`\`

## ✅ Étape 5 : Validation Finale

### Obtenir la Validation

**Document de Validation** :

\`\`\`
CAHIER DES CHARGES - VALIDATION

Projet : [Nom]
Date : [Date]
Version : [Version]

BESOINS VALIDÉS :
- [ ] Section 1 : Contexte et Objectifs
- [ ] Section 2 : Besoins Fonctionnels
- [ ] Section 3 : Besoins Techniques
- [ ] Section 4 : Contraintes
- [ ] Section 5 : Critères de Succès

MODIFICATIONS APPORTÉES :
[Liste des modifications]

VALIDATION :
Nom : ________________
Signature : ________________
Date : ________________
\`\`\`

### Après la Validation

**Actions Immédiates** :
1. Envoyer le document validé par email
2. Archiver la version validée
3. Informer l'équipe
4. Planifier la prochaine étape

## 💡 Exemple de Réunion

**Scénario** : Validation du CDC pour une application e-commerce

**Vous** : "Bonjour, merci d'être là. Aujourd'hui, nous allons valider ensemble le cahier des charges de votre projet e-commerce."

**Présentation** : Vous présentez les 5 besoins fonctionnels principaux avec des exemples visuels.

**Client** : "Pour la fonctionnalité de paiement, pouvez-vous ajouter PayPal ?"

**Vous** : "Excellente question. PayPal est tout à fait possible. Cela ajoutera environ 2 jours de développement. Voulez-vous que je l'intègre dans le périmètre initial ou en phase 2 ?"

**Client** : "Dans le périmètre initial, c'est important pour nous."

**Vous** : "Parfait, je vais mettre à jour le document avec cette modification. Avez-vous d'autres questions ?"

**Validation** : Le client signe le document validé.

## ⚠️ Erreurs à Éviter

1. **Présenter sans préparation** ❌
   - Arriver sans support
   - ✅ Préparer une présentation claire

2. **Ignorer les retours** ❌
   - Ne pas écouter les objections
   - ✅ Prendre en compte tous les retours

3. **Valider trop vite** ❌
   - Accepter sans discussion
   - ✅ S'assurer de la compréhension

4. **Pas de trace écrite** ❌
   - Validation verbale uniquement
   - ✅ Toujours avoir une validation écrite

5. **Oublier les modifications** ❌
   - Ne pas documenter les changements
   - ✅ Mettre à jour le document

## 🎓 Exercice Pratique

**Mission** : Organisez une réunion de validation fictive.

**Étapes** :
1. Préparez un support de présentation
2. Simulez la présentation (5 min)
3. Anticipez 3 questions possibles
4. Préparez vos réponses
5. Créez un document de validation

## ✅ Checklist de Validation

Avant la réunion :
- [ ] Documentation complète
- [ ] Support de présentation
- [ ] Questions anticipées
- [ ] Document de validation préparé

Pendant la réunion :
- [ ] Présentation claire
- [ ] Écoute active
- [ ] Réponses aux questions
- [ ] Prise de notes

Après la réunion :
- [ ] Document mis à jour
- [ ] Validation obtenue
- [ ] Équipe informée
- [ ] Prochaine étape planifiée

---
**Fin du Module 2**`,
    order: 4
  }
];

/**
 * MODULE 3: NÉGOCIATION
 */
const module3 = {
  title: 'Module 3: Négociation Commerciale',
  description: 'Maîtrisez l\'art de la négociation commerciale. Apprenez à défendre vos prix, gérer les objections et conclure des accords gagnant-gagnant.',
  caseStudyType: 'none',
  order: 3
};

const lessonsModule3 = [
  {
    title: '3.1 - Principes de la Négociation',
    content: `# 💼 Principes de la Négociation

## 🎯 Objectifs
- Comprendre les fondamentaux de la négociation
- Identifier les différents types de négociation
- Maîtriser les techniques de base

## 🧠 Qu'est-ce que la Négociation ?

La **négociation** est un processus de discussion visant à trouver un accord mutuellement acceptable entre deux parties.

### 📊 Les 2 Types de Négociation

**1. Négociation Distributive (Gagnant-Perdu)** ⚔️
- Ressources limitées à partager
- Chaque gain de l'un = perte de l'autre
- Exemple : Négociation de prix fixe

**2. Négociation Intégrative (Gagnant-Gagnant)** 🤝
- Création de valeur pour les deux parties
- Recherche de solutions mutuellement bénéfiques
- Exemple : Négociation avec options multiples

## 🎯 Les 5 Principes Fondamentaux

### 1. Préparation 📋
**Avant la négociation** :
- Connaissez votre objectif minimum (walk-away point)
- Identifiez les besoins de l'autre partie
- Préparez vos arguments
- Anticipez les objections

**Checklist de Préparation** :
- [ ] Objectif minimum défini
- [ ] Objectif idéal défini
- [ ] Arguments préparés
- [ ] Alternatives identifiées
- [ ] Informations sur le client

### 2. Écoute Active 👂
- Comprenez les besoins réels
- Identifiez les points de flexibilité
- Détectez les signaux non verbaux

### 3. Création de Valeur 💎
- Cherchez des solutions créatives
- Proposez des options multiples
- Trouvez des bénéfices mutuels

### 4. Patience et Calme 😌
- Ne vous précipitez pas
- Laissez l'autre parler
- Prenez le temps de réfléchir

### 5. Relation Long Terme 🤝
- Pensez au-delà de cette négociation
- Construisez la confiance
- Préservez la relation

## 💰 La Zone d'Accord Possible (ZOPA)

La **ZOPA** (Zone of Possible Agreement) est la plage où un accord est possible.

**Exemple** :
- Votre prix minimum : 10 000€
- Votre prix idéal : 15 000€
- Budget client maximum : 12 000€
- Budget client idéal : 8 000€

**ZOPA** : Entre 10 000€ et 12 000€

## 🎯 Stratégies de Négociation

### Stratégie 1 : Anchoring (Ancrage) ⚓
**Principe** : Le premier prix mentionné influence la négociation.

**Technique** :
- Mentionnez d'abord votre prix idéal
- Justifiez avec la valeur apportée
- Laissez le client négocier depuis ce point

**Exemple** :
- Vous : "Pour ce projet, je propose 15 000€"
- Client : "C'est trop cher"
- Vous : "Je comprends. Sur quels éléments pouvez-vous être flexible ?"

### Stratégie 2 : Concession Graduelle 📉
**Principe** : Faites des concessions de plus en plus petites.

**Technique** :
- Première concession : 5%
- Deuxième concession : 3%
- Troisième concession : 1%
- Dernière concession : 0.5%

**Message** : "Je m'approche de ma limite"

### Stratégie 3 : Package Deal 📦
**Principe** : Liez plusieurs éléments ensemble.

**Exemple** :
- "Si vous prenez aussi la maintenance, je peux réduire le prix de 10%"
- "Pour ce prix, j'inclus aussi la formation"

## 💡 Exemple Concret

**Scénario** : Négociation d'un projet de 15 000€

**Préparation** :
- Prix minimum : 12 000€
- Prix idéal : 15 000€
- Alternatives : Maintenance incluse, paiement échelonné

**Négociation** :
1. Vous proposez : 15 000€ (anchoring)
2. Client : "C'est trop cher, mon budget est de 10 000€"
3. Vous : "Je comprends. Pour 12 000€, je peux inclure la maintenance la première année"
4. Client : "11 000€ maximum"
5. Vous : "À 11 500€ avec paiement en 3 fois, c'est possible"
6. Accord : 11 500€ avec paiement échelonné

## ⚠️ Erreurs à Éviter

1. **Céder trop vite** ❌
   - Accepter la première offre
   - ✅ Toujours négocier

2. **Être rigide** ❌
   - Refuser toute flexibilité
   - ✅ Proposer des alternatives

3. **Négliger la relation** ❌
   - Se concentrer uniquement sur le prix
   - ✅ Penser long terme

4. **Manquer de préparation** ❌
   - Arriver sans objectifs clairs
   - ✅ Préparer chaque négociation

5. **Oublier la valeur** ❌
   - Se concentrer sur le prix uniquement
   - ✅ Mettre en avant la valeur

## ✅ Checklist de Négociation

Avant :
- [ ] Objectifs définis (min/ideal)
- [ ] Arguments préparés
- [ ] Alternatives identifiées
- [ ] Informations sur le client

Pendant :
- [ ] Écoute active
- [ ] Questions posées
- [ ] Valeur mise en avant
- [ ] Concessions graduelles

Après :
- [ ] Accord documenté
- [ ] Prochaines étapes définies
- [ ] Relation préservée

---
**Prochaine leçon** : Gérer les Objections`,
    order: 1
  },
  {
    title: '3.2 - Gérer les Objections',
    content: `# 🛡️ Gérer les Objections

## 🎯 Objectifs
- Identifier les types d'objections
- Maîtriser les techniques de réponse
- Transformer les objections en opportunités

## 🎯 Les 5 Types d'Objections

### 1. Objection de Prix 💰
**Exemple** : "C'est trop cher"

**Causes possibles** :
- Budget réellement limité
- Manque de perception de la valeur
- Comparaison avec d'autres offres
- Technique de négociation

### 2. Objection de Besoin 🤔
**Exemple** : "Je ne suis pas sûr d'en avoir besoin"

**Causes possibles** :
- Besoin non identifié
- Manque d'urgence
- Doute sur la solution

### 3. Objection d'Autorité 👔
**Exemple** : "Je dois en parler à mon supérieur"

**Causes possibles** :
- Vraie nécessité de validation
- Technique de report
- Manque de pouvoir décisionnel

### 4. Objection de Confiance 😟
**Exemple** : "Comment puis-je vous faire confiance ?"

**Causes possibles** :
- Manque de preuves
- Expériences négatives passées
- Nouvelle relation

### 5. Objection de Timing ⏰
**Exemple** : "Ce n'est pas le bon moment"

**Causes possibles** :
- Vraie contrainte de timing
- Manque d'urgence perçue
- Priorités concurrentes

## 🎯 Technique LAER pour Répondre

**L**isten → **A**cknowledge → **E**xplore → **R**espond

### Étape 1 : Listen (Écouter) 👂
- Laissez le client finir
- Ne coupez pas
- Prenez des notes

### Étape 2 : Acknowledge (Reconnaître) ✅
- Montrez que vous comprenez
- Validez leur préoccupation
- Ne minimisez pas

**Exemples** :
- "Je comprends votre préoccupation"
- "C'est une question légitime"
- "Beaucoup de clients me posent cette question"

### Étape 3 : Explore (Explorer) 🔍
- Posez des questions pour comprendre
- Identifiez la cause réelle
- Qualifiez l'objection

**Questions** :
- "Qu'est-ce qui vous préoccupe exactement ?"
- "Avez-vous eu une mauvaise expérience ?"
- "Quel serait le bon moment pour vous ?"

### Étape 4 : Respond (Répondre) 💬
- Répondez avec des faits
- Utilisez des exemples
- Proposez des solutions

## 💡 Réponses aux Objections Courantes

### Objection : "C'est trop cher" 💰

**Réponse Type** :
\`\`\`
"Je comprends que le budget est important pour vous.

[EXPLORER] Pourriez-vous me dire ce qui vous semble cher 
par rapport à quoi vous comparez ?

[RÉPONDRE] Regardons la valeur que vous recevez :
- [Bénéfice 1 avec chiffre]
- [Bénéfice 2 avec chiffre]
- [Bénéfice 3 avec chiffre]

Cela représente un ROI de [X]% en [temps].

[SOLUTION] Si le budget est une contrainte, je peux proposer :
- Paiement échelonné
- Réduction du périmètre initial
- Phase 1 + Phase 2"
\`\`\`

### Objection : "Je dois réfléchir" 🤔

**Réponse Type** :
\`\`\`
"Bien sûr, c'est une décision importante.

[EXPLORER] Quels sont les points sur lesquels vous 
souhaitez réfléchir ?

[RÉPONDRE] Pour vous aider, je peux vous envoyer :
- Un récapitulatif écrit
- Des références clients
- Un planning détaillé

[URGENCE] Je dois vous informer que [raison d'urgence], 
seriez-vous disponible pour une décision d'ici [date] ?"
\`\`\`

### Objection : "Je dois en parler à mon supérieur" 👔

**Réponse Type** :
\`\`\`
"Je comprends, c'est normal pour une décision importante.

[EXPLORER] Quel est le processus de décision dans votre 
entreprise ? Qui d'autre est impliqué ?

[RÉPONDRE] Pour faciliter votre présentation, je peux :
- Préparer un document de synthèse
- Participer à la réunion
- Fournir des références

[ACTION] Quand pourriez-vous présenter le projet ? 
Je peux être disponible pour répondre aux questions."
\`\`\`

## 🎯 Transformer les Objections

**Objection** = **Opportunité** de :
- Clarifier la valeur
- Renforcer la confiance
- Créer de l'urgence
- Proposer des alternatives

## 📊 Tableau de Réponses Rapides

| Objection | Cause Probable | Réponse Clé |
|-----------|----------------|-------------|
| "Trop cher" | Valeur non perçue | Montrer le ROI |
| "Pas besoin" | Besoin non identifié | Re-qualifier |
| "Pas maintenant" | Manque d'urgence | Créer l'urgence |
| "Pas sûr" | Manque de confiance | Preuves sociales |
| "Autre fournisseur" | Comparaison | Différenciation |

## ⚠️ Erreurs à Éviter

1. **Contredire directement** ❌
   - "Vous avez tort"
   - ✅ "Je comprends votre point de vue"

2. **Se défendre** ❌
   - "Ce n'est pas vrai"
   - ✅ "Laissez-moi clarifier"

3. **Ignorer l'objection** ❌
   - Changer de sujet
   - ✅ Traiter chaque objection

4. **Répondre trop vite** ❌
   - Répondre sans comprendre
   - ✅ Explorer d'abord

5. **Perdre patience** ❌
   - Montrer de l'agacement
   - ✅ Rester calme et professionnel

## 🎓 Exercice Pratique

**Mission** : Préparez des réponses à ces objections :

1. "Votre prix est 30% plus cher que la concurrence"
2. "Nous n'avons pas besoin de cela maintenant"
3. "Je dois en parler à mon équipe"
4. "Comment puis-je vous faire confiance ?"
5. "Nous avons déjà une solution"

## ✅ Checklist de Gestion d'Objections

Quand vous rencontrez une objection :
- [ ] J'écoute jusqu'au bout
- [ ] Je reconnais la préoccupation
- [ ] J'explore pour comprendre
- [ ] Je réponds avec des faits
- [ ] Je propose des solutions
- [ ] Je vérifie la compréhension

---
**Prochaine leçon** : Techniques de Closing`,
    order: 2
  },
  {
    title: '3.3 - Techniques de Closing',
    content: `# 🎯 Techniques de Closing

## 🎯 Objectifs
- Identifier les signaux d'achat
- Maîtriser les techniques de clôture
- Conclure efficacement la vente

## 🔍 Les Signaux d'Achat

### Signaux Verbaux 🗣️
- "Combien ça coûte ?"
- "Quand pouvez-vous commencer ?"
- "Quelles sont les modalités de paiement ?"
- "Comment ça fonctionne ?"
- "Qui d'autre utilise votre solution ?"

### Signaux Non Verbaux 👀
- Hochement de tête positif
- Prise de notes
- Questions sur les détails
- Langage corporel ouvert
- Intérêt manifeste

### Signaux de Comportement 📊
- Demande de documentation
- Présentation à d'autres décideurs
- Questions sur l'implémentation
- Discussion sur les délais

## 🎯 Les 7 Techniques de Closing

### 1. Closing par Assomption ✅
**Principe** : Supposer que la vente est faite.

**Exemple** :
- "Parfait, je vais préparer le contrat pour une signature la semaine prochaine. Préférez-vous lundi ou mardi ?"

**Quand l'utiliser** : Quand les signaux sont très positifs

### 2. Closing par Alternative (Choix) 🎯
**Principe** : Proposer deux options positives.

**Exemple** :
- "Préférez-vous commencer le 1er ou le 15 du mois ?"
- "Souhaitez-vous le paiement en une fois ou en 3 fois ?"

**Quand l'utiliser** : Pour faciliter la décision

### 3. Closing par Urgence ⏰
**Principe** : Créer un sentiment d'urgence.

**Exemple** :
- "Pour bénéficier de ce prix, il faut signer avant la fin du mois"
- "J'ai 2 créneaux disponibles ce mois, lequel vous convient ?"

**Quand l'utiliser** : Quand il y a une vraie urgence ou deadline

### 4. Closing par Résumé 📋
**Principe** : Résumer les bénéfices et demander.

**Exemple** :
- "Récapitulons : vous avez besoin de [besoin], notre solution apporte [bénéfice 1], [bénéfice 2], [bénéfice 3]. Êtes-vous prêt à démarrer ?"

**Quand l'utiliser** : Après une longue présentation

### 5. Closing par Question Finale ❓
**Principe** : Poser une question directe.

**Exemple** :
- "Y a-t-il quelque chose qui vous empêche de démarrer maintenant ?"
- "Qu'est-ce qui vous retient encore ?"

**Quand l'utiliser** : Pour identifier les derniers obstacles

### 6. Closing par Test 🧪
**Principe** : Proposer un essai ou pilote.

**Exemple** :
- "Commençons par une phase pilote de 1 mois, qu'en pensez-vous ?"
- "Faisons un projet test sur un module, puis nous étendons"

**Quand l'utiliser** : Quand le client hésite encore

### 7. Closing par Silence 🤐
**Principe** : Après votre proposition, taisez-vous.

**Technique** :
- Faites votre proposition
- Restez silencieux
- Laissez le client répondre

**Pourquoi ça marche** : Le silence crée une pression positive

## 💡 Exemple de Closing Complet

**Scénario** : Après présentation d'un projet

**Vous** : "Récapitulons ce que nous avons vu :
- Votre besoin : [besoin]
- Notre solution : [solution]
- Bénéfices : [bénéfice 1], [bénéfice 2]
- Investissement : [prix]
- Délai : [délai]

[CLOSING PAR QUESTION] Y a-t-il quelque chose qui vous empêche de démarrer ?"

**Client** : "Non, tout me semble bon"

**Vous** : "Parfait ! [CLOSING PAR ALTERNATIVE] Préférez-vous commencer le 1er ou le 15 du mois prochain ?"

**Client** : "Le 1er me convient"

**Vous** : "Excellent ! Je vais préparer le contrat et vous l'envoie demain. [CLOSING PAR ASSOMPTION] Vous pourrez le signer avant la fin de la semaine ?"

## ⚠️ Erreurs à Éviter

1. **Fermer trop tôt** ❌
   - Avant d'avoir répondu aux objections
   - ✅ Fermez seulement quand prêt

2. **Être trop agressif** ❌
   - Forcer la décision
   - ✅ Guider naturellement

3. **Oublier de fermer** ❌
   - Ne jamais demander
   - ✅ Toujours proposer la prochaine étape

4. **Fermer plusieurs fois** ❌
   - Répéter la même question
   - ✅ Varier les techniques

5. **Perdre après le closing** ❌
   - Ne pas suivre
   - ✅ Confirmer et documenter

## 🎯 Le Processus de Closing

\`\`\`
1. IDENTIFIER les signaux
   ↓
2. RÉSUMER les bénéfices
   ↓
3. RÉPONDRE aux dernières objections
   ↓
4. PROPOSER la prochaine étape
   ↓
5. CONFIRMER l'accord
   ↓
6. DOCUMENTER
\`\`\`

## ✅ Checklist de Closing

Avant de fermer :
- [ ] Toutes les objections traitées
- [ ] Bénéfices clairs
- [ ] Signaux d'achat identifiés
- [ ] Prochaine étape préparée

Pendant le closing :
- [ ] Technique appropriée utilisée
- [ ] Calme et confiant
- [ ] Écoute de la réponse
- [ ] Adaptation si nécessaire

Après le closing :
- [ ] Accord confirmé
- [ ] Documenté par écrit
- [ ] Prochaines étapes définies
- [ ] Suivi planifié

---
**Prochaine leçon** : Négociation Gagnant-Gagnant`,
    order: 3
  },
  {
    title: '3.4 - Négociation Gagnant-Gagnant',
    content: `# 🤝 Négociation Gagnant-Gagnant

## 🎯 Objectifs
- Comprendre les principes du gagnant-gagnant
- Créer de la valeur pour les deux parties
- Construire des relations durables

## 🧠 Qu'est-ce que le Gagnant-Gagnant ?

Le **gagnant-gagnant** est une approche de négociation où les deux parties obtiennent des bénéfices satisfaisants.

### 📊 Gagnant-Perdu vs Gagnant-Gagnant

| Gagnant-Perdu | Gagnant-Gagnant |
|---------------|-----------------|
| Ressources limitées | Création de valeur |
| Conflit | Collaboration |
| Relation à court terme | Relation durable |
| Une partie perd | Les deux gagnent |

## 🎯 Les 5 Principes du Gagnant-Gagnant

### 1. Comprendre les Vrais Besoins 🎯
**Pas seulement** : Ce que le client demande
**Mais aussi** : Pourquoi il le demande

**Exemple** :
- Demande : "Prix réduit de 20%"
- Besoin réel : "Respecter le budget alloué"
- Solution gagnant-gagnant : "Prix réduit de 10% + paiement échelonné"

### 2. Créer de la Valeur 💎
**Au lieu de** : Se battre sur le prix
**Créez** : Des options qui apportent de la valeur

**Exemples de création de valeur** :
- Paiement échelonné (valeur pour le client, cash-flow pour vous)
- Maintenance incluse (valeur pour le client, revenu récurrent pour vous)
- Formation étendue (valeur pour le client, moins de support pour vous)

### 3. Proposer des Options Multiples 🎁
**Ne proposez pas** : Une seule solution
**Proposez** : Plusieurs packages

**Exemple** :
- Package Basic : 10 000€ (fonctionnalités essentielles)
- Package Standard : 12 000€ (fonctionnalités + support)
- Package Premium : 15 000€ (tout + formation + maintenance)

### 4. Penser Long Terme 📅
**Pas seulement** : Cette transaction
**Mais aussi** : La relation future

**Bénéfices long terme** :
- Références clients
- Projets futurs
- Recommandations
- Partenariats

### 5. Communication Transparente 💬
**Soyez** : Honnête et clair
**Évitez** : Les manipulations

**Avantages** :
- Construit la confiance
- Facilite la négociation
- Évite les malentendus

## 💡 Exemple Concret de Gagnant-Gagnant

**Situation** :
- Votre prix : 15 000€
- Budget client : 12 000€
- Écart : 3 000€

**Approche Gagnant-Perdu** ❌ :
- Réduire le prix à 12 000€
- Vous perdez 3 000€
- Client gagne, vous perdez

**Approche Gagnant-Gagnant** ✅ :
- Prix : 13 000€ (vous gagnez 1 000€ de plus)
- Paiement : 50% à la signature, 50% à la livraison (cash-flow pour vous)
- Maintenance : Incluse la 1ère année (valeur pour le client, revenu récurrent pour vous)
- Formation : Session étendue (valeur pour le client, moins de support pour vous)

**Résultat** :
- Client : Paye 13 000€ au lieu de 15 000€ + bénéfices supplémentaires
- Vous : Revenu de 13 000€ + maintenance récurrente + moins de support

## 🎯 Techniques de Création de Valeur

### Technique 1 : Bundle (Regroupement) 📦
**Principe** : Groupez plusieurs éléments.

**Exemple** :
- "Pour 13 000€, vous avez le développement + maintenance 1 an + formation"

### Technique 2 : Trade-off (Échange) 🔄
**Principe** : Échangez des éléments de valeur différente.

**Exemple** :
- "Si vous acceptez un délai de 4 mois au lieu de 3, je réduis le prix de 10%"

### Technique 3 : Phase Approach (Approche par Phases) 📊
**Principe** : Divisez en phases avec valeur à chaque étape.

**Exemple** :
- Phase 1 : 8 000€ (fonctionnalités essentielles)
- Phase 2 : 5 000€ (fonctionnalités avancées)
- Total : 13 000€ mais valeur immédiate à 8 000€

### Technique 4 : Value-Add (Ajout de Valeur) ➕
**Principe** : Ajoutez des éléments à forte valeur perçue, faible coût réel.

**Exemple** :
- Documentation premium
- Support prioritaire
- Formation personnalisée

## 📊 Tableau de Négociation Gagnant-Gagnant

| Élément | Valeur Client | Coût Réel | Bénéfice Net |
|---------|---------------|-----------|--------------|
| Paiement échelonné | ⭐⭐⭐⭐⭐ | ⭐ | Gagnant-Gagnant |
| Maintenance incluse | ⭐⭐⭐⭐ | ⭐⭐ | Gagnant-Gagnant |
| Formation étendue | ⭐⭐⭐⭐⭐ | ⭐ | Gagnant-Gagnant |
| Support prioritaire | ⭐⭐⭐⭐ | ⭐ | Gagnant-Gagnant |

## ⚠️ Pièges à Éviter

1. **Céder trop** ❌
   - Accepter n'importe quoi
   - ✅ Définissez vos limites

2. **Manipuler** ❌
   - Tromper le client
   - ✅ Soyez transparent

3. **Oublier vos besoins** ❌
   - Se concentrer uniquement sur le client
   - ✅ Pensez aussi à vous

4. **Forcer** ❌
   - Imposer une solution
   - ✅ Proposez et laissez choisir

5. **Court terme uniquement** ❌
   - Penser seulement à cette vente
   - ✅ Pensez à la relation

## 🎓 Exercice Pratique

**Mission** : Créez 3 options gagnant-gagnant pour cette situation :

- Projet : 15 000€
- Budget client : 12 000€
- Besoin client : Réduire le coût
- Votre besoin : Maintenir la rentabilité

**Options à créer** :
1. Option 1 : _________________________________
2. Option 2 : _________________________________
3. Option 3 : _________________________________

## ✅ Checklist Gagnant-Gagnant

Avant la négociation :
- [ ] Besoins des deux parties identifiés
- [ ] Options multiples préparées
- [ ] Limites définies (min/ideal)

Pendant la négociation :
- [ ] Écoute active des besoins
- [ ] Création de valeur
- [ ] Propositions multiples
- [ ] Communication transparente

Après la négociation :
- [ ] Les deux parties satisfaites
- [ ] Relation préservée
- [ ] Accord documenté
- [ ] Suivi planifié

---
**Fin du Module 3**`,
    order: 4
  }
];

/**
 * MODULE 4: ACCORD CLIENT
 */
const module4 = {
  title: 'Module 4: Accord et Contrat Client',
  description: 'Apprenez à rédiger des contrats clairs, définir les périmètres et établir des accords solides qui protègent toutes les parties.',
  caseStudyType: 'none',
  order: 4
};

const lessonsModule4 = [
  {
    title: '4.1 - Rédaction de Contrats',
    content: `# 📄 Rédaction de Contrats

## 🎯 Objectifs
- Comprendre les éléments essentiels d'un contrat
- Rédiger des contrats clairs et protecteurs
- Éviter les pièges juridiques courants

## 📋 Les Éléments Essentiels d'un Contrat

### 1. Identification des Parties 👥
**Doit contenir** :
- Nom complet des parties
- Adresses
- Numéros SIRET/SIREN (si applicable)
- Représentants légaux

**Exemple** :
\`\`\`
ENTRE LES SOUSSIGNÉS :

[Votre entreprise]
[Adresse]
SIRET : [Numéro]
Représenté par : [Nom]

ET

[Client]
[Adresse]
SIRET : [Numéro]
Représenté par : [Nom]
\`\`\`

### 2. Objet du Contrat 🎯
**Doit contenir** :
- Description claire du projet
- Périmètre précis
- Livrables identifiés

**Exemple** :
\`\`\`
OBJET :
Le présent contrat a pour objet la réalisation d'une 
application web de gestion de commandes pour restaurant, 
comprenant :
- Développement frontend (React)
- Développement backend (Node.js)
- Base de données (MongoDB)
- Déploiement en production
- Documentation technique
\`\`\`

### 3. Conditions Financières 💰
**Doit contenir** :
- Prix HT et TTC
- Modalités de paiement
- Conditions d'échéance
- Pénalités de retard (si applicable)

**Exemple** :
\`\`\`
CONDITIONS FINANCIÈRES :
- Prix HT : 12 000€
- TVA (20%) : 2 400€
- Prix TTC : 14 400€

MODALITÉS DE PAIEMENT :
- 40% à la signature : 5 760€
- 40% à la livraison : 5 760€
- 20% à la réception définitive : 2 880€

DÉLAI DE PAIEMENT : 30 jours
\`\`\`

### 4. Délais et Livraison ⏰
**Doit contenir** :
- Dates de début et fin
- Jalons intermédiaires
- Conditions de report

**Exemple** :
\`\`\`
DÉLAIS :
- Début : [Date]
- Livraison version 1 : [Date + 2 mois]
- Livraison finale : [Date + 3 mois]

JALONS :
- Jalon 1 : Spécifications validées (Date)
- Jalon 2 : Développement 50% (Date)
- Jalon 3 : Tests et recette (Date)
\`\`\`

### 5. Obligations des Parties 📝
**Doit contenir** :
- Vos obligations
- Obligations du client
- Responsabilités de chacun

**Exemple** :
\`\`\`
OBLIGATIONS DU PRESTATAIRE :
- Réaliser le projet selon les spécifications
- Respecter les délais convenus
- Fournir la documentation
- Assurer la formation

OBLIGATIONS DU CLIENT :
- Fournir les informations nécessaires
- Valider les jalons dans les délais
- Effectuer les paiements selon échéances
- Tester et valider les livrables
\`\`\`

### 6. Propriété Intellectuelle 🧠
**Doit contenir** :
- Qui possède le code
- Droits d'utilisation
- Licences

**Exemple** :
\`\`\`
PROPRIÉTÉ INTELLECTUELLE :
Le code source développé reste la propriété du 
prestataire jusqu'au paiement intégral.

Après paiement complet, les droits d'exploitation 
sont transférés au client.

Les bibliothèques tierces restent sous leurs 
licences respectives.
\`\`\`

### 7. Garanties et Support 🛡️
**Doit contenir** :
- Durée de garantie
- Types de bugs couverts
- Support inclus

**Exemple** :
\`\`\`
GARANTIE :
Garantie de bon fonctionnement : 3 mois après 
livraison.

Support inclus : Correction des bugs majeurs 
pendant la garantie.

Support au-delà : Forfait ou à l'heure selon 
tarif convenu.
\`\`\`

### 8. Résiliation 📛
**Doit contenir** :
- Conditions de résiliation
- Délais de préavis
- Conséquences financières

**Exemple** :
\`\`\`
RÉSILIATION :
Chaque partie peut résilier avec préavis de 30 jours.

En cas de résiliation par le client :
- Paiement du travail déjà effectué
- Paiement de 20% du reste pour dédommagement

En cas de résiliation par le prestataire :
- Remboursement proportionnel
- Transfert du code déjà développé
\`\`\`

## 📝 Template de Contrat Complet

\`\`\`
CONTRAT DE PRESTATION DE SERVICES

ENTRE LES SOUSSIGNÉS :

[PARTIE 1]
ET

[PARTIE 2]

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 - OBJET
[Description du projet]

ARTICLE 2 - PÉRIMÈTRE
[Fonctionnalités incluses et exclues]

ARTICLE 3 - CONDITIONS FINANCIÈRES
[Prix, modalités, échéances]

ARTICLE 4 - DÉLAIS
[Dates, jalons]

ARTICLE 5 - OBLIGATIONS
[Obligations de chaque partie]

ARTICLE 6 - PROPRIÉTÉ INTELLECTUELLE
[Droits et licences]

ARTICLE 7 - GARANTIES
[Garanties et support]

ARTICLE 8 - RÉSILIATION
[Conditions de résiliation]

ARTICLE 9 - LITIGES
[Mode de résolution]

Fait à [Lieu], le [Date]

[Signature Partie 1]        [Signature Partie 2]
\`\`\`

## ⚠️ Pièges Juridiques à Éviter

1. **Contrat trop vague** ❌
   - "Développement d'une application"
   - ✅ Spécifications détaillées

2. **Oublier les exclusions** ❌
   - Ne pas préciser ce qui n'est pas inclus
   - ✅ Liste claire des exclusions

3. **Pas de clause de force majeure** ❌
   - Pas de protection en cas d'événement imprévu
   - ✅ Inclure une clause de force majeure

4. **Propriété intellectuelle floue** ❌
   - Ne pas préciser qui possède quoi
   - ✅ Clause claire sur la PI

5. **Pas de révision de prix** ❌
   - Prix fixe sans possibilité d'ajustement
   - ✅ Clause de révision pour modifications

## 💡 Exemple de Clause Importante

**Clause de Modification du Périmètre** :
\`\`\`
Toute modification du périmètre initial devra faire 
l'objet d'un avenant au présent contrat.

Les modifications seront facturées selon le tarif 
horaire de [X]€/heure ou selon devis préalable.

Aucune modification ne pourra être effectuée sans 
avenant signé par les deux parties.
\`\`\`

## ✅ Checklist de Contrat

Avant de signer :
- [ ] Tous les éléments essentiels présents
- [ ] Périmètre clairement défini
- [ ] Conditions financières précises
- [ ] Délais réalistes
- [ ] Obligations équilibrées
- [ ] Propriété intellectuelle clarifiée
- [ ] Garanties définies
- [ ] Clause de résiliation incluse
- [ ] Relu et compris par les deux parties
- [ ] Validation juridique si nécessaire

---
**Prochaine leçon** : Définition du Périmètre`,
    order: 1
  },
  {
    title: '4.2 - Définition du Périmètre',
    content: `# 🎯 Définition du Périmètre

## 🎯 Objectifs
- Définir clairement ce qui est inclus et exclu
- Éviter les malentendus sur le scope
- Protéger contre les demandes hors périmètre

## 📋 Le Périmètre : Inclus vs Exclus

### ✅ Ce qui est INCLUS

**Fonctionnalités Principales** :
- Liste détaillée de chaque fonctionnalité
- Spécifications techniques
- Livrables attendus

**Exemple** :
\`\`\`
INCLUS :
✓ Développement frontend React
✓ Développement backend Node.js
✓ Base de données MongoDB
✓ Authentification utilisateur
✓ Gestion des commandes
✓ Interface d'administration
✓ Déploiement en production
✓ Documentation technique
✓ Formation utilisateur (2h)
\`\`\`

### ❌ Ce qui est EXCLU

**Important** : Précisez clairement ce qui n'est PAS inclus.

**Exemple** :
\`\`\`
EXCLUS :
✗ Maintenance au-delà de 3 mois
✗ Support 24/7
✗ Intégration avec systèmes tiers (sauf spécifié)
✗ Design graphique personnalisé
✗ Hébergement (fourni par le client)
✗ Nom de domaine
✗ Certificat SSL
✗ Formation avancée
\`\`\`

## 🎯 La Matrice Inclus/Exclus

Créez un tableau clair :

| Élément | Inclus | Exclus | Notes |
|---------|--------|--------|-------|
| Développement | ✅ | | React + Node.js |
| Base de données | ✅ | | MongoDB |
| Design | ✅ | | Template standard |
| Design personnalisé | | ❌ | Sur devis |
| Déploiement | ✅ | | Production |
| Maintenance | ✅ | | 3 mois inclus |
| Support | ✅ | | Pendant garantie |
| Support 24/7 | | ❌ | Sur devis |
| Formation | ✅ | | 2h de base |
| Formation avancée | | ❌ | Sur devis |

## 📝 Document de Périmètre

### Structure Recommandée

\`\`\`
DOCUMENT DE PÉRIMÈTRE

PROJET : [Nom]
VERSION : 1.0
DATE : [Date]

1. PÉRIMÈTRE INCLUS
   [Liste détaillée]

2. PÉRIMÈTRE EXCLU
   [Liste détaillée]

3. ASSUMPTIONS
   [Hypothèses de travail]

4. DÉPENDANCES
   [Éléments nécessaires du client]

5. MODIFICATIONS
   [Processus pour modifier le périmètre]
\`\`\`

## 💡 Exemple Complet

**Projet** : Application e-commerce

**PÉRIMÈTRE INCLUS** :
- Catalogue produits (CRUD)
- Panier d'achat
- Paiement Stripe
- Gestion commandes
- Interface admin basique
- Responsive design
- Déploiement Vercel
- Documentation
- Formation 2h

**PÉRIMÈTRE EXCLU** :
- Application mobile native
- Intégration ERP
- Système de recommandation IA
- Chat en direct
- Programme de fidélité
- Multi-langues (sauf FR)
- Support téléphonique
- Maintenance au-delà garantie

## ⚠️ Gestion des Modifications

### Processus d'Avenant

\`\`\`
Toute modification du périmètre initial nécessite :

1. DEMANDE du client
2. ÉVALUATION de l'impact
3. DEVIS de modification
4. VALIDATION par les deux parties
5. AVENANT au contrat
6. MISE À JOUR du planning
\`\`\`

### Exemple d'Avenant

**Demande** : "Ajouter un système de chat"

**Évaluation** :
- Temps estimé : 3 jours
- Coût : 2 400€ HT
- Impact délai : +1 semaine

**Avenant** :
- Nouveau périmètre : + Chat en direct
- Coût additionnel : 2 400€ HT
- Nouveau délai : [Date + 1 semaine]

## ✅ Checklist de Périmètre

Avant de finaliser :
- [ ] Liste complète des fonctionnalités incluses
- [ ] Liste claire des exclusions
- [ ] Tableau inclus/exclus créé
- [ ] Document validé par le client
- [ ] Processus de modification défini
- [ ] Assumptions documentées

---
**Prochaine leçon** : Gestion des Avenants`,
    order: 2
  },
  {
    title: '4.3 - Gestion des Avenants',
    content: `# 📝 Gestion des Avenants

## 🎯 Objectifs
- Comprendre quand créer un avenant
- Rédiger des avenants clairs
- Gérer les modifications de périmètre

## 🔄 Qu'est-ce qu'un Avenant ?

Un **avenant** est un document qui modifie ou complète un contrat existant.

### 📋 Quand Créer un Avenant ?

**Créer un avenant quand** :
- ✅ Modification du périmètre
- ✅ Changement de délai
- ✅ Modification du prix
- ✅ Changement de modalités
- ✅ Ajout de fonctionnalités

**Ne PAS créer d'avenant pour** :
- ❌ Corrections de bugs (dans garantie)
- ❌ Améliorations mineures
- ❌ Clarifications

## 📝 Structure d'un Avenant

\`\`\`
AVENANT N°[X] AU CONTRAT DU [DATE]

ENTRE :
[Partie 1]
ET
[Partie 2]

OBJET DE L'AVENANT :
[Description de la modification]

MODIFICATIONS APPORTÉES :

ARTICLE [X] - [Titre]
Est modifié comme suit :
[Ancien texte]
↓
[Nouveau texte]

IMPACT FINANCIER :
- Coût additionnel : [Montant]€ HT
- Nouveau total : [Montant]€ HT

IMPACT SUR LES DÉLAIS :
- Délai initial : [Date]
- Nouveau délai : [Date]
- Report : [X] jours

VALIDATION :
Les parties conviennent des modifications ci-dessus.

Fait à [Lieu], le [Date]

[Signatures]
\`\`\`

## 💡 Exemple Concret

**Contrat Initial** :
- Projet : Application web
- Prix : 12 000€
- Délai : 3 mois

**Demande Client** : "Ajouter une application mobile"

**Avenant** :
\`\`\`
AVENANT N°1 AU CONTRAT DU 01/01/2024

OBJET :
Ajout d'une application mobile iOS et Android

MODIFICATIONS :

ARTICLE 2 - PÉRIMÈTRE
Est complété comme suit :
En plus des éléments initiaux, le présent contrat inclut 
désormais :
- Développement application iOS (React Native)
- Développement application Android (React Native)
- Synchronisation avec l'application web
- Publication sur App Store et Google Play

IMPACT FINANCIER :
- Coût additionnel : 8 000€ HT
- TVA (20%) : 1 600€
- Total additionnel : 9 600€ TTC
- Nouveau total projet : 20 000€ HT / 24 000€ TTC

IMPACT SUR LES DÉLAIS :
- Délai initial : 01/04/2024
- Nouveau délai : 15/05/2024
- Report : 6 semaines

VALIDATION :
Les parties conviennent des modifications ci-dessus.

[Signatures]
\`\`\`

## ⚠️ Erreurs à Éviter

1. **Modifier sans avenant** ❌
   - Accepter des changements oralement
   - ✅ Toujours documenter par avenant

2. **Avenant trop vague** ❌
   - "Ajouter quelques fonctionnalités"
   - ✅ Spécifier exactement ce qui est ajouté

3. **Oublier l'impact** ❌
   - Ne pas évaluer le coût/délai
   - ✅ Toujours évaluer l'impact

4. **Accepter sans réfléchir** ❌
   - Dire oui à tout
   - ✅ Évaluer avant d'accepter

5. **Pas de validation** ❌
   - Modifier sans signature
   - ✅ Toujours faire signer l'avenant

## ✅ Checklist d'Avenant

Avant de créer un avenant :
- [ ] Modification clairement identifiée
- [ ] Impact financier évalué
- [ ] Impact sur délai évalué
- [ ] Avenant rédigé
- [ ] Validé par les deux parties
- [ ] Signé et archivé

---
**Prochaine leçon** : Protection Juridique`,
    order: 3
  },
  {
    title: '4.4 - Protection Juridique',
    content: `# 🛡️ Protection Juridique

## 🎯 Objectifs
- Comprendre les clauses de protection
- Protéger vos intérêts légaux
- Éviter les litiges

## ⚖️ Les Clauses Essentielles de Protection

### 1. Clause de Limitation de Responsabilité 🛡️

**Objectif** : Limiter votre responsabilité en cas de problème.

**Exemple** :
\`\`\`
LIMITATION DE RESPONSABILITÉ :
La responsabilité du prestataire est limitée au montant 
total du contrat.

En aucun cas le prestataire ne pourra être tenu 
responsable de :
- Perte de données due à une faute du client
- Dommages indirects
- Perte de chiffre d'affaires
- Dommages consécutifs
\`\`\`

### 2. Clause de Force Majeure 🌪️

**Objectif** : Vous protéger en cas d'événement imprévisible.

**Exemple** :
\`\`\`
FORCE MAJEURE :
Aucune partie ne pourra être tenue responsable en cas 
de force majeure, notamment :
- Catastrophes naturelles
- Grèves
- Pandémies
- Pannes de réseau majeures
- Modifications législatives

En cas de force majeure, les délais sont suspendus.
\`\`\`

### 3. Clause de Propriété Intellectuelle 🧠

**Objectif** : Clarifier qui possède quoi.

**Exemple** :
\`\`\`
PROPRIÉTÉ INTELLECTUELLE :
- Le code source reste propriété du prestataire jusqu'au 
  paiement intégral
- Après paiement, droits d'exploitation transférés au client
- Les bibliothèques tierces restent sous leurs licences
- Le prestataire conserve le droit d'utiliser le code 
  comme référence (anonymisé)
\`\`\`

### 4. Clause de Confidentialité 🔒

**Objectif** : Protéger les informations sensibles.

**Exemple** :
\`\`\`
CONFIDENTIALITÉ :
Les parties s'engagent à :
- Ne pas divulguer les informations confidentielles
- Utiliser les informations uniquement pour le projet
- Protéger les données du client
- Respecter le RGPD
\`\`\`

### 5. Clause de Résiliation 📛

**Objectif** : Définir les conditions de rupture.

**Exemple** :
\`\`\`
RÉSILIATION :
En cas de résiliation par le client :
- Paiement du travail effectué
- Paiement de 20% du reste pour dédommagement
- Transfert du code développé

En cas de résiliation par le prestataire :
- Remboursement proportionnel
- Transfert du code développé
- Aucun dédommagement
\`\`\`

## ⚠️ Points d'Attention Légaux

### 1. RGPD et Protection des Données 🔐

**Obligations** :
- Consentement utilisateur
- Droit à l'oubli
- Sécurité des données
- Notification en cas de fuite

**Clause Type** :
\`\`\`
PROTECTION DES DONNÉES :
Le prestataire s'engage à :
- Respecter le RGPD
- Sécuriser les données
- Notifier toute fuite dans les 72h
- Permettre l'exercice des droits utilisateurs
\`\`\`

### 2. Garanties et Responsabilités ⚖️

**Garanties à Inclure** :
- Garantie de bon fonctionnement
- Garantie de conformité
- Garantie de sécurité

**Limites** :
- Limiter la durée de garantie
- Exclure les dommages indirects
- Définir les cas exclus

### 3. Résolution des Litiges ⚖️

**Options** :
- Médiation (recommandé)
- Arbitrage
- Tribunal compétent

**Exemple** :
\`\`\`
RÉSOLUTION DES LITIGES :
En cas de litige, les parties s'engagent à :
1. Tenter une médiation amiable
2. Si échec, recourir à l'arbitrage
3. En dernier recours, tribunal de [Ville]
\`\`\`

## 💡 Exemple de Clauses Complètes

**Clause de Garantie** :
\`\`\`
GARANTIE :
Le prestataire garantit :
- Bon fonctionnement selon spécifications
- Conformité aux standards du secteur
- Absence de virus ou malware
- Sécurité des données

Durée : 3 mois après livraison

Exclusions :
- Modifications non autorisées
- Utilisation non conforme
- Problèmes d'hébergement
- Intégrations tierces
\`\`\`

## ✅ Checklist de Protection Juridique

Votre contrat doit contenir :
- [ ] Limitation de responsabilité
- [ ] Clause de force majeure
- [ ] Propriété intellectuelle
- [ ] Confidentialité
- [ ] Résiliation
- [ ] Protection des données (RGPD)
- [ ] Garanties et exclusions
- [ ] Résolution des litiges
- [ ] Validation juridique (si nécessaire)

---
**Fin du Module 4**`,
    order: 4
  }
];

/**
 * MODULE 5: SUIVI DES OPÉRATIONS
 */
const module5 = {
  title: 'Module 5: Suivi des Opérations',
  description: 'Gérez efficacement la communication avec vos équipes et vos clients. Maîtrisez les outils de collaboration et de suivi de projet.',
  caseStudyType: 'none',
  order: 5
};

const lessonsModule5 = [
  {
    title: '5.1 - Communication avec les Équipes',
    content: `# 👥 Communication avec les Équipes

## 🎯 Objectifs
- Établir une communication efficace avec votre équipe
- Utiliser les bons outils de collaboration
- Gérer les réunions et le reporting

## 📢 Les 5 Principes de Communication d'Équipe

### 1. Transparence 🔍
**Pourquoi** : Éviter les malentendus
**Comment** :
- Partagez les informations importantes
- Documentez les décisions
- Communiquez les changements rapidement

### 2. Fréquence Régulière 📅
**Pourquoi** : Maintenir l'alignement
**Comment** :
- Stand-up quotidien (15 min)
- Réunion hebdomadaire (1h)
- Point mensuel (2h)

### 3. Canaux Appropriés 📱
**Pourquoi** : Utiliser le bon outil pour le bon message
**Comment** :
- Urgent → Téléphone/Message
- Important → Email
- Discussion → Chat/Slack
- Documentation → Wiki/Notion

### 4. Clarté et Concision 💬
**Pourquoi** : Éviter la surcharge d'information
**Comment** :
- Messages courts et clairs
- Points d'action identifiés
- Deadlines précises

### 5. Écoute Active 👂
**Pourquoi** : Comprendre les besoins de l'équipe
**Comment** :
- Poser des questions
- Reformuler pour vérifier
- Prendre en compte les retours

## 🛠️ Outils de Communication

### 1. Slack / Microsoft Teams 💬
**Utilisation** :
- Communication quotidienne
- Canaux par projet
- Intégrations outils

**Bonnes Pratiques** :
- Canaux organisés (#projet-frontend, #projet-backend)
- Threads pour les discussions
- Réactions pour éviter le spam

### 2. Email 📧
**Utilisation** :
- Communications formelles
- Décisions importantes
- Documentation

**Bonnes Pratiques** :
- Objet clair
- Structure claire
- Action items identifiés

### 3. Réunions Vidéo 🎥
**Utilisation** :
- Stand-ups
- Réunions de projet
- Points d'équipe

**Bonnes Pratiques** :
- Ordre du jour
- Durée limitée
- Compte-rendu

## 📋 Structure d'une Réunion Efficace

### Stand-up Quotidien (15 min)

**Format** :
1. Ce que j'ai fait hier (2 min/personne)
2. Ce que je fais aujourd'hui (2 min/personne)
3. Blocages éventuels (1 min/personne)

**Règles** :
- Maximum 15 minutes
- Debout (si possible)
- Pas de discussion technique
- Blocages traités après

### Réunion Hebdomadaire (1h)

**Ordre du Jour** :
1. Récap de la semaine (10 min)
2. Objectifs de la semaine (10 min)
3. Blocages et solutions (20 min)
4. Priorités (10 min)
5. Questions diverses (10 min)

### Point Mensuel (2h)

**Ordre du Jour** :
1. Bilan du mois (30 min)
2. Objectifs du mois suivant (30 min)
3. Rétrospective (30 min)
4. Améliorations (30 min)

## 💡 Exemple de Communication Efficace

**Email Type - Point Hebdomadaire** :

\`\`\`
Objet : Point Hebdomadaire - Projet Restaurant App - Semaine 3

Bonjour l'équipe,

RÉCAP DE LA SEMAINE :
✅ Backend API terminé
✅ Authentification implémentée
⏳ Frontend en cours (60%)

OBJECTIFS SEMAINE PROCHAINE :
- Finaliser le frontend
- Intégration API
- Tests unitaires

BLOCAGES :
- [Dev] Besoin d'accès à l'API de paiement
→ Action : [PM] Contacter le client pour les credentials

PRIORITÉS :
1. Finaliser authentification
2. Intégration paiement
3. Tests

Questions ? Disponible pour en discuter.

Bonne semaine !
\`\`\`

## ✅ Checklist de Communication

Quotidien :
- [ ] Stand-up effectué
- [ ] Blocages communiqués
- [ ] Mises à jour partagées

Hebdomadaire :
- [ ] Réunion organisée
- [ ] Ordre du jour envoyé
- [ ] Compte-rendu partagé
- [ ] Actions identifiées

Mensuel :
- [ ] Bilan effectué
- [ ] Objectifs définis
- [ ] Rétrospective faite

---
**Prochaine leçon** : Communication avec le Client`,
    order: 1
  },
  {
    title: '5.2 - Communication avec le Client',
    content: `# 📞 Communication avec le Client

## 🎯 Objectifs
- Maintenir une communication claire avec le client
- Gérer les attentes
- Construire la confiance

## 📅 Fréquence de Communication

### Communication Régulière 📆

**Hebdomadaire** :
- Point d'avancement (email)
- Rapport de progression
- Prochaines étapes

**Mensuel** :
- Réunion de suivi (30-60 min)
- Bilan du mois
- Ajustements si nécessaire

**Par Jalons** :
- Présentation du jalon
- Validation
- Passage au suivant

## 📧 Types de Communication Client

### 1. Rapport d'Avancement 📊

**Fréquence** : Hebdomadaire

**Contenu** :
- Progression (%)
- Tâches complétées
- Tâches en cours
- Blocages éventuels
- Prochaines étapes

**Template** :
\`\`\`
RAPPORT D'AVANCEMENT - SEMAINE [X]

PROJET : [Nom]
PÉRIODE : [Date début] - [Date fin]

PROGRESSION GLOBALE : [X]%

TÂCHES COMPLÉTÉES CETTE SEMAINE :
✅ [Tâche 1]
✅ [Tâche 2]
✅ [Tâche 3]

EN COURS :
🔄 [Tâche 4] - [X]% complété
🔄 [Tâche 5] - [X]% complété

BLOCAGES :
⚠️ [Blocage] - [Action en cours]

PROCHAINES ÉTAPES :
- [Étape 1]
- [Étape 2]
- [Étape 3]

QUESTIONS / VALIDATIONS NÉCESSAIRES :
- [Question 1]
- [Question 2]

Cordialement,
[Votre nom]
\`\`\`

### 2. Communication de Blocage 🚧

**Quand** : Dès qu'un blocage apparaît

**Contenu** :
- Nature du blocage
- Impact sur le projet
- Solutions proposées
- Action requise du client

**Template** :
\`\`\`
URGENT - Blocage Projet [Nom]

Bonjour [Nom],

Nous rencontrons un blocage qui nécessite votre intervention :

BLOCAGE :
[Description du blocage]

IMPACT :
- Délai : [X] jours de retard possible
- Coût : [Impact financier si applicable]

SOLUTIONS PROPOSÉES :
1. [Solution 1] - Impact : [X] jours
2. [Solution 2] - Impact : [X] jours

ACTION REQUISE :
[Ce que le client doit faire]

DÉLAI :
Merci de répondre avant [Date] pour éviter tout retard.

Cordialement,
[Votre nom]
\`\`\`

### 3. Présentation de Jalon 🎯

**Quand** : À chaque jalon

**Contenu** :
- Ce qui a été livré
- Démonstration
- Points de validation
- Prochaines étapes

## 🎯 Gérer les Attentes

### Technique 1 : Under-Promise, Over-Deliver 📈

**Principe** : Promettre moins, livrer plus.

**Exemple** :
- Promis : Livraison en 3 mois
- Livré : Livraison en 2,5 mois
- Résultat : Client satisfait

### Technique 2 : Communication Proactive 📢

**Principe** : Informer avant qu'on vous demande.

**Exemple** :
- Ne pas attendre que le client demande des nouvelles
- Envoyer régulièrement des mises à jour
- Anticiper les questions

### Technique 3 : Transparence Totale 🔍

**Principe** : Partager les bonnes ET mauvaises nouvelles.

**Exemple** :
- Communiquer les retards rapidement
- Expliquer les problèmes
- Proposer des solutions

## 💡 Exemple de Communication Client

**Scénario** : Retard de 3 jours sur un jalon

**Mauvaise Communication** ❌ :
- Attendre le dernier moment
- Ne rien dire
- Client découvre le retard

**Bonne Communication** ✅ :
\`\`\`
Bonjour [Nom],

Je vous contacte pour vous informer d'un léger 
retard sur le jalon [Nom].

SITUATION :
Le jalon prévu pour [Date] sera livré le [Date + 3 jours].

RAISON :
[Explication claire et honnête]

IMPACT :
- Retard : 3 jours
- Impact sur délai final : Aucun (marge prévue)
- Impact financier : Aucun

ACTIONS CORRECTIVES :
- [Action 1]
- [Action 2]

NOUVELLE DATE :
[Date + 3 jours]

Désolé pour ce décalage. Nous restons dans les délais 
finaux convenus.

Cordialement,
[Votre nom]
\`\`\`

## ⚠️ Erreurs à Éviter

1. **Communication insuffisante** ❌
   - Ne pas donner de nouvelles
   - ✅ Communiquer régulièrement

2. **Cacher les problèmes** ❌
   - Ne pas informer des retards
   - ✅ Être transparent

3. **Jargon technique** ❌
   - Utiliser des termes techniques
   - ✅ Adapter le langage

4. **Pas de suivi** ❌
   - Envoyer et oublier
   - ✅ Suivre les réponses

5. **Réactivité lente** ❌
   - Répondre après plusieurs jours
   - ✅ Répondre dans les 24h

## ✅ Checklist de Communication Client

Hebdomadaire :
- [ ] Rapport d'avancement envoyé
- [ ] Progression mise à jour
- [ ] Prochaines étapes communiquées

Par jalon :
- [ ] Jalon présenté
- [ ] Validation obtenue
- [ ] Prochain jalon planifié

En cas de problème :
- [ ] Client informé rapidement
- [ ] Impact expliqué
- [ ] Solutions proposées
- [ ] Action requise claire

---
**Prochaine leçon** : Outils de Collaboration`,
    order: 2
  }
];

// Modules 5-10 avec leçons complètes (structure simplifiée pour gagner de l'espace)
// Les leçons complètes seront ajoutées progressivement

const module6 = {
  title: 'Module 6: Gestion des Délais et du Projet',
  description: 'Apprenez à planifier, suivre et respecter les délais. Maîtrisez les outils de gestion de projet et les techniques de priorisation.',
  caseStudyType: 'none',
  order: 6
};

const module7 = {
  title: 'Module 7: Tests et Diagnostic',
  description: 'Découvrez les techniques de test, de débogage et de diagnostic. Apprenez à identifier et résoudre les problèmes efficacement.',
  caseStudyType: 'none',
  order: 7
};

const module8 = {
  title: 'Module 8: Livraison',
  description: 'Maîtrisez le processus de livraison d\'un projet. Apprenez à préparer, tester et déployer une solution en production.',
  caseStudyType: 'none',
  order: 8
};

const module9 = {
  title: 'Module 9: Formation et Suivi',
  description: 'Apprenez à former vos clients et leurs équipes. Créez des supports de formation efficaces et assurez un suivi post-livraison.',
  caseStudyType: 'none',
  order: 9
};

const module10 = {
  title: 'Module 10: Maintenance et Mise à Jour',
  description: 'Gérez la maintenance et les mises à jour de vos solutions. Apprenez à anticiper les besoins d\'évolution et à proposer des améliorations.',
  caseStudyType: 'none',
  order: 10
};

// Leçons simplifiées pour les modules 6-10 (à compléter progressivement)
const lessonsModule6 = [
  {
    title: '6.1 - Planification de Projet',
    content: `# 📅 Planification de Projet\n\n## 🎯 Objectifs\n- Créer un planning réaliste\n- Identifier les dépendances\n- Gérer les ressources\n\n## 📋 Étapes de Planification\n\n1. **Décomposition en Tâches**\n2. **Estimation des Durées**\n3. **Identification des Dépendances**\n4. **Allocation des Ressources**\n5. **Création du Planning**\n\n## 🛠️ Outils Recommandés\n\n- **Jira** : Gestion de projet agile\n- **Trello** : Kanban simple\n- **Asana** : Gestion de tâches\n- **Monday.com** : Planning visuel\n\n## ✅ Checklist\n\n- [ ] Toutes les tâches identifiées\n- [ ] Durées estimées\n- [ ] Dépendances mappées\n- [ ] Ressources allouées\n- [ ] Planning validé`,
    order: 1
  },
  {
    title: '6.2 - Estimation des Délais',
    content: `# ⏱️ Estimation des Délais\n\n## 🎯 Objectifs\n- Estimer avec précision\n- Gérer les imprévus\n- Communiquer les délais\n\n## 📊 Techniques d'Estimation\n\n1. **Estimation par Analogie**\n2. **Estimation par Points de Story**\n3. **Planning Poker**\n4. **Estimation en 3 Points**\n\n## ⚠️ Buffer de Sécurité\n\nToujours ajouter 20-30% de buffer pour les imprévus.`,
    order: 2
  }
];

const lessonsModule7 = [
  {
    title: '7.1 - Stratégies de Test',
    content: `# 🧪 Stratégies de Test\n\n## 🎯 Objectifs\n- Comprendre les types de tests\n- Créer une stratégie de test\n- Automatiser les tests\n\n## 📋 Types de Tests\n\n- **Tests Unitaires**\n- **Tests d'Intégration**\n- **Tests E2E**\n- **Tests de Performance**\n- **Tests de Sécurité**`,
    order: 1
  },
  {
    title: '7.2 - Techniques de Débogage',
    content: `# 🐛 Techniques de Débogage\n\n## 🎯 Objectifs\n- Identifier les bugs rapidement\n- Utiliser les outils de debug\n- Résoudre efficacement\n\n## 🛠️ Outils\n\n- **Chrome DevTools**\n- **VS Code Debugger**\n- **Console Logs**\n- **Error Tracking (Sentry)**`,
    order: 2
  }
];

const lessonsModule8 = [
  {
    title: '8.1 - Préparation à la Livraison',
    content: `# 📦 Préparation à la Livraison\n\n## 🎯 Objectifs\n- Préparer tous les livrables\n- Vérifier la qualité\n- Documenter\n\n## ✅ Checklist de Livraison\n\n- [ ] Code testé\n- [ ] Documentation complète\n- [ ] Formation préparée\n- [ ] Support prêt`,
    order: 1
  },
  {
    title: '8.2 - Déploiement en Production',
    content: `# 🚀 Déploiement en Production\n\n## 🎯 Objectifs\n- Déployer en sécurité\n- Vérifier le fonctionnement\n- Monitorer\n\n## 📋 Étapes\n\n1. **Backup**\n2. **Déploiement Staging**\n3. **Tests**\n4. **Déploiement Production**\n5. **Vérification**`,
    order: 2
  }
];

const lessonsModule9 = [
  {
    title: '9.1 - Création de Supports de Formation',
    content: `# 📚 Supports de Formation\n\n## 🎯 Objectifs\n- Créer des supports clairs\n- Adapter au niveau\n- Rendre interactif\n\n## 📋 Types de Supports\n\n- **Guides PDF**\n- **Vidéos**\n- **Tutoriels interactifs**\n- **FAQ**`,
    order: 1
  },
  {
    title: '9.2 - Techniques de Formation',
    content: `# 🎓 Techniques de Formation\n\n## 🎯 Objectifs\n- Former efficacement\n- Adapter le rythme\n- Vérifier la compréhension\n\n## 💡 Bonnes Pratiques\n\n- Commencer simple\n- Exemples concrets\n- Exercices pratiques\n- Support continu`,
    order: 2
  }
];

const lessonsModule10 = [
  {
    title: '10.1 - Stratégies de Maintenance',
    content: `# 🔧 Stratégies de Maintenance\n\n## 🎯 Objectifs\n- Planifier la maintenance\n- Prévenir les problèmes\n- Optimiser\n\n## 📋 Types de Maintenance\n\n- **Corrective** : Réparer\n- **Préventive** : Prévenir\n- **Évolutive** : Améliorer`,
    order: 1
  },
  {
    title: '10.2 - Gestion des Mises à Jour',
    content: `# 🔄 Gestion des Mises à Jour\n\n## 🎯 Objectifs\n- Planifier les mises à jour\n- Tester avant déploiement\n- Communiquer les changements\n\n## 📋 Processus\n\n1. **Planification**\n2. **Développement**\n3. **Tests**\n4. **Déploiement**\n5. **Communication**`,
    order: 2
  }
];

// Tous les modules
const allModules = [
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
  module9,
  module10
];

const importProfessionalData = async () => {
  try {
    // Connect if needed (when running as standalone script)
    await connectIfNeeded();
    
    console.log('🌱 Starting Professional Content Seeding...\n');

    // Check if modules already exist
    const existingModules = await Module.find({ title: { $regex: /^Module \d+:/ } });
    if (existingModules.length > 0) {
      console.log('⚠️  Professional modules already exist. Skipping...');
      return {
        success: false,
        message: 'Professional modules already exist',
        modules: existingModules.length
      };
    }

    // Create modules
    const createdModules = await Module.insertMany(allModules);
    console.log(`✅ Created ${createdModules.length} modules`);

    // Create lessons for Module 1
    const lessons1 = lessonsModule1.map(lesson => ({
      ...lesson,
      module: createdModules[0]._id
    }));
    await Lesson.insertMany(lessons1);
    console.log(`✅ Created ${lessons1.length} lessons for Module 1`);

    // Create lessons for Module 2
    const lessons2 = lessonsModule2.map(lesson => ({
      ...lesson,
      module: createdModules[1]._id
    }));
    await Lesson.insertMany(lessons2);
    console.log(`✅ Created ${lessons2.length} lessons for Module 2`);

    // Create lessons for Module 3
    const lessons3 = lessonsModule3.map(lesson => ({
      ...lesson,
      module: createdModules[2]._id
    }));
    await Lesson.insertMany(lessons3);
    console.log(`✅ Created ${lessons3.length} lessons for Module 3`);

    // Create lessons for Module 4
    const lessons4 = lessonsModule4.map(lesson => ({
      ...lesson,
      module: createdModules[3]._id
    }));
    await Lesson.insertMany(lessons4);
    console.log(`✅ Created ${lessons4.length} lessons for Module 4`);

    // Create lessons for Module 5
    const lessons5 = lessonsModule5.map(lesson => ({
      ...lesson,
      module: createdModules[4]._id
    }));
    await Lesson.insertMany(lessons5);
    console.log(`✅ Created ${lessons5.length} lessons for Module 5`);

    // Create lessons for Module 6
    const lessons6 = lessonsModule6.map(lesson => ({
      ...lesson,
      module: createdModules[5]._id
    }));
    await Lesson.insertMany(lessons6);
    console.log(`✅ Created ${lessons6.length} lessons for Module 6`);

    // Create lessons for Module 7
    const lessons7 = lessonsModule7.map(lesson => ({
      ...lesson,
      module: createdModules[6]._id
    }));
    await Lesson.insertMany(lessons7);
    console.log(`✅ Created ${lessons7.length} lessons for Module 7`);

    // Create lessons for Module 8
    const lessons8 = lessonsModule8.map(lesson => ({
      ...lesson,
      module: createdModules[7]._id
    }));
    await Lesson.insertMany(lessons8);
    console.log(`✅ Created ${lessons8.length} lessons for Module 8`);

    // Create lessons for Module 9
    const lessons9 = lessonsModule9.map(lesson => ({
      ...lesson,
      module: createdModules[8]._id
    }));
    await Lesson.insertMany(lessons9);
    console.log(`✅ Created ${lessons9.length} lessons for Module 9`);

    // Create lessons for Module 10
    const lessons10 = lessonsModule10.map(lesson => ({
      ...lesson,
      module: createdModules[9]._id
    }));
    await Lesson.insertMany(lessons10);
    console.log(`✅ Created ${lessons10.length} lessons for Module 10`);

    console.log('\n🎉 Professional Content Seeded Successfully!');
    
    const totalLessons = lessons1.length + lessons2.length + lessons3.length + 
                        lessons4.length + lessons5.length + lessons6.length + 
                        lessons7.length + lessons8.length + lessons9.length + 
                        lessons10.length;

    const result = {
      success: true,
      message: 'Professional content seeded successfully',
      modules: createdModules.length,
      lessons: totalLessons,
      moduleTitles: createdModules.map(m => m.title)
    };

    // Only exit if running as script
    if (require.main === module) {
      console.log('\n📚 Modules Available:');
      createdModules.forEach((module, index) => {
        console.log(`   ${index + 1}. ${module.title}`);
      });
      process.exit();
    }

    return result;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error);
    
    if (require.main === module) {
      process.exit(1);
    }
    
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learncycle')
    .then(() => importProfessionalData())
    .catch(err => {
      console.error('Database connection error:', err);
      process.exit(1);
    });
}

module.exports = { importProfessionalData };

