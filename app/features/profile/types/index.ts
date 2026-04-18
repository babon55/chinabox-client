export interface CustomerProfile {
  id:       string
  name:     string
  email:    string
  phone:    string | null
  address:  string | null
  status:   'ACTIVE' | 'BLOCKED'
}

export interface UpdateProfilePayload {
  name?:     string
  email?:    string
  phone?:    string
  address?:  string
}

export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword:     string
}

export type FeedbackType = 'success' | 'error'

export interface Feedback {
  message: string
  type:    FeedbackType
}