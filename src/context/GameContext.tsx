import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import gameTimeline from '../data/gameTimeline.json'

type Phase = 'prepareAttack' | 'attack' | 'prepareDefend' | 'defend' | 'gameOver'
type GameStatus = 'idle' | 'playing' | 'ended'

type Tap = {
    timestamp: number
    cellId: string
}

type GameContextType = {
    round: number
    phase: Phase
    elapsed: number
    startGame: () => void
    resetGame: () => void
    videoRef: React.RefObject<HTMLVideoElement | null>
    gameStatus: GameStatus
    tapHistory: Record<number, Tap[]>
    registerTap: (cellId: string) => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
    const ctx = useContext(GameContext)
    if (!ctx) throw new Error('GameContext not found')
    return ctx
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [round, setRound] = useState(1)
    const [phase, setPhase] = useState<Phase>('prepareAttack')
    const [elapsed, setElapsed] = useState(0)
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
    const [tapHistory, setTapHistory] = useState<Record<number, Tap[]>>({})

    const videoRef = useRef<HTMLVideoElement | null>(null)

    const startGame = useCallback(() => {
        setGameStatus('playing')
        setPhase('prepareAttack')
        setRound(1)
        setTapHistory({})

        if (videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play().catch((err) => {
                console.warn('Autoplay blocked:', err)
            })
        }
    }, [])

    const resetGame = useCallback(() => {
        setGameStatus('idle')
        setPhase('prepareAttack')
        setRound(1)
        setTapHistory({})
        setElapsed(0)

        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [])

    const registerTap = (cellId: string) => {
        const time = elapsed / 1000
        setTapHistory((prev) => {
            const current = prev[round] || []
            return {
                ...prev,
                [round]: [...current, { timestamp: time, cellId }],
            }
        })
    }

    // Sync time with video
    useEffect(() => {
        if (!videoRef.current) return
        const interval = setInterval(() => {
            const video = videoRef.current
            if (video && !video.paused) {
                setElapsed(video.currentTime * 1000)
            }
        }, 50)
        return () => clearInterval(interval)
    }, [])

    // Phase updates
    useEffect(() => {
        if (gameStatus !== 'playing') return

        const currentSeconds = elapsed / 1000
        const prepare = gameTimeline.prepareDuration
        const duration = gameTimeline.eventDuration
        const events = gameTimeline.events
        const gameDuration = gameTimeline.gameDuration

        const firstPrepareStart = events[0].start - prepare
        if (currentSeconds < firstPrepareStart) {
            setPhase('gameOver')
            return
        }

        if (currentSeconds >= gameDuration) {
            setPhase('gameOver')
            setGameStatus('ended')
            videoRef.current?.pause()
            return
        }

        let currentRound = 0
        let updatedPhase: Phase | null = null

        for (let i = 0; i < events.length; i++) {
            const e = events[i]
            const isAttack = e.type === 'attack'
            const phaseType = isAttack ? 'attack' : 'defend'
            const prepareType = isAttack ? 'prepareAttack' : 'prepareDefend'

            const prepareStart = e.start - prepare
            const eventEnd = e.start + duration

            if (currentSeconds >= prepareStart && currentSeconds < e.start) {
                updatedPhase = prepareType
            } else if (currentSeconds >= e.start && currentSeconds < eventEnd) {
                updatedPhase = phaseType
            }

            if (currentSeconds < eventEnd) {
                currentRound = i + 1
                break
            }
        }

        setRound(currentRound)
        if (!updatedPhase) {
            setPhase('gameOver')
        } else if (updatedPhase !== phase) {
            setPhase(updatedPhase)
        }
    }, [elapsed, gameStatus, phase])

    return (
        <GameContext.Provider
            value={{
                round,
                phase,
                elapsed,
                startGame,
                resetGame,
                videoRef,
                gameStatus,
                tapHistory,
                registerTap,
            }}
        >
            {children}
        </GameContext.Provider>
    )
}
