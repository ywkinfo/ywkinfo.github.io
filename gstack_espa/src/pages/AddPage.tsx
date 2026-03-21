import { startTransition, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useStudy } from '../context/StudyContext'
import { parseTags } from '../lib/validation'

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
  onSave: (input: { exampleSentence?: string; meaningKo: string; notes?: string; spanish: string; tags?: string[] }, editingId?: string) => Promise<{ message?: string; ok: boolean }>
}

function EntryForm({
  editingId,
  editingItemExists,
  initialForm,
  navigateToDeck,
  onSave,
}: EntryFormProps) {
  const [form, setForm] = useState<EntryFormState>(initialForm)
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const result = await onSave(
      {
        spanish: form.spanish,
        meaningKo: form.meaningKo,
        exampleSentence: form.exampleSentence,
        notes: form.notes,
        tags: parseTags(form.tagsText),
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
        <span>스페인어 단어</span>
        <input
          aria-label="스페인어 단어"
          autoFocus
          name="spanish"
          placeholder="예: compartir"
          value={form.spanish}
          onChange={handleChange}
        />
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
        <span>예문</span>
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
