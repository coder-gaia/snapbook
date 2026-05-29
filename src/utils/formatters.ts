import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy')
}
export function formatTime(time: string): string { return time.slice(0, 5) }
export function formatPhone(phone: string): string {
  const c = phone.replace(/\D/g, '').slice(0, 11)
  if (c.length === 11) return c.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  return c.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
}
export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}
export const DAY_NAMES = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']
export const DAY_NAMES_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']