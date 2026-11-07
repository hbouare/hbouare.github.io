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
        "Ce travail étudie les contraintes et les déplacements autour d’un tunnel de forme quelconque soumis à des ondes harmoniques, dans un milieu élastique composé de plusieurs couches. Il propose une méthode semi-analytique pour représenter cette géométrie et calculer la réponse du tunnel et du terrain environnant.",
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
        "This paper examines stresses and displacements around an arbitrarily shaped tunnel subjected to harmonic waves in a layered elastic medium. It develops a semi-analytical method to represent the geometry and calculate the response of the tunnel and surrounding ground.",
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
        "Ma thèse porte sur la réponse d’un tunnel enterré aux ondes mécaniques. Elle rassemble des modèles mathématiques et des méthodes de calcul pour évaluer les contraintes et les déplacements dans le tunnel et le terrain environnant, et étudier le comportement de ces ouvrages.",
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
        "My doctoral thesis studies how a buried tunnel responds to mechanical waves. It brings together mathematical models and computational methods for evaluating stresses and displacements in the tunnel and surrounding ground, helping to understand the behaviour of these structures.",
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
        "Deux cavités circulaires voisines modifient chacune les ondes qui atteignent l’autre. Cette étude analyse leur réponse dynamique couplée dans un milieu rocheux infini, afin de comprendre l’influence de cette interaction sur des galeries ou des tunnels rapprochés.",
      themes: ["Élastodynamique", "Diffraction d’ondes", "Cavités souterraines"],
      skills: ["Modélisation analytique", "Analyse dynamique", "Interprétation physique"],
    },
    en: {
      summary:
        "Two neighbouring circular cavities each alter the waves reaching the other. This study examines their coupled dynamic response in an infinite rock medium to understand how this interaction affects closely spaced galleries or tunnels.",
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
        "Cette étude suit l’évolution de la réponse d’un tunnel au cours du temps lorsqu’une onde traverse le terrain environnant. Le modèle prend en compte un milieu élastique hétérogène, dont les propriétés varient dans l’espace.",
      themes: ["Régime transitoire", "Milieux hétérogènes", "Propagation d’ondes"],
      skills: ["Analyse dans le domaine temporel", "Modélisation numérique", "Milieux hétérogènes"],
    },
    en: {
      summary:
        "This study follows a tunnel’s response over time as a wave travels through the surrounding ground. The model accounts for a heterogeneous elastic medium whose properties vary spatially.",
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
        "Ce travail porte sur la caractérisation mécanique du sous-sol du Laboratoire Souterrain à Bas Bruit (LSBB). Il associe modélisation et mesures pour décrire les propriétés du terrain, nécessaires à l’étude de la propagation des ondes autour des galeries.",
      themes: ["Caractérisation mécanique", "Géophysique", "LSBB"],
      skills: ["Modélisation & mesure", "Validation expérimentale", "Analyse de données"],
    },
    en: {
      summary:
        "This work examines the mechanical properties of the ground at the Low Noise Underground Laboratory (LSBB). It combines modelling and measurements to describe the ground properties needed to study wave propagation around the galleries.",
      themes: ["Mechanical characterisation", "Geophysics", "LSBB"],
      skills: ["Modelling & measurement", "Experimental validation", "Data analysis"],
    },
  },
]
