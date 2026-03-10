export type Lang = 'tk' | 'ru'

export interface SignInForm {
  email:       string
  password:    string
  rememberMe:  boolean
}

export interface SignInErrors {
  email?:    string
  password?: string
  general?:  string
}

export interface SignInTranslations {
  title:        string
  subtitle:     string
  email:        string
  password:     string
  rememberMe:   string
  forgotPass:   string
  submit:       string
  loading:      string
  noAccount:    string
  signUp:       string
  orContinue:   string
  emailPh:      string
  passwordPh:   string
  errEmail:     string
  errPassword:  string
  errGeneral:   string
}