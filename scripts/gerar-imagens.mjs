/**
 * Gera as versões responsivas das fotos, em WebP e em JPG.
 *
 * As fotos da ONG chegaram grandes: a do hero tem 1600x2400 e quase meio
 * mega. Num celular de 390px isso é dez vezes mais pixel do que a tela
 * mostra, e é o maior peso da página. Aqui cada foto vira uma escada de
 * larguras, e o componente Foto escolhe a certa por `srcset`.
 *
 * Saída em public/assets/fotos/gerado/, que fica fora do Git: é derivado,
 * e o build do Cloudflare Pages roda este script antes do Vite.
 *
 * Uso: node scripts/gerar-imagens.mjs [--forcar]
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const origem = path.join(raiz, 'public/assets/fotos')
const destino = path.join(origem, 'gerado')

/** a mesma escada que o componente Foto usa para montar o srcset */
export const LARGURAS = [400, 640, 960, 1280, 1600]

const forcar = process.argv.includes('--forcar')

async function precisaGerar(saida, entrada) {
  if (forcar) return true
  try {
    const [a, b] = await Promise.all([fs.stat(saida), fs.stat(entrada)])
    return a.mtimeMs < b.mtimeMs
  } catch {
    return true
  }
}

await fs.mkdir(destino, { recursive: true })

const arquivos = (await fs.readdir(origem)).filter((f) => f.endsWith('.jpg'))
let geradas = 0
let puladas = 0

for (const arquivo of arquivos) {
  const entrada = path.join(origem, arquivo)
  const nome = arquivo.replace(/\.jpg$/, '')
  const { width = 0 } = await sharp(entrada).metadata()

  // só larguras menores que a original, mais a própria original
  const alvos = [...new Set([...LARGURAS.filter((l) => l < width), width])]

  for (const largura of alvos) {
    for (const formato of ['webp', 'jpg']) {
      const saida = path.join(destino, `${nome}-${largura}.${formato}`)
      if (!(await precisaGerar(saida, entrada))) {
        puladas += 1
        continue
      }

      const canal = sharp(entrada).resize({ width: largura, withoutEnlargement: true })
      await (formato === 'webp'
        ? canal.webp({ quality: 72, effort: 5 })
        : canal.jpeg({ quality: 72, mozjpeg: true })
      ).toFile(saida)
      geradas += 1
    }
  }
}

console.log(
  `imagens: ${geradas} geradas, ${puladas} já estavam em dia (${arquivos.length} fotos)`,
)
