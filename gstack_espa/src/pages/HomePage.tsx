import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useStudy } from '../context/StudyContext'
import { formatDateTime, formatRelativeDue } from '../lib/format'

export function HomePage() {
  const { deck, dueEntries, lastSummary, session, stats } = useStudy()

  if (!deck.length) {
    return (
      <EmptyState
        description="단어와 뜻을 넣으면 바로 오늘의 복습 큐가 만들어집니다. 모바일에서 짧게 반복하는 흐름에 맞춰 설계했습니다."
        eyebrow="첫 시작"
        primaryLabel="첫 단어 추가"
        primaryTo="/add"
        secondaryLabel="단어장 보기"
        secondaryTo="/deck"
        title="직접 모은 단어로 스페인어 루틴을 시작해 보세요."
      />
    )
  }

  const newestEntries = [...deck]
    .sort(
      (left, right) =>
        new Date(right.entry.createdAt).getTime() -
        new Date(left.entry.createdAt).getTime(),
    )
    .slice(0, 3)

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">오늘의 루틴</p>
          <h1>
            {dueEntries.length
              ? `오늘 복습할 카드 ${dueEntries.length}개`
              : '오늘은 새 카드부터 채워볼까요?'}
          </h1>
          <p className="body-copy">
            지금까지 {stats.totalEntries}개의 단어를 쌓았고, 오늘은 {stats.reviewedToday}개를
            복습했습니다.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to={dueEntries.length ? '/review' : '/add'}>
            {dueEntries.length ? '오늘 복습 시작' : '새 단어 추가'}
          </Link>
          <Link className="button button-secondary" to="/deck">
            내 단어장 보기
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>총 단어</span>
          <strong>{stats.totalEntries}</strong>
        </article>
        <article className="stat-card">
          <span>바로 복습</span>
          <strong>{stats.dueCount}</strong>
        </article>
        <article className="stat-card">
          <span>학습 중</span>
          <strong>{stats.learningCount + stats.newCount}</strong>
        </article>
        <article className="stat-card">
          <span>리뷰 단계</span>
          <strong>{stats.reviewCount}</strong>
        </article>
      </section>

      <section className="surface-card section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">바로 보기</p>
            <h2>복습 대기 카드</h2>
          </div>
          <Link className="text-link" to="/review">
            복습 화면 열기
          </Link>
        </div>
        {dueEntries.length ? (
          <div className="stack-list">
            {dueEntries.slice(0, 3).map((item) => (
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
        ) : (
          <p className="body-copy muted">
            현재 due 카드는 없습니다. 새 단어를 추가하거나 나중에 다시 돌아오면 됩니다.
          </p>
        )}
      </section>

      <section className="surface-card section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">최근 추가</p>
            <h2>가장 최근에 넣은 단어</h2>
          </div>
          <Link className="text-link" to="/add">
            더 추가하기
          </Link>
        </div>
        <div className="stack-list">
          {newestEntries.map((item) => (
            <article className="list-item" key={item.entry.id}>
              <div className="vocab-pair">
                <strong className="vocab-latin vocab-latin-sm" lang="es">
                  {item.entry.spanish}
                </strong>
                <p className="vocab-korean" lang="ko">
                  {item.entry.meaningKo}
                </p>
              </div>
              <span className="meta-label">{formatDateTime(item.entry.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>

      {lastSummary ? (
        <section className="surface-card section-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">최근 세션</p>
              <h2>마지막 복습 요약</h2>
            </div>
            <Link className="text-link" to="/summary">
              자세히 보기
            </Link>
          </div>
          <p className="body-copy">
            {formatDateTime(lastSummary.completedAt)}에 {lastSummary.totalReviewed}개 카드를
            마쳤습니다.
          </p>
        </section>
      ) : null}

      {session ? (
        <section className="surface-card section-card highlight-card">
          <p className="eyebrow">이어 하기</p>
          <h2>진행 중인 복습 세션이 있습니다.</h2>
          <p className="body-copy">
            남은 카드 {session.remainingIds.length}개를 이어서 확인할 수 있습니다.
          </p>
          <Link className="button button-primary" to="/review">
            세션 이어서 진행하기
          </Link>
        </section>
      ) : null}
    </div>
  )
}
