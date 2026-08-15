import type { Language } from "./content";
import type { JourneyKey } from "./journeyQuiz";

export type CoachSection = {
  /** Small label above the bubble, e.g. "Section 1 of 3". */
  step: string;
  /** What the coach says, in first person. */
  says: string;
  /** Big line under the bubble. */
  title: string;
  cta: string;
};

export type MirrorCopy = {
  kicker: string;
  title: string;
  subtitle: string;
  saidLabel: string;
  /** One reflection line per question, shown under the user's own words. */
  reflections: Record<JourneyKey, string>;
  closing: string;
  cta: string;
};

type Pack = { coachName: string; sections: CoachSection[]; mirror: MirrorCopy };

const PACKS: Partial<Record<Language, Pack>> & { en: Pack } = {
  en: {
    coachName: "Sàmm",
    sections: [
      { step: "Section 1 of 3", says: "Before I give you a single book, I want to know where you are standing today. No judgement — just the truth.", title: "Let's start with you.", cta: "I'm ready" },
      { step: "Section 2 of 3", says: "Good. Now tell me what you are actually chasing, and how much of your day is really yours.", title: "What you want.", cta: "Continue" },
      { step: "Section 3 of 3", says: "Last part. Your language and your subject — because knowledge only lands when it speaks the way you think.", title: "How you read.", cta: "Let's finish" },
    ],
    mirror: {
      kicker: "In your own words",
      title: "This is what you just told me.",
      subtitle: "Read it back slowly. This is the person your first book is written for.",
      saidLabel: "You said",
      reflections: {
        place: "So we start where you actually stand — not where a book assumes you are.",
        challenge: "That is not a character flaw. It is a pattern, and patterns can be read and rewritten.",
        want: "Everything I hand you from now on serves that one sentence.",
        minutes: "That is enough. People rebuild whole lives in that window.",
        readLang: "You will read in the language you dream in. Nothing gets lost.",
        topic: "That is where we open the first page.",
      },
      closing: "I am not going to solve this for you here. The answer is inside the pages waiting for you.",
      cta: "Show me my first book",
    },
  },
  fr: {
    coachName: "Sàmm",
    sections: [
      { step: "Section 1 sur 3", says: "Avant de te donner le moindre livre, je veux savoir où tu en es aujourd'hui. Aucun jugement — juste la vérité.", title: "Commençons par toi.", cta: "Je suis prêt" },
      { step: "Section 2 sur 3", says: "Bien. Maintenant dis-moi ce que tu cherches vraiment, et combien de ta journée t'appartient réellement.", title: "Ce que tu veux.", cta: "Continuer" },
      { step: "Section 3 sur 3", says: "Dernière partie. Ta langue et ton sujet — car le savoir n'entre que s'il parle comme tu penses.", title: "Ta façon de lire.", cta: "Terminons" },
    ],
    mirror: {
      kicker: "Avec tes mots",
      title: "Voici ce que tu viens de me dire.",
      subtitle: "Relis-le lentement. C'est pour cette personne que ton premier livre est écrit.",
      saidLabel: "Tu as dit",
      reflections: {
        place: "On part donc d'où tu es vraiment — pas d'où un livre imagine que tu es.",
        challenge: "Ce n'est pas un défaut. C'est un schéma, et un schéma peut se lire et se réécrire.",
        want: "Tout ce que je te donnerai désormais sert cette seule phrase.",
        minutes: "C'est suffisant. Des vies entières se reconstruisent dans ce créneau.",
        readLang: "Tu liras dans la langue où tu rêves. Rien ne se perd.",
        topic: "C'est là que nous ouvrons la première page.",
      },
      closing: "Je ne vais pas résoudre ça ici. La réponse est dans les pages qui t'attendent.",
      cta: "Montre-moi mon premier livre",
    },
  },
  it: {
    coachName: "Sàmm",
    sections: [
      { step: "Sezione 1 di 3", says: "Prima di darti un solo libro, voglio sapere dove ti trovi oggi. Nessun giudizio — solo la verità.", title: "Partiamo da te.", cta: "Sono pronto" },
      { step: "Sezione 2 di 3", says: "Bene. Ora dimmi cosa stai davvero inseguendo, e quanta parte della giornata è veramente tua.", title: "Ciò che vuoi.", cta: "Continua" },
      { step: "Sezione 3 di 3", says: "Ultima parte. La tua lingua e il tuo tema — la conoscenza entra solo se parla come pensi.", title: "Come leggi.", cta: "Finiamo" },
    ],
    mirror: {
      kicker: "Con le tue parole",
      title: "Questo è ciò che mi hai appena detto.",
      subtitle: "Rileggilo piano. Il tuo primo libro è scritto per questa persona.",
      saidLabel: "Hai detto",
      reflections: {
        place: "Partiamo da dove sei davvero — non da dove un libro immagina che tu sia.",
        challenge: "Non è un difetto. È uno schema, e gli schemi si possono leggere e riscrivere.",
        want: "Tutto ciò che ti darò da ora serve quella sola frase.",
        minutes: "Basta così. Ci sono vite intere ricostruite in quella finestra.",
        readLang: "Leggerai nella lingua in cui sogni. Non si perde nulla.",
        topic: "È lì che apriamo la prima pagina.",
      },
      closing: "Non risolverò tutto qui. La risposta è dentro le pagine che ti aspettano.",
      cta: "Mostrami il mio primo libro",
    },
  },
  pt: {
    coachName: "Sàmm",
    sections: [
      { step: "Secção 1 de 3", says: "Antes de lhe dar um único livro, quero saber onde está hoje. Sem julgamento — só a verdade.", title: "Comecemos por si.", cta: "Estou pronto" },
      { step: "Secção 2 de 3", says: "Bom. Agora diga-me o que procura de verdade, e quanto do seu dia é mesmo seu.", title: "O que quer.", cta: "Continuar" },
      { step: "Secção 3 de 3", says: "Última parte. A sua língua e o seu tema — o saber só entra quando fala como você pensa.", title: "Como lê.", cta: "Vamos terminar" },
    ],
    mirror: {
      kicker: "Nas suas palavras",
      title: "Isto foi o que acabou de me dizer.",
      subtitle: "Releia devagar. O seu primeiro livro foi escrito para esta pessoa.",
      saidLabel: "Você disse",
      reflections: {
        place: "Começamos onde está mesmo — não onde um livro imagina que está.",
        challenge: "Não é um defeito. É um padrão, e padrões podem ser lidos e reescritos.",
        want: "Tudo o que lhe der a partir de agora serve essa única frase.",
        minutes: "Chega. Há vidas inteiras reconstruídas nessa janela.",
        readLang: "Vai ler na língua em que sonha. Nada se perde.",
        topic: "É aí que abrimos a primeira página.",
      },
      closing: "Não vou resolver isto aqui. A resposta está nas páginas que o esperam.",
      cta: "Mostre-me o meu primeiro livro",
    },
  },
  ar: {
    coachName: "سام",
    sections: [
      { step: "القسم ١ من ٣", says: "قبل أن أعطيك أي كتاب، أريد أن أعرف أين أنت اليوم. بلا أحكام — الحقيقة فقط.", title: "لنبدأ بك أنت.", cta: "أنا مستعد" },
      { step: "القسم ٢ من ٣", says: "جيد. الآن أخبرني بما تسعى إليه فعلاً، وكم من يومك يخصّك حقًا.", title: "ما الذي تريده.", cta: "متابعة" },
      { step: "القسم ٣ من ٣", says: "الجزء الأخير. لغتك وموضوعك — فالمعرفة لا تصل إلا إذا تكلمت بطريقة تفكيرك.", title: "كيف تقرأ.", cta: "لننهِ الأمر" },
    ],
    mirror: {
      kicker: "بكلماتك أنت",
      title: "هذا ما قلته لي للتو.",
      subtitle: "اقرأه ببطء. كتابك الأول مكتوب لهذا الشخص.",
      saidLabel: "قلت",
      reflections: {
        place: "سنبدأ من حيث أنت فعلاً — لا من حيث يفترض الكتاب أنك موجود.",
        challenge: "هذا ليس عيبًا فيك. إنه نمط، والأنماط تُقرأ وتُعاد كتابتها.",
        want: "كل ما سأعطيك من الآن يخدم هذه الجملة وحدها.",
        minutes: "هذا يكفي. حيوات كاملة أُعيد بناؤها في هذه المساحة.",
        readLang: "ستقرأ باللغة التي تحلم بها. لن يضيع شيء.",
        topic: "من هناك نفتح الصفحة الأولى.",
      },
      closing: "لن أحل لك هذا هنا. الجواب داخل الصفحات التي تنتظرك.",
      cta: "أرني كتابي الأول",
    },
  },
};

export function journeyCoach(lang: Language): Pack {
  return PACKS[lang] ?? PACKS.en;
}

/** True when this language has hand-written coach copy. */
export function hasNativeCoachPack(lang: Language) {
  return Boolean(PACKS[lang]);
}
