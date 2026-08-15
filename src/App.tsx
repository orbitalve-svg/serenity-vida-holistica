import { Suspense, lazy } from 'react'
import Nav from './components/Nav'
import Threshold from './components/Threshold'
import Hero from './components/Hero'
import WelcomeBack from './components/WelcomeBack'
import About from './components/About'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Gallery from './components/Gallery'
import Workshops from './components/Workshops'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'

/**
 * Las secciones pesadas de la mitad inferior se cargan cuando hacen falta:
 * el quiz, las formaciones, los chakras con audio, la carta astral con su
 * motor astronómico, la luna y el oráculo suman la mayor parte del JS y
 * nadie las ve sin hacer scroll. Así la primera pintura llega antes en móvil.
 */
const ChakraQuiz = lazy(() => import('./components/ChakraQuiz'))
const Formations = lazy(() => import('./components/Formations'))
const Chakras = lazy(() => import('./components/Chakras'))
const AstralChart = lazy(() => import('./components/AstralChart'))
const LunarPhase = lazy(() => import('./components/LunarPhase'))
const Oracle = lazy(() => import('./components/Oracle'))

/** Reserva el alto aproximado de la sección para que el scroll no salte. */
function Cargando() {
  return <div style={{ minHeight: '70vh' }} aria-hidden="true" />
}

export default function App() {
  return (
    <>
      <Threshold />
      <Nav />
      <main>
        <Hero />
        <WelcomeBack />
        <About />
        <Services />
        {/* La prueba social va justo tras la oferta: confianza en el momento
            de decidir, no dieciocho pantallas después. */}
        <Testimonials />
        <Gallery />
        <Workshops />
        <Suspense fallback={<Cargando />}>
          <ChakraQuiz />
          <Formations />
          <Chakras />
          <AstralChart />
          <LunarPhase />
          <Oracle />
        </Suspense>
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
