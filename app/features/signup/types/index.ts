export type Lang = 'tk' | 'ru'

export interface SignUpForm {
  firstName:       string
  lastName:        string
  email:           string
  phone:           string
  password:        string
  confirmPassword: string
  agreeTerms:      boolean
}

export interface SignUpErrors {
  firstName?:  string
  lastName?:   string
  email?:      string
  phone?:      string
  password?:   string
  confirm?:    string
  terms?:      string
}

export interface SignUpTranslations {
  title:         string
  subtitle:      string
  firstName:     string
  lastName:      string
  email:         string
  phone:         string
  password:      string
  confirmPass:   string
  agree:         string
  submit:        string
  loading:       string
  haveAccount:   string
  signIn:        string
  orContinue:    string
  firstNamePh:   string
  lastNamePh:    string
  emailPh:       string
  phonePh:       string
  passwordPh:    string
  confirmPassPh: string
  errFirstName:  string
  errLastName:   string
  errEmail:      string
  errPhone:      string
  errPassword:   string
  errConfirm:    string
  errTerms:      string
}