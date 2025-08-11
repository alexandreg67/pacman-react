# Levels Feature Specification

## Scope

Introduce authentic Pac‑Man level mechanics: timed scatter/chase cycles, frightened timing, ghost/Pac‑Man speeds (incl. tunnel), ghost release rules, fruit spawn rules, Cruise Elroy, and level progression UI.

## Authoritative References (to cite in code/docs)

- The Pac‑Man Dossier (Game Developer): https://www.gamedeveloper.com/design/the-pac-man-dossier
- Don Hodges (bugs/kill screen analyses): http://www.donhodges.com/
- MAME project (hardware/ROM behavior reference): https://github.com/mamedev/mame
- Additional cross‑checks: reputable arcade docs and GitHub implementations mirroring arcade timings.

## Data To Extract (checked against multiple sources)

- Scatter/Chase schedule per level (phase order, durations, infinite chase end).
- Frightened duration per level (incl. flashing behavior).
- Speed tables: Pac‑Man and ghosts (normal vs frightened), tunnel speed modifier, per level.
- Ghost release rules: dot counters per ghost and resets, intermissions not required.
- Cruise Elroy thresholds and speed changes (Blinky behavior tied to remaining pellets).
- Fruit: per‑level sequence and scores; spawn count per level and pellet thresholds triggering spawns.
- Maze constants: single original maze layout, pellet/energizer counts, fruit spawn location and warp tunnels.

## Data Model (planned)

`LevelConfig` with: `id`, `fruit`, `scores`, `frightened`, `scatterChase: {mode: 'scatter'|'chase', ms}[]`, `speeds: {pacman, ghost, frightened, tunnel}`, `dotRelease`, `elroy`.

## Implementation Plan

- Add `src/game/logic/levels.ts` exporting typed `LEVELS[]` and helpers.
- Add `levelManager` to initialize/apply per‑level parameters to movement, AI, and frightened/tunnel systems.
- Hook fruit spawns to pellet counters; update HUD with level/fruit icons.

## Test Plan (Vitest)

- Level progression updates timers/speeds and resets pellets.
- Scatter/Chase schedule honored over time.
- Frightened duration decreases with level.
- Fruit spawns at defined pellet thresholds; scoring applied.
- Ghost release/Elroy behavior triggers at configured counters.
- Tunnel speed reductions applied.

## Open Items / To Confirm

Exact numeric tables (durations, speeds, thresholds). Fill after extracting from sources above and commit with references.
