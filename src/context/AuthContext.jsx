import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const lastUserId = useRef(undefined)

  useEffect(() => {
    let active = true

    const evaluate = async (sess) => {
      const uid = sess?.user?.id ?? null
      setSession(sess)
      // Só reconsulta quando o usuário muda (evita recarregar a cada refresh de token)
      if (uid === lastUserId.current) return
      lastUserId.current = uid
      if (!uid) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      setLoading(true)
      const { data, error } = await supabase.from('admins').select('user_id').eq('user_id', uid).maybeSingle()
      if (!active) return
      setIsAdmin(!error && Boolean(data))
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => active && evaluate(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // setTimeout evita chamar o Supabase dentro do callback de autenticação
      setTimeout(() => active && evaluate(sess), 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), [])
  const signOut = useCallback(() => supabase.auth.signOut(), [])

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, isAdmin, loading, signIn, signOut }),
    [session, isAdmin, loading, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
