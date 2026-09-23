import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// a ordem importa: base do Tailwind primeiro, depois as nossas camadas
import './styles/global.css'
import './styles/componentes.css'
import './styles/header.css'
import './styles/preloader.css'
import './styles/secoes.css'
import './styles/visibilidade.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
