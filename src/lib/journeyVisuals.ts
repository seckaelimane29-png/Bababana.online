import type { Language } from "./content";

export type StatVisual = {
  kicker: string;
  headline: string;
  stat: string;
  statCaption: string;
  youLabel: string;
  themLabel: string;
  youValue: string;
  themValue: string;
  footnote: string;
};

export type CommitVisual = {
  tiles: Array<{ label: string; value: string }>;
};

export type JourneyVisuals = { stat: StatVisual; commit: CommitVisual };

export const JOURNEY_VISUALS: Partial<Record<Language, JourneyVisuals>> & { en: JourneyVisuals } = {
  en: {
    stat: {
      kicker: "The maths",
      headline: "Right now you finish only",
      stat: "8%",
      statCaption: "of the books you start.",
      youLabel: "You today",
      themLabel: "People who read daily",
      youValue: "2 books / year",
      themValue: "24 books / year",
      footnote: "It was never discipline. Nobody gave you 15 minutes that belong to you.",
    },
    commit: {
      tiles: [
        { label: "Show up daily", value: "15 min a day" },
        { label: "Be honest", value: "With yourself" },
        { label: "Track it", value: "Every insight" },
        { label: "Trust the process", value: "90 days minimum" },
      ],
    },
  },
  fr: {
    stat: {
      kicker: "Les chiffres",
      headline: "Aujourd'hui tu termines seulement",
      stat: "8%",
      statCaption: "des livres que tu commences.",
      youLabel: "Toi aujourd'hui",
      themLabel: "Ceux qui lisent chaque jour",
      youValue: "2 livres / an",
      themValue: "24 livres / an",
      footnote: "Ce n'était jamais la discipline. Personne ne t'a donné 15 minutes à toi.",
    },
    commit: {
      tiles: [
        { label: "Être là chaque jour", value: "15 min par jour" },
        { label: "Être honnête", value: "Avec toi-même" },
        { label: "Suivre", value: "Chaque idée" },
        { label: "Faire confiance", value: "90 jours minimum" },
      ],
    },
  },
  it: {
    stat: {
      kicker: "I numeri",
      headline: "Oggi finisci soltanto",
      stat: "8%",
      statCaption: "dei libri che inizi.",
      youLabel: "Tu oggi",
      themLabel: "Chi legge ogni giorno",
      youValue: "2 libri / anno",
      themValue: "24 libri / anno",
      footnote: "Non è mai stata la disciplina. Nessuno ti ha dato 15 minuti tuoi.",
    },
    commit: {
      tiles: [
        { label: "Esserci ogni giorno", value: "15 min al giorno" },
        { label: "Essere onesto", value: "Con te stesso" },
        { label: "Tenere traccia", value: "Ogni intuizione" },
        { label: "Fidarti del percorso", value: "90 giorni minimo" },
      ],
    },
  },
  pt: {
    stat: {
      kicker: "As contas",
      headline: "Hoje terminas apenas",
      stat: "8%",
      statCaption: "dos livros que começas.",
      youLabel: "Tu hoje",
      themLabel: "Quem lê todos os dias",
      youValue: "2 livros / ano",
      themValue: "24 livros / ano",
      footnote: "Nunca foi disciplina. Ninguém te deu 15 minutos que sejam teus.",
    },
    commit: {
      tiles: [
        { label: "Aparecer todos os dias", value: "15 min por dia" },
        { label: "Ser honesto", value: "Contigo mesmo" },
        { label: "Registar", value: "Cada ideia" },
        { label: "Confiar no processo", value: "90 dias no mínimo" },
      ],
    },
  },
  ar: {
    stat: {
      kicker: "الأرقام",
      headline: "اليوم تُنهي فقط",
      stat: "٨٪",
      statCaption: "من الكتب التي تبدأها.",
      youLabel: "أنت اليوم",
      themLabel: "من يقرأ يوميًا",
      youValue: "كتابان / سنة",
      themValue: "٢٤ كتابًا / سنة",
      footnote: "لم تكن المشكلة في الانضباط. لم يمنحك أحد ١٥ دقيقة تخصّك وحدك.",
    },
    commit: {
      tiles: [
        { label: "احضر كل يوم", value: "١٥ دقيقة يوميًا" },
        { label: "كن صادقًا", value: "مع نفسك" },
        { label: "تابع تقدمك", value: "كل فكرة" },
        { label: "ثق بالطريق", value: "٩٠ يومًا على الأقل" },
      ],
    },
  },
};

export function journeyVisuals(lang: Language): JourneyVisuals {
  return JOURNEY_VISUALS[lang] ?? JOURNEY_VISUALS.en;
}

/** True when this language has hand-written story-beat copy. */
export function hasNativeVisuals(lang: Language) {
  return Boolean(JOURNEY_VISUALS[lang]);
}
