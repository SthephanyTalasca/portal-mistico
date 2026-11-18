import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import StarField from './StarField'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function PublicLayout() {
  const { pathname } = useLocation()
  return (
    <div className="site">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <StarField />
      <ScrollManager />
      <Header />
      <main id="conteudo" className="site-main">
        <div key={pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
