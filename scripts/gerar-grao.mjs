/**
 * Gera o ladrilho da granulação.
 *
 * O design pede uma granulação fina sobre a página inteira. Fazer isso com
 * um <feTurbulence> cobrindo a viewport custa caro: é um filtro vivo, que o
 * navegador recompõe a cada quadro, e no Lighthouse mobile ele aparecia como
 * mais de um segundo de "Style & Layout". Um ladrilho de ruído repetido em
 * background-image dá o mesmo resultado visual por um custo de bitmap.
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const LADO = 128

await sharp({
  create: {
    width: LADO,
    height: LADO,
    channels: 3,
    background: '#808080',
    noise: { type: 'gaussian', mean: 128, sigma: 26 },
  },
})
  .greyscale()
  .png({ compressionLevel: 9, palette: true, colours: 16, dither: 0 })
  .toFile(path.join(raiz, 'public/assets/grao.png'))

console.log(`public/assets/grao.png gerado em ${LADO}x${LADO}`)
