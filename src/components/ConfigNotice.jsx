import { MoonLogo } from './ui/Icons'

// Exibido quando as variáveis de ambiente do Supabase não foram configuradas.
export default function ConfigNotice() {
  return (
    <main className="config-notice">
      <MoonLogo className="state-moon" />
      <h1 className="display">Quase lá…</h1>
      <p>
        O site ainda não está conectado ao banco de dados. Crie o arquivo <code>.env</code> na raiz do projeto
        (use o <code>.env.example</code> como modelo) com:
      </p>
      <pre>{`VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica`}</pre>
      <p>Na Vercel ou Netlify, cadastre essas mesmas variáveis nas configurações do projeto e publique de novo.</p>
      <p>O passo a passo completo está no arquivo <code>README.md</code>.</p>
    </main>
  )
}
