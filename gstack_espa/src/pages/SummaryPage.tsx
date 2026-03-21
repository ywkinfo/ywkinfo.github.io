import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useStudy } from '../context/StudyContext'
import { formatDateTime } from '../lib/format'

export function SummaryPage() {
  const { dueEntries, lastSummary, stats } = useStudy()

  if (!lastSummary) {
    return (
      <EmptyState
        description="복습을 한 번 마치면 여기에서 마지막 세션 결과와 전체 진도를 빠르게 확인할 수 있습니다."
        eyebrow="세션 기록 없음"
        primaryLabel="복습하러 가기"
        primaryTo="/review"
        secondaryLabel="단어 추가"
        secondaryTo="/add"
        title="아직 완료한 복습 세션이 없습니다."
      />
    )
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">세션 완료</p>
          <h1>{lastSummary.totalReviewed}개 카드를 마쳤습니다.</h1>
          <p className="body-copy">
            마지막 완료 시각은 {formatDateTime(lastSummary.completedAt)}입니다. 짧은 세션을 자주
            반복하는 흐름을 목표로 합니다.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button button-primary" to={dueEntries.length ? '/review' : '/add'}>
            {dueEntries.length ? '남은 due 카드 보기' : '새 단어 추가'}
          </Link>
          <Link className="button button-secondary" to="/deck">
            단어장 보기
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Again</span>
          <strong>{lastSummary.ratingCounts.again}</strong>
        </article>
        <article className="stat-card">
          <span>Good</span>
          <strong>{lastSummary.ratingCounts.good}</strong>
        </article>
        <article className="stat-card">
          <span>Easy</span>
          <strong>{lastSummary.ratingCounts.easy}</strong>
        </article>
        <article className="stat-card">
          <span>남은 due</span>
          <strong>{stats.dueCount}</strong>
        </article>
      </section>

      <section className="surface-card section-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">전체 현황</p>
            <h2>누적 학습 상태</h2>
          </div>
        </div>
        <div className="stack-list">
          <article className="list-item">
            <div>
              <strong>총 단어</strong>
              <p>직접 만든 카드의 총합</p>
            </div>
            <span className="meta-label">{stats.totalEntries}</span>
          </article>
          <article className="list-item">
            <div>
              <strong>오늘 복습</strong>
              <p>오늘 날짜 기준으로 마지막 복습 기록이 있는 카드 수</p>
            </div>
            <span className="meta-label">{stats.reviewedToday}</span>
          </article>
          <article className="list-item">
            <div>
              <strong>리뷰 단계</strong>
              <p>간격이 늘어나 장기 복습에 들어간 카드</p>
            </div>
            <span className="meta-label">{stats.reviewCount}</span>
          </article>
        </div>
      </section>
    </div>
  )
}
