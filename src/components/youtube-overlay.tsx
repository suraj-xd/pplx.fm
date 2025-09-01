'use client'

import { useEffect, useState } from 'react'

interface YouTubeOverlayProps {
  videoId: string
  className?: string
}

export default function YouTubeOverlay({ videoId, className = '' }: YouTubeOverlayProps) {
  const [screenDimensions, setScreenDimensions] = useState({
    width: 0,
    height: 0,
    top: 0,
    left: 0
  })

  useEffect(() => {
    const calculateScreenPosition = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      const macWidth = Math.min(viewportWidth * 0.8, viewportHeight * 0.8)
      const macHeight = macWidth
      
      const screenWidthRatio = 0.365
      const screenHeightRatio = 0.275
      const screenTopRatio = 0.155
      const screenLeftRatio = 0.318
      
      setScreenDimensions({
        width: macWidth * screenWidthRatio,
        height: macWidth * screenHeightRatio,
        top: macWidth * screenTopRatio,
        left: macWidth * screenLeftRatio
      })
    }

    calculateScreenPosition()
    window.addEventListener('resize', calculateScreenPosition)
    
    return () => window.removeEventListener('resize', calculateScreenPosition)
  }, [])

  return (
    <>
      <div 
        className={`${className} pointer-events-none`}
        style={{
          width: `${screenDimensions.width}px`,
          height: `${screenDimensions.height}px`,
          top: `${screenDimensions.top}px`,
          left: `${screenDimensions.left}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&fs=0&cc_load_policy=0&iv_load_policy=3&autohide=1&playsinline=1&disablekb=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>
      <div 
        className="absolute pointer-events-auto"
        style={{
          width: `${screenDimensions.width}px`,
          height: `${screenDimensions.height}px`,
          top: `${screenDimensions.top}px`,
          left: `${screenDimensions.left}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 11,
          background: 'transparent'
        }}
        onClick={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      />
    </>
  )
}
