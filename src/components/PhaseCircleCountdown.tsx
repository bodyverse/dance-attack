import React from 'react'
import { useGame } from '../context/GameContext'
import gameTimeline from '../data/gameTimeline.json'
import clsx from 'clsx'

const RADIUS = 48
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export const PhaseCircleCountdown: React.FC = () => {
    const { elapsed, phase } = useGame()
    const currentSeconds = elapsed / 1000
    const prepareDuration = gameTimeline.prepareDuration
    const eventDuration = gameTimeline.eventDuration
    const events = gameTimeline.events

    let label = ''
    let timeLeft = 0
    let totalDuration = 0
    let color = 'white'

    for (const event of events) {
        const isAttack = event.type === 'attack'
        const eventType = isAttack ? 'attack' : 'defend'
        const prepareType = isAttack ? 'prepareAttack' : 'prepareDefend'

        const prepareStart = event.start - prepareDuration
        const eventEnd = event.start + eventDuration

        if (
            phase === prepareType &&
            currentSeconds >= prepareStart &&
            currentSeconds < event.start
        ) {
            label = 'Prepare'
            color = 'yellow'
            totalDuration = prepareDuration
            timeLeft = event.start - currentSeconds
            break
        }

        if (
            phase === eventType &&
            currentSeconds >= event.start &&
            currentSeconds < eventEnd
        ) {
            label = isAttack ? 'Attack' : 'Defend'
            color = isAttack ? 'red' : 'blue'
            totalDuration = eventDuration
            timeLeft = eventEnd - currentSeconds
            break
        }
    }

    if (totalDuration === 0 || timeLeft < 0) return null

    const strokeDashoffset = CIRCUMFERENCE * (1 - timeLeft / totalDuration)
    const colorMap: Record<string, string> = {
        red: '#ef4444',
        yellow: '#facc15',
        blue: '#3b82f6',
    }

    return (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-sm rounded-full p-2 shadow-lg z-40">
            <div className="relative w-[120px] h-[120px] opacity-90">
                {/* Pulsing ring */}
                <div
                    className={clsx(
                        'absolute w-[160px] h-[160px] rounded-full -top-5 -left-5 animate-ping',
                        {
                            'bg-red-500/20': color === 'red',
                            'bg-yellow-400/20': color === 'yellow',
                            'bg-blue-500/20': color === 'blue',
                        }
                    )}
                />

                {/* SVG circle */}
                <svg width="120" height="120" className="relative z-10">
                    <g transform="rotate(-90 60 60)">
                        <circle
                            cx="60"
                            cy="60"
                            r={RADIUS}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="8"
                        />
                        <circle
                            cx="60"
                            cy="60"
                            r={RADIUS}
                            fill="none"
                            stroke={colorMap[color]}
                            strokeWidth="8"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{
                                transition: 'stroke-dashoffset 0.1s linear',
                            }}
                        />
                    </g>
                </svg>

                {/* Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-center pointer-events-none z-20">
                    <div
                        className={clsx('text-xl font-medium tracking-wider', {
                            'text-red-400': color === 'red',
                            'text-yellow-400': color === 'yellow',
                            'text-blue-400': color === 'blue',
                        })}
                    >
                        {label}
                    </div>
                    <div className="text-sm opacity-70">{timeLeft.toFixed(1)}s</div>
                </div>
            </div>
        </div>
    )
}
