import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { isConfigured } from './lib/supabase'
import { SiteProvider } from './context/SiteContext'
import { AuthProvider } from './context/AuthContext'
import ConfigNotice from './components/ConfigNotice'
import PublicLayout from './components/layout/PublicLayout'
import { Loading } from './components/ui/States'
import Home from './pages/Home'
import DecksPage from './pages/DecksPage'
import DeckPage from './pages/DeckPage'
import SpreadsPage from './pages/SpreadsPage'
import SpreadDetail from './pages/SpreadDetail'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FaqPage from './pages/FaqPage'
import LegalPage from './pages/LegalPage'
import NotFound from './pages/NotFound'
import RequireAdmin from './admin/RequireAdmin'

// O painel é carregado sob demanda: visitantes não baixam esse código.
const AdminLogin = lazy(() => import('./admin/AdminLogin'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Overview = lazy(() => import('./admin/pages/Overview'))
const SpreadsAdmin = lazy(() => import('./admin/pages/SpreadsAdmin'))
const SpreadForm = lazy(() => import('./admin/pages/SpreadForm'))
const DecksAdmin = lazy(() => import('./admin/pages/DecksAdmin'))
const CategoriesAdmin = lazy(() => import('./admin/pages/CategoriesAdmin'))
const ServicesAdmin = lazy(() => import('./admin/pages/ServicesAdmin'))
const FaqAdmin = lazy(() => import('./admin/pages/FaqAdmin'))
const IdentityAdmin = lazy(() => import('./admin/pages/IdentityAdmin'))
const SettingsAdmin = lazy(() => import('./admin/pages/SettingsAdmin'))

export default function App() {
  if (!isConfigured) return <ConfigNotice />

  return (
    <SiteProvider>
      <AuthProvider>
        <Suspense fallback={<Loading full />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="baralhos" element={<DecksPage />} />
              <Route path="baralhos/:slug" element={<DeckPage />} />
              <Route path="tiragens" element={<SpreadsPage />} />
              <Route path="tiragens/:slug" element={<SpreadDetail />} />
              <Route path="servicos" element={<ServicesPage />} />
              <Route path="sobre" element={<AboutPage />} />
              <Route path="contato" element={<ContactPage />} />
              <Route path="perguntas-frequentes" element={<FaqPage />} />
              <Route path="privacidade" element={<LegalPage kind="privacy" />} />
              <Route path="termos" element={<LegalPage kind="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="admin/login" element={<AdminLogin />} />
            <Route
              path="admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<Overview />} />
              <Route path="tiragens" element={<SpreadsAdmin />} />
              <Route path="tiragens/nova" element={<SpreadForm key="new" />} />
              <Route path="tiragens/:id" element={<SpreadForm />} />
              <Route path="baralhos" element={<DecksAdmin />} />
              <Route path="categorias" element={<CategoriesAdmin />} />
              <Route path="servicos" element={<ServicesAdmin />} />
              <Route path="faq" element={<FaqAdmin />} />
              <Route path="identidade" element={<IdentityAdmin />} />
              <Route path="configuracoes" element={<SettingsAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </SiteProvider>
  )
}
