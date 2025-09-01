'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import styles from './crt-screen.module.css'

interface YouTubeLivePlayerProps {
  videoId: string
  className?: string
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export default function YouTubeLivePlayer({ videoId, className = '' }: YouTubeLivePlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const initPlayer = () => {
    if (!window.YT || !containerRef.current) return

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 1,
        mute: 1, // Start muted for guaranteed autoplay
        controls: 0,
        showinfo: 0,
        rel: 0,
        loop: 1,
        playlist: videoId,
        modestbranding: 1,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 1,
        playsinline: 1,
        disablekb: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        allow: 'autoplay'
      },
      events: {
        onReady: (event: any) => {
          setIsReady(true)
          event.target.mute() // Ensure muted first
          event.target.setVolume(100)
          event.target.playVideo()
          setIsPlaying(true)
          
          // Try to unmute after a delay
          setTimeout(() => {
            if (event.target.unMute) {
              event.target.unMute()
              console.log('Attempting to unmute...')
            }
          }, 1000)
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
            // Try to unmute on every play
            setTimeout(() => {
              if (!hasUserInteracted && playerRef.current) {
                try {
                  playerRef.current.unMute()
                  setHasUserInteracted(true)
                } catch (e) {
                  // User interaction still needed
                }
              }
            }, 100)
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
          }
        },
        onError: (error: any) => {
          console.error('YouTube Player Error:', error)
        }
      }
    })
  }

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    const tryInitPlayer = () => {
      if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
        initPlayer()
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
        // Retry in case the API loads slowly
        retryTimeout = setTimeout(tryInitPlayer, 1000)
      }
    }
    
    tryInitPlayer()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
    }
  }, [videoId])

  const togglePlayPause = () => {
    if (!playerRef.current) return

    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.unMute()
      playerRef.current.playVideo()
      setHasUserInteracted(true)
    }
  }

  const goToLive = () => {
    if (!playerRef.current) return
    
    // For live streams, seek to the live edge
    const duration = playerRef.current.getDuration()
    if (duration) {
      playerRef.current.seekTo(duration, true)
      playerRef.current.playVideo()
      setIsPlaying(true)
    }
  }

  // Ensure autoplay starts when player is ready
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    
    // Force play if not already playing
    const checkAndPlay = setTimeout(() => {
      if (playerRef.current && playerRef.current.getPlayerState) {
        const state = playerRef.current.getPlayerState()
        if (state !== window.YT?.PlayerState?.PLAYING) {
          playerRef.current.mute()
          playerRef.current.playVideo()
          console.log('Forcing autoplay...')
        }
      }
    }, 500)

    // Aggressive unmute attempts
    const attempts = [1000, 1500, 2000, 3000, 5000]
    const timeouts: NodeJS.Timeout[] = []
    let successfulUnmute = false

    attempts.forEach((delay, index) => {
      const timeout = setTimeout(() => {
        if (playerRef.current && !hasUserInteracted && !successfulUnmute) {
          try {
            playerRef.current.unMute()
            playerRef.current.setVolume(100)
            
            // Check if unmute was successful
            if (playerRef.current.isMuted && !playerRef.current.isMuted()) {
              setHasUserInteracted(true)
              successfulUnmute = true
              console.log(`Audio unmuted successfully after ${delay}ms`)
              // Clear remaining timeouts
              timeouts.forEach(t => clearTimeout(t))
            } else if (index === attempts.length - 1) {
              // Last attempt failed, show prompt
              console.log('All unmute attempts failed, showing prompt')
              setShowPrompt(true)
            }
          } catch (e) {
            console.log(`Unmute attempt at ${delay}ms failed`)
            if (index === attempts.length - 1) {
              setShowPrompt(true)
            }
          }
        }
      }, delay)
      timeouts.push(timeout)
    })

    return () => {
      clearTimeout(checkAndPlay)
      timeouts.forEach(t => clearTimeout(t))
    }
  }, [isReady, hasUserInteracted])

  return (
    <>
      <Script 
        src="https://www.youtube.com/iframe_api"
        strategy="lazyOnload"
      />
      
      <div className={styles.videoContainer}>
        <div className={styles.videoPlayer}>
          <div 
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              visibility: 'hidden',
              left: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 1
            }}
          />
        
          {/* Click prompt overlay if audio is blocked */}
          {showPrompt && !hasUserInteracted && (
            <div 
              className={styles.clickPrompt}
              onClick={() => {
                if (playerRef.current) {
                  playerRef.current.unMute()
                  playerRef.current.setVolume(100)
                  playerRef.current.playVideo()
                  setHasUserInteracted(true)
                  setShowPrompt(false)
                }
              }}
            >
              <div className={styles.promptText}>
                <span>Click to enable audio</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
