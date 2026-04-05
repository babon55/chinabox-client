<script setup lang="ts">
definePageMeta({ layout: 'default' })

const config = useRuntimeConfig()
const API   = config.public.apiBase

const lang = ref<'tk' | 'ru'>('tk')
onMounted(() => {
  const saved = localStorage.getItem('silkshop_lang')
  if (saved === 'tk' || saved === 'ru') lang.value = saved
})

const form = ref({
  nameTk:       '',
  nameRu:       '',
  description:  '',
  contactName:  '',
  contactPhone: '',
  contactEmail: '',
})

const imageFile    = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageUrl     = ref<string | null>(null)
const uploading    = ref(false)
const submitting   = ref(false)
const submitted    = ref(false)
const errors       = ref<Record<string, string>>({})

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    errors.value.image = lang.value === 'tk' ? 'Faýl 5MB-dan uly bolmaly däldir' : 'Файл не должен превышать 5МБ'
    return
  }
  imageFile.value    = file
  imagePreview.value = URL.createObjectURL(file)
  errors.value.image = ''
}

function clearImage() {
  imageFile.value    = null
  imagePreview.value = null
  imageUrl.value     = null
}

async function uploadImage(): Promise<string | null> {
  if (!imageFile.value) return null
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', imageFile.value)
    const res = await $fetch<{ url: string }>(`${API}/upload/request`, {
      method:  'POST',
      body:    fd,
    })
    return res.url
  } catch {
    return null
  } finally {
    uploading.value = false
  }
}

function validate(): boolean {
  const e: Record<string, string> = {}
  const req = lang.value === 'tk' ? 'Hökman' : 'Обязательно'
  if (!form.value.nameTk.trim())      e.nameTk      = req
  if (!form.value.nameRu.trim())      e.nameRu      = req
  if (!form.value.contactName.trim()) e.contactName = req
  if (!form.value.contactPhone.trim() && !form.value.contactEmail.trim()) {
    e.contact = lang.value === 'tk' ? 'Telefon ýa-da email giriziň' : 'Укажите телефон или email'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    let uploadedUrl: string | null = null
    if (imageFile.value) uploadedUrl = await uploadImage()

    await $fetch(`${API}/requests`, {
      method: 'POST',
      body: {
        nameTk:       form.value.nameTk,
        nameRu:       form.value.nameRu,
        description:  form.value.description || undefined,
        imageUrl:     uploadedUrl,
        contactName:  form.value.contactName,
        contactPhone: form.value.contactPhone || undefined,
        contactEmail: form.value.contactEmail || undefined,
      },
    })
    submitted.value = true
  } catch (e: any) {
    errors.value.general = e?.data?.message ?? (lang.value === 'tk' ? 'Ýalňyşlyk ýüze çykdy' : 'Произошла ошибка')
  } finally {
    submitting.value = false
  }
}

useHead({ title: computed(() => lang.value === 'tk' ? 'Haryt Talaby – SilkShop' : 'Запрос товара – SilkShop') })
</script>

<template>
  <div class="request-page">

    <!-- Breadcrumb -->
    <div class="bc-bar">
      <div class="bc-inner">
        <NuxtLink to="/">{{ lang === 'tk' ? 'Baş sahypa' : 'Главная' }}</NuxtLink>
        <span>›</span>
        <span>{{ lang === 'tk' ? 'Haryt Talaby' : 'Запрос товара' }}</span>
      </div>
    </div>

    <div class="page-inner">

      <!-- Success -->
      <div v-if="submitted" class="success-card">
        <div class="success-icon">🎉</div>
        <h2>{{ lang === 'tk' ? 'Talap ugradyldy!' : 'Запрос отправлен!' }}</h2>
        <p>{{ lang === 'tk'
          ? 'Talap üstünlikli alyndy. Biz mümkin boldugyndan çalt sizi habarlaşarys!'
          : 'Ваш запрос успешно получен. Мы свяжемся с вами как можно скорее!' }}</p>
        <div class="success-actions">
          <NuxtLink to="/products" class="btn-gold">{{ lang === 'tk' ? 'Harytlara Git' : 'К товарам' }}</NuxtLink>
          <button class="btn-outline" @click="submitted = false; form.nameTk = ''; form.nameRu = ''; imagePreview = null">
            {{ lang === 'tk' ? 'Täze Talap' : 'Новый запрос' }}
          </button>
        </div>
      </div>

      <template v-else>
        <div class="page-header">
          <div class="header-icon">🛍️</div>
          <div>
            <h1>{{ lang === 'tk' ? 'Haryt Talaby' : 'Запрос товара' }}</h1>
            <p>{{ lang === 'tk'
              ? 'Tapyp bilmedik harydyňyzy biziň üçin goşmagy haýyş ediň'
              : 'Попросите нас добавить товар, который вы не можете найти' }}</p>
          </div>
        </div>

        <div class="form-grid">

          <!-- Left: form -->
          <div class="form-card">

            <!-- Image upload -->
            <div class="field">
              <label class="field-label">
                📷 {{ lang === 'tk' ? 'Harydyň suraty (islege görä)' : 'Фото товара (необязательно)' }}
              </label>
              <div
                class="upload-zone"
                :class="{ 'has-image': imagePreview }"
                @click="($refs.fileInput as HTMLInputElement).click()"
              >
                <template v-if="imagePreview">
                  <img :src="imagePreview" class="preview-img" />
                  <button class="remove-img" @click.stop="clearImage">×</button>
                  <div class="preview-overlay">
                    <span>{{ lang === 'tk' ? 'Üýtget' : 'Изменить' }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="upload-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <div class="upload-text">{{ lang === 'tk' ? 'Surat ýükle' : 'Загрузить фото' }}</div>
                    <div class="upload-hint">JPG, PNG • Max 5MB</div>
                  </div>
                </template>
              </div>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden-input" @change="onFileChange" />
              <span v-if="errors.image" class="err">{{ errors.image }}</span>
            </div>

            <!-- Product names -->
            <div class="form-row">
              <div class="field">
                <label class="field-label">{{ lang === 'tk' ? 'Haryt ady (Türkmençe)' : 'Название (туркменский)' }} *</label>
                <input
                  v-model="form.nameTk"
                  class="field-input"
                  :class="{ error: errors.nameTk }"
                  :placeholder="lang === 'tk' ? 'mysal: Simsiz gulaklyk' : 'пример: Беспроводные наушники'"
                />
                <span v-if="errors.nameTk" class="err">{{ errors.nameTk }}</span>
              </div>
              <div class="field">
                <label class="field-label">{{ lang === 'tk' ? 'Haryt ady (Rusça)' : 'Название (русский)' }} *</label>
                <input
                  v-model="form.nameRu"
                  class="field-input"
                  :class="{ error: errors.nameRu }"
                  :placeholder="lang === 'tk' ? 'mysal: Беспроводные наушники' : 'пример: Беспроводные наушники'"
                />
                <span v-if="errors.nameRu" class="err">{{ errors.nameRu }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="field">
              <label class="field-label">{{ lang === 'tk' ? 'Beýany (islege görä)' : 'Описание (необязательно)' }}</label>
              <textarea
                v-model="form.description"
                class="field-textarea"
                rows="3"
                :placeholder="lang === 'tk' ? 'Haryt hakynda goşmaça maglumat...' : 'Дополнительная информация о товаре...'"
              />
            </div>

            <div class="divider" />

            <!-- Contact -->
            <div class="field">
              <label class="field-label">{{ lang === 'tk' ? 'Adyňyz' : 'Ваше имя' }} *</label>
              <input
                v-model="form.contactName"
                class="field-input"
                :class="{ error: errors.contactName }"
                :placeholder="lang === 'tk' ? 'Adyňyz we familiýaňyz' : 'Имя и фамилия'"
              />
              <span v-if="errors.contactName" class="err">{{ errors.contactName }}</span>
            </div>

            <div class="form-row">
              <div class="field">
                <label class="field-label">{{ lang === 'tk' ? 'Telefon' : 'Телефон' }}</label>
                <input
                  v-model="form.contactPhone"
                  class="field-input"
                  placeholder="+993 65 xxxxxx"
                />
              </div>
              <div class="field">
                <label class="field-label">Email</label>
                <input
                  v-model="form.contactEmail"
                  class="field-input"
                  placeholder="email@mysal.com"
                  type="email"
                />
              </div>
            </div>
            <span v-if="errors.contact" class="err">{{ errors.contact }}</span>

            <!-- Error -->
            <div v-if="errors.general" class="error-box">⚠ {{ errors.general }}</div>

            <!-- Submit -->
            <button class="submit-btn" :disabled="submitting || uploading" @click="handleSubmit">
              <svg v-if="submitting || uploading" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              {{ uploading
                ? (lang === 'tk' ? 'Surat ýüklenýär...' : 'Загрузка фото...')
                : submitting
                  ? (lang === 'tk' ? 'Ugradylýar...' : 'Отправка...')
                  : (lang === 'tk' ? '📨 Talap Ugrat' : '📨 Отправить запрос') }}
            </button>

          </div>

          <!-- Right: info card -->
          <div class="info-col">
            <div class="info-card">
              <h3>{{ lang === 'tk' ? 'Bu nähili işleýär?' : 'Как это работает?' }}</h3>
              <div class="steps">
                <div class="step">
                  <span class="step-num">1</span>
                  <span>{{ lang === 'tk' ? 'Harydyň adyny we suratyny goşuň' : 'Добавьте название и фото товара' }}</span>
                </div>
                <div class="step">
                  <span class="step-num">2</span>
                  <span>{{ lang === 'tk' ? 'Habarlaşmak üçin maglumat giriziň' : 'Укажите контактные данные' }}</span>
                </div>
                <div class="step">
                  <span class="step-num">3</span>
                  <span>{{ lang === 'tk' ? 'Biz siziň talabyňyzy gözden geçireris' : 'Мы рассмотрим ваш запрос' }}</span>
                </div>
                <div class="step">
                  <span class="step-num">4</span>
                  <span>{{ lang === 'tk' ? 'Haryt goşulanda size habar bereris' : 'Сообщим вам, когда товар будет добавлен' }}</span>
                </div>
              </div>
            </div>

            <div class="contact-card">
              <h3>{{ lang === 'tk' ? 'Soraglaryňyz barmy?' : 'Есть вопросы?' }}</h3>
              <p>{{ lang === 'tk' ? 'Bize ýazyň, kömek ederis!' : 'Напишите нам, мы поможем!' }}</p>
              <a href="tel:+99365000000" class="contact-link">📞 +993 65 000 000</a>
            </div>
          </div>

        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.request-page { min-height: 80vh; background: var(--surface); font-family: var(--font-body); }

.bc-bar   { background: var(--white); border-bottom: 1px solid var(--border-light); padding: 12px 0; }
.bc-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--subtle); }
.bc-inner a { color: var(--subtle); text-decoration: none; }
.bc-inner a:hover { color: var(--gold); }

.page-inner { max-width: 1100px; margin: 0 auto; padding: 36px 24px 60px; }

/* Success */
.success-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); padding: 56px 40px; text-align: center; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: center; gap: 16px; max-width: 480px; margin: 0 auto; }
.success-icon { font-size: 56px; }
.success-card h2 { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--dark); }
.success-card p  { font-size: 14px; color: var(--subtle); line-height: 1.6; }
.success-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
.btn-gold    { display: inline-flex; align-items: center; height: 44px; padding: 0 24px; border-radius: var(--radius-pill); background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 13px; font-weight: 700; text-decoration: none; }
.btn-outline { display: inline-flex; align-items: center; height: 44px; padding: 0 24px; border-radius: var(--radius-pill); border: 1.5px solid var(--border); background: none; color: var(--dark); font-size: 13px; font-weight: 700; cursor: pointer; font-family: var(--font-body); }

/* Header */
.page-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
.header-icon { width: 56px; height: 56px; border-radius: var(--radius-lg); background: rgba(232,160,32,.1); border: 1.5px solid rgba(232,160,32,.25); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
.page-header h1 { font-family: var(--font-display); font-size: 26px; font-weight: 700; color: var(--dark); margin-bottom: 4px; }
.page-header p  { font-size: 14px; color: var(--subtle); }

/* Grid */
.form-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }

/* Form card */
.form-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); padding: 28px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 18px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 13px; font-weight: 700; color: var(--dark); }
.field-input { height: 42px; border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 0 14px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; }
.field-input:focus { border-color: var(--gold); background: var(--white); }
.field-input.error { border-color: var(--error); }
.field-textarea { border-radius: var(--radius-md); border: 1.5px solid var(--border); background: var(--surface); padding: 10px 14px; font-size: 13px; font-family: var(--font-body); color: var(--dark); outline: none; resize: vertical; }
.field-textarea:focus { border-color: var(--gold); background: var(--white); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.err { font-size: 11px; color: var(--error); font-weight: 600; }
.divider { height: 1px; background: var(--border-light); }

/* Upload */
.upload-zone { width: 100%; height: 150px; border: 2px dashed var(--border); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 14px; cursor: pointer; transition: all .15s; background: var(--surface); position: relative; overflow: hidden; }
.upload-zone:hover { border-color: var(--gold); background: var(--gold-glow); }
.upload-zone.has-image { border-style: solid; border-color: var(--gold); padding: 0; }
.upload-icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--border-light); display: flex; align-items: center; justify-content: center; }
.upload-icon svg { width: 22px; height: 22px; color: var(--subtle); }
.upload-text { font-size: 14px; font-weight: 700; color: var(--dark); }
.upload-hint { font-size: 11px; color: var(--subtle); margin-top: 3px; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity .15s; }
.upload-zone:hover .preview-overlay { opacity: 1; }
.preview-overlay span { color: white; font-size: 13px; font-weight: 700; }
.remove-img { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.6); border: none; color: white; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; }
.hidden-input { display: none; }

.error-box { background: var(--error-bg); color: var(--error); border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; font-weight: 600; }

.submit-btn { height: 48px; border-radius: var(--radius-md); border: none; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 15px; font-weight: 800; cursor: pointer; font-family: var(--font-body); transition: all .15s; box-shadow: 0 4px 16px var(--gold-shadow); display: flex; align-items: center; justify-content: center; gap: 8px; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); }
.submit-btn:disabled { opacity: .65; cursor: not-allowed; }
.spin { animation: spin .8s linear infinite; width: 16px; height: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Info col */
.info-col { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 90px; }
.info-card { background: var(--dark); border-radius: var(--radius-xl); padding: 24px; }
.info-card h3 { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: white; margin-bottom: 16px; }
.steps { display: flex; flex-direction: column; gap: 12px; }
.step { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; color: rgba(255,255,255,.65); line-height: 1.4; }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(232,160,32,.2); border: 1.5px solid rgba(232,160,32,.4); color: var(--gold); font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.contact-card { background: var(--white); border-radius: var(--radius-xl); border: 1.5px solid var(--border-light); padding: 20px; box-shadow: var(--shadow-sm); }
.contact-card h3 { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--dark); margin-bottom: 6px; }
.contact-card p  { font-size: 13px; color: var(--subtle); margin-bottom: 12px; }
.contact-link { display: block; font-size: 14px; font-weight: 700; color: var(--gold); text-decoration: none; }

@media (max-width: 900px) { .form-grid { grid-template-columns: 1fr; } .info-col { position: static; } }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
</style>