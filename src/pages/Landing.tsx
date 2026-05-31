import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-brand">Snapbook</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login"   className="btn btn--ghost btn--sm">Entrar</Link>
          <Link to="/cadastro" className="btn btn--primary btn--sm">Criar conta</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="landing-badge">Para fotógrafos autônomos</span>
          <h1 className="landing-title">
            Chega de agendar<br />
            <span style={{ color: 'var(--color-gold)' }}>pelo WhatsApp.</span>
          </h1>
          <p className="landing-subtitle">
            Crie sua página de agendamento em minutos. Seus clientes escolhem o serviço,
            a data e o horário — você recebe tudo organizado.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/cadastro" className="btn btn--primary btn--lg">Começar grátis →</Link>
            <span className="text-sm text-muted">Sem cartão de crédito</span>
          </div>
        </motion.div>
      </section>

      <section className="landing-features">
        {[
          { icon: '🔗', title: 'Seu link único', desc: 'Um link personalizado que você manda no WhatsApp, Instagram e onde quiser. Clients agendam direto, sem te chamar.' },
          { icon: '📅', title: 'Agenda inteligente', desc: 'Configure seus dias e horários de trabalho. O sistema bloqueia conflitos automaticamente.' },
          { icon: '💰', title: 'Controle de pagamento', desc: 'Defina um sinal por serviço. O cliente vê as instruções do PIX ao confirmar o agendamento.' },
        ].map((f, i) => (
          <motion.div key={f.title} className="card landing-feature-card"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}>
            <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>{f.icon}</span>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
            <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <section style={{ textAlign: 'center', padding: '80px 24px', borderTop: '1px solid var(--color-border)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, marginBottom: 12 }}>
          Pronto para começar?
        </h2>
        <p className="text-muted" style={{ marginBottom: 28 }}>Grátis, sem complicação.</p>
        <Link to="/cadastro" className="btn btn--primary btn--lg">Criar minha conta →</Link>
      </section>

      <footer style={{ textAlign: 'center', padding: 24, borderTop: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-muted)' }}>
        Snapbook · Feito para fotógrafos brasileiros
      </footer>
    </div>
  )
}