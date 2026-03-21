import { describe, expect, it } from 'vitest'
import type { ReviewSession, SessionSummary, StorageExportBundle, VocabEntry } from '../types'
import {
  BACKUP_SCHEMA_VERSION,
  createBackupBundle,
  parseBackupBundle,
  sanitizeImportedSession,
} from './backup'
import { createInitialReviewState } from './srs'

const entry: VocabEntry = {
  id: 'entry-1',
  spanish: 'compartir',
  meaningKo: '나누다',
  exampleSentence: 'Quiero compartir este cafe contigo.',
  createdAt: '2026-03-21T00:00:00.000Z',
}

const bundle: StorageExportBundle = {
  exportedAt: '2026-03-21T00:05:00.000Z',
  entries: [entry],
  reviews: [createInitialReviewState(entry.id, entry.createdAt)],
}

describe('backup helpers', () => {
  it('creates and parses a backup bundle with session metadata', () => {
    const session: ReviewSession = {
      startedAt: '2026-03-21T00:06:00.000Z',
      remainingIds: [entry.id],
      answers: [],
    }
    const lastSummary: SessionSummary = {
      startedAt: '2026-03-20T23:00:00.000Z',
      completedAt: '2026-03-20T23:05:00.000Z',
      totalReviewed: 3,
      ratingCounts: {
        again: 1,
        good: 1,
        easy: 1,
      },
    }

    const parsed = parseBackupBundle(createBackupBundle(bundle, session, lastSummary))

    expect(parsed.schemaVersion).toBe(BACKUP_SCHEMA_VERSION)
    expect(parsed.session).toEqual(session)
    expect(parsed.lastSummary).toEqual(lastSummary)
  })

  it('accepts legacy exports without session metadata', () => {
    const parsed = parseBackupBundle(bundle)

    expect(parsed.entries).toEqual(bundle.entries)
    expect(parsed.reviews).toEqual(bundle.reviews)
    expect(parsed.session).toBeNull()
    expect(parsed.lastSummary).toBeNull()
  })

  it('drops imported sessions that reference missing cards', () => {
    const session: ReviewSession = {
      startedAt: '2026-03-21T00:06:00.000Z',
      remainingIds: ['missing-entry'],
      answers: [],
    }

    expect(sanitizeImportedSession(session, bundle.entries)).toBeNull()
  })
})
