import { Font } from '@react-pdf/renderer';

import interRegularUrl from '@/assets/fonts/Inter/Inter_18pt-Regular.ttf';
import interMediumUrl from '@/assets/fonts/Inter/Inter_18pt-Medium.ttf';
import interSemiBoldUrl from '@/assets/fonts/Inter/Inter_18pt-SemiBold.ttf';
import interBoldUrl from '@/assets/fonts/Inter/Inter_18pt-Bold.ttf';

export const LABEL_PDF_FONT_FAMILY = 'Inter';

let registered = false;
export function registerLabelPdfFonts(): void {
  if (registered) return;
  Font.register({
    family: LABEL_PDF_FONT_FAMILY,
    fonts: [
      { src: interRegularUrl, fontWeight: 400 },
      { src: interMediumUrl, fontWeight: 500 },
      { src: interSemiBoldUrl, fontWeight: 600 },
      { src: interBoldUrl, fontWeight: 700 },
    ],
  });

  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
