import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

test('test setup renders into jsdom with jest-dom matchers', () => {
  render(<p>hello</p>)
  expect(screen.getByText('hello')).toBeInTheDocument()
})
