/**
 * Máscaras orgânicas. Copiado de BLOBS, idêntico no desktop e no mobile.
 * Cada valor é um border-radius de oito raios, recortado à mão.
 */
export const BLOBS = [
  '58% 42% 55% 45% / 48% 60% 40% 52%',
  '45% 55% 48% 52% / 58% 42% 58% 42%',
  '52% 48% 40% 60% / 55% 45% 55% 45%',
  '60% 40% 50% 50% / 42% 58% 42% 58%',
  '48% 52% 58% 42% / 50% 50% 60% 40%',
] as const

/** O sexto recorte, maior, exclusivo do hero (aparece na prancha e no hero do desktop). */
export const BLOB_HERO = '44% 56% 52% 48% / 62% 38% 62% 38%'

/** O recorte do hero mobile, que só arredonda a base. */
export const BLOB_HERO_MOBILE = '0 0 46% 54% / 0 0 18% 22%'

/** Rotação sutil de cada máscara, de -3° a +2°, como descrito na prancha. */
export const ROTACOES = [-3, 0, 2, -2, 1] as const

export const blob = (i: number) => BLOBS[i % BLOBS.length]
