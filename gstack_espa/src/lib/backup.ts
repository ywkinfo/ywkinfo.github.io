import type {
  BackupBundle,
  ReviewSession,
  ReviewSessionAnswer,
  ReviewState,
  SessionSummary,
  StorageExportBundle,
  StudyRating,
  VocabEntry,
} from '../types'

export const BACKUP_SCHEMA_VERSION = 1

const REVIEW_STATUSES = new Set(['new', 'learning', 'review'])
const STUDY_RATINGS = new Set(['again', 'good', 'easy'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, fieldName: string) {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} 형식을 읽지 못했습니다.`)
  }

  return value
}

function readOptionalString(value: unknown, fieldName: string) {
  if (value === undefined || value === null) {
    return undefined
  }

  return readString(value, fieldName)
}

function readStringArray(value: unknown, fieldName: string) {
  if (value === undefined || value === null) {
    return undefined
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${fieldName} 형식을 읽지 못했습니다.`)
  }

  return value
}

function readNumber(value: unknown, fieldName: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${fieldName} 형식을 읽지 못했습니다.`)
  }

  return value
}

function readNullableString(value: unknown, fieldName: string) {
  if (value === null) {
    return null
  }

  return readString(value, fieldName)
}

function readRating(value: unknown, fieldName: string): StudyRating {
  if (typeof value !== 'string' || !STUDY_RATINGS.has(value)) {
    throw new Error(`${fieldName} 형식을 읽지 못했습니다.`)
  }

  return value as StudyRating
}

function readVocabEntry(value: unknown, index: number): VocabEntry {
  if (!isRecord(value)) {
    throw new Error(`entries[${index}] 형식을 읽지 못했습니다.`)
  }

  return {
    id: readString(value.id, `entries[${index}].id`),
    spanish: readString(value.spanish, `entries[${index}].spanish`),
    meaningKo: readString(value.meaningKo, `entries[${index}].meaningKo`),
    exampleSentence: readOptionalString(
      value.exampleSentence,
      `entries[${index}].exampleSentence`,
    ),
    notes: readOptionalString(value.notes, `entries[${index}].notes`),
    tags: readStringArray(value.tags, `entries[${index}].tags`),
    createdAt: readString(value.createdAt, `entries[${index}].createdAt`),
  }
}

function readReviewState(value: unknown, index: number): ReviewState {
  if (!isRecord(value)) {
    throw new Error(`reviews[${index}] 형식을 읽지 못했습니다.`)
  }

  const status = readString(value.status, `reviews[${index}].status`)

  if (!REVIEW_STATUSES.has(status)) {
    throw new Error(`reviews[${index}].status 형식을 읽지 못했습니다.`)
  }

  return {
    entryId: readString(value.entryId, `reviews[${index}].entryId`),
    status: status as ReviewState['status'],
    intervalDays: readNumber(value.intervalDays, `reviews[${index}].intervalDays`),
    easeBucket: readNumber(value.easeBucket, `reviews[${index}].easeBucket`),
    dueAt: readString(value.dueAt, `reviews[${index}].dueAt`),
    lastReviewedAt: readNullableString(
      value.lastReviewedAt,
      `reviews[${index}].lastReviewedAt`,
    ),
  }
}

function readReviewSessionAnswer(value: unknown, index: number): ReviewSessionAnswer {
  if (!isRecord(value)) {
    throw new Error(`session.answers[${index}] 형식을 읽지 못했습니다.`)
  }

  return {
    entryId: readString(value.entryId, `session.answers[${index}].entryId`),
    rating: readRating(value.rating, `session.answers[${index}].rating`),
    reviewedAt: readString(value.reviewedAt, `session.answers[${index}].reviewedAt`),
  }
}

function readSession(value: unknown): ReviewSession | null {
  if (value === undefined || value === null) {
    return null
  }

  if (!isRecord(value)) {
    throw new Error('session 형식을 읽지 못했습니다.')
  }

  if (
    !Array.isArray(value.remainingIds) ||
    value.remainingIds.some((item) => typeof item !== 'string')
  ) {
    throw new Error('session.remainingIds 형식을 읽지 못했습니다.')
  }

  if (!Array.isArray(value.answers)) {
    throw new Error('session.answers 형식을 읽지 못했습니다.')
  }

  return {
    startedAt: readString(value.startedAt, 'session.startedAt'),
    remainingIds: value.remainingIds,
    answers: value.answers.map((answer, index) => readReviewSessionAnswer(answer, index)),
  }
}

function readSummary(value: unknown): SessionSummary | null {
  if (value === undefined || value === null) {
    return null
  }

  if (!isRecord(value)) {
    throw new Error('lastSummary 형식을 읽지 못했습니다.')
  }

  if (!isRecord(value.ratingCounts)) {
    throw new Error('lastSummary.ratingCounts 형식을 읽지 못했습니다.')
  }

  return {
    startedAt: readString(value.startedAt, 'lastSummary.startedAt'),
    completedAt: readString(value.completedAt, 'lastSummary.completedAt'),
    totalReviewed: readNumber(value.totalReviewed, 'lastSummary.totalReviewed'),
    ratingCounts: {
      again: readNumber(value.ratingCounts.again, 'lastSummary.ratingCounts.again'),
      good: readNumber(value.ratingCounts.good, 'lastSummary.ratingCounts.good'),
      easy: readNumber(value.ratingCounts.easy, 'lastSummary.ratingCounts.easy'),
    },
  }
}

function readExportedEntries(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('entries 형식을 읽지 못했습니다.')
  }

  return value.map((entry, index) => readVocabEntry(entry, index))
}

function readExportedReviews(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('reviews 형식을 읽지 못했습니다.')
  }

  return value.map((review, index) => readReviewState(review, index))
}

export function createBackupBundle(
  bundle: StorageExportBundle,
  session: ReviewSession | null,
  lastSummary: SessionSummary | null,
): BackupBundle {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    ...bundle,
    session,
    lastSummary,
  }
}

export function parseBackupBundle(payload: unknown): BackupBundle {
  if (!isRecord(payload)) {
    throw new Error('백업 파일 형식을 읽지 못했습니다.')
  }

  return {
    schemaVersion:
      typeof payload.schemaVersion === 'number'
        ? payload.schemaVersion
        : BACKUP_SCHEMA_VERSION,
    exportedAt: readString(payload.exportedAt, 'exportedAt'),
    entries: readExportedEntries(payload.entries),
    reviews: readExportedReviews(payload.reviews),
    session: readSession(payload.session),
    lastSummary: readSummary(payload.lastSummary),
  }
}

export function sanitizeImportedSession(
  session: ReviewSession | null,
  entries: VocabEntry[],
): ReviewSession | null {
  if (!session) {
    return null
  }

  const entryIds = new Set(entries.map((entry) => entry.id))
  const hasUnknownRemainingId = session.remainingIds.some((entryId) => !entryIds.has(entryId))
  const hasUnknownAnsweredId = session.answers.some((answer) => !entryIds.has(answer.entryId))

  if (hasUnknownRemainingId || hasUnknownAnsweredId) {
    return null
  }

  return session
}
