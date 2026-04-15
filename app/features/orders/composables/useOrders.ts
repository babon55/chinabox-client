import { computed }         from 'vue'
import { useI18n }          from 'vue-i18n'
import { useOrdersStore }   from '../stores/orders.store'
import type { OrderStats }  from '../types'

export const STATUS_OPTIONS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export const STATUS_STEPS   = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

export const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#F59E0B',
  PROCESSING: '#3B82F6',
  SHIPPED:    '#8B5CF6',
  DELIVERED:  '#22C55E',
  CANCELLED:  '#EF4444',
}

export function useOrders() {
  const { t, locale } = useI18n()
  const store         = useOrdersStore()

  // ── Labels ─────────────────────────────────────────────────────────────────
  const STATUS_LABELS = computed<Record<string, string>>(() => ({
    ALL:        t('common.allCategories'),
    PENDING:    t('orders.statusPending'),
    PROCESSING: t('orders.statusProcessing'),
    SHIPPED:    t('orders.statusShipped'),
    DELIVERED:  t('orders.statusDelivered'),
    CANCELLED:  t('orders.statusCancelled'),
  }))

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function fmt(n: number | string): string {
    return Number(n).toFixed(2)
  }

  function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString(
      locale.value === 'tk' ? 'tk-TM' : 'ru-RU',
      { day: '2-digit', month: 'short', year: 'numeric' }
    )
  }

  function stepIndex(status: string): number {
    return STATUS_STEPS.indexOf(status as any)
  }

  function filteredOrders(filterStatus: string) {
    if (filterStatus === 'ALL') return store.orders
    return store.orders.filter(o => o.status === filterStatus)
  }

  function countByStatus(status: string): number {
    return store.orders.filter(o => o.status === status).length
  }

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = computed<OrderStats[]>(() => {
    const total  = store.orders.length
    const active = store.orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length
    const done   = store.orders.filter(o => o.status === 'DELIVERED').length
    const spent  = store.orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((s, o) => s + Number(o.total), 0)

    return [
      { label: t('pages.orders.title'),     value: total,           icon: '📦' },
      { label: t('orders.statusPending'),   value: active,          icon: '⏳' },
      { label: t('orders.statusDelivered'), value: done,            icon: '✅' },
      { label: t('orders.total'),           value: `$${fmt(spent)}`, icon: '💰' },
    ]
  })

  return {
    STATUS_LABELS,
    STATUS_COLORS,
    STATUS_OPTIONS,
    STATUS_STEPS,
    stats,
    fmt,
    fmtDate,
    stepIndex,
    filteredOrders,
    countByStatus,
  }
}