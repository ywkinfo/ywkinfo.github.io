import { Link, Outlet } from 'react-router-dom'
import { useStudy } from '../context/StudyContext'
import { BottomNav } from './BottomNav'

export function AppShell() {
  const { dueEntries, error } = useStudy()

  return (
    <div className="app-shell">
      <div aria-hidden="true" className="ambient ambient-left" />
      <div aria-hidden="true" className="ambient ambient-right" />
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">HD</span>
          <span>
            <strong>Hola Diario</strong>
            <small>내 단어로 쌓는 스페인어 루틴</small>
          </span>
        </Link>
        <div className="topbar-pill">{dueEntries.length} due</div>
      </header>

      {error ? <div className="alert-banner">{error}</div> : null}

      <main className="page-frame">
        <Outlet />
      </main>

      <BottomNav dueCount={dueEntries.length} />
    </div>
  )
}
