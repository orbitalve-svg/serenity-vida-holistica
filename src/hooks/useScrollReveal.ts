import { useEffect, useRef, useState } from 'react'

/**
 * IntersectionObserver-based scroll reveal. Returns a ref to attach and a
 * boolean that flips true once the element scrolls into view (once).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(entry.target)
        }
      })
    }, options)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, visible }
}
