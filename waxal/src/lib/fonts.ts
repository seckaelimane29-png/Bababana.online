import { Anton_400Regular } from '@expo-google-fonts/anton';
import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script';
import { DMSerifDisplay_400Regular_Italic } from '@expo-google-fonts/dm-serif-display';
import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Montserrat_900Black } from '@expo-google-fonts/montserrat';
import { Oswald_700Bold } from '@expo-google-fonts/oswald';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { PlayfairDisplay_800ExtraBold_Italic } from '@expo-google-fonts/playfair-display';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Rubik_900Black_Italic } from '@expo-google-fonts/rubik';

import type { FontKey } from '@/types';

export const fontAssets = {
  Anton_400Regular,
  ArchivoBlack_400Regular,
  Bangers_400Regular,
  BebasNeue_400Regular,
  DancingScript_700Bold,
  DMSerifDisplay_400Regular_Italic,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_800ExtraBold,
  Montserrat_900Black,
  Oswald_700Bold,
  PermanentMarker_400Regular,
  PlayfairDisplay_800ExtraBold_Italic,
  Poppins_800ExtraBold,
  Rubik_900Black_Italic,
};

/** Font family names in the app, plus the matching font name used by the export server (ASS / libass). */
export const FONTS: Record<FontKey, { label: string; family: string; assFamily: string }> = {
  montserrat: { label: 'Montserrat', family: 'Montserrat_900Black', assFamily: 'Montserrat Black' },
  anton: { label: 'Anton', family: 'Anton_400Regular', assFamily: 'Anton' },
  bebas: { label: 'Bebas', family: 'BebasNeue_400Regular', assFamily: 'Bebas Neue' },
  poppins: { label: 'Poppins', family: 'Poppins_800ExtraBold', assFamily: 'Poppins ExtraBold' },
  marker: { label: 'Marker', family: 'PermanentMarker_400Regular', assFamily: 'Permanent Marker' },
  inter: { label: 'Inter', family: 'Inter_800ExtraBold', assFamily: 'Inter ExtraBold' },
  playfair: { label: 'Elegant', family: 'PlayfairDisplay_800ExtraBold_Italic', assFamily: 'Playfair Display ExtraBold Italic' },
  dancing: { label: 'Script', family: 'DancingScript_700Bold', assFamily: 'Dancing Script Bold' },
  oswald: { label: 'Oswald', family: 'Oswald_700Bold', assFamily: 'Oswald Bold' },
  bangers: { label: 'Comic', family: 'Bangers_400Regular', assFamily: 'Bangers' },
  archivo: { label: 'Archivo', family: 'ArchivoBlack_400Regular', assFamily: 'Archivo Black' },
  dmserif: { label: 'Serif', family: 'DMSerifDisplay_400Regular_Italic', assFamily: 'DM Serif Display Italic' },
  rubik: { label: 'Sport', family: 'Rubik_900Black_Italic', assFamily: 'Rubik Black Italic' },
};

export const UI_FONT = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_800ExtraBold',
};
