import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

/** true quando o sistema pede menos movimento. Tudo vira fade, o fio já nasce desenhado. */
export function useReducedMotion() {
  const [reduzido, setReduzido] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(CONSULTA).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(CONSULTA)
    const aoMudar = (e: MediaQueryListEvent) => setReduzido(e.matches)
    mq.addEventListener('change', aoMudar)
    setReduzido(mq.matches)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  return reduzido
}
