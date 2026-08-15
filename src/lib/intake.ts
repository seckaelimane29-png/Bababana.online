import type { IntakeStep, Language } from "./content";
import { INTAKE_QUIZ } from "./content";

type Q = { q: string; sub?: string; options?: string[]; low?: string; high?: string; placeholder?: string };
type Pack = Record<string, Q>;

const PACKS: Partial<Record<Language, Pack>> = {
  fr: {
    why: {
      q: "Pourquoi es-tu ici aujourd'hui ?",
      sub: "Sois honnête — personne ne regarde.",
      options: [
        "Je veux faire grandir mon esprit et mon argent",
        "Je commence des livres mais je ne les finis jamais",
        "Je veux une sagesse qui parle ma langue",
      ],
    },
    struggles: {
      q: "Qu'est-ce qui te bloque en ce moment ?",
      sub: "Choisis tout ce qui est vrai.",
      options: [
        "Pas le temps de lire des livres entiers",
        "Je sais quoi faire mais je ne le fais pas",
        "Je perds la motivation après quelques jours",
        "Rien de ce que je lis ne me ressemble",
        "Je construis quelque chose et j'ai besoin d'un avantage",
      ],
    },
    readiness: { q: "À quel point es-tu prêt à changer quelque chose ce mois-ci ?", low: "Juste curieux", high: "Très sérieux" },
    minutes: {
      q: "Combien de minutes par jour peux-tu vraiment donner ?",
      sub: "Choisis ce que tu peux tenir, pas ce qui sonne bien.",
      options: ["5 minutes", "10 minutes", "20 minutes"],
    },
    promise: {
      q: "En une phrase — qu'est-ce que tu veux voir changer dans 90 jours ?",
      sub: "On te le rappellera après chaque livre lu.",
      placeholder: "Dans 90 jours je veux…",
    },
  },
  it: {
    why: {
      q: "Perché sei qui oggi?",
      sub: "Sii onesto — nessuno ti guarda.",
      options: [
        "Voglio far crescere la mia mente e i miei soldi",
        "Inizio libri ma non li finisco mai",
        "Voglio saggezza che parli la mia lingua",
      ],
    },
    struggles: {
      q: "Cosa ti sta bloccando adesso?",
      sub: "Scegli tutto ciò che è vero.",
      options: [
        "Non ho tempo per leggere libri interi",
        "So cosa fare ma non lo faccio",
        "Perdo la motivazione dopo pochi giorni",
        "Niente di ciò che leggo sembra fatto per me",
        "Sto costruendo qualcosa e mi serve un vantaggio",
      ],
    },
    readiness: { q: "Quanto sei pronto a cambiare davvero qualcosa questo mese?", low: "Solo curioso", high: "Molto serio" },
    minutes: {
      q: "Quanti minuti al giorno puoi davvero dedicare?",
      sub: "Scegli quello che puoi mantenere, non quello che suona bene.",
      options: ["5 minuti", "10 minuti", "20 minuti"],
    },
    promise: {
      q: "In una frase — cosa vuoi che sia diverso tra 90 giorni?",
      sub: "Te lo ricorderemo dopo ogni libro che leggi.",
      placeholder: "Tra 90 giorni voglio…",
    },
  },
  ar: {
    why: {
      q: "لماذا أنت هنا اليوم؟",
      sub: "كن صادقًا — لا أحد يراقب.",
      options: [
        "أريد أن أنمّي عقلي ومالي",
        "أبدأ الكتب ولا أنهيها أبدًا",
        "أريد حكمة تتحدث لغتي",
      ],
    },
    struggles: {
      q: "ما الذي يعيقك الآن؟",
      sub: "اختر كل ما ينطبق عليك.",
      options: [
        "لا وقت لقراءة كتب كاملة",
        "أعرف ما يجب فعله لكنني لا أفعله",
        "أفقد الحماس بعد أيام قليلة",
        "لا شيء أقرأه يبدو مصنوعًا لي",
        "أبني مشروعًا وأحتاج إلى أفضلية",
      ],
    },
    readiness: { q: "ما مدى استعدادك لتغيير شيء فعلي هذا الشهر؟", low: "مجرد فضول", high: "جاد تمامًا" },
    minutes: {
      q: "كم دقيقة يوميًا تستطيع منحها فعلاً؟",
      sub: "اختر ما تستطيع الالتزام به، لا ما يبدو جميلًا.",
      options: ["5 دقائق", "10 دقائق", "20 دقيقة"],
    },
    promise: {
      q: "بجملة واحدة — ما الذي تريده مختلفًا بعد 90 يومًا؟",
      sub: "سنذكّرك بها بعد كل كتاب تقرأه.",
      placeholder: "بعد 90 يومًا أريد…",
    },
  },
  pt: {
    why: {
      q: "Por que você está aqui hoje?",
      sub: "Seja honesto — ninguém está a ver.",
      options: [
        "Quero crescer na mente e no dinheiro",
        "Começo livros mas nunca os termino",
        "Quero sabedoria que fale a minha língua",
      ],
    },
    struggles: {
      q: "O que o está a travar agora?",
      sub: "Escolha tudo o que for verdade.",
      options: [
        "Sem tempo para ler livros inteiros",
        "Sei o que fazer mas não faço",
        "Perco a motivação depois de poucos dias",
        "Nada do que leio parece feito para mim",
        "Estou a construir algo e preciso de vantagem",
      ],
    },
    readiness: { q: "Quão pronto está para mudar algo mesmo este mês?", low: "Só curioso", high: "Muito sério" },
    minutes: {
      q: "Quantos minutos por dia consegue dar de verdade?",
      sub: "Escolha o que consegue manter, não o que soa bem.",
      options: ["5 minutos", "10 minutos", "20 minutos"],
    },
    promise: {
      q: "Numa frase — o que quer diferente daqui a 90 dias?",
      sub: "Vamos lembrá-lo disto depois de cada livro.",
      placeholder: "Daqui a 90 dias quero…",
    },
  },
};

/** The intake quiz, localised into the language the user picked on the first screen. */
export function intakeQuiz(lang: Language): IntakeStep[] {
  const pack = PACKS[lang];
  if (!pack) return INTAKE_QUIZ;
  return INTAKE_QUIZ.map((step) => {
    if (step.kind !== "q") return step;
    const tr = pack[step.id];
    if (!tr) return step;
    const base = { q: tr.q ?? step.q, sub: tr.sub ?? step.sub };
    switch (step.type) {
      case "single":
      case "multi":
        return { ...step, ...base, options: tr.options ?? step.options };
      case "scale":
        return { ...step, ...base, low: tr.low ?? step.low, high: tr.high ?? step.high };
      case "text":
        return { ...step, ...base, placeholder: tr.placeholder ?? step.placeholder };
    }
  });
}
