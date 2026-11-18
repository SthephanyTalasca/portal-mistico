import { useSeo } from '../hooks/useSeo'
import FaqList from '../components/FaqList'
import SectionTitle from '../components/ui/SectionTitle'

export default function FaqPage() {
  useSeo({ title: 'Perguntas frequentes' })
  return (
    <section className="section page-top">
      <div className="container narrow">
        <SectionTitle as="h1" title="Perguntas frequentes" />
        <FaqList />
      </div>
    </section>
  )
}
