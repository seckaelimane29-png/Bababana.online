import { Anton_400Regular } from '@expo-google-fonts/anton';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Montserrat_900Black } from '@expo-google-fonts/montserrat';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins';

import type { FontKey } from '@/types';

export const fontAssets = {
  Anton_400Regular,
  BebasNeue_400Regular,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_800ExtraBold,
  Montserrat_900Black,
  PermanentMarker_400Regular,
  Poppins_800ExtraBold,
};

/** Font family names in the app, plus the matching family name used by the export server (ASS). */
export const FONTS: Record<FontKey, { label: string; family: string; assFamily: string }> = {
  montserrat: { label: 'Montserrat', family: 'Montserrat_900Black', assFamily: 'Montserrat Black' },
  anton: { label: 'Anton', family: 'Anton_400Regular', assFamily: 'Anton' },
  bebas: { label: 'Bebas', family: 'BebasNeue_400Regular', assFamily: 'Bebas Neue' },
  poppins: { label: 'Poppins', family: 'Poppins_800ExtraBold', assFamily: 'Poppins ExtraBold' },
  marker: { label: 'Marker', family: 'PermanentMarker_400Regular', assFamily: 'Permanent Marker' },
  inter: { label: 'Inter', family: 'Inter_800ExtraBold', assFamily: 'Inter ExtraBold' },
};

export const UI_FONT = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_800ExtraBold',
};
