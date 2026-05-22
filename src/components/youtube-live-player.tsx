'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import styles from './crt-screen.module.css'

interface YouTubeLivePlayerProps {
  videoId: string
  className?: string
  playerRef?: React.MutableRefObject<any>
  onPlayingChange?: (playing: boolean) => void
  onReady?: () => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady?: () => void
  }
}

export default function YouTubeLivePlayer({ videoId, className = '', playerRef: externalPlayerRef, onPlayingChange, onReady }: YouTubeLivePlayerProps) {
  const internalPlayerRef = useRef<any>(null)
  const playerRef = externalPlayerRef || internalPlayerRef
  const containerRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)
  const hasSeekToLiveRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const initPlayer = () => {
    if (hasInitializedRef.current || !window.YT?.Player || !containerRef.current) return
    hasInitializedRef.current = true

    const iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOSDevice)

    try {
      new window.YT.Player(containerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: iOSDevice ? 0 : 1, // Disable autoplay on iOS
          mute: 1, // Muted autoplay is the only reliable autoplay path on production origins
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
          playsinline: 1, // Critical for iOS
          disablekb: 1,
          origin: window.location.origin,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            // Store the ready player instance only after YouTube gives us the controllable target.
            playerRef.current = event.target
            if (externalPlayerRef) {
              externalPlayerRef.current = event.target
            }

            setIsReady(true)
            event.target.mute() // Ensure muted first
            event.target.setVolume(100)

            // Notify parent that player is ready
            onReady?.()

            if (iOSDevice) {
              console.log('iOS detected - player ready for manual control')
            } else {
              event.target.playVideo()
            }
          },
          onStateChange: (event: any) => {
            console.log('YouTube player state changed:', event.data);
            if (event.data === window.YT.PlayerState.PLAYING) {
              console.log('Player is now playing');
              if (!hasSeekToLiveRef.current) {
                hasSeekToLiveRef.current = true
                const duration = event.target.getDuration?.()
                const currentTime = event.target.getCurrentTime?.() || 0
                if (duration && duration > 0 && (duration - currentTime) > 5) {
                  console.log('Seeking to live edge:', duration)
                  event.target.seekTo(duration, true)
                }
              }
              setIsPlaying(true)
              onPlayingChange?.(true)
              if (playerRef.current && playerRef.current.isMuted) {
                setIsMuted(playerRef.current.isMuted())
              }
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              console.log('Player is now paused');
              setIsPlaying(false)
              onPlayingChange?.(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              console.log('Player has ended');
              setIsPlaying(false)
              onPlayingChange?.(false)
            }
          },
          onError: (error: any) => {
            console.error('YouTube Player Error:', error)
          }
        }
      })
    } catch (error) {
      hasInitializedRef.current = false
      console.error('Failed to initialize YouTube player:', error)
    }
  }

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    let cancelled = false;
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    
    const tryInitPlayer = () => {
      if (cancelled || hasInitializedRef.current) return

      if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
        initPlayer()
      } else {
        // Retry in case the API loads slowly
        retryTimeout = setTimeout(tryInitPlayer, 250)
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.()
      tryInitPlayer()
    }
    
    tryInitPlayer()

    return () => {
      cancelled = true
      if (retryTimeout) clearTimeout(retryTimeout)
      if (window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = previousReadyHandler
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
      playerRef.current = null
    }
  }, [videoId])



  useEffect(() => {
    if (!isReady || !playerRef.current) return

    const iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    if (iOSDevice) return

    let attempts = 0
    const maxAttempts = 6
    let timer: NodeJS.Timeout

    const ensurePlaying = () => {
      if (!playerRef.current?.getPlayerState) return
      const state = playerRef.current.getPlayerState()

      if (state !== window.YT?.PlayerState?.PLAYING) {
        playerRef.current.mute()
        const duration = playerRef.current.getDuration?.()
        if (duration && duration > 0) {
          playerRef.current.seekTo(duration, true)
        }
        playerRef.current.playVideo()
        console.log('Autoplay attempt', attempts + 1)
        attempts++
        if (attempts < maxAttempts) {
          timer = setTimeout(ensurePlaying, 1500)
        }
      }
    }

    timer = setTimeout(ensurePlaying, 800)
    return () => clearTimeout(timer)
  }, [isReady])

  return (
    <>
      <Script 
        src="https://www.youtube.com/iframe_api"
        strategy="afterInteractive"
        onLoad={initPlayer}
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
                console.log('Click prompt clicked, starting playback...');
                if (playerRef.current) {
                  playerRef.current.unMute()
                  playerRef.current.setVolume(100)
                  playerRef.current.playVideo()
                  setHasUserInteracted(true)
                  setShowPrompt(false)
                  setIsMuted(false)
                  onPlayingChange?.(true)
                }
              }}
            >
              <div className={styles.promptText}>
                <span>Click to play</span>
              </div>
            </div>
          )}
        </div>
      </div>
      

    </>
  )
}
