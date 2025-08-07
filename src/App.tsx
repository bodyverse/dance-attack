import React from 'react'
import { useGame } from './context/GameContext'
import { VideoBackground } from './components/VideoBackground'
import { PhaseCircleCountdown } from './components/PhaseCircleCountdown'
import { HitGrid } from './components/HitGrid'

const App: React.FC = () => {
  const { phase, elapsed, startGame, resetGame, round, gameStatus } = useGame()
  console.log(gameStatus)
  return (
    <div className="w-full h-screen overflow-hidden text-center relative">
      <VideoBackground />

      {gameStatus !== 'idle' && <PhaseCircleCountdown />}

      {gameStatus !== 'idle' && <HitGrid />}

      {/* Restart Button (Top Right) */}
      {gameStatus !== 'idle' && (
        <button
          onClick={resetGame}
          className="absolute top-4 right-4 px-4 py-2 text-xs font-medium tracking-wider uppercase
                   text-white/70 rounded-full border border-white/20 backdrop-blur-md bg-white/5
                   hover:bg-white/10 transition-all duration-200 active:scale-95 z-20"
        >
          Restart
        </button>
      )}

      {/* Debug Info (Top Left) */}
      <div className="absolute top-4 left-4 text-white font-mono text-sm z-10">
        Round: {round} | Phase: {phase} | Time: {(elapsed / 1000).toFixed(2)}s
      </div>

      {/* Main UI (Center) */}
      <div className="flex justify-center items-center h-full z-10">
        {gameStatus === 'idle' && (
          <button
            onClick={startGame}
            className="relative px-16 py-6 text-3xl font-medium tracking-[0.1em] uppercase text-white/80
             rounded-full bg-pink-300/10 backdrop-blur-md border border-white/20
             shadow-[0_2px_10px_0_rgba(255,192,203,0.08)]
             hover:shadow-[0_4px_16px_0_rgba(255,192,203,0.12)]
             hover:bg-pink-300/15 active:scale-95 transition-all duration-300"
          >
            Start
          </button>
        )}
      </div>
    </div>
  )
}

export default App
