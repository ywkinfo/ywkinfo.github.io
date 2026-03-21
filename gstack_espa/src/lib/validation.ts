import type { CreateEntryInput, VocabEntry } from '../types'
import { DuplicateEntryError } from './errors'

function normalizeText(value: string) {
  return value.normalize('NFKC').trim()
}

function normalizeKey(value: string) {
  return normalizeText(value).toLowerCase()
}

export function sanitizeEntryInput(input: CreateEntryInput): CreateEntryInput {
  const tags = Array.from(
    new Set(
      (input.tags ?? [])
        .map((tag) => normalizeText(tag))
        .filter(Boolean),
    ),
  )

  return {
    spanish: normalizeText(input.spanish),
    meaningKo: normalizeText(input.meaningKo),
    exampleSentence: normalizeText(input.exampleSentence ?? '') || undefined,
    notes: normalizeText(input.notes ?? '') || undefined,
    tags: tags.length ? tags : undefined,
  }
}

export function validateEntryInput(input: CreateEntryInput) {
  if (!normalizeText(input.spanish)) {
    throw new Error('스페인어 단어를 입력해 주세요.')
  }

  if (!normalizeText(input.meaningKo)) {
    throw new Error('한국어 뜻을 입력해 주세요.')
  }
}

export function assertNoDuplicateEntry(
  input: CreateEntryInput,
  entries: VocabEntry[],
  editingId?: string,
) {
  const spanishKey = normalizeKey(input.spanish)
  const meaningKey = normalizeKey(input.meaningKo)

  const hasDuplicate = entries.some((entry) => {
    if (entry.id === editingId) {
      return false
    }

    return (
      normalizeKey(entry.spanish) === spanishKey &&
      normalizeKey(entry.meaningKo) === meaningKey
    )
  })

  if (hasDuplicate) {
    throw new DuplicateEntryError()
  }
}

export function parseTags(rawValue: string) {
  return rawValue
    .split(',')
    .map((tag) => normalizeText(tag))
    .filter(Boolean)
}
