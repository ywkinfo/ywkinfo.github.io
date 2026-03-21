import { useDeferredValue, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useStudy } from '../context/StudyContext'
import { formatDateTime, formatRelativeDue } from '../lib/format'

export function DeckPage() {
  const { deck, isLoading } = useStudy()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  if (!deck.length && !isLoading) {
    return (
      <EmptyState
        description="첫 단어를 추가하면 여기에서 due 상태와 메모, 태그를 함께 관리할 수 있습니다."
        eyebrow="단어장 비어 있음"
        primaryLabel="단어 추가"
        primaryTo="/add"
        secondaryLabel="홈으로"
        secondaryTo="/"
        title="아직 저장된 단어가 없습니다."
      />
    )
  }

  const filteredDeck = deck.filter((item) => {
    if (!deferredQuery) {
      return true
    }

    const haystack = [
      item.entry.spanish,
      item.entry.meaningKo,
      item.entry.exampleSentence,
      item.entry.notes,
      item.entry.tags?.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(deferredQuery)
  })

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value)
  }

  return (
    <div className="page-stack">
      <section className="surface-card section-card">
        <p className="eyebrow">내 단어장</p>
        <h1>직접 만든 카드 {deck.length}장</h1>
        <p className="body-copy">
          수정이 필요하면 편집으로 들어가고, 현재 due 시점은 오른쪽 배지에서 바로 확인할 수
          있습니다.
        </p>
        <div className="search-row">
          <input
            aria-label="단어 검색"
            className="search-input"
            placeholder="스페인어, 뜻, 태그로 검색"
            value={query}
            onChange={handleQueryChange}
          />
          <Link className="button button-secondary" to="/add">
            새 단어
          </Link>
        </div>
      </section>

      <section className="stack-list">
        {filteredDeck.map((item) => (
          <article className="surface-card list-card" key={item.entry.id}>
            <div className="list-card-header">
              <div className="card-term-stack">
                <h2 className="vocab-latin vocab-latin-lg" lang="es">
                  {item.entry.spanish}
                </h2>
                <p className="vocab-korean card-meaning" lang="ko">
                  {item.entry.meaningKo}
                </p>
              </div>
              <span
                className={
                  item.review.status === 'review'
                    ? 'status-pill is-review'
                    : item.review.status === 'learning'
                      ? 'status-pill is-learning'
                      : 'status-pill is-new'
                }
              >
                {formatRelativeDue(item.review.dueAt)}
              </span>
            </div>

            {item.entry.exampleSentence ? (
              <p className="quote-copy sentence-latin" lang="es">
                {item.entry.exampleSentence}
              </p>
            ) : null}

            {item.entry.notes ? <p className="body-copy">{item.entry.notes}</p> : null}

            {item.entry.tags?.length ? (
              <div className="tag-row">
                {item.entry.tags.map((tag) => (
                  <span className="tag-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="list-card-footer">
              <span className="meta-label">생성 {formatDateTime(item.entry.createdAt)}</span>
              <Link className="text-link" to={`/add?edit=${item.entry.id}`}>
                편집
              </Link>
            </div>
          </article>
        ))}

        {!filteredDeck.length ? (
          <section className="surface-card section-card">
            <h2>검색 결과가 없습니다.</h2>
            <p className="body-copy muted">검색어를 바꾸거나 태그 없이 다시 확인해 보세요.</p>
          </section>
        ) : null}
      </section>
    </div>
  )
}
