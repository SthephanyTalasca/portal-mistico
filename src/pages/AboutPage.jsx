import { useSite } from '../context/SiteContext'
import { useSeo } from '../hooks/useSeo'
import { stripMarkdown } from '../lib/markdown'
import AboutSection from './sections/AboutSection'

export default function AboutPage() {
  const { home } = useSite()
  useSeo({ title: 'Sobre mim', description: stripMarkdown(home.about_bio).slice(0, 160), image: home.about_photo_url })
  return (
    <div className="page-top">
      <AboutSection headingLevel="h1" />
    </div>
  )
}
