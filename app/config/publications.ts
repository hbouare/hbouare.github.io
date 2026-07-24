// app/config/publications.ts
//
// Source of truth for the /research page. These are REAL, peer-reviewed
// publications with public URLs — the one part of the portfolio that is
// externally verifiable, so nothing here is invented: titles, venues and
// dates are exactly as published; the vulgarised summaries describe the
// PROBLEM each paper studies and the NATURE of its contribution (a model,
// a semi-analytical method, an analysis) without asserting specific numeric
// results.
//
// Locale-invariant fields (title, venue, date, type, url) live at the top
// level so they are never duplicated across languages — only the translated
// prose (summary / themes / skills) is split per locale. This is the same
// "config as data" pattern as app/config/motion.ts, and it honours the
// "avoid duplication" constraint better than one Markdown file per locale.

export type PublicationType = "journal" | "conference" | "thesis"

export interface PublicationCopy {
  /** 3–6 line vulgarised summary — understandable by a non-specialist. */
  summary: string
  /** Research themes, shown as chips. */
  themes: string[]
  /** Skills mobilised, shown as a hairline-marked list. */
  skills: string[]
}

export interface Publication {
  /** Stable key for v-for / anchors. */
  key: string
  /** The paper’s real title, as published (not translated). */
  title: string
  /** Journal or conference name. */
  venue: string
  /** ISO date, used for ordering and <time>. */
  date: string
  /** Display year, shown as the card’s rail marker. */
  year: number
  type: PublicationType
  /** Link to the original publication. */
  url: string
  /** Translated copy, resolved by the current locale. */
  fr: PublicationCopy
  en: PublicationCopy
}

/** Reverse-chronological: the peer-reviewed journal paper leads (strongest
 *  signal), then the doctoral thesis, then the three conference papers. */
export const publications: Publication[] = [
  {
    key: "sdee-2022",
    title:
      "Stress and displacement fields around an arbitrary shape tunnel surrounded by a multilayered elastic medium subjected to harmonic waves under plane strain conditions",
    venue: "Soil Dynamics and Earthquake Engineering",
    date: "2022-03-01",
    year: 2022,
    type: "journal",
    url: "https://doi.org/10.1016/j.soildyn.2022.107158",
    fr: {
      summary:
        "Lorsqu’une onde sismique traverse le sol, comment se répartissent les contraintes et les déplacements autour d’un tunnel de forme quelconque, creusé dans un terrain composé de plusieurs couches ? Ce travail développe une méthode semi-analytique capable de traiter des géométries arbitraires — pas seulement des cercles — dans un milieu multicouche. Il fournit un outil de calcul précis et rapide, essentiel pour dimensionner des ouvrages souterrains capables de résister aux séismes.",
      themes: ["Élastodynamique", "Propagation d’ondes", "Génie parasismique", "Ouvrages souterrains"],
      skills: [
        "Modélisation mathématique",
        "Méthodes semi-analytiques",
        "Analyse dans le domaine fréquentiel",
        "Programmation scientifique",
      ],
    },
    en: {
      summary:
        "When a seismic wave travels through the ground, how do stresses and displacements distribute around a tunnel of arbitrary shape cut through several distinct layers? This work develops a semi-analytical method able to handle arbitrary geometries — not just circles — in a multilayered medium. It provides an accurate, fast computational tool, essential for designing underground structures that can withstand earthquakes.",
      themes: ["Elastodynamics", "Wave propagation", "Earthquake engineering", "Underground structures"],
      skills: [
        "Mathematical modelling",
        "Semi-analytical methods",
        "Frequency-domain analysis",
        "Scientific programming",
      ],
    },
  },
  {
    key: "these-2021",
    title: "Réponse dynamique d’un tunnel enterré soumis à des ondes mécaniques",
    venue: "Thèse de doctorat",
    date: "2021-09-01",
    year: 2021,
    type: "thesis",
    url: "https://theses.hal.science/tel-03467875v1",
    fr: {
      summary:
        "Ma thèse de doctorat, qui rassemble et prolonge l’ensemble de ces travaux. Objectif : comprendre et prédire la manière dont un tunnel enterré réagit au passage d’ondes mécaniques — séismes, vibrations. Elle construit les modèles mathématiques et les méthodes de calcul qui permettent d’évaluer les contraintes et déplacements induits, avec des applications directes au dimensionnement et à la sûreté des ouvrages souterrains.",
      themes: ["Modélisation numérique", "Mécanique des milieux continus", "Interaction sol-structure", "Dynamique"],
      skills: [
        "Recherche doctorale",
        "Modélisation numérique avancée",
        "Résolution de problèmes complexes",
        "Communication scientifique",
      ],
    },
    en: {
      summary:
        "My doctoral thesis, which gathers and extends this whole body of work. The goal: to understand and predict how a buried tunnel responds to mechanical waves — earthquakes, vibrations. It builds the mathematical models and computational methods needed to evaluate the induced stresses and displacements, with direct applications to the design and safety of underground structures.",
      themes: ["Numerical modelling", "Continuum mechanics", "Soil–structure interaction", "Dynamics"],
      skills: [
        "Doctoral research",
        "Advanced numerical modelling",
        "Complex problem solving",
        "Scientific communication",
      ],
    },
  },
  {
    key: "cfm-2019",
    title: "Réponse dynamique d’une cavité circulaire double dans un milieu rocheux infini",
    venue: "Congrès Français de Mécanique",
    date: "2019-08-31",
    year: 2019,
    type: "conference",
    url: "https://cfm2019.sciencesconf.org/254442/H_BOUARE_CFM_2019.pdf",
    fr: {
      summary:
        "Deux cavités circulaires voisines, creusées dans un massif rocheux, ne réagissent pas indépendamment au passage d’ondes : chacune perturbe le champ ressenti par l’autre. Ce travail analyse leur réponse dynamique couplée et quantifie cette influence mutuelle — un point clé pour comprendre le comportement de galeries ou tunnels rapprochés.",
      themes: ["Élastodynamique", "Diffraction d’ondes", "Cavités souterraines"],
      skills: ["Modélisation analytique", "Analyse dynamique", "Interprétation physique"],
    },
    en: {
      summary:
        "Two neighbouring circular cavities dug into a rock mass do not respond to waves independently: each disturbs the field felt by the other. This work analyses their coupled dynamic response and quantifies that mutual influence — a key point for understanding the behaviour of closely spaced galleries or tunnels.",
      themes: ["Elastodynamics", "Wave diffraction", "Underground cavities"],
      skills: ["Analytical modelling", "Dynamic analysis", "Physical interpretation"],
    },
  },
  {
    key: "eccomas-2019",
    title: "Transient response of a tunnel embedded in a heterogeneous elastic full space",
    venue: "Eccomas Procedia",
    date: "2019-06-30",
    year: 2019,
    type: "conference",
    url: "https://research.amanote.com/publication/eYoG0HMBKQvf0Bhi9fnQ/transient-response-of-a-tunnel-embedded-in-a-heterogeneous-elastic-full-space",
    fr: {
      summary:
        "Que se passe-t-il, instant après instant, lorsqu’une onde atteint un tunnel enfoui dans un sol dont les propriétés varient d’un point à l’autre ? Au-delà du régime harmonique idéalisé, ce travail modélise la réponse transitoire — la réaction réelle dans le temps — d’un tunnel dans un milieu hétérogène, plus proche des conditions rencontrées sur le terrain.",
      themes: ["Régime transitoire", "Milieux hétérogènes", "Propagation d’ondes"],
      skills: ["Analyse dans le domaine temporel", "Modélisation numérique", "Milieux hétérogènes"],
    },
    en: {
      summary:
        "What happens, moment by moment, when a wave reaches a tunnel buried in ground whose properties vary from point to point? Beyond the idealised harmonic regime, this work models the transient response — the real reaction over time — of a tunnel in a heterogeneous medium, closer to the conditions found in the field.",
      themes: ["Transient regime", "Heterogeneous media", "Wave propagation"],
      skills: ["Time-domain analysis", "Numerical modelling", "Heterogeneous media"],
    },
  },
  {
    key: "e3s-2019",
    title:
      "Contribution to the modeling and the mechanical characterization of the subsoil in the LSBB environment",
    venue: "E3S Web of Conferences",
    date: "2019-02-22",
    year: 2019,
    type: "conference",
    url: "https://www.e3s-conferences.org/articles/e3sconf/abs/2019/14/e3sconf_i-dust2018_06001/e3sconf_i-dust2018_06001.html",
    fr: {
      summary:
        "Avant de modéliser la propagation des ondes, il faut connaître le milieu qui les porte. Ce travail caractérise mécaniquement le sous-sol du LSBB (Laboratoire Souterrain à Bas Bruit), en combinant modélisation et mesures pour décrire un environnement géologique complexe. Il pose les bases physiques réalistes sur lesquelles s’appuient les modèles de réponse dynamique.",
      themes: ["Caractérisation mécanique", "Géophysique", "LSBB"],
      skills: ["Modélisation & mesure", "Validation expérimentale", "Analyse de données"],
    },
    en: {
      summary:
        "Before modelling how waves propagate, you have to know the medium that carries them. This work mechanically characterises the subsoil of the LSBB (Low Noise Underground Laboratory), combining modelling and measurement to describe a complex geological environment. It lays the realistic physical foundations that the dynamic-response models rely on.",
      themes: ["Mechanical characterisation", "Geophysics", "LSBB"],
      skills: ["Modelling & measurement", "Experimental validation", "Data analysis"],
    },
  },
]
