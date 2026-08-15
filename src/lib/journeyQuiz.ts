import type { Language } from "./content";

export type JourneyOption = { id: string; emoji: string; label: string };
export type JourneyQuestion = { id: JourneyKey; title: string; options: JourneyOption[] };
export type JourneyKey = "place" | "challenge" | "want" | "minutes" | "readLang" | "topic";

export type JourneyPack = {
  questions: JourneyQuestion[];
  ui: {
    of: string;
    back: string;
    kicker: string;
    title: string;
    yourBook: string;
    yourGoal: string;
    yourLang: string;
    minutesADay: string;
    cta: string;
    loadingBook: string;
  };
  /** Personalised line keyed by the "place" answer. */
  messages: Record<string, string>;
  /** Two full-screen interstitials shown after Q2 and Q4. */
  interstitials: JourneyInterstitial[];
};

export type JourneyInterstitial = { kicker: string; title: string; body: string; cta: string };

const OPTION_IDS = {
  place: ["africa", "arrived", "years", "founder"],
  challenge: ["wealth", "start", "time", "cultures"],
  want: ["income", "learn", "become", "family"],
  minutes: ["5", "15", "30", "60"],
  readLang: ["en", "fr", "wo", "it", "es"],
  topic: ["money", "mindset", "business", "purpose"],
};

const EMOJIS = {
  place: ["🌍", "✈️", "💪", "🚀"],
  challenge: ["💰", "🧠", "⏰", "🌐"],
  want: ["📈", "📚", "🏆", "👨‍👩‍👧"],
  minutes: ["⚡", "📖", "🔥", "💎"],
  readLang: ["🇬🇧", "🇫🇷", "🌍", "🇮🇹", "🇪🇸"],
  topic: ["💰", "🧠", "🚀", "❤️"],
};

type Raw = {
  titles: Record<JourneyKey, string>;
  labels: Record<JourneyKey, string[]>;
  ui: JourneyPack["ui"];
  messages: Record<string, string>;
  interstitials: JourneyInterstitial[];
};

const RAW: Partial<Record<Language, Raw>> & { en: Raw } = {
  en: {
    titles: {
      place: "Where are you right now in life?",
      challenge: "What is holding you back the most?",
      want: "What do you want most in the next 12 months?",
      minutes: "How much time can you give yourself every day?",
      readLang: "Which language do you prefer to read in?",
      topic: "Which topic speaks to you most right now?",
    },
    labels: {
      place: [
        "I am in Africa building my future",
        "I just arrived in Europe starting fresh",
        "I have been in Europe for years, still fighting",
        "I am an entrepreneur building something",
      ],
      challenge: [
        "I work hard but never build wealth",
        "I know what to do but never start",
        "I have no time for myself",
        "I feel lost between two cultures",
      ],
      want: [
        "Build something that generates income",
        "Learn more and grow my mind",
        "Become the person I always imagined",
        "Build a better life for my family",
      ],
      minutes: [
        "5 minutes — I am very busy",
        "15 minutes — I can make time",
        "30 minutes — I am serious about this",
        "1 hour — I am fully committed",
      ],
      readLang: ["English", "French", "Wolof", "Italian", "Spanish"],
      topic: ["Money and wealth", "Mindset and discipline", "Business and entrepreneurship", "Purpose and meaning"],
    },
    ui: {
      of: "of",
      back: "Back",
      kicker: "Your path is ready",
      title: "This is where you start.",
      yourBook: "Your first book",
      yourGoal: "Your daily goal",
      yourLang: "Your language",
      minutesADay: "minutes a day",
      cta: "Start My Journey — Free for 2 Days",
      loadingBook: "Choosing your first book…",
    },
    interstitials: [
      { kicker: "The truth", title: "You are not lazy. You are tired.", body: "Most people who never finish a book are not missing discipline — they are missing 15 honest minutes that belong to them alone. That is all we are going to protect.", cta: "Continue" },
      { kicker: "Your promise", title: "Small pages. Whole life.", body: "One insight a day, in your language, is enough to change how you think about money, work and family in 90 days. Two more questions and your path is ready.", cta: "I am ready" },
    ],
    messages: {
      africa: "You are building from home, where the roots are. Yesal sa Khel gives you the same knowledge they read in London and Milan — in your language, every morning.",
      arrived: "You left everything to build something better. Yesal sa Khel was built for exactly this moment.",
      years: "You have carried this fight for years. From today, the work starts paying your mind back too.",
      founder: "You are already building. Now you get the thinking that keeps it standing.",
    },
  },
  fr: {
    titles: {
      place: "Où en es-tu dans ta vie en ce moment ?",
      challenge: "Qu'est-ce qui te freine le plus ?",
      want: "Que veux-tu le plus dans les 12 prochains mois ?",
      minutes: "Combien de temps peux-tu t'accorder chaque jour ?",
      readLang: "Dans quelle langue préfères-tu lire ?",
      topic: "Quel sujet te parle le plus en ce moment ?",
    },
    labels: {
      place: [
        "Je suis en Afrique et je construis mon avenir",
        "Je viens d'arriver en Europe, je repars de zéro",
        "Je suis en Europe depuis des années, je me bats encore",
        "Je suis entrepreneur, je construis quelque chose",
      ],
      challenge: [
        "Je travaille dur mais je ne construis rien",
        "Je sais quoi faire mais je ne commence jamais",
        "Je n'ai pas de temps pour moi",
        "Je me sens perdu entre deux cultures",
      ],
      want: [
        "Créer quelque chose qui génère des revenus",
        "Apprendre plus et faire grandir mon esprit",
        "Devenir la personne que j'ai toujours imaginée",
        "Construire une meilleure vie pour ma famille",
      ],
      minutes: [
        "5 minutes — je suis très occupé",
        "15 minutes — je peux trouver le temps",
        "30 minutes — je suis sérieux",
        "1 heure — je suis totalement engagé",
      ],
      readLang: ["Anglais", "Français", "Wolof", "Italien", "Espagnol"],
      topic: ["Argent et richesse", "Mental et discipline", "Business et entrepreneuriat", "Sens et mission"],
    },
    ui: {
      of: "sur",
      back: "Retour",
      kicker: "Ton chemin est prêt",
      title: "C'est ici que tu commences.",
      yourBook: "Ton premier livre",
      yourGoal: "Ton objectif quotidien",
      yourLang: "Ta langue",
      minutesADay: "minutes par jour",
      cta: "Commencer mon voyage — 2 jours offerts",
      loadingBook: "Choix de ton premier livre…",
    },
    interstitials: [
      { kicker: "La vérité", title: "Tu n'es pas paresseux. Tu es fatigué.", body: "Ceux qui ne finissent jamais un livre ne manquent pas de discipline — il leur manque 15 minutes honnêtes qui n'appartiennent qu'à eux. C'est tout ce que nous allons protéger.", cta: "Continuer" },
      { kicker: "Ta promesse", title: "Peu de pages. Toute une vie.", body: "Une idée par jour, dans ta langue, suffit à changer ta façon de voir l'argent, le travail et la famille en 90 jours. Encore deux questions et ton chemin est prêt.", cta: "Je suis prêt" },
    ],
    messages: {
      africa: "Tu construis depuis chez toi, là où sont les racines. Yesal sa Khel t'apporte le même savoir qu'à Londres ou Milan — dans ta langue, chaque matin.",
      arrived: "Tu as tout quitté pour construire mieux. Yesal sa Khel a été créé exactement pour ce moment.",
      years: "Tu portes ce combat depuis des années. À partir d'aujourd'hui, ton travail nourrit aussi ton esprit.",
      founder: "Tu construis déjà. Maintenant tu reçois la pensée qui fait tenir l'ouvrage.",
    },
  },
  it: {
    titles: {
      place: "A che punto della tua vita sei adesso?",
      challenge: "Cosa ti sta frenando di più?",
      want: "Cosa vuoi di più nei prossimi 12 mesi?",
      minutes: "Quanto tempo puoi dedicarti ogni giorno?",
      readLang: "In quale lingua preferisci leggere?",
      topic: "Quale tema ti parla di più in questo momento?",
    },
    labels: {
      place: [
        "Sono in Africa e sto costruendo il mio futuro",
        "Sono appena arrivato in Europa, riparto da zero",
        "Sono in Europa da anni e sto ancora lottando",
        "Sono un imprenditore e sto costruendo qualcosa",
      ],
      challenge: [
        "Lavoro tanto ma non costruisco ricchezza",
        "So cosa fare ma non inizio mai",
        "Non ho tempo per me stesso",
        "Mi sento perso tra due culture",
      ],
      want: [
        "Creare qualcosa che generi entrate",
        "Imparare di più e far crescere la mia mente",
        "Diventare la persona che ho sempre immaginato",
        "Costruire una vita migliore per la mia famiglia",
      ],
      minutes: [
        "5 minuti — sono molto occupato",
        "15 minuti — posso trovare il tempo",
        "30 minuti — faccio sul serio",
        "1 ora — sono totalmente dentro",
      ],
      readLang: ["Inglese", "Francese", "Wolof", "Italiano", "Spagnolo"],
      topic: ["Soldi e ricchezza", "Mentalità e disciplina", "Business e imprenditoria", "Scopo e significato"],
    },
    ui: {
      of: "di",
      back: "Indietro",
      kicker: "Il tuo percorso è pronto",
      title: "È da qui che si comincia.",
      yourBook: "Il tuo primo libro",
      yourGoal: "Il tuo obiettivo giornaliero",
      yourLang: "La tua lingua",
      minutesADay: "minuti al giorno",
      cta: "Inizia il mio percorso — 2 giorni gratis",
      loadingBook: "Sto scegliendo il tuo primo libro…",
    },
    interstitials: [
      { kicker: "La verità", title: "Non sei pigro. Sei stanco.", body: "Chi non finisce mai un libro non manca di disciplina — gli mancano 15 minuti onesti che appartengono solo a lui. È tutto ciò che proteggeremo.", cta: "Continua" },
      { kicker: "La tua promessa", title: "Poche pagine. Tutta una vita.", body: "Un'idea al giorno, nella tua lingua, basta a cambiare come pensi a soldi, lavoro e famiglia in 90 giorni. Ancora due domande e il tuo percorso è pronto.", cta: "Sono pronto" },
    ],
    messages: {
      africa: "Stai costruendo da casa, dove sono le radici. Yesal sa Khel ti dà la stessa conoscenza che leggono a Londra e Milano — nella tua lingua, ogni mattina.",
      arrived: "Hai lasciato tutto per costruire qualcosa di meglio. Yesal sa Khel è nato esattamente per questo momento.",
      years: "Porti questa lotta da anni. Da oggi il lavoro ripaga anche la tua mente.",
      founder: "Stai già costruendo. Ora ricevi il pensiero che tiene in piedi tutto.",
    },
  },
  pt: {
    titles: {
      place: "Onde está na sua vida neste momento?",
      challenge: "O que mais o está a travar?",
      want: "O que mais quer nos próximos 12 meses?",
      minutes: "Quanto tempo consegue dar a si próprio todos os dias?",
      readLang: "Em que língua prefere ler?",
      topic: "Que tema lhe fala mais agora?",
    },
    labels: {
      place: [
        "Estou em África a construir o meu futuro",
        "Acabei de chegar à Europa, a começar do zero",
        "Estou na Europa há anos, ainda a lutar",
        "Sou empreendedor e estou a construir algo",
      ],
      challenge: [
        "Trabalho muito mas nunca construo riqueza",
        "Sei o que fazer mas nunca começo",
        "Não tenho tempo para mim",
        "Sinto-me perdido entre duas culturas",
      ],
      want: [
        "Criar algo que gere rendimento",
        "Aprender mais e crescer na mente",
        "Tornar-me a pessoa que sempre imaginei",
        "Construir uma vida melhor para a minha família",
      ],
      minutes: [
        "5 minutos — estou muito ocupado",
        "15 minutos — consigo arranjar tempo",
        "30 minutos — estou a levar isto a sério",
        "1 hora — estou totalmente comprometido",
      ],
      readLang: ["Inglês", "Francês", "Wolof", "Italiano", "Espanhol"],
      topic: ["Dinheiro e riqueza", "Mentalidade e disciplina", "Negócios e empreendedorismo", "Propósito e sentido"],
    },
    ui: {
      of: "de",
      back: "Voltar",
      kicker: "O seu caminho está pronto",
      title: "É aqui que começa.",
      yourBook: "O seu primeiro livro",
      yourGoal: "A sua meta diária",
      yourLang: "A sua língua",
      minutesADay: "minutos por dia",
      cta: "Começar a minha jornada — 2 dias grátis",
      loadingBook: "A escolher o seu primeiro livro…",
    },
    interstitials: [
      { kicker: "A verdade", title: "Não é preguiça. É cansaço.", body: "Quem nunca termina um livro não tem falta de disciplina — tem falta de 15 minutos honestos que sejam só seus. É isso que vamos proteger.", cta: "Continuar" },
      { kicker: "A sua promessa", title: "Poucas páginas. Uma vida inteira.", body: "Uma ideia por dia, na sua língua, chega para mudar como pensa em dinheiro, trabalho e família em 90 dias. Mais duas perguntas e o seu caminho está pronto.", cta: "Estou pronto" },
    ],
    messages: {
      africa: "Está a construir a partir de casa, onde estão as raízes. O Yesal sa Khel dá-lhe o mesmo conhecimento que leem em Londres e Milão — na sua língua, todas as manhãs.",
      arrived: "Deixou tudo para construir algo melhor. O Yesal sa Khel foi feito exatamente para este momento.",
      years: "Carrega esta luta há anos. A partir de hoje, o trabalho também alimenta a sua mente.",
      founder: "Já está a construir. Agora recebe o pensamento que mantém tudo de pé.",
    },
  },
  ar: {
    titles: {
      place: "أين أنت في حياتك الآن؟",
      challenge: "ما الذي يعيقك أكثر من غيره؟",
      want: "ما الذي تريده أكثر خلال الـ 12 شهرًا القادمة؟",
      minutes: "كم من الوقت تستطيع أن تمنح نفسك كل يوم؟",
      readLang: "بأي لغة تفضّل القراءة؟",
      topic: "أي موضوع يخاطبك أكثر الآن؟",
    },
    labels: {
      place: [
        "أنا في أفريقيا أبني مستقبلي",
        "وصلت للتو إلى أوروبا وأبدأ من جديد",
        "أنا في أوروبا منذ سنوات وما زلت أكافح",
        "أنا رائد أعمال وأبني شيئًا",
      ],
      challenge: [
        "أعمل بجد لكنني لا أبني ثروة",
        "أعرف ما يجب فعله لكنني لا أبدأ",
        "ليس لدي وقت لنفسي",
        "أشعر بالضياع بين ثقافتين",
      ],
      want: [
        "بناء شيء يولّد دخلاً",
        "أن أتعلم أكثر وأنمّي عقلي",
        "أن أصبح الشخص الذي تخيلته دائمًا",
        "بناء حياة أفضل لعائلتي",
      ],
      minutes: [
        "5 دقائق — أنا مشغول جدًا",
        "15 دقيقة — أستطيع تدبير الوقت",
        "30 دقيقة — أنا جاد في هذا",
        "ساعة — أنا ملتزم تمامًا",
      ],
      readLang: ["الإنجليزية", "الفرنسية", "الولوفية", "الإيطالية", "الإسبانية"],
      topic: ["المال والثروة", "العقلية والانضباط", "الأعمال وريادة الأعمال", "المعنى والرسالة"],
    },
    ui: {
      of: "من",
      back: "رجوع",
      kicker: "طريقك جاهز",
      title: "من هنا تبدأ.",
      yourBook: "كتابك الأول",
      yourGoal: "هدفك اليومي",
      yourLang: "لغتك",
      minutesADay: "دقيقة يوميًا",
      cta: "ابدأ رحلتي — مجانًا لمدة يومين",
      loadingBook: "نختار كتابك الأول…",
    },
    interstitials: [
      { kicker: "الحقيقة", title: "أنت لست كسولًا. أنت متعب.", body: "من لا ينهون كتابًا أبدًا لا ينقصهم الانضباط — ينقصهم 15 دقيقة صادقة تخصّهم وحدهم. هذا كل ما سنحميه.", cta: "متابعة" },
      { kicker: "وعدك", title: "صفحات قليلة. حياة كاملة.", body: "فكرة واحدة يوميًا بلغتك تكفي لتغيير نظرتك إلى المال والعمل والعائلة خلال 90 يومًا. سؤالان فقط ويصبح طريقك جاهزًا.", cta: "أنا مستعد" },
    ],
    messages: {
      africa: "أنت تبني من الوطن، حيث الجذور. يمنحك يسال سا خيل المعرفة نفسها التي تُقرأ في لندن وميلانو — بلغتك، كل صباح.",
      arrived: "تركت كل شيء لتبني ما هو أفضل. يسال سا خيل صُنع لهذه اللحظة بالذات.",
      years: "تحمل هذا الكفاح منذ سنوات. من اليوم، يعود تعبك على عقلك أيضًا.",
      founder: "أنت تبني بالفعل. الآن تحصل على التفكير الذي يبقي البناء واقفًا.",
    },
  },
};

export function journeyPack(lang: Language): JourneyPack {
  const raw = RAW[lang] ?? RAW.en;
  // Reading language is chosen on the very first screen (/language), so it is not asked again here.
  const keys: JourneyKey[] = ["place", "challenge", "want", "minutes", "topic"];
  return {
    ui: raw.ui,
    messages: raw.messages,
    interstitials: raw.interstitials,
    questions: keys.map((k) => ({
      id: k,
      title: raw.titles[k],
      options: OPTION_IDS[k].map((id, i) => ({ id, emoji: EMOJIS[k][i], label: raw.labels[k][i] })),
    })),
  };
}

/** Reading-language answer → an app language we can fully render. */
export function toAppLanguage(readLang: string): Language {
  switch (readLang) {
    case "fr":
      return "fr";
    case "it":
      return "it";
    case "es":
      return "pt";
    default:
      return "en"; // English and Wolof both read in English, with Wolof wisdom in every book
  }
}

/** Topic answer → the library category we recommend the first book from. */
export const TOPIC_CATEGORY: Record<string, string> = {
  money: "Money",
  mindset: "Mindset",
  business: "Business",
  purpose: "Philosophy",
};
/** True when this language has hand-written quiz copy. */
export function hasNativeJourneyPack(lang: Language) {
  return Boolean(RAW[lang]);
}
