/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import type {
  AnswerResult,
  BackupBundle,
  CreateEntryInput,
  DeckEntry,
  ReviewSession,
  SaveEntryResult,
  SessionSummary,
  StudyRepository,
  StudyRating,
  VocabEntry,
} from '../types'
import { toUserMessage } from '../lib/errors'
import {
  clearStoredSummary,
  clearStoredSession,
  loadStoredSession,
  loadStoredSummary,
  saveStoredSession,
  saveStoredSummary,
} from '../lib/sessionStorage'
import { createBackupBundle, sanitizeImportedSession } from '../lib/backup'
import { buildStats, getDueDeckEntries, summarizeSession } from '../lib/stats'
import { studyRepository } from '../lib/storage'

interface StudyContextValue {
  deck: DeckEntry[]
  dueEntries: DeckEntry[]
  isLoading: boolean
  error: string | null
  session: ReviewSession | null
  lastSummary: SessionSummary | null
  stats: ReturnType<typeof buildStats>
  saveEntry: (input: CreateEntryInput, editingId?: string) => Promise<SaveEntryResult>
  deleteEntry: (entryId: string) => Promise<SaveEntryResult>
  startSession: () => ReviewSession | null
  answerCurrentCard: (rating: StudyRating) => Promise<AnswerResult>
  exportData: () => Promise<BackupBundle>
  importData: (bundle: BackupBundle) => Promise<SaveEntryResult>
  clearSession: () => void
}

const StudyContext = createContext<StudyContextValue | null>(null)

interface StudyProviderProps extends PropsWithChildren {
  repository?: StudyRepository
}

export function StudyProvider({
  children,
  repository = studyRepository,
}: StudyProviderProps) {
  const [deck, setDeck] = useState<DeckEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<ReviewSession | null>(() => loadStoredSession())
  const [lastSummary, setLastSummary] = useState<SessionSummary | null>(() => loadStoredSummary())

  const hydrate = useCallback(async () => {
    try {
      const nextDeck = await repository.listEntries()

      startTransition(() => {
        setDeck(nextDeck)
        setError(null)
        setIsLoading(false)
      })
    } catch (nextError) {
      startTransition(() => {
        setError(toUserMessage(nextError))
        setIsLoading(false)
      })
    }
  }, [repository])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (session) {
      saveStoredSession(session)
      return
    }

    clearStoredSession()
  }, [session])

  useEffect(() => {
    if (lastSummary) {
      saveStoredSummary(lastSummary)
      return
    }

    clearStoredSummary()
  }, [lastSummary])

  async function saveEntry(
    input: CreateEntryInput,
    editingId?: string,
  ): Promise<SaveEntryResult> {
    try {
      if (editingId) {
        const existingItem = deck.find((item) => item.entry.id === editingId)

        if (!existingItem) {
          return {
            ok: false,
            message: '수정할 단어를 찾을 수 없습니다.',
          }
        }

        const nextEntry: VocabEntry = {
          ...existingItem.entry,
          ...input,
        }

        await repository.updateEntry(nextEntry)
      } else {
        await repository.createEntry(input)
      }

      await hydrate()

      return {
        ok: true,
      }
    } catch (nextError) {
      return {
        ok: false,
        message: toUserMessage(nextError),
      }
    }
  }

  async function deleteEntry(entryId: string): Promise<SaveEntryResult> {
    try {
      await repository.deleteEntry(entryId)
      const isSessionAffected = Boolean(
        session &&
          (session.remainingIds.includes(entryId) ||
            session.answers.some((answer) => answer.entryId === entryId)),
      )

      if (isSessionAffected) {
        setSession(null)
      }

      await hydrate()

      return {
        ok: true,
        message: isSessionAffected
          ? '카드를 삭제했고, 진행 중 세션은 안전하게 비웠습니다.'
          : '카드를 삭제했습니다.',
      }
    } catch (nextError) {
      return {
        ok: false,
        message: toUserMessage(nextError),
      }
    }
  }

  function startSession() {
    if (session) {
      return session
    }

    const dueEntries = getDueDeckEntries(deck)

    if (!dueEntries.length) {
      return null
    }

    const nextSession: ReviewSession = {
      startedAt: new Date().toISOString(),
      remainingIds: dueEntries.map((item) => item.entry.id),
      answers: [],
    }

    setSession(nextSession)

    return nextSession
  }

  async function answerCurrentCard(rating: StudyRating): Promise<AnswerResult> {
    if (!session || !session.remainingIds.length) {
      return {
        completed: false,
      }
    }

    const currentEntryId = session.remainingIds[0]
    const reviewedAt = new Date().toISOString()

    await repository.recordReview(currentEntryId, rating, reviewedAt)

    const nextAnswers = [
      ...session.answers,
      {
        entryId: currentEntryId,
        rating,
        reviewedAt,
      },
    ]
    const remainingIds = session.remainingIds.slice(1)

    if (remainingIds.length) {
      setSession({
        ...session,
        remainingIds,
        answers: nextAnswers,
      })
      await hydrate()

      return {
        completed: false,
      }
    }

    const summary = summarizeSession(
      session.startedAt,
      reviewedAt,
      nextAnswers.map((answer) => answer.rating),
    )

    setLastSummary(summary)
    setSession(null)
    await hydrate()

    return {
      completed: true,
      summary,
    }
  }

  function clearSession() {
    setSession(null)
  }

  async function exportData() {
    const bundle = await repository.exportData()

    return createBackupBundle(bundle, session, lastSummary)
  }

  async function importData(bundle: BackupBundle): Promise<SaveEntryResult> {
    try {
      await repository.importData(bundle)
      const restoredSession = sanitizeImportedSession(bundle.session, bundle.entries)

      startTransition(() => {
        setSession(restoredSession)
        setLastSummary(bundle.lastSummary)
      })

      await hydrate()

      return {
        ok: true,
        message: restoredSession
          ? '백업을 불러왔습니다. 진행 중 세션과 마지막 요약도 함께 복원했습니다.'
          : '백업을 불러왔습니다.',
      }
    } catch (nextError) {
      return {
        ok: false,
        message: toUserMessage(nextError),
      }
    }
  }

  const dueEntries = getDueDeckEntries(deck)

  const value: StudyContextValue = {
    deck,
    dueEntries,
    isLoading,
    error,
    session,
    lastSummary,
    stats: buildStats(deck),
    saveEntry,
    deleteEntry,
    startSession,
    answerCurrentCard,
    exportData,
    importData,
    clearSession,
  }

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const context = useContext(StudyContext)

  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider')
  }

  return context
}
