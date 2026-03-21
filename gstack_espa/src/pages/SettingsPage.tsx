import { useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { useStudy } from '../context/StudyContext'
import { parseBackupBundle } from '../lib/backup'

function createExportFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `hola-diario-backup-${date}.json`
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('백업 파일을 읽는 중 오류가 발생했습니다.'))
    }
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('백업 파일 형식을 읽지 못했습니다.'))
        return
      }

      resolve(reader.result)
    }

    reader.readAsText(file)
  })
}

export function SettingsPage() {
  const { clearSession, exportData, importData, session, stats } = useStudy()
  const [message, setMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement | null>(null)

  async function handleExport() {
    setIsExporting(true)

    try {
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
      setMessage('현재 단어장, 복습 상태, 진행 중 세션, 마지막 요약을 JSON으로 내보냈습니다.')
    } finally {
      setIsExporting(false)
    }
  }

  function handleImportClick() {
    importInputRef.current?.click()
  }

  async function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setIsImporting(true)

    try {
      const rawText = await readFileAsText(file)
      const bundle = parseBackupBundle(JSON.parse(rawText) as unknown)
      const result = await importData(bundle)

      setMessage(result.message ?? (result.ok ? '백업을 불러왔습니다.' : '백업 불러오기에 실패했습니다.'))
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '백업 파일을 읽는 중 오류가 발생했습니다.',
      )
    } finally {
      setIsImporting(false)
    }
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
        <p className="body-copy muted">
          백업 파일에는 카드, 복습 상태, 진행 중 세션, 마지막 세션 요약까지 함께 담깁니다.
          가져오기는 현재 로컬 데이터를 통째로 교체합니다.
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
        <input
          accept="application/json"
          aria-label="JSON 백업 파일 선택"
          className="sr-only"
          onChange={handleImportChange}
          ref={importInputRef}
          type="file"
        />
        <div className="action-row">
          <button
            className="button button-primary"
            disabled={isExporting || isImporting}
            onClick={handleExport}
            type="button"
          >
            {isExporting ? '내보내는 중...' : 'JSON 백업 내보내기'}
          </button>
          <button
            className="button button-secondary"
            disabled={isExporting || isImporting}
            onClick={handleImportClick}
            type="button"
          >
            {isImporting ? '불러오는 중...' : 'JSON 백업 불러오기'}
          </button>
          {session ? (
            <button
              className="button button-secondary"
              disabled={isExporting || isImporting}
              onClick={clearSession}
              type="button"
            >
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
