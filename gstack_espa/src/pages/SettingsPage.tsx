import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStudy } from '../context/StudyContext'

function createExportFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `hola-diario-backup-${date}.json`
}

export function SettingsPage() {
  const { clearSession, exportData, session, stats } = useStudy()
  const [message, setMessage] = useState<string | null>(null)

  async function handleExport() {
    const payload = await exportData()
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = createExportFileName()
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('현재 단어장과 복습 상태를 JSON으로 내보냈습니다.')
  }

  return (
    <div className="page-stack">
      <section className="surface-card section-card">
        <p className="eyebrow">설정</p>
        <h1>이 브라우저에만 저장되는 학습 데이터</h1>
        <p className="body-copy">
          첫 버전은 로그인 없이 동작합니다. 그래서 진도와 카드 상태는 현재 기기의
          IndexedDB에 보관됩니다.
        </p>
      </section>

      <section className="surface-card section-card">
        <div className="stack-list">
          <article className="list-item">
            <div>
              <strong>총 카드</strong>
              <p>현재 로컬 저장소에 있는 카드 수</p>
            </div>
            <span className="meta-label">{stats.totalEntries}</span>
          </article>
          <article className="list-item">
            <div>
              <strong>바로 복습</strong>
              <p>지금 due 상태인 카드 수</p>
            </div>
            <span className="meta-label">{stats.dueCount}</span>
          </article>
          <article className="list-item">
            <div>
              <strong>진행 중 세션</strong>
              <p>새로고침 후에도 이어갈 수 있는 현재 세션</p>
            </div>
            <span className="meta-label">{session ? '있음' : '없음'}</span>
          </article>
        </div>
      </section>

      <section className="surface-card section-card">
        <div className="action-row">
          <button className="button button-primary" onClick={handleExport} type="button">
            JSON 백업 내보내기
          </button>
          {session ? (
            <button className="button button-secondary" onClick={clearSession} type="button">
              진행 중 세션 비우기
            </button>
          ) : (
            <Link className="button button-secondary" to="/review">
              복습 화면 보기
            </Link>
          )}
        </div>
        {message ? <p className="inline-message">{message}</p> : null}
      </section>
    </div>
  )
}
