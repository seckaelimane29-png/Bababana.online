import type { UiLanguage } from '../types';

/**
 * UI strings in Wolof (wo), French (fr) and English (en).
 *
 * The Wolof strings deliberately use the mixed register people actually use
 * online (some French borrowings like "compte" or "copier" are kept where a
 * pure Wolof word would feel artificial). A native speaker should review the
 * `wo` column before launch — see README → "Reviewing the Wolof".
 */

const wo = {
  tagline: 'Defaral sa nataal ay captions yu neex ci wolof',
  heroTitle: 'Waxal sa nataal',
  heroSubtitle:
    'Yebal nataal, AI bi defaral la ay captions ci wolof — ngir Instagram, TikTok, Twitter ak LinkedIn.',

  'nav.history': 'Historique',
  'nav.login': 'Dugg',
  'nav.register': 'Bind sa bopp',
  'nav.logout': 'Génn',
  'nav.upgrade': 'Jëlal Pro',

  'upload.title': 'Teg sa nataal fii',
  'upload.release': 'Bàyyil ko fii',
  'upload.hint': 'JPG, PNG, WEBP — ba 10MB',
  'upload.change': 'Soppi nataal bi',
  'upload.uploading': 'Mu ngi yeb...',
  'upload.browse': 'walla bësal ngir tann benn',

  'tone.label': 'Melo bi',
  'tone.witty': 'Kaf',
  'tone.professional': 'Pro',
  'tone.poetic': 'Taalif',
  'tone.casual': 'Cool rekk',
  'tone.hype': 'Xumb',

  'platform.label': 'Fan nga koy post?',
  'platform.instagram': 'Nataal ak léeb',
  'platform.twitter': 'Wax bu gàtt te ñaw',
  'platform.linkedin': 'Liggéey ak jëf',
  'platform.tiktok': 'Vidéo ak yëngu',

  'lang.label': 'Làkku captions yi',
  'lang.wolof': 'Wolof (ak tuuti français)',
  'lang.wolof_pure': 'Wolof bu sell',
  'lang.french': 'Français',

  'options.hashtags': 'Boole hashtags',
  'options.context': 'Lu ci ëpp (facultatif)',
  'options.contextPlaceholder': 'Misaal: sumay anniversaire la, teral ko...',

  'generate.cta': 'Waxal! Defar captions',
  'generate.loading': 'Mu ngi liggéey...',
  'generate.needImage': 'Tegal nataal bu jëkk',
  'generate.needLogin': 'Duggal ngir defar captions',

  'results.title': 'Sa captions',
  'results.aiSees': 'AI bi gis na:',
  'results.empty': 'Mënuñu woon defar captions. Jéemaatal.',

  'caption.copy': 'Copier',
  'caption.copied': 'Copié ✓',
  'caption.refine': 'Soppi ko',

  'refine.shorter': '✂️ Gën gaa gàtt',
  'refine.funnier': '😂 Gën gaa reetaan',
  'refine.creative': '✨ Gën gaa bees',
  'refine.professional': '💼 Gën gaa pro',
  'refine.punchier': '🎯 Gën gaa am doole',
  'refine.storytelling': '📖 Def ko léeb',
  'refine.placeholder': 'Walla bindal li nga bëgg...',
  'refine.loading': 'Mu ngi soppi...',

  'history.title': 'Historique',
  'history.empty': 'Amuloo benn caption ba léegi',
  'history.emptySub': 'Yebal nataal ngir tàmbali',
  'history.count': '{n} captions',
  'history.delete': 'Far ko',
  'history.favorite': 'Bëgg naa ko',
  'history.load': 'Delloo ko',

  'quota.left': 'Des na la {n} captions ci weer wi',
  'quota.out': 'Jeexal nga sa captions yu free ci weer wi',
  'quota.upgradeCta': 'Jëlal Pro ngir gën gaa bari',

  'auth.loginTitle': 'Duggal ci sa compte',
  'auth.registerTitle': 'Bindal sa bopp — dafa gratuit',
  'auth.email': 'Email',
  'auth.password': 'Mot de passe (8 walla lu ëpp)',
  'auth.name': 'Sa tur',
  'auth.loginBtn': 'Dugg',
  'auth.registerBtn': 'Bind sa bopp',
  'auth.switchToRegister': 'Amuloo compte? Bindal fii',
  'auth.switchToLogin': 'Am nga compte? Duggal fii',
  'auth.welcome': 'Dalal jàmm, {name}!',

  'plans.title': 'Tannal sa plan',
  'plans.free': 'Free',
  'plans.pro': 'Pro',
  'plans.perMonth': '/ weer',
  'plans.captionsPerMonth': '{n} captions ci weer',
  'plans.fcfa': 'FCFA',
  'plans.current': 'Sa plan',
  'plans.upgradeBtn': 'Jëlal Pro',
  'plans.notReady':
    'Fey bi jëkkagul a jeexal. Ci kanam dinga mën a fey ak Wave walla Orange Money.',
  'plans.upgraded': 'Jërejëf! Pro nga léegi 🎉',

  'toast.copied': 'Caption bi copié na!',
  'toast.generated': 'Sa captions pare nañu!',
  'toast.deleted': 'Far nañu ko',
  'toast.error': 'Am na njumte. Jéemaatal.',
  'toast.network': 'Xoolal sa connexion internet',

  'theme.toggle': 'Soppi melo bi (leer/lëndëm)',
  'footer.madeIn': 'Defar nañu ko ci Senegal 🇸🇳',
};

const fr: Record<keyof typeof wo, string> = {
  tagline: 'Des captions en wolof pour vos photos, générées par IA',
  heroTitle: 'Waxal — parle pour ta photo',
  heroSubtitle:
    'Uploadez une photo, l’IA écrit des captions en wolof — pour Instagram, TikTok, Twitter et LinkedIn.',

  'nav.history': 'Historique',
  'nav.login': 'Connexion',
  'nav.register': 'Créer un compte',
  'nav.logout': 'Déconnexion',
  'nav.upgrade': 'Passer à Pro',

  'upload.title': 'Déposez votre photo ici',
  'upload.release': 'Relâchez pour uploader',
  'upload.hint': 'JPG, PNG, WEBP — jusqu’à 10 Mo',
  'upload.change': 'Changer la photo',
  'upload.uploading': 'Upload en cours...',
  'upload.browse': 'ou cliquez pour parcourir',

  'tone.label': 'Le ton',
  'tone.witty': 'Humour',
  'tone.professional': 'Pro',
  'tone.poetic': 'Poétique',
  'tone.casual': 'Décontracté',
  'tone.hype': 'Hype',

  'platform.label': 'Où allez-vous publier ?',
  'platform.instagram': 'Visuel et storytelling',
  'platform.twitter': 'Court et percutant',
  'platform.linkedin': 'Professionnel',
  'platform.tiktok': 'Vidéo et tendances',

  'lang.label': 'Langue des captions',
  'lang.wolof': 'Wolof (avec un peu de français)',
  'lang.wolof_pure': 'Wolof pur',
  'lang.french': 'Français',

  'options.hashtags': 'Inclure des hashtags',
  'options.context': 'Contexte (facultatif)',
  'options.contextPlaceholder': 'Ex : c’est mon anniversaire, mets-le en avant...',

  'generate.cta': 'Waxal ! Générer les captions',
  'generate.loading': 'Génération en cours...',
  'generate.needImage': 'Uploadez d’abord une photo',
  'generate.needLogin': 'Connectez-vous pour générer',

  'results.title': 'Vos captions',
  'results.aiSees': 'L’IA voit :',
  'results.empty': 'Impossible de générer des captions. Réessayez.',

  'caption.copy': 'Copier',
  'caption.copied': 'Copié ✓',
  'caption.refine': 'Affiner',

  'refine.shorter': '✂️ Plus court',
  'refine.funnier': '😂 Plus drôle',
  'refine.creative': '✨ Plus créatif',
  'refine.professional': '💼 Plus pro',
  'refine.punchier': '🎯 Plus percutant',
  'refine.storytelling': '📖 En mode histoire',
  'refine.placeholder': 'Ou décrivez ce que vous voulez...',
  'refine.loading': 'Affinage...',

  'history.title': 'Historique',
  'history.empty': 'Aucune caption pour le moment',
  'history.emptySub': 'Uploadez une photo pour commencer',
  'history.count': '{n} captions',
  'history.delete': 'Supprimer',
  'history.favorite': 'Favori',
  'history.load': 'Recharger',

  'quota.left': 'Il vous reste {n} générations ce mois-ci',
  'quota.out': 'Vous avez utilisé toutes vos générations gratuites ce mois-ci',
  'quota.upgradeCta': 'Passez à Pro pour continuer',

  'auth.loginTitle': 'Connectez-vous à votre compte',
  'auth.registerTitle': 'Créez un compte — c’est gratuit',
  'auth.email': 'Email',
  'auth.password': 'Mot de passe (8 caractères min.)',
  'auth.name': 'Votre nom',
  'auth.loginBtn': 'Connexion',
  'auth.registerBtn': 'Créer mon compte',
  'auth.switchToRegister': 'Pas de compte ? Inscrivez-vous ici',
  'auth.switchToLogin': 'Déjà un compte ? Connectez-vous ici',
  'auth.welcome': 'Bienvenue, {name} !',

  'plans.title': 'Choisissez votre plan',
  'plans.free': 'Gratuit',
  'plans.pro': 'Pro',
  'plans.perMonth': '/ mois',
  'plans.captionsPerMonth': '{n} captions par mois',
  'plans.fcfa': 'FCFA',
  'plans.current': 'Votre plan',
  'plans.upgradeBtn': 'Passer à Pro',
  'plans.notReady':
    'Le paiement n’est pas encore activé. Bientôt : Wave et Orange Money.',
  'plans.upgraded': 'Merci ! Vous êtes Pro 🎉',

  'toast.copied': 'Caption copiée !',
  'toast.generated': 'Vos captions sont prêtes !',
  'toast.deleted': 'Supprimé',
  'toast.error': 'Une erreur est survenue. Réessayez.',
  'toast.network': 'Vérifiez votre connexion internet',

  'theme.toggle': 'Changer de thème (clair/sombre)',
  'footer.madeIn': 'Fait au Sénégal 🇸🇳',
};

const en: Record<keyof typeof wo, string> = {
  tagline: 'AI-written Wolof captions for your photos',
  heroTitle: 'Waxal — let your photo speak',
  heroSubtitle:
    'Upload a photo and the AI writes captions in Wolof — for Instagram, TikTok, Twitter and LinkedIn.',

  'nav.history': 'History',
  'nav.login': 'Log in',
  'nav.register': 'Sign up',
  'nav.logout': 'Log out',
  'nav.upgrade': 'Go Pro',

  'upload.title': 'Drop your image here',
  'upload.release': 'Release to upload',
  'upload.hint': 'JPG, PNG, WEBP — up to 10MB',
  'upload.change': 'Change image',
  'upload.uploading': 'Uploading...',
  'upload.browse': 'or click to browse',

  'tone.label': 'Tone',
  'tone.witty': 'Witty',
  'tone.professional': 'Professional',
  'tone.poetic': 'Poetic',
  'tone.casual': 'Casual',
  'tone.hype': 'Hype',

  'platform.label': 'Where will you post?',
  'platform.instagram': 'Visual storytelling',
  'platform.twitter': 'Short and punchy',
  'platform.linkedin': 'Professional',
  'platform.tiktok': 'Video and trends',

  'lang.label': 'Caption language',
  'lang.wolof': 'Wolof (with some French)',
  'lang.wolof_pure': 'Pure Wolof',
  'lang.french': 'French',

  'options.hashtags': 'Include hashtags',
  'options.context': 'Context (optional)',
  'options.contextPlaceholder': 'E.g. it’s my birthday, make it about that...',

  'generate.cta': 'Waxal! Generate captions',
  'generate.loading': 'Generating...',
  'generate.needImage': 'Upload an image first',
  'generate.needLogin': 'Log in to generate',

  'results.title': 'Your captions',
  'results.aiSees': 'AI sees:',
  'results.empty': 'We couldn’t generate captions. Try again.',

  'caption.copy': 'Copy',
  'caption.copied': 'Copied ✓',
  'caption.refine': 'Refine',

  'refine.shorter': '✂️ Shorter',
  'refine.funnier': '😂 Funnier',
  'refine.creative': '✨ More creative',
  'refine.professional': '💼 More professional',
  'refine.punchier': '🎯 Punchier',
  'refine.storytelling': '📖 Storytelling',
  'refine.placeholder': 'Or describe what you want...',
  'refine.loading': 'Refining...',

  'history.title': 'History',
  'history.empty': 'No captions yet',
  'history.emptySub': 'Upload an image to get started',
  'history.count': '{n} captions',
  'history.delete': 'Delete',
  'history.favorite': 'Favorite',
  'history.load': 'Load again',

  'quota.left': 'You have {n} generations left this month',
  'quota.out': 'You’ve used all your free generations this month',
  'quota.upgradeCta': 'Go Pro to keep going',

  'auth.loginTitle': 'Log in to your account',
  'auth.registerTitle': 'Create an account — it’s free',
  'auth.email': 'Email',
  'auth.password': 'Password (8+ characters)',
  'auth.name': 'Your name',
  'auth.loginBtn': 'Log in',
  'auth.registerBtn': 'Create my account',
  'auth.switchToRegister': 'No account? Sign up here',
  'auth.switchToLogin': 'Have an account? Log in here',
  'auth.welcome': 'Welcome, {name}!',

  'plans.title': 'Choose your plan',
  'plans.free': 'Free',
  'plans.pro': 'Pro',
  'plans.perMonth': '/ month',
  'plans.captionsPerMonth': '{n} captions per month',
  'plans.fcfa': 'FCFA',
  'plans.current': 'Your plan',
  'plans.upgradeBtn': 'Go Pro',
  'plans.notReady': 'Payments aren’t connected yet. Coming soon: Wave and Orange Money.',
  'plans.upgraded': 'Thank you! You’re Pro now 🎉',

  'toast.copied': 'Caption copied!',
  'toast.generated': 'Your captions are ready!',
  'toast.deleted': 'Deleted',
  'toast.error': 'Something went wrong. Try again.',
  'toast.network': 'Check your internet connection',

  'theme.toggle': 'Toggle theme (light/dark)',
  'footer.madeIn': 'Made in Senegal 🇸🇳',
};

export type TranslationKey = keyof typeof wo;

const dictionaries: Record<UiLanguage, Record<TranslationKey, string>> = { wo, fr, en };

export function translate(
  lang: UiLanguage,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  let text = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const UI_LANGUAGES: { code: UiLanguage; label: string }[] = [
  { code: 'wo', label: 'Wolof' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
];
