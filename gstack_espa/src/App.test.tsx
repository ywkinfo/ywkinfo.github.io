import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
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
    await user.click(screen.getByRole('button', { name: /카드를 눌러 뜻 보기/i }))
    await user.click(screen.getByRole('button', { name: 'Good' }))

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
})
