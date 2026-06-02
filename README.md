# Snapbook

Sistema de agendamento para fotógrafos autônomos brasileiros. O fotógrafo configura seus serviços e disponibilidade, recebe um link único e seus clientes agendam diretamente — sem precisar de conta, sem vai e vem no WhatsApp.

🔗 **[https://snapbook-virid.vercel.app/](#)**

---

## Por que esse projeto existe

Fotógrafos autônomos gerenciam agenda pelo WhatsApp. O problema: horário duplo, cliente sumido, sem histórico, sem controle. Ferramentas existentes como Calendly são genéricas e caras. O Snapbook foi construído especificamente para o contexto brasileiro — com PIX, com o fluxo de sinal/confirmação e com a simplicidade que um autônomo precisa.

---

## Funcionalidades

### Para o fotógrafo

**Dashboard `/app`**

- Métricas do mês: agendamentos, receita estimada, pendentes, serviços ativos
- SmartAlerts: notificação automática quando um agendamento fica sem confirmação por mais de 24h
- Lista de próximos agendamentos confirmados
- Lista de agendamentos aguardando confirmação de pagamento
- Link de agendamento em destaque para copiar e compartilhar

**Agenda `/app/agenda`**

- Todos os agendamentos com filtros por status
- Modal de ação: confirmar, concluir, cancelar ou reabrir
- Campo de nota interna por agendamento

**Serviços `/app/servicos`**

- CRUD de serviços com nome, descrição, duração, preço e valor do sinal
- Toggle ativo/inativo — serviços inativos não aparecem para o cliente
- Link público em destaque com botão de cópia

**Disponibilidade `/app/disponibilidade`**

- Configuração por dia da semana com horário de início e fim
- Datas bloqueadas para feriados, viagens e ausências

**Configurações `/app/configuracoes`**

- Edição de perfil: nome, slug, bio, Instagram
- Configuração de pagamento: chave PIX e instrução de pagamento

### Para o cliente (sem login)

**Página de agendamento `/book/:slug`**

- Perfil do fotógrafo com bio e Instagram
- Fluxo multi-step com 5 etapas:
  1. **Serviço** — cards com nome, duração, preço e valor do sinal
  2. **Data** — calendário mensal navegável, apenas dias com disponibilidade real habilitados
  3. **Horário** — slots gerados automaticamente, sem conflito com agendamentos existentes
  4. **Dados pessoais** — nome, email, telefone, observação opcional
  5. **Confirmação** — resumo completo antes de finalizar

**Página de confirmação `/book/:slug/confirmacao`**

- Resumo do agendamento
- Instruções de pagamento do sinal via PIX
- CTA para agendar outro ensaio

---

## Decisões de arquitetura

### Engine de slots — o coração técnico

O coração do produto. Dado um fotógrafo, uma data e um serviço, gera os horários disponíveis considerando simultaneamente:

- Disponibilidade semanal configurada
- Datas bloqueadas
- Agendamentos já existentes (evita conflito por sobreposição de horário)
- Duração do serviço selecionado

```ts
export function generateSlots(
  date: Date,
  availability: Availability[],
  blockedDates: BlockedDate[],
  existingBookings: Booking[],
  serviceDurationMin: number,
): string[] {
  // 1. Data bloqueada? Retorna []
  // 2. Dia da semana tem disponibilidade? Retorna [] se não
  // 3. Gera slots em intervalos de 30min dentro da janela
  // 4. Filtra slots que conflitam com agendamentos existentes
}
```

Isso reduz conflitos de agendamento ao impedir que horários ocupados sejam exibidos como disponíveis.

### RLS no Supabase — segurança no nível do banco

Cada fotógrafo só acessa seus próprios dados, garantido por Row Level Security no PostgreSQL — não apenas na aplicação.

```sql
-- Fotógrafo só vê seus próprios agendamentos
CREATE POLICY "own_bookings" ON bookings
  FOR ALL USING (auth.uid() = photographer_id);

-- Cliente pode inserir agendamento sem autenticação
CREATE POLICY "public_insert_booking" ON bookings
  FOR INSERT WITH CHECK (true);

-- Dados do fotógrafo são públicos para leitura (página de booking)
CREATE POLICY "public_read_profile" ON photographer_profiles
  FOR SELECT USING (true);
```

### Página pública sem autenticação

A página `/book/:slug` é completamente pública. O cliente não precisa de conta para agendar. A inserção de agendamentos é permitida para usuários não autenticados via política de RLS específica, enquanto a leitura, confirmação e cancelamento são restritos ao fotógrafo autenticado.

### React Query para cache e sincronização

Todas as operações de dados usam TanStack Query. Após qualquer mutação (confirmar agendamento, criar serviço, bloquear data), o cache é invalidado automaticamente — o dashboard reflete o estado real em tempo real sem reload.

### Booking components extraídos

O fluxo de agendamento é dividido em componentes independentes em `components/booking/`:

- `ServiceStep` — lista de serviços
- `DateStep` — wrapper do calendário mensal
- `DatePicker` — calendário com navegação mensal e lógica de disponibilidade
- `TimeStep` — grid de horários disponíveis
- `ClientStep` — formulário de dados pessoais
- `BookingProgress` — indicador de progresso

Cada componente é testável e reutilizável independentemente.

---

## Stack

| Tecnologia            | Uso                                     |
| --------------------- | --------------------------------------- |
| React 18 + TypeScript | UI e tipagem                            |
| Vite                  | Build e dev server                      |
| React Router DOM v6   | Roteamento público e protegido          |
| Supabase              | Auth + PostgreSQL + RLS                 |
| TanStack Query        | Cache, sincronização e mutações         |
| Framer Motion         | Animações e transições                  |
| date-fns              | Manipulação de datas e geração de slots |
| Lucide React          | Ícones                                  |

**Zero backend próprio. Zero cold start. Deploy estático no frontend, dados no Supabase.**

---

## Estrutura do projeto

```
src/
├── components/
│   ├── ui/           # Button, Input, Card, Badge, Modal, Spinner, Skeleton
│   ├── layout/       # Sidebar, BottomNav, Header, PageTransition
│   ├── booking/      # ServiceStep, DateStep, DatePicker, TimeStep,
│   │                 # ClientStep, BookingProgress
│   └── dashboard/    # StatsCards, BookingCard, UpcomingList, SmartAlerts
├── hooks/
│   ├── useAuth.tsx               # Auth com Supabase
│   ├── useBookings.ts            # CRUD de agendamentos
│   ├── useServices.ts            # CRUD de serviços
│   ├── useAvailability.ts        # Disponibilidade e datas bloqueadas
│   └── usePublicPhotographer.ts  # Dados públicos por slug
├── pages/
│   ├── Landing, Login, Register, Onboarding
│   ├── Dashboard, Agenda, Services, Availability, Settings
│   ├── BookingPage, BookingConfirm
│   └── NotFound
├── utils/
│   ├── timeSlots.ts    # Engine de geração de slots
│   └── formatters.ts   # formatBRL, formatDate, slugify...
└── types/index.ts      # Interfaces TypeScript
```

---

## Como rodar localmente

```bash
git clone https://github.com/seu-usuario/snapbook.git
cd snapbook
npm install
```

Configure o `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Rode o schema SQL no Supabase SQL Editor (seção "Schema" do plano), então:

```bash
npm run dev
```

---

## Deploy

**Frontend:** Vercel — conecte o repositório e clique em Deploy. Vite é detectado automaticamente.

**Backend:** Supabase — já está hospedado. Configure as mesmas variáveis de ambiente na Vercel.

---

## Autor

Desenvolvido por **Alexandre Gaia** — desenvolvedor Full Stack.

📧 alexandregaia.dev@gmail.com · 🔗 [alexandregaia.netlify.app](https://alexandregaia.netlify.app) · 💼 [linkedin.com/in/alexandre-gaia](https://linkedin.com/in/alexandre-gaia)
