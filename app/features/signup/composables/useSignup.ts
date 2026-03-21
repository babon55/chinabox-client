import type { Lang, SignUpForm, SignUpErrors, SignUpTranslations } from '../types'

const API = 'http://localhost:3001/api/v1'

// ── Translations ──────────────────────────────────────────────────────────────
const translations: Record<Lang, SignUpTranslations> = {
  tk: {
    title:         'Hasap Açmak',
    subtitle:      'Maglumatlaryňyzy dolduryň',
    firstName:     'Ady',
    lastName:      'Familiýasy',
    email:         'E-poçta',
    phone:         'Telefon belgisi',
    password:      'Açar söz',
    confirmPass:   'Açar sözi tassykla',
    agree:         'Şertler we Gizlinlik Syýasaty bilen ylalaşýaryn',
    submit:        'Hasap Açmak',
    loading:       'Döredilýär...',
    haveAccount:   'Eýýäm hasabyňyz barmy?',
    signIn:        'Giriş ediň',
    orContinue:    'ýa-da dowam et',
    firstNamePh:   'Adyňyzy giriziň',
    lastNamePh:    'Familiýaňyzy giriziň',
    emailPh:       'email@mysal.com',
    phonePh:       '+993 XX XXX XXX',
    passwordPh:    'Iň az 8 nyşan',
    confirmPassPh: 'Açar sözi gaýtadan giriziň',
    errFirstName:  'Adyňyzy giriziň',
    errLastName:   'Familiýaňyzy giriziň',
    errEmail:      'Dogry e-poçta giriziň',
    errPhone:      'Telefon belgiňizi giriziň',
    errPassword:   'Iň az 8 nyşan bolmaly',
    errConfirm:    'Açar sözler deň däl',
    errTerms:      'Şertleri kabul etmelisiniz',
  },
  ru: {
    title:         'Регистрация',
    subtitle:      'Заполните данные для создания аккаунта',
    firstName:     'Имя',
    lastName:      'Фамилия',
    email:         'Электронная почта',
    phone:         'Номер телефона',
    password:      'Пароль',
    confirmPass:   'Подтвердите пароль',
    agree:         'Я согласен с Условиями и Политикой конфиденциальности',
    submit:        'Создать аккаунт',
    loading:       'Создание...',
    haveAccount:   'Уже есть аккаунт?',
    signIn:        'Войти',
    orContinue:    'или продолжить',
    firstNamePh:   'Введите имя',
    lastNamePh:    'Введите фамилию',
    emailPh:       'email@example.com',
    phonePh:       '+7 XXX XXX XX XX',
    passwordPh:    'Минимум 8 символов',
    confirmPassPh: 'Повторите пароль',
    errFirstName:  'Введите имя',
    errLastName:   'Введите фамилию',
    errEmail:      'Введите корректный email',
    errPhone:      'Введите номер телефона',
    errPassword:   'Минимум 8 символов',
    errConfirm:    'Пароли не совпадают',
    errTerms:      'Примите условия использования',
  },
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useSignUp(lang: Ref<Lang>) {
  const form = reactive<SignUpForm>({
    firstName:       '',
    lastName:        '',
    email:           '',
    phone:           '',
    password:        '',
    confirmPassword: '',
    agreeTerms:      false,
  })

  const errors    = reactive<SignUpErrors>({})
  const isLoading = ref(false)
  const submitted = ref(false)
  const t         = computed<SignUpTranslations>(() => translations[lang.value])

  // ── Password strength ──────────────────────────────────────────────────────
  const strength = computed<number>(() => {
    const p = form.password
    if (!p) return 0
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  })

  const strengthColors   = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E']
  const strengthLabelsTk = ['', 'Gowşak', 'Orta', 'Güýçli', 'Örän güýçli']
  const strengthLabelsRu = ['', 'Слабый', 'Средний', 'Сильный', 'Очень сильный']

  const strengthColor = computed(() => strengthColors[strength.value] ?? '')
  const strengthLabel = computed(() =>
    lang.value === 'tk'
      ? strengthLabelsTk[strength.value] ?? ''
      : strengthLabelsRu[strength.value] ?? ''
  )

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(): boolean {
    Object.keys(errors).forEach(k => delete (errors as Record<string, string>)[k])
    let valid = true

    if (!form.firstName.trim())  { errors.firstName = t.value.errFirstName; valid = false }
    if (!form.lastName.trim())   { errors.lastName  = t.value.errLastName;  valid = false }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = t.value.errEmail; valid = false
    }
    if (!form.phone.trim())      { errors.phone    = t.value.errPhone;    valid = false }
    if (form.password.length < 8){ errors.password = t.value.errPassword; valid = false }
    if (form.password !== form.confirmPassword) {
      errors.confirm = t.value.errConfirm; valid = false
    }
    if (!form.agreeTerms)        { errors.terms = t.value.errTerms; valid = false }

    return valid
  }

  // ── Submit → real API ──────────────────────────────────────────────────────
  async function handleSubmit(onSuccess: () => void) {
    submitted.value = true
    if (!validate()) return

    isLoading.value = true
    try {
      const data = await $fetch<{
        accessToken:  string
        refreshToken: string
        customer:     { id: string; name: string; email: string; phone: string }
      }>(`${API}/customer/register`, {
        method: 'POST',
        body: {
          name:     `${form.firstName} ${form.lastName}`.trim(),
          email:    form.email,
          phone:    form.phone,
          address:  '',
          password: form.password,
        },
      })

      // Persist tokens so the rest of the app can use them
      if (import.meta.client) {
        localStorage.setItem('customer_access_token',  data.accessToken)
        localStorage.setItem('customer_refresh_token', data.refreshToken)
        localStorage.setItem('customer_user', JSON.stringify(data.customer))
      }

      onSuccess()
    } catch (err: any) {
      // Show the server error message if available
      const msg = err?.data?.message ?? err?.message ?? 'Registration failed'
      errors.email = msg   // display under email field (most common conflict)
    } finally {
      isLoading.value = false
    }
  }

  return {
    form,
    errors,
    isLoading,
    submitted,
    t,
    strength,
    strengthColor,
    strengthLabel,
    validate,
    handleSubmit,
  }
}