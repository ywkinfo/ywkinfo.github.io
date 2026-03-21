export type ReviewStatus = 'new' | 'learning' | 'review'

export type StudyRating = 'again' | 'good' | 'easy'

export interface VocabEntry {
  id: string
  spanish: string
  meaningKo: string
  exampleSentence?: string
  notes?: string
  tags?: string[]
  createdAt: string
}

export interface ReviewState {
  entryId: string
  status: ReviewStatus
  intervalDays: number
  easeBucket: number
  dueAt: string
  lastReviewedAt: string | null
}

export interface DeckEntry {
  entry: VocabEntry
  review: ReviewState
}

export interface StudyStats {
  totalEntries: number
  dueCount: number
  newCount: number
  learningCount: number
  reviewCount: number
  reviewedToday: number
}

export interface CreateEntryInput {
  spanish: string
  meaningKo: string
  exampleSentence?: string
  notes?: string
  tags?: string[]
}

export interface ReviewSessionAnswer {
  entryId: string
  rating: StudyRating
  reviewedAt: string
}

export interface ReviewSession {
  startedAt: string
  remainingIds: string[]
  answers: ReviewSessionAnswer[]
}

export interface SessionSummary {
  startedAt: string
  completedAt: string
  totalReviewed: number
  ratingCounts: Record<StudyRating, number>
}

export interface StorageExportBundle {
  exportedAt: string
  entries: VocabEntry[]
  reviews: ReviewState[]
}

export interface BackupBundle extends StorageExportBundle {
  schemaVersion: number
  session: ReviewSession | null
  lastSummary: SessionSummary | null
}

export interface SaveEntryResult {
  ok: boolean
  message?: string
}

export interface AnswerResult {
  completed: boolean
  summary?: SessionSummary
}

export interface StudyRepository {
  createEntry(input: CreateEntryInput): Promise<VocabEntry>
  updateEntry(entry: VocabEntry): Promise<VocabEntry>
  deleteEntry(id: string): Promise<void>
  listEntries(): Promise<DeckEntry[]>
  getDueEntries(at?: string): Promise<DeckEntry[]>
  recordReview(entryId: string, rating: StudyRating, reviewedAt?: string): Promise<ReviewState>
  getStats(at?: string): Promise<StudyStats>
  exportData(): Promise<StorageExportBundle>
  importData(bundle: StorageExportBundle): Promise<void>
}
