import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, test } from 'vitest'
import { THEME_STORAGE_KEY, ThemeToggle } from './ThemeToggle'

const toggle = () => screen.getByRole('switch', { name: 'Dark mode' })

afterEach(() => {
  document.documentElement.classList.remove('dark')
  localStorage.clear()
})

describe('ThemeToggle', () => {
  test('starts off when the page is light', () => {
    render(<ThemeToggle />)
    expect(toggle()).not.toBeChecked()
  })

  test('starts on when the page is already dark', () => {
    document.documentElement.classList.add('dark')
    render(<ThemeToggle />)
    expect(toggle()).toBeChecked()
  })

  test('toggling switches the page theme and remembers the choice', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.click(toggle())
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    await user.click(toggle())
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })

  test('Space toggles it from the keyboard', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    await user.tab()
    expect(toggle()).toHaveFocus()
    await user.keyboard(' ')
    expect(toggle()).toBeChecked()
    expect(document.documentElement).toHaveClass('dark')
  })
})
