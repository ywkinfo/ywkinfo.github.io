import { describe, expect, it } from 'vitest'
import { createInitialReviewState } from './srs'
import { studyRepository } from './storage'

describe('IndexedDbStudyRepository', () => {
  it('deletes an entry and its review together', async () => {
    const entry = await studyRepository.createEntry({
      spanish: 'hola',
      meaningKo: '안녕',
    })

    await studyRepository.deleteEntry(entry.id)

    const deck = await studyRepository.listEntries()
    const exported = await studyRepository.exportData()

    expect(deck).toEqual([])
    expect(exported.entries).toEqual([])
    expect(exported.reviews).toEqual([])
  })

  it('replaces current study data when importing a backup', async () => {
    await studyRepository.createEntry({
      spanish: 'hola',
      meaningKo: '안녕',
    })

    const entry = {
      id: 'entry-imported',
      spanish: 'compartir',
      meaningKo: '나누다',
      exampleSentence: 'Quiero compartir este cafe contigo.',
      createdAt: '2026-03-21T00:00:00.000Z',
    }

    await studyRepository.importData({
      exportedAt: '2026-03-21T00:05:00.000Z',
      entries: [entry],
      reviews: [createInitialReviewState(entry.id, entry.createdAt)],
    })

    const deck = await studyRepository.listEntries()

    expect(deck).toHaveLength(1)
    expect(deck[0]?.entry.spanish).toBe('compartir')
    expect(deck[0]?.entry.meaningKo).toBe('나누다')
  })

  it('recreates missing review data during import', async () => {
    const entry = {
      id: 'entry-no-review',
      spanish: 'viajar',
      meaningKo: '여행하다',
      createdAt: '2026-03-21T00:00:00.000Z',
    }

    await studyRepository.importData({
      exportedAt: '2026-03-21T00:10:00.000Z',
      entries: [entry],
      reviews: [],
    })

    const deck = await studyRepository.listEntries()

    expect(deck).toHaveLength(1)
    expect(deck[0]?.review.entryId).toBe(entry.id)
    expect(deck[0]?.review.status).toBe('new')
  })
})
