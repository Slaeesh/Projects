# NIRD Village - Nuit de l'Info 2025

Un jeu de gestion en pixel-art pour la Nuit de l'Info 2025.
Theme : "Le Village Numerique Resistant".

## Le Concept

NIRD Village est un jeu de gestion ou vous incarnez le directeur d'un etablissement scolaire cherchant a se liberer de sa dependance aux Big Tech. Gerez vos salles informatiques, vos serveurs, vos equipes et vos élèves pour atteindre l'independance numerique.

## Comment Gagner

Reduisez votre dependance aux Big Tech a 0% en migrant progressivement vers des solutions libres et open source.

## Comment Perdre

Deux conditions de defaite :
- Le temps s'ecoule avant la fin du support de Windows 10 (48 mois)
- Le bonheur de vos equipes tombe a 0%

## Easter Eggs

Le jeu contient plusieurs surprises cachees :

### Mini-jeux secrets
- **Snake** : Tapez "ennui" dans une phrase ou utilisez les commandes `/snake`, `/clear`, `/hacker`, `/rainbow` dans le chatbot
- **Laser Game** : Apparait automatiquement lorsqu'un PC est infecte par un virus
- **Visualisation Audio** : Se declenche lors de l'organisation d'une soiree

### Autres secrets
- **Chatbot** : Un assistant pas tres malin en bas a droite de l'ecran
- **Logo Klub** : Animation speciale au lancement du jeu
- **Collectivite Territoriale** : Apparition speciale si votre dependance GAFAM depasse 75% au 12eme mois

Le reste des mecaniques (serveurs, migration vers Linux, LibreOffice, etc.) se decouvre en jouant !

---

## Installation

### Prerequis
- Node.js (v20+)
- npm

### Demarrage

1. Cloner le depot :
   ```bash
   git clone git@github.com:Toyaco12/NuitDeLinfo.git
   cd NuitDeLinfo
   ```

2. Installer les dependances :
   ```bash
   npm install
   ```

3. Lancer le serveur de developpement :
   ```bash
   npm run dev
   ```

4. Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur.

### Build de production

```bash
npm run build
```

## Structure du Projet

- `src/features/` : Logique du jeu et composants (Snake, Laser, Chatbot, etc.)
- `src/layouts/` : Layout principal du dashboard
- `src/store/` : Gestion de l'etat global (Zustand)
- `src/assets/` : Images et ressources statiques

## Strategie de Branches

- **main** : Code stable en production. Protegee (PR requise).
- **feat/[feature-name]** : Branches de developpement pour les fonctionnalites specifiques.

## Design System

- **Police** : "Press Start 2P" (`font-pixel`)
- **Couleurs** : Retro Dark (`bg-retro-dark`), Retro Green (`text-retro-green`)
- **Style** : Pixel art, esthetique 8-bit

## Licence

Ce projet est sous licence MIT.
