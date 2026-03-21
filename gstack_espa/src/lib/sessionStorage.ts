import type { ReviewSession, SessionSummary } from '../types'

const SESSION_STORAGE_KEY = 'gstack-espa:review-session'
const SUMMARY_STORAGE_KEY = 'gstack-espa:last-summary'

function readJson<T>(key: string) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(key)

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function loadStoredSession() {
  return readJson<ReviewSession>(SESSION_STORAGE_KEY)
}

export function saveStoredSession(session: ReviewSession) {
  writeJson(SESSION_STORAGE_KEY, session)
}

export function clearStoredSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function loadStoredSummary() {
  return readJson<SessionSummary>(SUMMARY_STORAGE_KEY)
}

export function saveStoredSummary(summary: SessionSummary) {
  writeJson(SUMMARY_STORAGE_KEY, summary)
}

export function clearStoredSummary() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SUMMARY_STORAGE_KEY)
}
