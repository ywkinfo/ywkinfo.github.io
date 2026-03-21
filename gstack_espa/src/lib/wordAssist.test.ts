import { describe, expect, it } from 'vitest'
import {
  mergeWordAssistSuggestion,
  needsWordAssist,
} from './wordAssist'

describe('needsWordAssist', () => {
  it('returns true when spanish exists and ai fields are missing', () => {
    expect(
      needsWordAssist({
        spanish: 'compartir',
        meaningKo: '',
        exampleSentence: '',
        tagsText: '',
      }),
    ).toBe(true)
  })

  it('returns false when all generated fields are present', () => {
    expect(
      needsWordAssist({
        spanish: 'compartir',
        meaningKo: '나누다',
        exampleSentence: 'Quiero compartir este cafe contigo.',
        tagsText: '동사, 기초회화',
      }),
    ).toBe(false)
  })
})

describe('mergeWordAssistSuggestion', () => {
  it('fills only the missing fields', () => {
    expect(
      mergeWordAssistSuggestion(
        {
          spanish: 'compartir',
          meaningKo: '',
          exampleSentence: '이미 작성한 예문',
          tagsText: '',
        },
        {
          meaningKo: '나누다, 공유하다',
          exampleSentence: 'Quiero compartir este cafe contigo.',
          tags: ['동사', '기초회화', '기초회화'],
        },
      ),
    ).toEqual({
      spanish: 'compartir',
      meaningKo: '나누다, 공유하다',
      exampleSentence: '이미 작성한 예문',
      tagsText: '동사, 기초회화',
    })
  })
})
