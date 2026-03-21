import type { ReviewState, ReviewStatus, StudyRating } from '../types'

const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 120]
const AGAIN_DELAY_MINUTES = 10

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000)
}

function addDays(base: Date, days: number) {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
}

function getStatusForInterval(intervalDays: number): ReviewStatus {
  if (intervalDays === 0) {
    return 'learning'
  }

  if (intervalDays < 3) {
    return 'learning'
  }

  return 'review'
}

export function createInitialReviewState(entryId: string, createdAt: string): ReviewState {
  return {
    entryId,
    status: 'new',
    intervalDays: 0,
    easeBucket: 0,
    dueAt: createdAt,
    lastReviewedAt: null,
  }
}

export function isDue(dueAt: string, now = new Date()) {
  return new Date(dueAt).getTime() <= now.getTime()
}

export function sortDeckEntries<T extends { review: ReviewState; entry: { createdAt: string } }>(
  entries: T[],
) {
  return [...entries].sort((left, right) => {
    const dueDiff =
      new Date(left.review.dueAt).getTime() - new Date(right.review.dueAt).getTime()

    if (dueDiff !== 0) {
      return dueDiff
    }

    return (
      new Date(right.entry.createdAt).getTime() -
      new Date(left.entry.createdAt).getTime()
    )
  })
}

export function getNextReviewState(
  current: ReviewState,
  rating: StudyRating,
  reviewedAt = new Date(),
): ReviewState {
  const reviewedAtIso = reviewedAt.toISOString()

  if (rating === 'again') {
    return {
      ...current,
      status: 'learning',
      intervalDays: 0,
      easeBucket: Math.max(0, current.easeBucket - 1),
      dueAt: addMinutes(reviewedAt, AGAIN_DELAY_MINUTES).toISOString(),
      lastReviewedAt: reviewedAtIso,
    }
  }

  const nextBucket =
    rating === 'good'
      ? current.status === 'new'
        ? 0
        : Math.min(REVIEW_INTERVALS.length - 1, current.easeBucket + 1)
      : current.status === 'new'
        ? 2
        : Math.min(REVIEW_INTERVALS.length - 1, current.easeBucket + 2)
  const intervalDays = REVIEW_INTERVALS[nextBucket]

  return {
    ...current,
    status: getStatusForInterval(intervalDays),
    intervalDays,
    easeBucket: nextBucket,
    dueAt: addDays(reviewedAt, intervalDays).toISOString(),
    lastReviewedAt: reviewedAtIso,
  }
}
