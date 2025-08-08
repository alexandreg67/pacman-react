import { useCallback, useState } from 'react'
import type { Direction, GameState } from '../types'
import { initialState, step } from '../state'

export function useGame() {
  const [state, setState] = useState<GameState>(() => initialState())

  const stepInput = useCallback((dir: Direction) => {
    setState((prev) => step(prev, dir))
  }, [])

  const reset = useCallback(() => setState(initialState()), [])

  return { state, stepInput, reset }
}
