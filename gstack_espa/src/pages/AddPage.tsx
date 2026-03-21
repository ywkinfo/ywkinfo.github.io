import {
  startTransition,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { CreateEntryInput, SaveEntryResult } from '../types'
import { useStudy } from '../context/StudyContext'
import { parseTags } from '../lib/validation'
import {
  mergeWordAssistSuggestion,
  needsWordAssist,
  requestWordAssist,
} from '../lib/wordAssist'

interface EntryFormState {
  spanish: string
  meaningKo: string
  exampleSentence: string
  notes: string
  tagsText: string
}

const EMPTY_FORM: EntryFormState = {
  spanish: '',
  meaningKo: '',
  exampleSentence: '',
  notes: '',
  tagsText: '',
}

export function AddPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { deck, saveEntry } = useStudy()
  const editingId = searchParams.get('edit')
  const editingItem = deck.find((item) => item.entry.id === editingId)
  const initialForm = editingItem
    ? {
        spanish: editingItem.entry.spanish,
        meaningKo: editingItem.entry.meaningKo,
        exampleSentence: editingItem.entry.exampleSentence ?? '',
        notes: editingItem.entry.notes ?? '',
        tagsText: editingItem.entry.tags?.join(', ') ?? '',
      }
    : EMPTY_FORM
  const formKey = editingItem ? editingItem.entry.id : editingId ? `pending-${editingId}` : 'new'

  return (
    <div className="page-stack">
      <section className="surface-card section-card">
        <p className="eyebrow">{editingItem ? '단어 수정' : '단어 추가'}</p>
        <h1>{editingItem ? '기존 단어를 다듬기' : '새로운 스페인어 카드 만들기'}</h1>
        <p className="body-copy">
          스페인어에서 한국어로 이해하는 흐름을 기본으로 둡니다. 나중에 복습할 때는 이
          정보를 그대로 카드에 보여줍니다.
        </p>
      </section>

      <EntryForm
        key={formKey}
        editingId={editingId ?? undefined}
        editingItemExists={Boolean(editingItem)}
        initialForm={initialForm}
        navigateToDeck={() =>
          startTransition(() => {
            navigate('/deck')
          })
        }
        onSave={saveEntry}
      />
    </div>
  )
}

interface EntryFormProps {
  editingId?: string
  editingItemExists: boolean
  initialForm: EntryFormState
  navigateToDeck: () => void
  onSave: (input: CreateEntryInput, editingId?: string) => Promise<SaveEntryResult>
}

function EntryForm({
  editingId,
  editingItemExists,
  initialForm,
  navigateToDeck,
  onSave,
}: EntryFormProps) {
  const [form, setForm] = useState<EntryFormState>(initialForm)
  const [assistMessage, setAssistMessage] = useState<string | null>(null)
  const [isAutofilling, setIsAutofilling] = useState(false)
  const [isRefreshingExample, setIsRefreshingExample] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastAutofilledSpanish, setLastAutofilledSpanish] = useState<string | null>(null)
  const aiRequestInFlightRef = useRef(false)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (name === 'spanish') {
      setLastAutofilledSpanish(null)
    }
  }

  async function requestSuggestionForSpanish(
    nextSpanish: string,
    messages: { loading: string; success: string },
  ) {
    if (aiRequestInFlightRef.current) {
      return null
    }

    aiRequestInFlightRef.current = true
    setAssistMessage(messages.loading)

    try {
      const suggestion = await requestWordAssist(nextSpanish)

      setAssistMessage(messages.success)

      return suggestion
    } catch (error) {
      setAssistMessage(
        error instanceof Error
          ? error.message
          : 'AI 자동 작성 중 오류가 발생했습니다.',
      )

      return null
    } finally {
      aiRequestInFlightRef.current = false
    }
  }

  async function autofillMissingFields(options?: { force?: boolean }) {
    const currentForm = form
    const nextSpanish = currentForm.spanish.trim()
    const spanishKey = nextSpanish.toLowerCase()

    if (!nextSpanish) {
      return null
    }

    if (!options?.force && !needsWordAssist(currentForm)) {
      return null
    }

    if (!options?.force && lastAutofilledSpanish === spanishKey) {
      return null
    }

    setIsAutofilling(true)
    const suggestion = await requestSuggestionForSpanish(nextSpanish, {
      loading: 'AI가 뜻, 예문, 태그를 작성하는 중입니다...',
      success: 'AI가 뜻, 예문, 태그를 자동으로 채웠습니다.',
    })

    if (!suggestion) {
      setIsAutofilling(false)
      return null
    }

    const mergedForm = mergeWordAssistSuggestion(currentForm, suggestion)

    setForm((current) =>
      current.spanish.trim().toLowerCase() === spanishKey
        ? mergeWordAssistSuggestion(current, suggestion)
        : current,
    )
    setLastAutofilledSpanish(spanishKey)
    setIsAutofilling(false)

    return mergedForm
  }

  async function regenerateExampleSentence() {
    const nextSpanish = form.spanish.trim()
    const spanishKey = nextSpanish.toLowerCase()

    if (!nextSpanish) {
      setAssistMessage('예문을 다시 만들려면 먼저 스페인어 단어를 입력해 주세요.')
      return
    }

    setIsRefreshingExample(true)
    const suggestion = await requestSuggestionForSpanish(nextSpanish, {
      loading: 'AI가 예문을 다시 작성하는 중입니다...',
      success: 'AI가 예문을 새로 작성했습니다.',
    })

    if (!suggestion) {
      setIsRefreshingExample(false)
      return
    }

    setForm((current) =>
      current.spanish.trim().toLowerCase() === spanishKey
        ? {
            ...current,
            exampleSentence: suggestion.exampleSentence,
          }
        : current,
    )
    setIsRefreshingExample(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)
    let nextForm = form

    if (needsWordAssist(form)) {
      const autofilledForm = await autofillMissingFields({ force: true })

      if (autofilledForm) {
        nextForm = autofilledForm
      }
    }

    const result = await onSave(
      {
        spanish: nextForm.spanish,
        meaningKo: nextForm.meaningKo,
        exampleSentence: nextForm.exampleSentence,
        notes: nextForm.notes,
        tags: parseTags(nextForm.tagsText),
      },
      editingId,
    )

    setIsSaving(false)

    if (!result.ok) {
      setMessage(result.message ?? '저장 중 오류가 발생했습니다.')
      return
    }

    navigateToDeck()
  }

  return (
    <form className="surface-card form-card" onSubmit={handleSubmit}>
      <label className="field">
        <div className="field-header">
          <span>스페인어 단어</span>
          <button
            className="button button-secondary button-compact"
            disabled={isAutofilling || isRefreshingExample || !form.spanish.trim()}
            onClick={() => {
              void autofillMissingFields({ force: true })
            }}
            type="button"
          >
            {isAutofilling ? 'AI 작성 중...' : 'AI 채우기'}
          </button>
        </div>
        <input
          aria-label="스페인어 단어"
          autoFocus
          className="vocab-entry-input"
          name="spanish"
          placeholder="예: compartir"
          value={form.spanish}
          onBlur={() => {
            void autofillMissingFields()
          }}
          onChange={handleChange}
        />
        <p className="meta-label">
          스페인어 단어만 입력하고 포커스를 옮기면 AI가 뜻, 예문, 태그를 채웁니다.
        </p>
      </label>

      <label className="field">
        <span>한국어 뜻</span>
        <input
          aria-label="한국어 뜻"
          name="meaningKo"
          placeholder="예: 나누다, 공유하다"
          value={form.meaningKo}
          onChange={handleChange}
        />
      </label>

      <label className="field">
        <div className="field-header">
          <span>예문</span>
          <button
            className="button button-secondary button-compact"
            disabled={isAutofilling || isRefreshingExample || !form.spanish.trim()}
            onClick={() => {
              void regenerateExampleSentence()
            }}
            type="button"
          >
            {isRefreshingExample ? '예문 생성 중...' : 'AI 채우기'}
          </button>
        </div>
        <textarea
          name="exampleSentence"
          placeholder="예: Quiero compartir este cafe contigo."
          rows={4}
          value={form.exampleSentence}
          onChange={handleChange}
        />
      </label>

      <label className="field">
        <span>메모</span>
        <textarea
          name="notes"
          placeholder="헷갈리는 포인트나 기억법을 남겨 두세요."
          rows={3}
          value={form.notes}
          onChange={handleChange}
        />
      </label>

      <label className="field">
        <span>태그</span>
        <input
          name="tagsText"
          placeholder="여행, cafe, 동사"
          value={form.tagsText}
          onChange={handleChange}
        />
      </label>

      {!editingItemExists && editingId ? (
        <p className="inline-message inline-error">수정할 단어를 찾을 수 없습니다.</p>
      ) : null}

      {assistMessage ? <p className="inline-message">{assistMessage}</p> : null}
      {message ? <p className="inline-message inline-error">{message}</p> : null}

      <div className="action-row">
        <button className="button button-primary" disabled={isSaving} type="submit">
          {isSaving ? '저장 중...' : editingId ? '수정 저장' : '단어 저장'}
        </button>
        <Link className="button button-secondary" to="/deck">
          단어장으로
        </Link>
      </div>
    </form>
  )
}
