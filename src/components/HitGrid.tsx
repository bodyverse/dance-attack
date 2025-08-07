import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useGame } from '../context/GameContext'
import gameTimeline from '../data/gameTimeline.json'
import clsx from 'clsx'

type Cell = {
    id: string
    x: number
    y: number
}

type Tap = {
    id: string
    time: number
}

type Feedback = 'tooSoon' | 'perfect' | 'miss'

const YELLOW_DURATION = 1000
const GREEN_DURATION = 500

export const HitGrid: React.FC = () => {
    const { phase } = useGame()
    const [aspect, setAspect] = useState<'wide' | 'square'>('wide')
    const [taps, setTaps] = useState<Tap[]>([])
    const [vfx, setVfx] = useState<{ [key: string]: number }>({})
    const [feedbackMap, setFeedbackMap] = useState<{ [key: string]: Feedback }>({})
    const [score, setScore] = useState(0)

    const attackTimeRef = useRef<number>(0)
    const defendTimeRef = useRef<number>(0)

    useEffect(() => {
        const updateAspect = () => {
            const ratio = window.innerWidth / window.innerHeight
            setAspect(ratio > 1.2 ? 'wide' : 'square')
        }
        updateAspect()
        window.addEventListener('resize', updateAspect)
        return () => window.removeEventListener('resize', updateAspect)
    }, [])

    const grid = useMemo(() => {
        const rows = aspect === 'wide' ? 2 : 3
        const cols = aspect === 'wide' ? 4 : 3
        const cells: Cell[] = []
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                cells.push({ id: `${x}-${y}`, x, y })
            }
        }
        return { rows, cols, cells }
    }, [aspect])

    const handleTap = (cell: Cell) => {
        const now = performance.now()

        if (phase === 'attack') {
            setTaps((prev) => [...prev, { id: cell.id, time: now }])
            setVfx((prev) => ({ ...prev, [cell.id]: now }))
            setTimeout(() => {
                setVfx((prev) => {
                    const updated = { ...prev }
                    delete updated[cell.id]
                    return updated
                })
            }, 300)
        }

        if (phase === 'defend') {
            const defendNow = now - defendTimeRef.current
            const target = taps.find((tap) => tap.id === cell.id)
            if (!target) {
                setFeedbackMap((prev) => ({ ...prev, [cell.id]: 'miss' }))
                setScore((s) => s - 3)
                return
            }

            const tapOffset = target.time - attackTimeRef.current
            const delta = defendNow - tapOffset

            if (delta >= YELLOW_DURATION && delta < YELLOW_DURATION + GREEN_DURATION) {
                setFeedbackMap((prev) => ({ ...prev, [cell.id]: 'perfect' }))
                setScore((s) => s + 15)
            } else if (delta >= 0 && delta < YELLOW_DURATION) {
                setFeedbackMap((prev) => ({ ...prev, [cell.id]: 'tooSoon' }))
                setScore((s) => s + 5)
            } else {
                setFeedbackMap((prev) => ({ ...prev, [cell.id]: 'miss' }))
                setScore((s) => s - 3)
            }

            setTimeout(() => {
                setFeedbackMap((prev) => {
                    const updated = { ...prev }
                    delete updated[cell.id]
                    return updated
                })
            }, YELLOW_DURATION + GREEN_DURATION)
        }
    }

    useEffect(() => {
        if (phase === 'prepareAttack') {
            setTaps([])
            setFeedbackMap({})
            setScore(0)
        }
        if (phase === 'attack') {
            attackTimeRef.current = performance.now()
        }
        if (phase === 'defend') {
            defendTimeRef.current = performance.now()
        }
    }, [phase])

    if (phase !== 'attack' && phase !== 'defend') return null

    return (
        <div
            className="absolute inset-0 grid z-20"
            style={{
                gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
                gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            }}
        >
            {grid.cells.map((cell) => {
                const now = performance.now()
                const isTapped = vfx[cell.id]
                const feedback = feedbackMap[cell.id]

                const defenders = taps.filter((t) => t.id === cell.id)
                const overlays = defenders.map((tap, i) => {
                    const tapOffset = tap.time - attackTimeRef.current
                    const delta = now - defendTimeRef.current - tapOffset
                    if (delta < 0 || delta > YELLOW_DURATION + GREEN_DURATION) return null

                    const showYellow = delta >= 0 && delta < YELLOW_DURATION
                    const showGreen = delta >= YELLOW_DURATION && delta < YELLOW_DURATION + GREEN_DURATION

                    const radius = 20
                    const circumference = 2 * Math.PI * radius
                    const progress = Math.min(delta / YELLOW_DURATION, 1)
                    const strokeDashoffset = circumference * (1 - progress)

                    return (
                        <div
                            key={i}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            {/* Green filled bg after yellow completes */}
                            {showGreen && (
                                <>
                                    <div className="absolute inset-0 bg-green-400/40 animate-fade-out rounded-none" />
                                    <svg width="48" height="48" className="z-10 animate-fade-out">
                                        <g transform="rotate(-90 24 24)">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r={radius}
                                                fill="rgb(74 222 128)" // Tailwind's green-400
                                                stroke="none"
                                                strokeWidth="4"
                                            />
                                        </g>
                                    </svg>
                                </>
                            )}

                            {showYellow && (
                                <>
                                    <div className="absolute inset-0 bg-yellow-400/10 animate-fade-in rounded-none" />
                                    <svg width="48" height="48" className="z-10">
                                        <g transform="rotate(-90 24 24)">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r={radius}
                                                fill="none"
                                                stroke="rgba(255,255,255,0.08)"
                                                strokeWidth="4"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r={radius}
                                                fill="none"
                                                stroke="#facc15"
                                                strokeWidth="4"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                                style={{
                                                    transition: 'stroke-dashoffset 0.05s linear',
                                                }}
                                            />
                                        </g>
                                    </svg>
                                </>
                            )}

                        </div>
                    )
                })

                return (
                    <div
                        key={cell.id}
                        onClick={() => handleTap(cell)}
                        className={clsx(
                            'relative w-full h-full rounded-none border border-white/20 bg-transparent transition-colors'
                        )}
                    >
                        {isTapped && (
                            <div className="absolute inset-0 bg-red-500/30 animate-ping pointer-events-none" />
                        )}

                        {feedback && (
                            <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none">
                                <div
                                    className={clsx(
                                        'text-2xl font-bold animate-fade-out',
                                        feedback === 'perfect' && 'text-green-400',
                                        feedback === 'tooSoon' && 'text-yellow-400',
                                        feedback === 'miss' && 'text-red-400'
                                    )}
                                >
                                    {feedback === 'perfect' && 'Perfect!'}
                                    {feedback === 'tooSoon' && 'Too Soon'}
                                    {feedback === 'miss' && 'Miss'}
                                </div>
                            </div>
                        )}

                        {overlays}
                    </div>
                )
            })}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-lg font-mono opacity-80">
                Score: {score}
            </div>
        </div>
    )
}
