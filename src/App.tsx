import { useEffect } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import './App.css'
import { Board } from './components/Board'
import { useGame } from './game/react/useGame'

function App() {
  const { state, stepInput, reset } = useGame()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') stepInput('up')
      else if (e.key === 'ArrowDown') stepInput('down')
      else if (e.key === 'ArrowLeft') stepInput('left')
      else if (e.key === 'ArrowRight') stepInput('right')
      else if (e.key.toLowerCase() === 'r') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [stepInput, reset])

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6 items-center">
      <h1 className="text-3xl font-bold">Pacman (demo)</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="btn btn-sm" onClick={reset}>
          Reset (R)
        </button>
      </div>
      <Board state={state} />
      <p className="text-sm opacity-70">Use arrow keys to move. Press R to reset.</p>
    </div>
  )
}

export default App
