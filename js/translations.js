/* The Signal Method — content guide, in 4 languages. */
const TRANSLATIONS = {
  en: {
    code: "en",
    label: "English",
    htmlLang: "en",
    dir: "ltr",
    nav: { switcher: "Language" },
    cover: {
      badge: "The Complete Guide",
      number: "50",
      titleLine1: "The Signal",
      titleLine2: "Method",
      subtitle: "Turn your experience into content that finds you",
      quote: "Your story is not a highlight reel. It's raw material.",
      motto: "Nekal sa bopp. Move.",
      stats: ["7 Parts", "50 Points", "7 Worked Examples", "1 System"]
    },
    howto: {
      label: "How To Use This",
      p1: "Most people building a personal brand don't have a content problem. They have a structure problem — attention that never turns into anything durable. This guide is the seven-part system for fixing that, in order.",
      p2: "Read one part before you script your next piece of content. Apply it once before moving to the next part — the order matters, because each part builds on the one before it.",
      tocLabel: "Contents"
    },
    appliedLabel: "Applied",
    pointsSuffix: "points in this part",
    parts: [
      {
        id: "the-mine",
        eyebrow: "Part 01",
        tagline: "Your life is already the material.",
        title: "The Mine",
        intro: "Before you script anything, the raw material already exists inside you. Most people scroll past their own best content because it feels too ordinary to be worth saying out loud.",
        points: [
          "List every mistake that cost you time or money — each one is a video",
          "List every question people ask you more than twice — that's proof of demand",
          "Write down the moment you almost quit — the turning point is the hook",
          "Name the skill you use without thinking — invisible to you, valuable to everyone else",
          "Track what you're building right now, in real numbers — progress is content, not just the result",
          "Notice what makes you genuinely frustrated in your field — a real opinion is magnetic",
          "Revisit your worst week on purpose — struggle told honestly builds more trust than any highlight reel",
          "Ask what you believed a year ago that you don't believe now — that shift is a full script on its own"
        ],
        applied: "Someone spends two hours waiting on a ride that never confirms. Told honestly, that frustration becomes the hook for a piece about a better way to solve exactly that problem — no research required, because the material already happened to them."
      },
      {
        id: "the-hook",
        eyebrow: "Part 02",
        tagline: "You get three seconds. Use them.",
        title: "The Hook",
        intro: "You have about three seconds before someone decides whether you've earned their next three. The hook's only job is surviving that first decision.",
        points: [
          "Open mid-scene, not mid-thought — start at the moment something went wrong",
          "Say a specific number in the first line — numbers stop the scroll faster than adjectives",
          "Contradict an expectation — “I said I'd never…” works because it promises a reversal",
          "Ask the exact question your viewer is already asking themselves, before you answer it",
          "Withhold the outcome — tease it without giving it away in the opening sentence",
          "Keep opening sentences short — a long setup loses people before the idea even lands",
          "Don't introduce yourself in the hook — earn the attention first, explain who you are second"
        ],
        applied: "“Today I want to talk about missed opportunities” loses to “I was standing in an airport, watching my flight leave without me.” Same topic. Completely different survival rate in the first three seconds."
      },
      {
        id: "the-arc",
        eyebrow: "Part 03",
        tagline: "Five beats. No more, no fewer.",
        title: "The Arc",
        intro: "A story that sells and a story that only entertains use the same five beats. The difference is whether the fifth beat exists at all.",
        points: [
          "Hook — the moment, never the topic",
          "Pain — name the specific cost, not the general struggle",
          "Turn — the exact decision or realization that changed the outcome",
          "Lesson — one sentence someone could repeat to a friend an hour later",
          "Bridge — a single line connecting the lesson to what you offer, only on sell-weeks",
          "Close — one specific next action, never a vague “learn more”",
          "Cut anything that doesn't serve one of these five beats, even a detail you love"
        ],
        applied: "A travel disaster story earns its ending only if the last line does something: either it lands a lesson worth repeating, or it bridges to a real offer. Without beat five, it's a good story that changes nothing about what happens next."
      },
      {
        id: "the-ratio",
        eyebrow: "Part 04",
        tagline: "Trust first. Sell rarely.",
        title: "The Ratio",
        intro: "An audience that only sees offers stops trusting you. An audience that only sees stories never buys. The ratio is what keeps both alive at the same time.",
        points: [
          "For every four pieces of trust content, post one that actually asks for something",
          "Trust content teaches, reveals, or admits — it never asks",
          "Sell content always closes with one specific action, never a vague interest-check",
          "Never sell inside a story that hasn't finished making its emotional case yet",
          "Audit your last ten posts — more than three asks means you're overselling, pull back",
          "Let the core lesson repeat across different scenes — the story shouldn't repeat, the lesson can",
          "Occasionally let your best trust post run with no CTA at all — restraint builds more credibility than it costs in conversions"
        ],
        applied: "A week that's four parts honest build-in-public update and one part direct offer earns the right to ask, because the audience already knows the asking isn't all you do."
      },
      {
        id: "the-magnet",
        eyebrow: "Part 05",
        tagline: "Watched isn't the same as reached-out-to.",
        title: "The Magnet",
        intro: "Content that gets watched is not the same as content that gets someone to reach out. That takes a specific, slightly uncomfortable clarity about what you actually want them to do next.",
        points: [
          "Ask one direct question per caption, never two — a choice between things creates hesitation",
          "Make the ask answerable in one word — “comment your number” beats “let me know your thoughts”",
          "Reply to every comment inside the first hour — the algorithm and the person both reward it",
          "When someone comments, ask them a question back instead of just thanking them",
          "Turn your best comment into next week's video — visible listening builds more trust than any script",
          "Give people a reason to tag someone, not only to comment — that's how reach compounds",
          "Never end on “let me know what you think” alone — always pair it with one concrete next step"
        ],
        applied: "“Comment YES if this happened to you” out-performs “what do you think?” because it asks for one word, not an essay — and every reply becomes proof the next viewer can see."
      },
      {
        id: "the-close",
        eyebrow: "Part 06",
        tagline: "The DM is an opening, not a sale.",
        title: "The Close",
        intro: "Someone reaching out is not a sale — it's an opening. What you say in the next two messages decides whether that opening closes or leaks.",
        points: [
          "Respond fast — interest has a half-life measured in minutes, not hours",
          "Ask one clarifying question before pitching anything — it proves you actually listened",
          "Every objection is a question wearing a disguise — answer the real question underneath it",
          "Make the next step small enough to be hard to refuse — two minutes, one link, one message",
          "State the offer once, clearly, then stop talking — the next person who speaks first often loses the close",
          "Silence after an ask isn't rejection — it's often just someone deciding. Let it sit",
          "If they say no, ask what would have made it a yes — that answer is worth more than the sale you missed"
        ],
        applied: "“Let me think about it” is rarely the real objection. Asking “what specifically would you need to think through?” usually surfaces the one real question — and it's often answerable on the spot."
      },
      {
        id: "the-ladder",
        eyebrow: "Part 07",
        tagline: "Attention alone doesn't pay you.",
        title: "The Ladder",
        intro: "Content creates attention. Attention alone doesn't create income. Between the two sits a structure — and most creators never build it on purpose.",
        points: [
          "Map every piece of content to a layer: free trust, low-ticket entry, recurring offer, or infrastructure",
          "Never build layer three before layer two has proof it converts",
          "Point your free content at one entry offer, not five — confusion kills conversion",
          "Recurring revenue should never depend on a single video going viral to survive the month",
          "Review the ladder monthly — most creators fix the wrong layer because they never mapped it",
          "Build whichever layer has the fewest live pieces next, not the one that feels most exciting",
          "Consistency beats intensity — a ladder built slowly over months outperforms one rushed in a week"
        ],
        applied: "A creator with 60,000 followers and zero recurring revenue doesn't have an attention problem — they have a missing layer two. More content won't fix it. One clear entry offer will."
      }
    ],
    closing: {
      strip: "The Signal Method · 50 points · 7 parts",
      line: "Your life was never too ordinary to be content. It just needed structure.",
      motto: "Nekal sa bopp. Move."
    }
  },

  fr: {
    code: "fr",
    label: "Français",
    htmlLang: "fr",
    dir: "ltr",
    nav: { switcher: "Langue" },
    cover: {
      badge: "Le Guide Complet",
      number: "50",
      titleLine1: "La Méthode",
      titleLine2: "Signal",
      subtitle: "Transformez votre expérience en contenu qui vous trouve",
      quote: "Votre histoire n'est pas un best-of. C'est de la matière première.",
      motto: "Nekal sa bopp. Move.",
      stats: ["7 Parties", "50 Points", "7 Exemples Concrets", "1 Système"]
    },
    howto: {
      label: "Comment Utiliser Ce Guide",
      p1: "La plupart des personnes qui construisent leur marque personnelle n'ont pas un problème de contenu. Elles ont un problème de structure — une attention qui ne se transforme jamais en quelque chose de durable. Ce guide est le système en sept parties pour résoudre cela, dans l'ordre.",
      p2: "Lisez une partie avant de scénariser votre prochain contenu. Appliquez-la une fois avant de passer à la suivante — l'ordre compte, car chaque partie s'appuie sur la précédente.",
      tocLabel: "Sommaire"
    },
    appliedLabel: "En pratique",
    pointsSuffix: "points dans cette partie",
    parts: [
      {
        id: "the-mine",
        eyebrow: "Partie 01",
        tagline: "Votre vie est déjà la matière première.",
        title: "La Mine",
        intro: "Avant même d'écrire le moindre script, la matière première existe déjà en vous. La plupart des gens passent à côté de leur meilleur contenu parce qu'il leur semble trop ordinaire pour être dit à voix haute.",
        points: [
          "Listez chaque erreur qui vous a coûté du temps ou de l'argent — chacune est une vidéo",
          "Listez chaque question qu'on vous pose plus de deux fois — c'est la preuve d'une demande",
          "Notez le moment où vous avez failli tout abandonner — ce tournant est l'accroche",
          "Nommez la compétence que vous utilisez sans y penser — invisible pour vous, précieuse pour tous les autres",
          "Suivez ce que vous construisez en ce moment, avec de vrais chiffres — la progression est du contenu, pas seulement le résultat",
          "Repérez ce qui vous frustre vraiment dans votre domaine — une opinion sincère est magnétique",
          "Revenez volontairement sur votre pire semaine — une difficulté racontée avec honnêteté crée plus de confiance que n'importe quel best-of",
          "Demandez-vous ce que vous croyiez il y a un an et que vous ne croyez plus aujourd'hui — ce changement est à lui seul un script complet"
        ],
        applied: "Quelqu'un passe deux heures à attendre une course qui ne se confirme jamais. Racontée avec honnêteté, cette frustration devient l'accroche d'un contenu sur une meilleure façon de résoudre exactement ce problème — sans aucune recherche nécessaire, car la matière a déjà été vécue."
      },
      {
        id: "the-hook",
        eyebrow: "Partie 02",
        tagline: "Vous avez trois secondes. Utilisez-les.",
        title: "L'Accroche",
        intro: "Vous disposez d'environ trois secondes avant que quelqu'un décide si vous avez mérité les trois suivantes. Le seul rôle de l'accroche est de survivre à cette première décision.",
        points: [
          "Ouvrez en pleine scène, pas en pleine pensée — commencez au moment précis où quelque chose a mal tourné",
          "Donnez un chiffre précis dès la première ligne — les chiffres arrêtent le défilement plus vite que les adjectifs",
          "Contredisez une attente — « J'avais dit que jamais... » fonctionne parce que ça promet un retournement",
          "Posez exactement la question que votre audience se pose déjà, avant d'y répondre",
          "Retenez le dénouement — suggérez-le sans le révéler dans la première phrase",
          "Gardez des phrases d'ouverture courtes — une mise en place trop longue perd les gens avant même que l'idée n'arrive",
          "Ne vous présentez pas dans l'accroche — gagnez d'abord l'attention, expliquez ensuite qui vous êtes"
        ],
        applied: "« Aujourd'hui, je veux parler des occasions manquées » perd face à « J'étais debout dans un aéroport, à regarder mon avion partir sans moi. » Même sujet. Taux de survie totalement différent dans les trois premières secondes."
      },
      {
        id: "the-arc",
        eyebrow: "Partie 03",
        tagline: "Cinq temps. Ni plus, ni moins.",
        title: "L'Arc",
        intro: "Une histoire qui vend et une histoire qui ne fait que divertir utilisent les cinq mêmes temps. La différence, c'est de savoir si le cinquième temps existe.",
        points: [
          "Accroche — le moment, jamais le sujet",
          "Douleur — nommez le coût précis, pas la difficulté générale",
          "Tournant — la décision ou la prise de conscience précise qui a changé l'issue",
          "Leçon — une phrase que quelqu'un pourrait répéter à un ami une heure plus tard",
          "Pont — une seule ligne reliant la leçon à ce que vous proposez, uniquement pendant les semaines de vente",
          "Conclusion — une action précise à réaliser, jamais un vague « en savoir plus »",
          "Supprimez tout ce qui ne sert pas l'un de ces cinq temps, même un détail que vous adorez"
        ],
        applied: "Une histoire de voyage catastrophique ne mérite sa fin que si la dernière ligne accomplit quelque chose : soit elle délivre une leçon qui mérite d'être répétée, soit elle fait le pont vers une offre réelle. Sans le cinquième temps, c'est une bonne histoire qui ne change rien à la suite."
      },
      {
        id: "the-ratio",
        eyebrow: "Partie 04",
        tagline: "La confiance d'abord. Vendre rarement.",
        title: "Le Ratio",
        intro: "Une audience qui ne voit que des offres cesse de vous faire confiance. Une audience qui ne voit que des histoires n'achète jamais. Le ratio est ce qui maintient les deux en vie en même temps.",
        points: [
          "Pour quatre contenus de confiance, publiez-en un qui demande réellement quelque chose",
          "Le contenu de confiance enseigne, révèle ou avoue — il ne demande jamais rien",
          "Le contenu de vente se termine toujours par une action précise, jamais par un vague test d'intérêt",
          "Ne vendez jamais à l'intérieur d'une histoire qui n'a pas encore fini d'établir son argument émotionnel",
          "Vérifiez vos dix dernières publications — plus de trois demandes signifie que vous en faites trop, ralentissez",
          "Laissez la leçon centrale se répéter à travers différentes scènes — l'histoire ne doit pas se répéter, la leçon le peut",
          "Laissez de temps en temps votre meilleur contenu de confiance sans aucun appel à l'action — la retenue construit plus de crédibilité qu'elle ne coûte en conversions"
        ],
        applied: "Une semaine composée de quatre parts de mise à jour honnête « build in public » et d'une part d'offre directe mérite le droit de demander, car l'audience sait déjà que demander n'est pas tout ce que vous faites."
      },
      {
        id: "the-magnet",
        eyebrow: "Partie 05",
        tagline: "Être regardé n'est pas la même chose qu'être contacté.",
        title: "L'Aimant",
        intro: "Un contenu regardé n'est pas la même chose qu'un contenu qui pousse quelqu'un à vous contacter. Cela demande une clarté précise, légèrement inconfortable, sur ce que vous voulez réellement qu'ils fassent ensuite.",
        points: [
          "Posez une seule question directe par légende, jamais deux — un choix entre plusieurs options crée de l'hésitation",
          "Formulez la demande de façon à ce qu'on puisse répondre en un mot — « commentez votre chiffre » l'emporte sur « dites-moi ce que vous en pensez »",
          "Répondez à chaque commentaire dans la première heure — l'algorithme et la personne récompensent tous les deux ce geste",
          "Quand quelqu'un commente, posez-lui une question en retour au lieu de simplement le remercier",
          "Transformez votre meilleur commentaire en vidéo de la semaine suivante — une écoute visible construit plus de confiance qu'aucun script",
          "Donnez aux gens une raison d'identifier quelqu'un, pas seulement de commenter — c'est ainsi que la portée se démultiplie",
          "Ne terminez jamais uniquement sur « dites-moi ce que vous en pensez » — associez-y toujours une étape concrète suivante"
        ],
        applied: "« Commentez OUI si cela vous est arrivé » surpasse « qu'en pensez-vous ? » parce que cela demande un mot, pas une dissertation — et chaque réponse devient une preuve que le prochain spectateur peut voir."
      },
      {
        id: "the-close",
        eyebrow: "Partie 06",
        tagline: "Le message privé est une ouverture, pas une vente.",
        title: "La Conclusion",
        intro: "Quand quelqu'un vous contacte, ce n'est pas une vente — c'est une ouverture. Ce que vous dites dans les deux messages suivants décide si cette ouverture se conclut ou se referme.",
        points: [
          "Répondez vite — l'intérêt a une demi-vie qui se mesure en minutes, pas en heures",
          "Posez une question de clarification avant de présenter quoi que ce soit — cela prouve que vous avez vraiment écouté",
          "Chaque objection est une question déguisée — répondez à la vraie question qui se cache derrière",
          "Rendez la prochaine étape assez petite pour qu'il soit difficile de la refuser — deux minutes, un lien, un message",
          "Énoncez l'offre une fois, clairement, puis arrêtez de parler — la première personne à reprendre la parole perd souvent la vente",
          "Le silence après une demande n'est pas un rejet — c'est souvent juste quelqu'un qui réfléchit. Laissez-le s'installer",
          "Si la réponse est non, demandez ce qui aurait pu la transformer en oui — cette réponse vaut plus que la vente manquée"
        ],
        applied: "« Laissez-moi y réfléchir » est rarement la véritable objection. Demander « qu'avez-vous précisément besoin de clarifier ? » fait généralement remonter la seule vraie question — et elle trouve souvent réponse sur-le-champ."
      },
      {
        id: "the-ladder",
        eyebrow: "Partie 07",
        tagline: "L'attention seule ne vous rapporte rien.",
        title: "L'Échelle",
        intro: "Le contenu crée de l'attention. L'attention seule ne crée pas de revenu. Entre les deux se trouve une structure — et la plupart des créateurs ne la construisent jamais volontairement.",
        points: [
          "Associez chaque contenu à une couche : confiance gratuite, offre d'entrée à bas prix, offre récurrente ou infrastructure",
          "Ne construisez jamais la troisième couche avant que la deuxième ait prouvé qu'elle convertit",
          "Orientez votre contenu gratuit vers une seule offre d'entrée, pas cinq — la confusion tue la conversion",
          "Le revenu récurrent ne doit jamais dépendre d'une seule vidéo devenue virale pour survivre au mois",
          "Revoyez l'échelle chaque mois — la plupart des créateurs corrigent la mauvaise couche parce qu'ils ne l'ont jamais cartographiée",
          "Construisez en priorité la couche qui compte le moins d'éléments actifs, pas celle qui vous semble la plus excitante",
          "La constance l'emporte sur l'intensité — une échelle construite lentement sur des mois surpasse celle bâclée en une semaine"
        ],
        applied: "Un créateur avec 60 000 abonnés et aucun revenu récurrent n'a pas un problème d'attention — il lui manque la deuxième couche. Plus de contenu ne réglera rien. Une offre d'entrée claire, si."
      }
    ],
    closing: {
      strip: "La Méthode Signal · 50 points · 7 parties",
      line: "Votre vie n'a jamais été trop ordinaire pour devenir du contenu. Elle avait juste besoin de structure.",
      motto: "Nekal sa bopp. Move."
    }
  },

  it: {
    code: "it",
    label: "Italiano",
    htmlLang: "it",
    dir: "ltr",
    nav: { switcher: "Lingua" },
    cover: {
      badge: "La Guida Completa",
      number: "50",
      titleLine1: "Il Metodo",
      titleLine2: "Signal",
      subtitle: "Trasforma la tua esperienza in contenuti che ti trovano",
      quote: "La tua storia non è un video dei momenti migliori. È materia prima.",
      motto: "Nekal sa bopp. Move.",
      stats: ["7 Parti", "50 Punti", "7 Esempi Pratici", "1 Sistema"]
    },
    howto: {
      label: "Come Usare Questa Guida",
      p1: "La maggior parte delle persone che costruisce un personal brand non ha un problema di contenuti. Ha un problema di struttura — attenzione che non si trasforma mai in qualcosa di duraturo. Questa guida è il sistema in sette parti per risolverlo, nell'ordine giusto.",
      p2: "Leggi una parte prima di scrivere il tuo prossimo contenuto. Applicala una volta prima di passare alla successiva — l'ordine conta, perché ogni parte si basa su quella precedente.",
      tocLabel: "Indice"
    },
    appliedLabel: "Applicato",
    pointsSuffix: "punti in questa parte",
    parts: [
      {
        id: "the-mine",
        eyebrow: "Parte 01",
        tagline: "La tua vita è già la materia prima.",
        title: "La Miniera",
        intro: "Prima ancora di scrivere qualsiasi script, la materia prima esiste già dentro di te. La maggior parte delle persone scorre oltre i propri contenuti migliori perché li sente troppo ordinari per essere detti ad alta voce.",
        points: [
          "Elenca ogni errore che ti è costato tempo o denaro — ognuno è un video",
          "Elenca ogni domanda che ti viene posta più di due volte — è la prova della domanda",
          "Scrivi il momento in cui hai quasi mollato — quel punto di svolta è l'aggancio",
          "Individua la competenza che usi senza pensarci — invisibile per te, preziosa per tutti gli altri",
          "Monitora ciò che stai costruendo ora, con numeri reali — il progresso è contenuto, non solo il risultato",
          "Individua ciò che ti frustra davvero nel tuo settore — un'opinione autentica è magnetica",
          "Ritorna volontariamente sulla tua settimana peggiore — una difficoltà raccontata con onestà crea più fiducia di qualsiasi video dei momenti migliori",
          "Chiediti cosa credevi un anno fa e che oggi non credi più — quel cambiamento è di per sé uno script completo"
        ],
        applied: "Qualcuno passa due ore ad aspettare una corsa che non si conferma mai. Raccontata con onestà, quella frustrazione diventa l'aggancio per un contenuto su un modo migliore di risolvere esattamente quel problema — senza bisogno di alcuna ricerca, perché la materia è già stata vissuta."
      },
      {
        id: "the-hook",
        eyebrow: "Parte 02",
        tagline: "Hai tre secondi. Usali.",
        title: "L'Aggancio",
        intro: "Hai circa tre secondi prima che qualcuno decida se ti sei guadagnato i tre successivi. L'unico compito dell'aggancio è sopravvivere a quella prima decisione.",
        points: [
          "Apri nel mezzo della scena, non nel mezzo di un pensiero — inizia dal momento esatto in cui qualcosa è andato storto",
          "Indica un numero preciso nella prima riga — i numeri fermano lo scroll più velocemente degli aggettivi",
          "Contraddici un'aspettativa — «Avevo detto che non l'avrei mai fatto…» funziona perché promette un ribaltamento",
          "Poni esattamente la domanda che il tuo pubblico si sta già facendo, prima di rispondere",
          "Trattieni l'esito — accennalo senza svelarlo nella frase iniziale",
          "Mantieni le frasi iniziali brevi — una premessa troppo lunga perde le persone prima ancora che l'idea arrivi",
          "Non presentarti nell'aggancio — guadagna prima l'attenzione, spiega poi chi sei"
        ],
        applied: "«Oggi voglio parlare delle occasioni perse» perde contro «Ero in piedi in aeroporto, a guardare il mio aereo partire senza di me.» Stesso argomento. Tasso di sopravvivenza completamente diverso nei primi tre secondi."
      },
      {
        id: "the-arc",
        eyebrow: "Parte 03",
        tagline: "Cinque tempi. Né più, né meno.",
        title: "L'Arco",
        intro: "Una storia che vende e una storia che si limita a intrattenere usano gli stessi cinque tempi. La differenza sta nel fatto che il quinto tempo esista o meno.",
        points: [
          "Aggancio — il momento, mai l'argomento",
          "Dolore — nomina il costo specifico, non la difficoltà generica",
          "Svolta — la decisione o la consapevolezza esatta che ha cambiato l'esito",
          "Lezione — una frase che qualcuno potrebbe ripetere a un amico un'ora dopo",
          "Ponte — una sola riga che collega la lezione a ciò che offri, solo nelle settimane di vendita",
          "Chiusura — un'azione specifica da compiere, mai un vago «scopri di più»",
          "Taglia tutto ciò che non serve a uno di questi cinque tempi, anche un dettaglio che ami"
        ],
        applied: "Una storia di viaggio disastroso merita il suo finale solo se l'ultima riga fa qualcosa: o consegna una lezione degna di essere ripetuta, oppure crea un ponte verso un'offerta reale. Senza il quinto tempo, è una buona storia che non cambia nulla di ciò che accade dopo."
      },
      {
        id: "the-ratio",
        eyebrow: "Parte 04",
        tagline: "Prima la fiducia. Vendi raramente.",
        title: "Il Rapporto",
        intro: "Un pubblico che vede solo offerte smette di fidarsi di te. Un pubblico che vede solo storie non compra mai. Il rapporto è ciò che tiene in vita entrambe le cose allo stesso tempo.",
        points: [
          "Per ogni quattro contenuti di fiducia, pubblicane uno che chieda davvero qualcosa",
          "Il contenuto di fiducia insegna, rivela o ammette — non chiede mai nulla",
          "Il contenuto di vendita si chiude sempre con un'azione specifica, mai con un vago test di interesse",
          "Non vendere mai all'interno di una storia che non ha ancora finito di costruire il suo argomento emotivo",
          "Rivedi i tuoi ultimi dieci contenuti — più di tre richieste significa che stai vendendo troppo, rallenta",
          "Lascia che la lezione centrale si ripeta in scene diverse — la storia non dovrebbe ripetersi, la lezione sì",
          "Ogni tanto lascia che il tuo miglior contenuto di fiducia giri senza alcuna call to action — la moderazione costruisce più credibilità di quanta ne costi in conversioni"
        ],
        applied: "Una settimana fatta di quattro parti di aggiornamento onesto in stile «build in public» e una parte di offerta diretta si guadagna il diritto di chiedere, perché il pubblico sa già che chiedere non è tutto ciò che fai."
      },
      {
        id: "the-magnet",
        eyebrow: "Parte 05",
        tagline: "Essere guardati non equivale a essere contattati.",
        title: "Il Magnete",
        intro: "Un contenuto guardato non è la stessa cosa di un contenuto che spinge qualcuno a contattarti. Serve una chiarezza precisa, leggermente scomoda, su cosa vuoi davvero che facciano subito dopo.",
        points: [
          "Poni una sola domanda diretta per didascalia, mai due — una scelta tra più opzioni crea esitazione",
          "Formula la richiesta in modo che si possa rispondere con una sola parola — «commenta il tuo numero» batte «fammi sapere cosa ne pensi»",
          "Rispondi a ogni commento entro la prima ora — sia l'algoritmo che la persona lo premiano",
          "Quando qualcuno commenta, fagli una domanda di rimando invece di limitarti a ringraziarlo",
          "Trasforma il tuo miglior commento nel video della settimana successiva — un ascolto visibile costruisce più fiducia di qualsiasi script",
          "Dai alle persone un motivo per taggare qualcuno, non solo per commentare — è così che la portata si moltiplica",
          "Non concludere mai solo con «fammi sapere cosa ne pensi» — abbinalo sempre a un passo successivo concreto"
        ],
        applied: "«Commenta SÌ se ti è successo» supera «cosa ne pensi?» perché chiede una parola, non un saggio — e ogni risposta diventa una prova che il prossimo spettatore può vedere."
      },
      {
        id: "the-close",
        eyebrow: "Parte 06",
        tagline: "Il messaggio privato è un'apertura, non una vendita.",
        title: "La Chiusura",
        intro: "Quando qualcuno ti contatta non è una vendita — è un'apertura. Ciò che dici nei due messaggi successivi decide se quell'apertura si chiude bene o si perde.",
        points: [
          "Rispondi in fretta — l'interesse ha un'emivita misurata in minuti, non in ore",
          "Poni una domanda di chiarimento prima di proporre qualsiasi cosa — dimostra che hai davvero ascoltato",
          "Ogni obiezione è una domanda travestita — rispondi alla vera domanda che si nasconde dietro",
          "Rendi il passo successivo abbastanza piccolo da essere difficile da rifiutare — due minuti, un link, un messaggio",
          "Esponi l'offerta una volta, chiaramente, poi smetti di parlare — chi parla per primo dopo spesso perde la chiusura",
          "Il silenzio dopo una richiesta non è un rifiuto — spesso è solo qualcuno che sta decidendo. Lascialo esistere",
          "Se dicono no, chiedi cosa avrebbe potuto trasformarlo in un sì — quella risposta vale più della vendita persa"
        ],
        applied: "«Fammi pensare» raramente è la vera obiezione. Chiedere «cosa devi valutare, nello specifico?» di solito fa emergere l'unica vera domanda — e spesso trova risposta seduta stante."
      },
      {
        id: "the-ladder",
        eyebrow: "Parte 07",
        tagline: "L'attenzione da sola non ti paga.",
        title: "La Scala",
        intro: "I contenuti creano attenzione. L'attenzione da sola non crea reddito. Tra le due cose c'è una struttura — e la maggior parte dei creator non la costruisce mai intenzionalmente.",
        points: [
          "Associa ogni contenuto a un livello: fiducia gratuita, offerta d'ingresso a basso costo, offerta ricorrente o infrastruttura",
          "Non costruire mai il terzo livello prima che il secondo abbia la prova che converte",
          "Indirizza il tuo contenuto gratuito verso una sola offerta d'ingresso, non cinque — la confusione uccide la conversione",
          "Il reddito ricorrente non dovrebbe mai dipendere da un singolo video diventato virale per sopravvivere al mese",
          "Rivedi la scala ogni mese — la maggior parte dei creator corregge il livello sbagliato perché non l'ha mai mappata",
          "Costruisci per primo il livello con meno elementi attivi, non quello che ti sembra più entusiasmante",
          "La costanza batte l'intensità — una scala costruita lentamente nel corso di mesi supera quella costruita di fretta in una settimana"
        ],
        applied: "Un creator con 60.000 follower e zero entrate ricorrenti non ha un problema di attenzione — gli manca il secondo livello. Più contenuti non risolveranno nulla. Un'offerta d'ingresso chiara sì."
      }
    ],
    closing: {
      strip: "Il Metodo Signal · 50 punti · 7 parti",
      line: "La tua vita non è mai stata troppo ordinaria per diventare contenuto. Le serviva solo una struttura.",
      motto: "Nekal sa bopp. Move."
    }
  },

  es: {
    code: "es",
    label: "Español",
    htmlLang: "es",
    dir: "ltr",
    nav: { switcher: "Idioma" },
    cover: {
      badge: "La Guía Completa",
      number: "50",
      titleLine1: "El Método",
      titleLine2: "Signal",
      subtitle: "Convierte tu experiencia en contenido que te encuentra",
      quote: "Tu historia no es un resumen de momentos destacados. Es materia prima.",
      motto: "Nekal sa bopp. Move.",
      stats: ["7 Partes", "50 Puntos", "7 Ejemplos Prácticos", "1 Sistema"]
    },
    howto: {
      label: "Cómo Usar Esta Guía",
      p1: "La mayoría de las personas que construyen una marca personal no tienen un problema de contenido. Tienen un problema de estructura: atención que nunca se convierte en algo duradero. Esta guía es el sistema de siete partes para solucionarlo, en orden.",
      p2: "Lee una parte antes de escribir el guion de tu próximo contenido. Aplícala una vez antes de pasar a la siguiente: el orden importa, porque cada parte se construye sobre la anterior.",
      tocLabel: "Índice"
    },
    appliedLabel: "Aplicado",
    pointsSuffix: "puntos en esta parte",
    parts: [
      {
        id: "the-mine",
        eyebrow: "Parte 01",
        tagline: "Tu vida ya es la materia prima.",
        title: "La Mina",
        intro: "Antes de escribir cualquier guion, la materia prima ya existe dentro de ti. La mayoría de la gente pasa por alto su mejor contenido porque le parece demasiado ordinario como para decirlo en voz alta.",
        points: [
          "Enumera cada error que te costó tiempo o dinero — cada uno es un video",
          "Enumera cada pregunta que te hagan más de dos veces — es prueba de demanda",
          "Anota el momento en que casi lo dejaste todo — ese punto de inflexión es el gancho",
          "Identifica la habilidad que usas sin pensar — invisible para ti, valiosa para todos los demás",
          "Haz seguimiento de lo que estás construyendo ahora mismo, con cifras reales — el progreso es contenido, no solo el resultado",
          "Identifica lo que realmente te frustra en tu campo — una opinión auténtica es magnética",
          "Vuelve deliberadamente a tu peor semana — una dificultad contada con honestidad genera más confianza que cualquier resumen de momentos destacados",
          "Pregúntate qué creías hace un año y ya no crees ahora — ese cambio es, por sí solo, un guion completo"
        ],
        applied: "Alguien pasa dos horas esperando un viaje que nunca se confirma. Contada con honestidad, esa frustración se convierte en el gancho de una pieza sobre una mejor forma de resolver exactamente ese problema — sin necesidad de investigación, porque el material ya lo vivió esa persona."
      },
      {
        id: "the-hook",
        eyebrow: "Parte 02",
        tagline: "Tienes tres segundos. Úsalos.",
        title: "El Gancho",
        intro: "Tienes unos tres segundos antes de que alguien decida si te has ganado los tres siguientes. La única función del gancho es sobrevivir a esa primera decisión.",
        points: [
          "Empieza en plena escena, no a mitad de un pensamiento — comienza en el momento exacto en que algo salió mal",
          "Menciona una cifra concreta en la primera línea — los números detienen el scroll más rápido que los adjetivos",
          "Contradice una expectativa — «Dije que nunca...» funciona porque promete un giro inesperado",
          "Formula exactamente la pregunta que tu audiencia ya se está haciendo, antes de responderla",
          "Reserva el desenlace — insinúalo sin revelarlo en la primera frase",
          "Mantén las frases iniciales cortas — una introducción larga pierde a la gente antes de que la idea llegue",
          "No te presentes en el gancho — gana la atención primero, explica quién eres después"
        ],
        applied: "«Hoy quiero hablar sobre las oportunidades perdidas» pierde frente a «Estaba de pie en un aeropuerto, viendo mi vuelo partir sin mí.» Mismo tema. Tasa de supervivencia completamente distinta en los primeros tres segundos."
      },
      {
        id: "the-arc",
        eyebrow: "Parte 03",
        tagline: "Cinco tiempos. Ni más, ni menos.",
        title: "El Arco",
        intro: "Una historia que vende y una historia que solo entretiene usan los mismos cinco tiempos. La diferencia está en si el quinto tiempo existe o no.",
        points: [
          "Gancho — el momento, nunca el tema",
          "Dolor — nombra el costo específico, no la dificultad general",
          "Giro — la decisión o el momento de claridad exacto que cambió el resultado",
          "Lección — una frase que alguien podría repetirle a un amigo una hora después",
          "Puente — una sola línea que conecta la lección con lo que ofreces, solo en las semanas de venta",
          "Cierre — una acción concreta a realizar, nunca un vago «saber más»",
          "Elimina todo lo que no sirva a uno de estos cinco tiempos, incluso un detalle que te encante"
        ],
        applied: "Una historia de desastre de viaje solo se gana su final si la última línea hace algo: o entrega una lección digna de repetirse, o tiende un puente hacia una oferta real. Sin el quinto tiempo, es una buena historia que no cambia nada de lo que viene después."
      },
      {
        id: "the-ratio",
        eyebrow: "Parte 04",
        tagline: "Primero la confianza. Vende rara vez.",
        title: "La Proporción",
        intro: "Una audiencia que solo ve ofertas deja de confiar en ti. Una audiencia que solo ve historias nunca compra. La proporción es lo que mantiene ambas cosas vivas al mismo tiempo.",
        points: [
          "Por cada cuatro contenidos de confianza, publica uno que realmente pida algo",
          "El contenido de confianza enseña, revela o admite — nunca pide nada",
          "El contenido de venta siempre cierra con una acción específica, nunca con una vaga comprobación de interés",
          "Nunca vendas dentro de una historia que aún no ha terminado de construir su argumento emocional",
          "Revisa tus últimas diez publicaciones — más de tres peticiones significa que estás vendiendo demasiado, frena",
          "Deja que la lección central se repita en distintas escenas — la historia no debería repetirse, la lección sí puede",
          "De vez en cuando deja que tu mejor contenido de confianza corra sin ningún llamado a la acción — la moderación genera más credibilidad de la que cuesta en conversiones"
        ],
        applied: "Una semana compuesta por cuatro partes de actualización honesta «build in public» y una parte de oferta directa se gana el derecho a pedir, porque la audiencia ya sabe que pedir no es todo lo que haces."
      },
      {
        id: "the-magnet",
        eyebrow: "Parte 05",
        tagline: "Que te vean no es lo mismo que te contacten.",
        title: "El Imán",
        intro: "Un contenido que se ve no es lo mismo que un contenido que hace que alguien te contacte. Eso requiere una claridad precisa, un poco incómoda, sobre lo que realmente quieres que hagan a continuación.",
        points: [
          "Haz una sola pregunta directa por pie de foto, nunca dos — elegir entre opciones genera duda",
          "Formula la petición de forma que se responda con una sola palabra — «comenta tu número» le gana a «cuéntame qué piensas»",
          "Responde a cada comentario dentro de la primera hora — tanto el algoritmo como la persona lo recompensan",
          "Cuando alguien comente, hazle una pregunta de vuelta en lugar de simplemente agradecerle",
          "Convierte tu mejor comentario en el video de la próxima semana — escuchar de forma visible genera más confianza que cualquier guion",
          "Dale a la gente un motivo para etiquetar a alguien, no solo para comentar — así se multiplica el alcance",
          "Nunca termines solo con «cuéntame qué piensas» — acompáñalo siempre de un próximo paso concreto"
        ],
        applied: "«Comenta SÍ si te pasó esto» supera a «¿qué opinas?» porque pide una palabra, no un ensayo — y cada respuesta se convierte en una prueba que el próximo espectador puede ver."
      },
      {
        id: "the-close",
        eyebrow: "Parte 06",
        tagline: "El mensaje directo es una apertura, no una venta.",
        title: "El Cierre",
        intro: "Que alguien te escriba no es una venta — es una apertura. Lo que digas en los dos mensajes siguientes decide si esa apertura se cierra o se pierde.",
        points: [
          "Responde rápido — el interés tiene una vida media que se mide en minutos, no en horas",
          "Haz una pregunta aclaratoria antes de proponer nada — demuestra que realmente escuchaste",
          "Cada objeción es una pregunta disfrazada — responde a la verdadera pregunta que se esconde detrás",
          "Haz que el siguiente paso sea tan pequeño que sea difícil de rechazar — dos minutos, un enlace, un mensaje",
          "Presenta la oferta una vez, con claridad, y luego deja de hablar — quien habla primero después suele perder el cierre",
          "El silencio después de una petición no es un rechazo — a menudo es solo alguien decidiendo. Déjalo estar",
          "Si dicen que no, pregunta qué lo habría convertido en un sí — esa respuesta vale más que la venta perdida"
        ],
        applied: "«Déjame pensarlo» rara vez es la verdadera objeción. Preguntar «¿qué es exactamente lo que necesitas pensar?» suele sacar a la luz la única pregunta real — y muchas veces se puede responder ahí mismo."
      },
      {
        id: "the-ladder",
        eyebrow: "Parte 07",
        tagline: "La atención por sí sola no te paga.",
        title: "La Escalera",
        intro: "El contenido crea atención. La atención por sí sola no crea ingresos. Entre ambas cosas hay una estructura — y la mayoría de los creadores nunca la construyen a propósito.",
        points: [
          "Asocia cada contenido a una capa: confianza gratuita, oferta de entrada de bajo costo, oferta recurrente o infraestructura",
          "Nunca construyas la tercera capa antes de que la segunda demuestre que convierte",
          "Dirige tu contenido gratuito hacia una sola oferta de entrada, no cinco — la confusión mata la conversión",
          "Los ingresos recurrentes nunca deben depender de que un solo video se vuelva viral para sobrevivir el mes",
          "Revisa la escalera mensualmente — la mayoría de los creadores arreglan la capa equivocada porque nunca la mapearon",
          "Construye primero la capa con menos elementos activos, no la que te parezca más emocionante",
          "La constancia le gana a la intensidad — una escalera construida lentamente durante meses supera a una hecha con prisa en una semana"
        ],
        applied: "Un creador con 60.000 seguidores y cero ingresos recurrentes no tiene un problema de atención — le falta la segunda capa. Más contenido no lo va a arreglar. Una oferta de entrada clara, sí."
      }
    ],
    closing: {
      strip: "El Método Signal · 50 puntos · 7 partes",
      line: "Tu vida nunca fue demasiado ordinaria para ser contenido. Solo necesitaba estructura.",
      motto: "Nekal sa bopp. Move."
    }
  }
};

const LANG_ORDER = ["en", "fr", "it", "es"];
