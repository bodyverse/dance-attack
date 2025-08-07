import React from 'react'
import { useGame } from '../context/GameContext'

export const VideoBackground: React.FC = () => {
    const { videoRef } = useGame()

    return (
        <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-[-1]"
            src={`${import.meta.env.BASE_URL}bg.mp4`}
            playsInline
            muted={false}        // Make sure this is false if you want audio
            controls={false}
            preload="auto"
        />
    )
}
