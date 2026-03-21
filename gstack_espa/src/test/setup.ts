import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { resetStudyDatabase } from '../lib/storage'

beforeEach(async () => {
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
  await resetStudyDatabase()
})

afterEach(() => {
  cleanup()
})
