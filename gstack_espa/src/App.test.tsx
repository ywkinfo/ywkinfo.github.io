import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { createBackupBundle } from './lib/backup'
import { createInitialReviewState } from './lib/srs'
import { studyRepository } from './lib/storage'

describe('Hola Diario', () => {
  it('adds a card and uses it in a review session', async () => {
    const user = userEvent.setup()
    window.history.pushState({}, '', '/add')
    render(<App />)

    await user.type(screen.getByLabelText('스페인어 단어'), 'compartir')
    await user.type(screen.getByLabelText('한국어 뜻'), '나누다')
    await user.click(screen.getByRole('button', { name: '단어 저장' }))

    await screen.findByText('compartir')
    await user.click(screen.getByRole('link', { name: '복습' }))
    await user.click(screen.getByRole('button', { name: '세션 시작' }))
    await screen.findByRole('heading', { name: 'compartir' })
    const reviewCard = screen.getByRole('button', { name: /카드를 눌러 뜻 보기/i })

    expect(reviewCard).toHaveAttribute('aria-expanded', 'false')
    await user.click(reviewCard)
    expect(reviewCard).toHaveAttribute('aria-expanded', 'true')
    await user.click(screen.getByRole('button', { name: /Good/ }))

    await screen.findByRole('heading', { name: '1개 카드를 마쳤습니다.' })
    expect(screen.getByText('남은 due')).toBeInTheDocument()
  })

  it('restores an active session after remount', async () => {
    await studyRepository.createEntry({
      spanish: 'viajar',
      meaningKo: '여행하다',
    })

    const user = userEvent.setup()
    window.history.pushState({}, '', '/review')
    const { unmount } = render(<App />)

    await user.click(await screen.findByRole('button', { name: '세션 시작' }))
    await screen.findByRole('heading', { name: 'viajar' })
    unmount()

    render(<App />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'viajar' })).toBeInTheDocument()
    })
  })

  it('deletes a card from the deck after confirmation', async () => {
    await studyRepository.createEntry({
      spanish: 'borrar',
      meaningKo: '지우다',
    })

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const user = userEvent.setup()
    window.history.pushState({}, '', '/deck')
    render(<App />)

    await screen.findByRole('heading', { name: 'borrar' })
    await user.click(screen.getByRole('button', { name: '삭제' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'borrar' })).not.toBeInTheDocument()
    })

    confirmSpy.mockRestore()
  })

  it('imports a backup and restores the saved summary and session', async () => {
    const user = userEvent.setup()
    const entry = {
      id: 'entry-imported',
      spanish: 'compartir',
      meaningKo: '나누다',
      createdAt: '2026-03-21T00:00:00.000Z',
    }
    const backup = createBackupBundle(
      {
        exportedAt: '2026-03-21T00:05:00.000Z',
        entries: [entry],
        reviews: [createInitialReviewState(entry.id, entry.createdAt)],
      },
      {
        startedAt: '2026-03-21T00:10:00.000Z',
        remainingIds: [entry.id],
        answers: [],
      },
      {
        startedAt: '2026-03-20T23:00:00.000Z',
        completedAt: '2026-03-20T23:05:00.000Z',
        totalReviewed: 1,
        ratingCounts: {
          again: 0,
          good: 1,
          easy: 0,
        },
      },
    )
    const file = new File([JSON.stringify(backup)], 'hola-diario-backup.json', {
      type: 'application/json',
    })

    window.history.pushState({}, '', '/settings')
    render(<App />)

    await user.upload(screen.getByLabelText('JSON 백업 파일 선택'), file)
    await screen.findByText('백업을 불러왔습니다. 진행 중 세션과 마지막 요약도 함께 복원했습니다.')

    await user.click(screen.getByRole('link', { name: '요약' }))
    await screen.findByRole('heading', { name: '1개 카드를 마쳤습니다.' })

    await user.click(screen.getByRole('link', { name: '복습' }))
    await screen.findByRole('heading', { name: 'compartir' })
  })
})
