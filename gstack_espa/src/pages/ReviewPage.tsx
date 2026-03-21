import { startTransition, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useStudy } from '../context/StudyContext'
import { formatRelativeDue } from '../lib/format'

export function ReviewPage() {
  const navigate = useNavigate()
  const { answerCurrentCard, deck, dueEntries, isLoading, session, startSession } = useStudy()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const currentCardId = session?.remainingIds[0]
  const currentItem = deck.find((item) => item.entry.id === currentCardId)

  async function handleRating(rating: 'again' | 'good' | 'easy') {
    setIsSubmitting(true)

    const result = await answerCurrentCard(rating)

    setIsSubmitting(false)

    if (result.completed) {
      startTransition(() => {
        navigate('/summary')
      })
    }
  }

  if (!deck.length && !isLoading) {
    return (
      <EmptyState
        description="추가한 단어는 저장 즉시 due 상태가 되며, 이 화면에서 곧바로 복습 세션을 시작할 수 있습니다."
        eyebrow="복습 준비 전"
        primaryLabel="단어 추가"
        primaryTo="/add"
        secondaryLabel="홈으로"
        secondaryTo="/"
        title="먼저 단어를 추가해야 복습 큐가 열립니다."
      />
    )
  }

  if (!session || !currentItem) {
    return (
      <div className="page-stack">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">오늘의 세션</p>
            <h1>
              {dueEntries.length
                ? `${dueEntries.length}개의 카드가 지금 복습을 기다립니다.`
                : '지금 바로 due 된 카드는 없습니다.'}
            </h1>
            <p className="body-copy">
              세션을 시작하면 현재 due 카드만 순서대로 소화합니다. `again`은 10분 뒤 다시
              오고, `good`과 `easy`는 더 긴 간격으로 넘어갑니다.
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="button button-primary"
              disabled={!dueEntries.length}
              onClick={() => startSession()}
              type="button"
            >
              세션 시작
            </button>
            <Link className="button button-secondary" to="/deck">
              단어장 보기
            </Link>
          </div>
        </section>

        {dueEntries.length ? (
          <section className="surface-card section-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">대기 중</p>
                <h2>이번 세션에 들어갈 카드</h2>
              </div>
            </div>
            <div className="stack-list">
              {dueEntries.slice(0, 4).map((item) => (
                <article className="list-item" key={item.entry.id}>
                  <div className="vocab-pair">
                    <strong className="vocab-latin vocab-latin-sm" lang="es">
                      {item.entry.spanish}
                    </strong>
                    <p className="vocab-korean" lang="ko">
                      {item.entry.meaningKo}
                    </p>
                  </div>
                  <span className="status-pill is-due">
                    {formatRelativeDue(item.review.dueAt)}
                  </span>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="surface-card section-card">
            <p className="body-copy muted">
              복습할 카드가 없을 때는 새 단어를 더 넣거나 조금 뒤에 돌아오면 됩니다.
            </p>
          </section>
        )}
      </div>
    )
  }

  const totalCards = session.answers.length + session.remainingIds.length
  const currentNumber = session.answers.length + 1

  return (
    <div className="page-stack">
      <section className="surface-card section-card session-header">
        <div>
          <p className="eyebrow">집중 복습 중</p>
          <h1>
            {currentNumber} / {totalCards}
          </h1>
        </div>
        <span className="meta-label">남은 카드 {session.remainingIds.length}개</span>
      </section>

      <ReviewCard
        key={currentItem.entry.id}
        currentItem={currentItem}
        isSubmitting={isSubmitting}
        onRating={handleRating}
      />
    </div>
  )
}

interface ReviewCardProps {
  currentItem: NonNullable<ReturnType<typeof useStudy>['deck'][number]>
  isSubmitting: boolean
  onRating: (rating: 'again' | 'good' | 'easy') => Promise<void>
}

function ReviewCard({ currentItem, isSubmitting, onRating }: ReviewCardProps) {
  const [isAnswerVisible, setIsAnswerVisible] = useState(false)
  const answerId = useId()

  return (
    <>
      <button
        aria-controls={answerId}
        aria-expanded={isAnswerVisible}
        aria-label={
          isAnswerVisible
            ? `뜻과 메모 ${currentItem.entry.spanish}`
            : `스페인어 단어 ${currentItem.entry.spanish} 카드를 눌러 뜻 보기`
        }
        className={isAnswerVisible ? 'study-card is-flipped' : 'study-card'}
        onClick={() => setIsAnswerVisible((current) => !current)}
        type="button"
      >
        <p className="study-card-label">{isAnswerVisible ? '뜻과 메모' : '스페인어 단어'}</p>
        <h2 className="study-card-term vocab-latin vocab-latin-xl" lang="es">
          {currentItem.entry.spanish}
        </h2>
        {isAnswerVisible ? (
          <div className="study-card-back" id={answerId}>
            <strong className="vocab-korean vocab-korean-strong" lang="ko">
              {currentItem.entry.meaningKo}
            </strong>
            {currentItem.entry.exampleSentence ? (
              <p className="sentence-latin" lang="es">
                {currentItem.entry.exampleSentence}
              </p>
            ) : null}
            {currentItem.entry.notes ? <p>{currentItem.entry.notes}</p> : null}
          </div>
        ) : (
          <p className="body-copy">카드를 눌러 뜻 보기</p>
        )}
      </button>

      <section className="surface-card section-card">
        <p className="body-copy muted">
          먼저 카드를 뒤집어 뜻을 확인한 뒤, 얼마나 쉬웠는지 선택해 주세요.
        </p>
        <div className="rating-grid">
          <button
            aria-label="Again, 10분 뒤 다시 보기"
            className="button button-danger"
            disabled={!isAnswerVisible || isSubmitting}
            onClick={() => onRating('again')}
            type="button"
          >
            Again
          </button>
          <button
            aria-label="Good, 다음 간격으로 넘기기"
            className="button button-secondary"
            disabled={!isAnswerVisible || isSubmitting}
            onClick={() => onRating('good')}
            type="button"
          >
            Good
          </button>
          <button
            aria-label="Easy, 더 긴 간격으로 넘기기"
            className="button button-primary"
            disabled={!isAnswerVisible || isSubmitting}
            onClick={() => onRating('easy')}
            type="button"
          >
            Easy
          </button>
        </div>
      </section>
    </>
  )
}
