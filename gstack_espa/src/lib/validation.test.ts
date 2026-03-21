import { describe, expect, it } from 'vitest'
import { DuplicateEntryError } from './errors'
import { assertNoDuplicateEntry, sanitizeEntryInput } from './validation'

describe('sanitizeEntryInput', () => {
  it('trims fields and removes duplicate tags', () => {
    const nextValue = sanitizeEntryInput({
      spanish: '  compartir  ',
      meaningKo: '  나누다  ',
      notes: '  ',
      tags: [' travel ', 'travel', ' verb '],
    })

    expect(nextValue).toEqual({
      spanish: 'compartir',
      meaningKo: '나누다',
      notes: undefined,
      exampleSentence: undefined,
      tags: ['travel', 'verb'],
    })
  })
})

describe('assertNoDuplicateEntry', () => {
  it('throws on duplicate spanish and meaning pairs', () => {
    expect(() =>
      assertNoDuplicateEntry(
        {
          spanish: 'Hola',
          meaningKo: '안녕',
        },
        [
          {
            id: '1',
            spanish: 'hola',
            meaningKo: '안녕',
            createdAt: '2026-03-21T00:00:00.000Z',
          },
        ],
      ),
    ).toThrow(DuplicateEntryError)
  })
})
