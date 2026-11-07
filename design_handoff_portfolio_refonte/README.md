# Handoff : refonte du portfolio hamedbouare.me

## Overview
Refonte complète de https://hamedbouare.me (FR/EN). Direction retenue : **« Sismogramme »**, un style éditorial clair et sombre. Le message est « la rigueur du chercheur, la précision de l'ingénieur ». L'objectif business est de convertir les visiteurs en missions de conseil : chaque page mène à **« Discuter d'un projet »** (/contact).

## About the Design Files
Les fichiers de ce dossier sont des **références de design en HTML** : des prototypes qui montrent l'apparence et le comportement attendus. Ce n'est **pas** du code de production à copier. La tâche consiste à **recréer ces designs dans le codebase du site** (Vue 3 / Nuxt, cohérent avec l'expertise affichée) en suivant ses conventions. Si aucun codebase n'existe, choisir **Nuxt 4 + TypeScript + @nuxtjs/i18n** (SSR/SSG, routes FR/EN, SEO).

Ouvrir `Ecrans Portfolio.dc.html` dans un navigateur pour voir toutes les pages en 1440 et 390 px. `Portfolio.dc.html` est le prototype navigable : tout le contenu se trouve dans les constantes JS du `<script data-dc-script>` (TIMELINE, SERVICES, PROJECTS, PUBS, IMPACT, POSTS…).

## Fidelity
**Haute fidélité.** Couleurs, typographies, échelles, espacements, interactions et contenus sont définitifs. Il faut les reproduire fidèlement. Le contenu FR est verbatim du site actuel. Le contenu EN existe déjà sur le site actuel et doit être repris (le prototype ne traduit que l'interface).

## Design Tokens

### Couleurs (variables CSS, `[data-theme="dark"]` sur `<html>`)
| Token | Clair | Sombre | Usage |
|---|---|---|---|
| `--bg` | `#F3F0E8` | `#13120F` | fond |
| `--surface` | `#EBE6DA` | `#1C1A16` | survol de rangée, code, formulaire |
| `--ink` | `#17150F` | `#EEEAE0` | texte, bouton primaire (fond) |
| `--muted` | `#5C574C` | `#A39E91` | texte secondaire, labels |
| `--rule` | `#D8D2C4` | `#2E2B25` | filets 1px, bordures de tags |
| `--accent` | `#C2441A` | `#F07A48` | un mot du titre, numéros, fronts d'onde, statut |

Contrastes AA vérifiés : ink/bg ≈ 16:1, muted/bg ≥ 6.4:1, accent/bg ≈ 5:1. L'accent reste rare (jamais en aplat de fond). Le bloc CTA de fin de page est **inversé** : fond `--ink`, texte `--bg`, texte secondaire `--rule`.
Thème : respecter `prefers-color-scheme` par défaut, persister le choix (localStorage), transition `background-color/color .35s`.

### Typographie (Google Fonts)
- **Display / titres** : `Newsreader` (opsz 6–72), poids 300 (titres) et 400 (éléments), italique pour les mots mis en valeur.
- **Texte** : `Instrument Sans` 400/500/600.
- **Repères / mono** : `IBM Plex Mono` 400/500.
- Variables : `--f-display`, `--f-sans`, `--f-mono`.

Échelle fluide (le prototype utilise `cqw` sur le conteneur racine ; en prod, `vw` ou des container queries) :
| Rôle | Police | Taille | Interlignage | Approche |
|---|---|---|---|---|
| Hero display | display 300 | clamp(46px, 9.2vw, 132px) | .96 | -0.035em |
| H1 de page | display 300 | clamp(44px, 7.2vw, 104px) | 1 | -0.033em |
| H2 de section | display 300 | clamp(36px, 4.8vw, 68px) | 1.04 | -0.03em |
| CTA final | display 300 | clamp(42px, 7.6vw, 112px) | 1 | -0.035em |
| H3 (entreprise, service) | display 400 | clamp(26px, 2.8vw, 40px) | 1.08–1.12 | -0.02em |
| Titre de liste (post, pub) | display 400 | clamp(22px, 2.2vw, 30px) | 1.2–1.25 | -0.015em |
| Chapô | display 400 | clamp(19px, 1.7vw, 24px) | 1.5 | — |
| Texte | sans 400 | 16–18px | 1.6–1.75 | — |
| Label / eyebrow | mono 400 | 12px, MAJUSCULES | — | +0.07em |
| Tag | mono 400 | 11px | — | — |
Utiliser `text-wrap: balance` sur les titres et `pretty` sur les paragraphes.

### Espacements & layout
- Base 4px. Échelle : 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 96, 136.
- Marge latérale : clamp(20px, 4.4vw, 64px). Padding vertical des sections : clamp(64px, 9vw, 136px).
- **Grille éditoriale** : une colonne repère (`flex: 1 1 200px`, eyebrow mono) et une colonne contenu (`flex: 999 1 620px`), avec `flex-wrap`. Elles s'empilent naturellement sous ~760px.
- **Rangées** : `border-top: 1px solid var(--rule)`, padding vertical 24→52px, survol `background: var(--surface)`.
- **Grilles de cellules** (chiffres, impact, méta) : `display:grid; gap:1px; background:var(--rule)` avec des cellules en `--bg` pour obtenir des filets parfaits.
- Breakpoint unique : **760px** (nav desktop ou menu mobile).

### Rayons, bordures, ombres
- Boutons et tags : `border-radius: 999px`. Images et cartes : 6–8px.
- Bordures 1px `--rule`. **Aucune ombre** dans le site.

## Composants
- **Header sticky** (fond `--bg`, filet bas). Desktop : logo « Hamed Bouare » (display italique 21px), nav 14px (actif = `--ink` + soulignement 1px `--accent` ; inactif = `--muted`), puis FR/EN (mono 12, langue active en `--ink`), bouton thème (pilule bordée, mono 12) et **CTA « Discuter d'un projet »** (pilule `--ink`, texte `--bg`, 14px/500, padding 10×18). Mobile : logo, CTA court « Discuter » (44px de haut) et bouton « Menu ». Le menu se déplie sous le header : liens en display 34px avec numéros mono, puis FR/EN et thème en boutons de 48px.
- **Bouton primaire** : pilule `--ink`/`--bg`, hauteur min 52px, padding 0 24px, 15px/500, flèche « → ». Survol : opacity .86.
- **Bouton secondaire** : pilule bordée 1px `--ink`, hauteur min 48px. Survol : fond inversé.
- **Lien texte** : 15px/500 avec `border-bottom: 1px solid currentColor`.
- **Tag** : mono 11px, bordure `--rule`, padding 4×10. Variante « Projet phare » : bordure et texte `--accent`, MAJUSCULES.
- **Chip filtre** : hauteur min 40px, mono 12. Actif = fond `--ink`, texte `--bg`. `aria-pressed`.
- **Champ de formulaire** : label mono 11 MAJ `--muted`, input transparent, `border-bottom: 1px solid var(--ink)`, 18px, hauteur min 44px.
- **Bloc CTA de fin** (toutes les pages sauf Contact) : eyebrow « Contact », titre XXL, texte, bouton pilule `--bg`/`--ink` de 56px (survol `--accent`). Le texte varie par page (voir `CTA` dans le JS).
- **Footer** : mono 12 `--muted` avec « © 2026 Hamed Bouare — Tous droits réservés », la pastille accent « Disponible pour de nouveaux projets », puis GitHub et LinkedIn.

## Screens / Views

### 1. Accueil `/`
1. **Hero** : hauteur clamp(640px, 56vw, 800px), le canvas de l'interaction signature en fond (voir plus bas). On y trouve dans l'ordre :
   - l'eyebrow mono « Architecte logiciel · IA & Data Engineering · R&D · Conseil technique » ;
   - le H1 « Des problèmes complexes, des logiciels *fiables* », avec « fiables » en italique `--accent` ;
   - le paragraphe d'intro (max 580px) ;
   - les CTA « Discuter d'un projet → » et « Études de cas » ;
   - en bas à droite (desktop seulement), un readout mono 11px : « Champ d'ondes · déplacez, cliquez pour émettre » et « t = 012.34 s · 3 sources ».
2. **Bandeau références** : le label mono « Ils m'ont confié des systèmes », suivi de EDF, GE HealthCare, SNCF, BHP, Institut d'études avancées, LSBB · Avignon Université (display 18–22px).
3. **Chiffres clés** : une grille auto-fit `minmax(160px,1fr)` avec 8+ Années d'expérience, 5 Secteurs, 5 Publications évaluées, FR · UK Expérience internationale. Les nombres sont en display 300 clamp(48px, 6vw, 88px), en `tabular-nums`. Count-up de 1.6s (ease-out cubique) déclenché par IntersectionObserver à 30%. ⚠️ Valeurs à confirmer avec le client. Le rendu SSR doit afficher les valeurs finales (pas « 0 »).
4. **01 — À propos** : H2 « La rigueur du chercheur, la précision de *l'ingénieur* », 1er paragraphe en chapô display, puis les 2 paragraphes suivants en 2 colonnes `--muted`.
5. **02 — Parcours « Où j'ai construit »** : 6 rangées (EDF, Institut d'études avancées, GE HealthCare, BHP, SNCF, LSBB & Avignon Université). Chaque rangée a trois colonnes :
   - [tag secteur, pastille « En cours » si actuel, dates mono, **frise 2018→2026** (filet + segment accent positionné en %)] ;
   - [entreprise H3, rôle · lieu · contrat en `--muted` 14px] ;
   - [description].
6. Bloc CTA de fin, puis footer.

### 2. Services `/services`
En-tête : eyebrow « 03 — Services », H1 et intro. Ensuite 6 rangées : [numéro accent + titre H3] et [« Constat » (display italique 19px) | « Réponse » (sans 16px)], en grille auto-fit 260px. Bloc CTA de fin : « Un de ces sujets correspond à votre besoin ? » / « Décrire votre besoin ».

### 3. Projets `/projects`
En-tête et note sur l'accès au code. 4 rangées-liens : [numéro 001 + tag « Projet phare »] et [image 16/9 (projet phare seulement), contexte mono, titre display 300 clamp(32–54px), résumé en chapô, tags et « Voir l'étude de cas → »]. Toute la rangée est cliquable.

### 3b. Étude de cas `/projects/fleetops` (racontée comme un article)
1. En-tête : « ← Retour aux projets », eyebrow, H1, chapô, puis une grille méta de 3 cellules (Contexte / Stack / Code).
2. Image hero pleine largeur avec légende mono.
3. Corps : un sommaire sticky (desktop, top 96px) « 01 Problème · 02 Contraintes · 03 Démarche · 04 Résultat », et un article de 780px max. Chaque section a un eyebrow accent, un H2 display 300 clamp(30–44px) et du texte 18px/1.7. Démarche : cellules Front-end / Back-end / Base de données, liste et 2 figures. Résultat : 3 figures.
4. Encadré « Accès au code » avec le bouton secondaire « Demander l'accès au dépôt → », puis le lien pleine largeur « Projet suivant — 002 ».
⚠️ Les sous-titres de section sont une proposition, et il manque un résultat mesurable à fournir par le client. Les 3 autres projets suivent le même gabarit.

### 4. Recherche `/research`
1. H1 « Docteur en mécanique, algorithmes & *modélisation numérique* », puis le chapô italique « Avant de concevoir des logiciels… » à côté de 2 paragraphes.
2. Trois cellules : 01 Docteur en mécanique / 02 5 publications… / 03 Revues & conférences.
3. « Travaux publiés » : 5 entrées. À gauche : l'année en display 300 clamp(44–64px) et le tag de type. À droite : revue mono, titre display 400, résumé, puis une grille avec « Thèmes de recherche » (tags) et « Compétences mobilisées » (liste), et le lien externe « Consulter la publication ↗ » (target _blank, rel noopener).
4. « Impact — De la recherche à l'ingénierie » : 8 cellules (numéro accent, titre display 21px, description `--muted`).
5. Bloc CTA de fin : « Un problème complexe, à forte incertitude ? » / « Discuter d'un projet exigeant ».

### 5. Blog `/blog` et Article `/blog/[slug]`
- **Liste** : H1 « Pensées & *articles* », chips de filtre (Tous, FastAPI, Python, Vue.js, Architecture, Frontend, TypeScript), puis 9 rangées : [date · durée mono] et [titre display 400 + #tags mono `--muted`].
- **Article** :
  - en-tête : « ← Voir tous les articles », date · durée, H1 display 300 clamp(38–80px), tags ;
  - corps : sommaire sticky auto-généré depuis les H2, colonne de 720px ;
  - styles : chapô en display, H2 display 400 clamp(26–34px), texte 18px/1.75 ;
  - code : `pre` mono 13px/1.6 sur `--surface`, bordure `--rule`, rayon 6, padding 20, `overflow-x:auto` ; `code` inline sur `--surface`, padding 2×6 ;
  - blockquote : filet gauche 2px `--accent` + display italique ;
  - liste : rangées filetées ;
  - fin : lien « Article suivant ».
  - Contenu en Markdown via Nuxt Content, coloration syntaxique sobre (Shiki, thème proche des tokens).

### 6. Contact `/contact`
- **Colonne gauche** : eyebrow, H1 « Travaillons *ensemble* », intro, statut disponible, puis « Me retrouver » : GitHub (hamedbouare9) et LinkedIn en rangées filetées.
- **Colonne droite** : formulaire sur `--surface` (rayon 8) avec Nom + E-mail (2 colonnes en auto-fit), **Sujet (facultatif)** en chips multi-sélection (Architecture full-stack, Data Engineering, IA appliquée, Audit & performance, Modernisation, Conseil & R&D, Autre), Message (textarea de 6 lignes) et le bouton « Envoyer le message → ».
- **Validation** : HTML5 `required`, `type=email`.
- **Succès** : `role="status"`, « Message envoyé », « Merci. Je vous réponds rapidement. » et « Écrire un autre message ». Prévoir les états d'envoi et d'erreur.
- Pas de bloc CTA sur cette page.

## Interaction signature : champ d'ondes (hero)
Canvas 2D plein cadre, voir `waveSim()` dans `Portfolio.dc.html`, à porter tel quel dans un composable `useWaveField(canvas)`.
- **Rendu** : des lignes horizontales (sismogramme) espacées de 15px (11px sur mobile), échantillonnées tous les 7px (5px). Chaque point est déplacé verticalement par la somme des fronts d'onde actifs : `a · exp(-dr²/2w²) · cos(k·dr) · exp(-âge/2.4) / (1 + r/420)`, avec `dr = r − c·âge`, `c = 230px/s` (160), `w = 34` (24), `k = 0.1` (0.14).
- **Couleurs** : lignes en `rgba(ink, .30)` en clair et `.24` en sombre, 1px. Segments où |d| > 0.28 en `--accent`, 1.4px.
- **Sources** : une source ambiante toutes les 2.8s (point accent à 78%/50% en desktop, 72%/24% en mobile). Le mouvement du pointeur émet une petite source (a = .45) tous les 36px et 120ms maximum. Un clic ou un tap émet une source forte (a = 1.4). Au maximum 18 sources, chacune durant 5.5s. Le pointeur est représenté par une croix accent de 18px.
- **Masque CSS** : en desktop, `linear-gradient(90deg, rgba(0,0,0,.1), rgba(0,0,0,.3) 35%, #000 62%)` pour garder le titre lisible ; en mobile, un dégradé vertical (`#000` jusqu'à 28%, puis `.12` à 58%).
- **Performance** : DPR plafonné à 2, pause hors écran (IntersectionObserver), une seule boucle rAF, redimensionnement à la volée. Charger le module côté client uniquement (`<ClientOnly>`).
- **`prefers-reduced-motion`** : une image fixe (une seule onde figée à t = 1.7s) et pas de count-up.
- Le canvas est `aria-hidden`.

## Interactions & Behavior
- Navigation : vraies routes Nuxt. L'état actif de la nav suit la section (cas → Projets, article → Blog).
- Survols : rangées en `--surface`, liens nav vers `--ink`, liens externes vers `--accent`.
- Focus : `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }`.
- `::selection` : fond `--accent`, texte `--bg`.
- Cibles tactiles ≥ 44px sur mobile.
- Transitions de page sobres (fondu/translate 8px, 250ms), jamais gadget.

## State Management
`theme` (light/dark, persisté), `locale` (fr/en via i18n, routes `/en/...`), `menuOpen` (mobile), `blogFilter`, `contactTopics[]`, état d'envoi du formulaire (`idle/sending/sent/error`). Contenu : fichiers Markdown/JSON (Nuxt Content), le prototype donnant la structure des données.

## Assets
- Captures FleetOps (existantes) : `https://hamedbouare.me/projects/fleetops/{hero,vehicles,form,analytics,costs,mobile}.webp`.
- Aucune icône ni emoji (les drapeaux du site actuel sont remplacés par « FR · UK »). Les flèches sont des caractères texte (→ ↗ ←).
- Polices : Google Fonts (à auto-héberger en prod via @nuxt/fonts).

## SEO / divers
Harmoniser les balises OG avec « Architecte logiciel · IA & Data Engineering » (le site actuel annonce encore « Data Engineer & Full-Stack »). `hreflang` FR/EN.

## Files
- `Ecrans Portfolio.dc.html` : planche avec le système de design et les 8 pages en desktop 1440 et mobile 390 (+ l'accueil en sombre).
- `Portfolio.dc.html` : prototype responsive navigable. Il contient tout le contenu (constantes JS), les tokens (`<style>` du helmet) et `waveSim()`. Ses props `page`, `theme` et `fonts` permettent d'afficher n'importe quelle page.
- `support.js` : runtime nécessaire pour ouvrir les fichiers `.dc.html` localement (servir le dossier via un petit serveur HTTP, ex. `npx serve`).
