export interface WordAssistFormShape {
  spanish: string
  meaningKo: string
  exampleSentence: string
  tagsText: string
}

export interface WordAssistSuggestion {
  meaningKo: string
  exampleSentence: string
  tags: string[]
}

function normalizeTagList(tags: string[]) {
  return Array.from(
    new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
  )
}

function isWordAssistSuggestion(payload: unknown): payload is WordAssistSuggestion {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as Partial<WordAssistSuggestion>

  return (
    typeof candidate.meaningKo === 'string' &&
    typeof candidate.exampleSentence === 'string' &&
    Array.isArray(candidate.tags)
  )
}

export function needsWordAssist(form: WordAssistFormShape) {
  if (!form.spanish.trim()) {
    return false
  }

  return (
    !form.meaningKo.trim() ||
    !form.exampleSentence.trim() ||
    !form.tagsText.trim()
  )
}

export function mergeWordAssistSuggestion<T extends WordAssistFormShape>(
  form: T,
  suggestion: WordAssistSuggestion,
) {
  const tagsText = normalizeTagList(suggestion.tags).join(', ')

  return {
    ...form,
    meaningKo: form.meaningKo.trim() || suggestion.meaningKo.trim(),
    exampleSentence:
      form.exampleSentence.trim() || suggestion.exampleSentence.trim(),
    tagsText: form.tagsText.trim() || tagsText,
  }
}

export async function requestWordAssist(spanish: string) {
  const response = await fetch('/api/spanish-word-autofill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ spanish }),
  })
  const payload = (await response.json().catch(() => null)) as
    | WordAssistSuggestion
    | { error?: string }
    | null

  if (!response.ok) {
    throw new Error(
      payload &&
        typeof payload === 'object' &&
        'error' in payload &&
        typeof payload.error === 'string'
        ? payload.error
        : 'AI 자동 작성에 실패했습니다.',
    )
  }

  if (!isWordAssistSuggestion(payload)) {
    throw new Error('AI 응답 형식을 해석하지 못했습니다.')
  }

  return {
    meaningKo: payload.meaningKo.trim(),
    exampleSentence: payload.exampleSentence.trim(),
    tags: normalizeTagList(
      payload.tags.filter((tag): tag is string => typeof tag === 'string'),
    ),
  }
}
