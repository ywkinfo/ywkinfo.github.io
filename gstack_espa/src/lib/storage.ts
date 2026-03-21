import { deleteDB, openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type {
  CreateEntryInput,
  DeckEntry,
  ExportBundle,
  ReviewState,
  StudyRating,
  StudyRepository,
  StudyStats,
  VocabEntry,
} from '../types'
import { buildStats, getDueDeckEntries } from './stats'
import { createInitialReviewState, getNextReviewState, sortDeckEntries } from './srs'
import { assertNoDuplicateEntry, sanitizeEntryInput, validateEntryInput } from './validation'

const STUDY_DB_NAME = 'gstack-espa-db'
const STUDY_DB_VERSION = 1

interface StudyDbSchema extends DBSchema {
  entries: {
    key: string
    value: VocabEntry
    indexes: {
      createdAt: string
    }
  }
  reviews: {
    key: string
    value: ReviewState
    indexes: {
      dueAt: string
      status: string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<StudyDbSchema>> | undefined

function getDb() {
  if (!('indexedDB' in globalThis)) {
    throw new Error('현재 브라우저는 로컬 저장소를 지원하지 않습니다.')
  }

  if (!dbPromise) {
    dbPromise = openDB<StudyDbSchema>(STUDY_DB_NAME, STUDY_DB_VERSION, {
      upgrade(database) {
        const entriesStore = database.createObjectStore('entries', {
          keyPath: 'id',
        })
        entriesStore.createIndex('createdAt', 'createdAt')

        const reviewsStore = database.createObjectStore('reviews', {
          keyPath: 'entryId',
        })
        reviewsStore.createIndex('dueAt', 'dueAt')
        reviewsStore.createIndex('status', 'status')
      },
    })
  }

  return dbPromise
}

function joinDeck(entries: VocabEntry[], reviews: ReviewState[]) {
  const reviewById = new Map(reviews.map((review) => [review.entryId, review]))
  const joined: DeckEntry[] = []

  for (const entry of entries) {
    const review = reviewById.get(entry.id)

    if (review) {
      joined.push({ entry, review })
    }
  }

  return sortDeckEntries(joined)
}

export class IndexedDbStudyRepository implements StudyRepository {
  async createEntry(input: CreateEntryInput) {
    const db = await getDb()
    const cleanInput = sanitizeEntryInput(input)

    validateEntryInput(cleanInput)

    const existingEntries = await db.getAll('entries')
    assertNoDuplicateEntry(cleanInput, existingEntries)

    const createdAt = new Date().toISOString()
    const entry: VocabEntry = {
      id: crypto.randomUUID(),
      createdAt,
      ...cleanInput,
    }
    const review = createInitialReviewState(entry.id, createdAt)
    const transaction = db.transaction(['entries', 'reviews'], 'readwrite')

    await Promise.all([
      transaction.objectStore('entries').put(entry),
      transaction.objectStore('reviews').put(review),
      transaction.done,
    ])

    return entry
  }

  async updateEntry(entry: VocabEntry) {
    const db = await getDb()
    const cleanInput = sanitizeEntryInput(entry)

    validateEntryInput(cleanInput)

    const existingEntries = await db.getAll('entries')
    assertNoDuplicateEntry(cleanInput, existingEntries, entry.id)

    const nextEntry: VocabEntry = {
      id: entry.id,
      createdAt: entry.createdAt,
      ...cleanInput,
    }

    await db.put('entries', nextEntry)

    return nextEntry
  }

  async listEntries() {
    const db = await getDb()
    const [entries, reviews] = await Promise.all([db.getAll('entries'), db.getAll('reviews')])

    return joinDeck(entries, reviews)
  }

  async getDueEntries(at = new Date().toISOString()) {
    const deck = await this.listEntries()

    return getDueDeckEntries(deck, new Date(at))
  }

  async recordReview(entryId: string, rating: StudyRating, reviewedAt = new Date().toISOString()) {
    const db = await getDb()
    const current = await db.get('reviews', entryId)

    if (!current) {
      throw new Error('복습 상태를 찾을 수 없습니다.')
    }

    const nextReview = getNextReviewState(current, rating, new Date(reviewedAt))
    await db.put('reviews', nextReview)

    return nextReview
  }

  async getStats(at = new Date().toISOString()) {
    const deck = await this.listEntries()

    return buildStats(deck, new Date(at))
  }

  async exportData(): Promise<ExportBundle> {
    const db = await getDb()
    const [entries, reviews] = await Promise.all([db.getAll('entries'), db.getAll('reviews')])

    return {
      exportedAt: new Date().toISOString(),
      entries,
      reviews,
    }
  }
}

export const studyRepository = new IndexedDbStudyRepository()

export async function resetStudyDatabase() {
  if (dbPromise) {
    const db = await dbPromise
    db.close()
    dbPromise = undefined
  }

  await deleteDB(STUDY_DB_NAME)
}

export async function getStoredStats(): Promise<StudyStats> {
  return studyRepository.getStats()
}
