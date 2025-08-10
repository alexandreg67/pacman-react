// Script simple pour déboguer le problème de test
import { initialState, step } from './src/game/state.js'
import { Cell } from './src/game/types.js'

console.log('=== DEBUG TEST MOVEMENT ===')

let s = initialState()
console.log('Position initiale Pacman:', s.pacman)
console.log('Game started:', s.started)
console.log('Grid dimensions:', { height: s.grid.length, width: s.grid[0]?.length })

// Essayer de reproduire la logique du test qui échoue
let placed = false
for (let y = 0; y < s.grid.length && !placed; y++) {
  for (let x = 0; x < s.grid[0].length - 1 && !placed; x++) {
    if (s.grid[y][x] === Cell.Wall && s.grid[y][x + 1] === Cell.Empty) {
      console.log(`\nFound wall at (${x}, ${y}) with empty at (${x + 1}, ${y})`)

      // Placer Pacman à la position empty
      s = { ...s, pacman: { x: x + 1, y } }
      console.log('Pacman placé à:', s.pacman)

      const before = { ...s.pacman }
      console.log('Avant mouvement:', before)

      // Essayer de bouger vers la gauche (dans le mur)
      s = step(s, 'left')
      console.log('Après mouvement left:', s.pacman)
      console.log('Game started après:', s.started)
      console.log('Direction:', s.dir)

      placed = true
    }
  }
}
