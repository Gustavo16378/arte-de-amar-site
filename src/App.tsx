import { useEffect } from 'react'
import { DefinicoesSvg } from './components/Fio'
import { Header } from './components/Header'
import { iniciarLenis } from './lib/lenis'
import { Hero } from './components/sections/Hero'
import { Numeros } from './components/sections/Numeros'
import { QuemSomos } from './components/sections/QuemSomos'
import { Historia } from './components/sections/Historia'
import { Diretoria } from './components/sections/Diretoria'
import { Atuacao } from './components/sections/Atuacao'
import { Projetos } from './components/sections/Projetos'
import { ComoAjudar } from './components/sections/ComoAjudar'
import { Footer } from './components/sections/Footer'

/**
 * Fase 2: navegação e scroll suave. As seções ainda são estáticas; o motion
 * de cada uma entra nas Fases 4 e 5.
 *
 * A ordem é a do design: hero, números, quem somos, história, diretoria,
 * atuação, projetos, como ajudar, rodapé.
 */
export default function App() {
  useEffect(() => {
    iniciarLenis()
  }, [])

  return (
    <div className="pagina">
      <DefinicoesSvg />
      <Header />

      <main>
        <Hero />
        <Numeros />
        <QuemSomos />
        <Historia />
        <Diretoria />
        <Atuacao />
        <Projetos />
        <ComoAjudar />
      </main>

      <Footer />
    </div>
  )
}
