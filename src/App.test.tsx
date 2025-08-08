import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import App from './App'

it('renders heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /pac-man/i })).toBeInTheDocument()
})
