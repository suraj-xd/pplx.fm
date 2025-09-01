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
    onYouTubeIframeAPIReady: () => void
  }
}

export default function YouTubeLivePlayer({ videoId, className = '', playerRef: externalPlayerRef, onPlayingChange, onReady }: YouTubeLivePlayerProps) {
  const internalPlayerRef = useRef<any>(null)
  const playerRef = externalPlayerRef || internalPlayerRef
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  const initPlayer = () => {
    if (!window.YT || !containerRef.current) return

    const iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    const player = new window.YT.Player(containerRef.current, {
      videoId: videoId,
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: iOSDevice ? 0 : 1, // Disable autoplay on iOS
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
        playsinline: 1, // Critical for iOS
        disablekb: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        allow: 'autoplay'
      },
      events: {
        onReady: (event: any) => {
          // Store the player instance in both refs
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
            // On iOS, don't show overlay - rely on the play button in header
            console.log('iOS detected - player ready for manual control')
            // Don't set showPrompt on iOS since we have the header button
          } else {
            // Non-iOS devices can attempt autoplay
            event.target.playVideo()
            setIsPlaying(true)
            
            // Try to unmute after a delay for non-iOS
            setTimeout(() => {
              if (event.target.unMute && !iOSDevice) {
                event.target.unMute()
                console.log('Attempting to unmute...')
              }
            }, 1000)
          }
        },
        onStateChange: (event: any) => {
          console.log('YouTube player state changed:', event.data);
          if (event.data === window.YT.PlayerState.PLAYING) {
            console.log('Player is now playing');
            setIsPlaying(true)
            onPlayingChange?.(true)
            // Check mute state
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
    
    // Store player immediately after creation
    playerRef.current = player
    if (externalPlayerRef) {
      externalPlayerRef.current = player
    }
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



  // Ensure autoplay starts when player is ready
  useEffect(() => {
    if (!isReady || !playerRef.current) return
    
    const iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    
    // Only attempt autoplay on non-iOS devices
    if (!iOSDevice) {
      const checkAndPlay = setTimeout(() => {
        if (playerRef.current && playerRef.current.getPlayerState) {
          const state = playerRef.current.getPlayerState()
          if (state !== window.YT?.PlayerState?.PLAYING) {
            playerRef.current.mute()
            playerRef.current.playVideo()
            console.log('Attempting autoplay...')
          }
        }
      }, 500)

      return () => {
        clearTimeout(checkAndPlay)
      }
    }
  }, [isReady])

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
