import { useState, type FormEvent, type SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input }  from '../components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await signIn(email, password)
      navigate('/app')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Email ou senha incorretos.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-brand">Snapbook</h1>
        <p className="auth-subtitle">Entre na sua conta</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email" type="email" placeholder="seu@email.com"
            value={email} onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" placeholder="••••••••"
            value={password} onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)} required />
          {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}
          <Button type="submit" loading={loading} full>Entrar</Button>
        </form>

        <p className="auth-footer">
          Não tem conta?{' '}
          <Link to="/cadastro" className="auth-link">Criar conta grátis</Link>
        </p>
        <div className="auth-divider"><span>ou</span></div>
        <Link to="/" className="auth-link" style={{ display: 'block', textAlign: 'center', fontSize: 14 }}>
          Ver demonstração →
        </Link>
      </div>
    </div>
  )
}