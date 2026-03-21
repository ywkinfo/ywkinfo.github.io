import { describe, expect, it } from 'vitest'
import { createInitialReviewState, getNextReviewState } from './srs'

describe('getNextReviewState', () => {
  it('schedules a new card to one day when rated good', () => {
    const review = createInitialReviewState('entry-1', '2026-03-21T00:00:00.000Z')
    const nextReview = getNextReviewState(
      review,
      'good',
      new Date('2026-03-21T09:00:00.000Z'),
    )

    expect(nextReview.intervalDays).toBe(1)
    expect(nextReview.status).toBe('learning')
    expect(nextReview.easeBucket).toBe(0)
    expect(nextReview.dueAt).toBe('2026-03-22T09:00:00.000Z')
  })

  it('jumps ahead for easy responses', () => {
    const review = createInitialReviewState('entry-1', '2026-03-21T00:00:00.000Z')
    const nextReview = getNextReviewState(
      review,
      'easy',
      new Date('2026-03-21T09:00:00.000Z'),
    )

    expect(nextReview.intervalDays).toBe(7)
    expect(nextReview.status).toBe('review')
    expect(nextReview.easeBucket).toBe(2)
    expect(nextReview.dueAt).toBe('2026-03-28T09:00:00.000Z')
  })

  it('brings difficult cards back quickly', () => {
    const review = {
      ...createInitialReviewState('entry-1', '2026-03-21T00:00:00.000Z'),
      easeBucket: 3,
      intervalDays: 14,
      status: 'review' as const,
    }
    const nextReview = getNextReviewState(
      review,
      'again',
      new Date('2026-03-21T09:00:00.000Z'),
    )

    expect(nextReview.intervalDays).toBe(0)
    expect(nextReview.status).toBe('learning')
    expect(nextReview.easeBucket).toBe(2)
    expect(nextReview.dueAt).toBe('2026-03-21T09:10:00.000Z')
  })
})
