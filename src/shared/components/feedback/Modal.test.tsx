import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const back = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back }),
}))

import { Modal } from './Modal'

describe('Modal', () => {
  beforeEach(() => {
    back.mockReset()
  })

  it('renders children inside dialog', () => {
    render(<Modal><span>Hello</span></Modal>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    render(<Modal><span>x</span></Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('calls router.back when close button clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span>x</span></Modal>)
    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(back).toHaveBeenCalledOnce()
  })

  it('calls router.back when Escape pressed', async () => {
    const user = userEvent.setup()
    render(<Modal><span>x</span></Modal>)
    await user.keyboard('{Escape}')
    expect(back).toHaveBeenCalledOnce()
  })

  it('calls router.back when backdrop clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span>content</span></Modal>)
    await user.click(screen.getByRole('dialog'))
    expect(back).toHaveBeenCalledOnce()
  })

  it('does NOT call router.back when content clicked', async () => {
    const user = userEvent.setup()
    render(<Modal><span data-testid="content">content</span></Modal>)
    await user.click(screen.getByTestId('content'))
    expect(back).not.toHaveBeenCalled()
  })
})
