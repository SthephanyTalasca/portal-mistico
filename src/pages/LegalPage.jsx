import { useSite } from '../context/SiteContext'
import { useSeo } from '../hooks/useSeo'
import Markdown from '../components/ui/Markdown'
import SectionTitle from '../components/ui/SectionTitle'

const PAGES = {
  privacy: { title: 'Política de privacidade', field: 'privacy_text' },
  terms: { title: 'Termos de atendimento', field: 'terms_text' },
}

export default function LegalPage({ kind }) {
  const { settings } = useSite()
  const page = PAGES[kind]
  useSeo({ title: page.title })
  const text = settings[page.field]
  return (
    <section className="section page-top">
      <div className="container narrow">
        <SectionTitle as="h1" title={page.title} />
        {text ? <Markdown text={text} className="legal-text" /> : <p className="lead center">Conteúdo em preparação.</p>}
      </div>
    </section>
  )
}
