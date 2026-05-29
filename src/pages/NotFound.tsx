import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div style={{ textAlign: 'center', maxWidth: 400 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 80, fontWeight: 700, color: 'var(--color-border)', lineHeight: 1, marginBottom: 24 }}>404</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Página não encontrada</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: 32 }}>A rota que você tentou acessar não existe.</p>
        <Link to="/" className="btn btn--primary">← Voltar para o início</Link>
      </motion.div>
    </div>
  )
}