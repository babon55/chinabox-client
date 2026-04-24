<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  productId: string
}>()

const { locale, t } = useI18n()

const config = useRuntimeConfig()
const API   = config.public.apiBase

// ── Types ─────────────────────────────────────────────────────────────────────
interface Comment {
  id:        string
  rating:    number
  text:      string
  createdAt: string
  customer:  { id: string; name: string }
}

interface CommentsData {
  comments:  Comment[]
  total:     number
  avgRating: number
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const token      = ref<string | null>(null)
const customerId = ref<string | null>(null)

onMounted(() => {
  token.value = localStorage.getItem('customer_access_token')
  const raw = localStorage.getItem('customer_user')
  if (raw) {
    try { customerId.value = JSON.parse(raw).id } catch {}
  }
})

// ── Comments data ─────────────────────────────────────────────────────────────
const data    = ref<CommentsData>({ comments: [], total: 0, avgRating: 0 })
const loading = ref(true)

async function loadComments() {
  loading.value = true
  try {
    data.value = await $fetch<CommentsData>(`${API}/products/${props.productId}/comments`)
  } catch {}
  finally { loading.value = false }
}

onMounted(loadComments)

// ── Submit form ───────────────────────────────────────────────────────────────
const newRating   = ref(0)
const hoverRating = ref(0)
const newText     = ref('')
const submitting  = ref(false)
const submitErr   = ref('')
const submitted   = ref(false)

async function submitComment() {
  if (!newRating.value) {
    submitErr.value = t('productComments.ratingRequired')
    return
  }
  if (!newText.value.trim()) {
    submitErr.value = t('productComments.reviewRequired')
    return
  }
  if (!token.value) return

  submitting.value = true
  submitErr.value  = ''

  try {
    await $fetch(`${API}/products/${props.productId}/comments`, {
      method:  'POST',
      body:    { rating: newRating.value, text: newText.value },
      headers: { Authorization: `Bearer ${token.value}` },
    })
    newRating.value = 0
    newText.value   = ''
    submitted.value = true
    await loadComments()
    setTimeout(() => { submitted.value = false }, 3000)
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    submitErr.value = msg ?? t('productComments.error')
  } finally {
    submitting.value = false
  }
}

async function deleteComment(id: string) {
  if (!token.value) return
  try {
    await $fetch(`${API}/products/${props.productId}/comments/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token.value}` },
    })
    await loadComments()
  } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(
    locale.value === 'tk' ? 'tk-TM' : 'ru-RU',
    { day: '2-digit', month: 'short', year: 'numeric' }
  )
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  '#E8A020','#3B82F6','#22C55E','#8B5CF6',
  '#EF4444','#06B6D4','#F59E0B','#EC4899',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]!
}

function starsForRating(star: number): number {
  return data.value.comments.filter(c => c.rating === star).length
}

const ratingLabels = computed(() =>
  locale.value === 'tk'
    ? ['', 'Erbet', 'Ortaça', 'Kadaly', 'Gowy', 'Ajaýyp']
    : ['', 'Плохо', 'Ниже среднего', 'Нормально', 'Хорошо', 'Отлично']
)

const reviewPlaceholder = computed(() =>
  locale.value === 'tk'
    ? 'Bu haryt hakynda pikiriňizi ýazyň...'
    : 'Напишите ваше мнение об этом товаре...'
)
</script>

<template>
  <section class="comments-section">

    <!-- Header -->
    <div class="section-header">
      <div class="header-left">
        <h2 class="section-title">
          {{ $t('productComments.customerReviews') }}
        </h2>
        <span v-if="data.total > 0" class="comment-count">{{ data.total }}</span>
      </div>

      <div v-if="data.total > 0" class="avg-rating">
        <span class="avg-number">{{ data.avgRating.toFixed(1) }}</span>
        <div class="stars-display">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= Math.round(data.avgRating) }"
          >★</span>
        </div>
        <span class="avg-label">
          {{ $t('productComments.count', { total: data.total }) }}
        </span>
      </div>
    </div>

    <!-- Rating bars -->
    <div v-if="data.total > 0" class="rating-bars">
      <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar-row">
        <span class="bar-label">{{ star }} ★</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{
              width:      (starsForRating(star) / data.total * 100) + '%',
              background: star >= 4 ? '#22C55E' : star === 3 ? '#F59E0B' : '#EF4444',
            }"
          />
        </div>
        <span class="bar-count">{{ starsForRating(star) }}</span>
      </div>
    </div>

    <!-- Review form area -->
    <div class="review-form-wrap">

      <!-- Not logged in -->
      <div v-if="!token" class="login-prompt">
        <span class="prompt-icon">💬</span>
        <div>
          <p class="prompt-title">
            {{ $t('productComments.loginToComment') }}
          </p>
          <p class="prompt-sub">
            {{ $t('productComments.shareOpinion') }}
          </p>
        </div>
        <NuxtLink to="/signin" class="login-btn">
          {{ $t('productComments.login') }}
        </NuxtLink>
      </div>
      <!-- Form -->
      <div v-else class="review-form">
        <h3 class="form-title">{{ $t('productComments.writeReview') }}</h3>

        <!-- Star picker -->
        <div class="star-picker">
          <span class="star-label">{{ $t('productComments.yourRating') }}</span>
          <div class="stars-input">
            <button
              v-for="i in 5"
              :key="i"
              :class="['star-btn', { active: i <= (hoverRating || newRating) }]"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
              @click="newRating = i"
            >★</button>
          </div>
          <span v-if="newRating" class="rating-text">
            {{ ['','😞','😕','😐','😊','🤩'][newRating] }}
            {{ ratingLabels[newRating] }}
          </span>
        </div>

        <!-- Text -->
        <textarea
          v-model="newText"
          class="review-textarea"
          :placeholder="reviewPlaceholder"
          rows="4"
          maxlength="1000"
        />

        <div class="form-footer">
          <span class="char-count" :class="{ warn: newText.length > 900 }">
            {{ newText.length }}/1000
          </span>
          <div class="form-actions">
            <span v-if="submitErr" class="submit-err">{{ submitErr }}</span>
            <button
              class="submit-btn"
              :disabled="submitting"
              @click="submitComment"
            >
              <svg
                v-if="submitting"
                class="spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              ><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              {{ submitting
                ? $t('productComments.submitting')
                : $t('productComments.submit') }}
            </button>
          </div>
        </div>

        <!-- Success -->
        <Transition name="fade">
          <div v-if="submitted" class="submit-success">
            🎉 {{ $t('productComments.success') }}
          </div>
        </Transition>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="comments-loading">
      <div v-for="i in 3" :key="i" class="skeleton-comment" />
    </div>

    <!-- Empty -->
    <div v-else-if="!data.comments.length" class="empty-comments">
      <span>💬</span>
      <p>{{ $t('productComments.none') }}</p>
    </div>

    <!-- Comments list -->
    <div v-else class="comments-list">
      <div v-for="comment in data.comments" :key="comment.id" class="comment-card">

        <div class="comment-header">
          <div class="comment-avatar" :style="{ background: avatarColor(comment.customer.name) }">
            {{ initials(comment.customer.name) }}
          </div>
          <div class="comment-meta">
            <span class="comment-author">{{ comment.customer.name }}</span>
            <div class="comment-stars">
              <span
                v-for="i in 5"
                :key="i"
                class="cstar"
                :class="{ filled: i <= comment.rating }"
              >★</span>
            </div>
          </div>
          <span class="comment-date">{{ fmtDate(comment.createdAt) }}</span>
          <button
            v-if="customerId === comment.customer.id"
            class="delete-btn"
            :title="$t('productComments.delete')"
            @click="deleteComment(comment.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>

        <p class="comment-text">{{ comment.text }}</p>

      </div>
    </div>

  </section>
</template>

<style scoped>
.comments-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 60px;
  font-family: var(--font-body);
}

/* Header */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px; margin-bottom: 20px;
  padding-top: 40px; border-top: 1px solid var(--border-light);
}
.header-left   { display: flex; align-items: center; gap: 12px; }
.section-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--dark); }
.comment-count { background: var(--surface); border: 1.5px solid var(--border-light); color: var(--subtle); font-size: 12px; font-weight: 700; padding: 2px 10px; border-radius: var(--radius-pill); }

.avg-rating   { display: flex; align-items: center; gap: 10px; }
.avg-number   { font-family: var(--font-display); font-size: 32px; font-weight: 800; color: var(--dark); line-height: 1; }
.stars-display { display: flex; gap: 2px; }
.star         { font-size: 18px; color: var(--border); transition: color .15s; }
.star.filled  { color: #F59E0B; }
.avg-label    { font-size: 13px; color: var(--subtle); }

/* Rating bars */
.rating-bars      { display: flex; flex-direction: column; gap: 6px; margin-bottom: 28px; max-width: 320px; }
.rating-bar-row   { display: flex; align-items: center; gap: 10px; }
.bar-label        { font-size: 12px; color: var(--subtle); width: 28px; text-align: right; flex-shrink: 0; }
.bar-track        { flex: 1; height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; }
.bar-fill         { height: 100%; border-radius: 3px; transition: width .4s ease; min-width: 2px; }
.bar-count        { font-size: 12px; color: var(--subtle); width: 20px; flex-shrink: 0; }

/* Review form */
.review-form-wrap { margin-bottom: 32px; }

.login-prompt {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, var(--surface), #F0F4FF);
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-xl); padding: 20px 24px; flex-wrap: wrap;
}
.prompt-icon  { font-size: 32px; flex-shrink: 0; }
.prompt-title { font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 3px; }
.prompt-sub   { font-size: 13px; color: var(--subtle); }
.login-btn    { display: inline-flex; align-items: center; height: 40px; padding: 0 20px; border-radius: var(--radius-pill); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 13px; font-weight: 700; text-decoration: none; margin-left: auto; white-space: nowrap; }

.review-form {
  background: var(--white); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-xl); padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 16px;
}
.form-title { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: var(--dark); }

/* Star picker */
.star-picker { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.star-label  { font-size: 13px; font-weight: 600; color: var(--dark); flex-shrink: 0; }
.stars-input { display: flex; gap: 4px; }
.star-btn {
  font-size: 28px; border: none; background: none;
  color: var(--border); cursor: pointer; transition: all .15s; line-height: 1; padding: 0 2px;
}
.star-btn.active { color: #F59E0B; transform: scale(1.1); }
.rating-text { font-size: 13px; font-weight: 600; color: var(--subtle); }

/* Textarea */
.review-textarea {
  width: 100%; border: 1.5px solid var(--border);
  border-radius: var(--radius-lg); padding: 14px 16px;
  font-size: 14px; font-family: var(--font-body); color: var(--dark);
  resize: vertical; outline: none; line-height: 1.6; min-height: 100px;
  transition: border-color .15s;
}
.review-textarea:focus { border-color: var(--gold); }
.review-textarea::placeholder { color: var(--subtle); }

.form-footer  { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.char-count   { font-size: 12px; color: var(--subtle); }
.char-count.warn { color: var(--error); }
.form-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.submit-err   { font-size: 12px; color: var(--error); font-weight: 600; }

.submit-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 42px; padding: 0 22px; border-radius: var(--radius-pill);
  border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark));
  color: white; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: var(--font-body);
  transition: all .15s; box-shadow: 0 4px 14px var(--gold-shadow);
}
.submit-btn:hover:not(:disabled) { transform: translateY(-1px); }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; width: 14px; height: 14px; }
@keyframes spin { to { transform: rotate(360deg); } }

.submit-success {
  background: rgba(34,197,94,.1); border: 1.5px solid rgba(34,197,94,.25);
  border-radius: var(--radius-md); padding: 10px 16px;
  font-size: 13px; font-weight: 600; color: #14532D;
}
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Loading skeleton */
.comments-loading { display: flex; flex-direction: column; gap: 14px; }
.skeleton-comment { height: 96px; background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--border-light); animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }

/* Empty state */
.empty-comments {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 48px 20px; text-align: center;
  background: var(--white); border-radius: var(--radius-xl);
  border: 1.5px dashed var(--border-light);
}
.empty-comments span { font-size: 40px; }
.empty-comments p    { font-size: 14px; color: var(--subtle); }

/* Comments list */
.comments-list { display: flex; flex-direction: column; gap: 14px; }

.comment-card {
  background: var(--white); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-xl); padding: 20px 22px;
  box-shadow: var(--shadow-sm); transition: box-shadow .15s;
}
.comment-card:hover { box-shadow: var(--shadow-md); }

.comment-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.comment-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  color: white; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.comment-meta   { flex: 1; min-width: 0; }
.comment-author { font-size: 14px; font-weight: 700; color: var(--dark); display: block; }
.comment-stars  { display: flex; gap: 2px; margin-top: 2px; }
.cstar          { font-size: 13px; color: var(--border); }
.cstar.filled   { color: #F59E0B; }
.comment-date   { font-size: 12px; color: var(--subtle); white-space: nowrap; margin-left: auto; }

.delete-btn {
  width: 28px; height: 28px; border-radius: var(--radius-md);
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  color: var(--subtle); cursor: pointer; transition: all .15s; flex-shrink: 0;
}
.delete-btn svg { width: 13px; height: 13px; }
.delete-btn:hover { border-color: var(--error); color: var(--error); background: var(--error-bg); }

.comment-text {
  font-size: 14px; color: var(--dark); line-height: 1.65; white-space: pre-wrap;
}

@media (max-width: 768px) {
  .comments-section { padding: 0 16px 40px; }
  .section-header   { flex-direction: column; align-items: flex-start; }
  .review-form      { padding: 18px; }
  .star-btn         { font-size: 24px; }
  .login-prompt     { flex-direction: column; align-items: flex-start; }
  .login-btn        { margin-left: 0; }
}
</style>