import type { DeckEntry, SessionSummary, StudyRating, StudyStats } from '../types'
import { isDue, sortDeckEntries } from './srs'

function isReviewedToday(iso: string | null, now = new Date()) {
  if (!iso) {
    return false
  }

  const reviewedAt = new Date(iso)

  return (
    reviewedAt.getFullYear() === now.getFullYear() &&
    reviewedAt.getMonth() === now.getMonth() &&
    reviewedAt.getDate() === now.getDate()
  )
}

export function buildStats(deck: DeckEntry[], now = new Date()): StudyStats {
  return deck.reduce<StudyStats>(
    (stats, item) => {
      stats.totalEntries += 1

      if (isDue(item.review.dueAt, now)) {
        stats.dueCount += 1
      }

      if (item.review.status === 'new') {
        stats.newCount += 1
      }

      if (item.review.status === 'learning') {
        stats.learningCount += 1
      }

      if (item.review.status === 'review') {
        stats.reviewCount += 1
      }

      if (isReviewedToday(item.review.lastReviewedAt, now)) {
        stats.reviewedToday += 1
      }

      return stats
    },
    {
      totalEntries: 0,
      dueCount: 0,
      newCount: 0,
      learningCount: 0,
      reviewCount: 0,
      reviewedToday: 0,
    },
  )
}

export function getDueDeckEntries(deck: DeckEntry[], now = new Date()) {
  return sortDeckEntries(deck.filter((item) => isDue(item.review.dueAt, now)))
}

export function summarizeSession(
  startedAt: string,
  completedAt: string,
  ratings: StudyRating[],
): SessionSummary {
  const ratingCounts: Record<StudyRating, number> = {
    again: 0,
    good: 0,
    easy: 0,
  }

  for (const rating of ratings) {
    ratingCounts[rating] += 1
  }

  return {
    startedAt,
    completedAt,
    totalReviewed: ratings.length,
    ratingCounts,
  }
}
