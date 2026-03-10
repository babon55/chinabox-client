import type { Lang, SignInForm, SignInErrors, SignInTranslations } from '../types'

const translations: Record<Lang, SignInTranslations> = {
  tk: {
    title:       'Ulgama Giriş',
    subtitle:    'Hasabyňyza giriş ediň',
    email:       'E-poçta',
    password:    'Açar söz',
    rememberMe:  'Meni ýatda sakla',
    forgotPass:  'Açar sözi unuttuňyzmy?',
    submit:      'Giriş',
    loading:     'Barlanýar...',
    noAccount:   'Hasabyňyz ýokmy?',
    signUp:      'Hasap açyň',
    orContinue:  'ýa-da dowam et',
    emailPh:     'email@mysal.com',
    passwordPh:  'Açar söziňizi giriziň',
    errEmail:    'Dogry e-poçta giriziň',
    errPassword: 'Açar sözi giriziň',
    errGeneral:  'E-poçta ýa-da açar söz ýalňyş',
  },
  ru: {
    title:       'Вход в аккаунт',
    subtitle:    'Войдите в свой аккаунт',
    email:       'Электронная почта',
    password:    'Пароль',
    rememberMe:  'Запомнить меня',
    forgotPass:  'Забыли пароль?',
    submit:      'Войти',
    loading:     'Проверка...',
    noAccount:   'Нет аккаунта?',
    signUp:      'Зарегистрироваться',
    orContinue:  'или продолжить',
    emailPh:     'email@example.com',
    passwordPh:  'Введите пароль',
    errEmail:    'Введите корректный email',
    errPassword: 'Введите пароль',
    errGeneral:  'Неверный email или пароль',
  },
}

export function useSignIn(lang: Ref<Lang>) {
  const form = reactive<SignInForm>({
    email:      '',
    password:   '',
    rememberMe: false,
  })

  const errors    = reactive<SignInErrors>({})
  const isLoading = ref(false)

  const t = computed<SignInTranslations>(() => translations[lang.value])

  function validate(): boolean {
    Object.keys(errors).forEach(k => delete (errors as Record<string, string>)[k])
    let valid = true

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = t.value.errEmail; valid = false
    }
    if (!form.password.trim()) {
      errors.password = t.value.errPassword; valid = false
    }

    return valid
  }

  async function handleSubmit(onSuccess: () => void) {
    if (!validate()) return

    isLoading.value = true
    try {
      // TODO: replace with your real API call
      // await $fetch('/api/auth/login', { method: 'POST', body: form })
      await new Promise(r => setTimeout(r, 1400))
      onSuccess()
    } catch (err: unknown) {
      errors.general = t.value.errGeneral
    } finally {
      isLoading.value = false
    }
  }

  return { form, errors, isLoading, t, validate, handleSubmit }
}