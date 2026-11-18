import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'
import RitualsSection from './sections/RitualsSection'

export default function ServicesPage() {
  useSeo({ title: 'Serviços' })
  return (
    <div className="page-top">
      <RitualsSection headingLevel="h1" />
      <section className="section">
        <div className="container narrow contact-panel">
          <h2 className="display">Consultas oraculares</h2>
          <p className="lead">Enquanto novos serviços são preparados, as tiragens de Baralho Cigano estão disponíveis.</p>
          <Link to="/tiragens" className="btn btn-primary">Ver tiragens</Link>
        </div>
      </section>
    </div>
  )
}
