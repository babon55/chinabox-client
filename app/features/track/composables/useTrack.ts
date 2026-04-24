import { computed } from 'vue'
import { useI18n }  from 'vue-i18n'
import { useTrackStore } from '../stores/track.store'
import type { TrackLine } from '../types'

export const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const

export const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#F59E0B',
  PROCESSING: '#3B82F6',
  SHIPPED:    '#8B5CF6',
  DELIVERED:  '#22C55E',
  CANCELLED:  '#EF4444',
}

export const STATUS_ICONS: Record<string, string> = {
  PENDING:    '⏳',
  PROCESSING: '⚙️',
  SHIPPED:    '🚚',
  DELIVERED:  '✅',
  CANCELLED:  '❌',
}

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING:    'orders.statusPending',
  PROCESSING: 'orders.statusProcessing',
  SHIPPED:    'orders.statusShipped',
  DELIVERED:  'orders.statusDelivered',
  CANCELLED:  'orders.statusCancelled',
}

export function useTrack() {
  const { t, locale } = useI18n()
  const store         = useTrackStore()

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function statusLabel(status: string): string {
    return t(STATUS_LABEL_KEYS[status] ?? 'common.error')
  }

  function stepIndex(status: string): number {
    return STATUS_STEPS.indexOf(status as any)
  }

  function fmt(n: number | string): string {
    return Number(n).toFixed(2)
  }

  function fmtDate(d: string): string {
    return new Date(d).toLocaleDateString(
      locale.value === 'tk' ? 'tk-TM' : 'ru-RU',
      { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    )
  }

  function productName(line: TrackLine): string {
    if (!line.product) return locale.value === 'tk' ? 'Önüm' : 'Товар'
    return locale.value === 'tk'
      ? (line.product.nameTk ?? line.product.nameRu ?? 'Önüm')
      : (line.product.nameRu ?? line.product.nameTk ?? 'Товар')
  }

  function productImage(line: TrackLine): string {
    return line.product?.image ?? '📦'
  }

  // ── Computed total — handles missing total field gracefully ────────────────
  const orderTotal = computed(() => {
    if (!store.order) return 0
    if (store.order.total != null) return Number(store.order.total)
    return (store.order.lines ?? []).reduce(
      (s, l) => s + Number(l.unitPrice ?? 0) * (l.qty ?? 1), 0
    )
  })

  return {
    STATUS_STEPS,
    STATUS_COLORS,
    STATUS_ICONS,
    orderTotal,
    statusLabel,
    stepIndex,
    fmt,
    fmtDate,
    productName,
    productImage,
  }
}