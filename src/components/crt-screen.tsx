"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./crt-screen.module.css";
import YouTubeLivePlayer from "./youtube-live-player";
import PplxInput from "./pplx-input";
import { Footer } from "./footer";

interface MenuItem {
  label: string;
  href?: string;
}

interface CRTScreenProps {
  children?: React.ReactNode;
  autoTurnOn?: boolean;
  turnOnDelay?: number;
  liveVideoId?: string;
}

export default function CRTScreen({
  children,
  autoTurnOn = true,
  turnOnDelay = 1000,
  liveVideoId,
}: CRTScreenProps) {
  const [isOn, setIsOn] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoTurnOn) {
      const timer = setTimeout(() => {
        setIsOn(true);
      }, turnOnDelay);
      return () => clearTimeout(timer);
    }
  }, [autoTurnOn, turnOnDelay]);

  useEffect(() => {
    if (!canvasRef.current || !isOn) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size - adjust for mobile screens
    const isMobile = window.innerWidth <= 768;
    canvas.width = isMobile ? window.innerWidth / 4 : window.innerWidth / 2;
    canvas.height = isMobile ? window.innerHeight / 4 : window.innerHeight / 2;

    // Generate CRT noise
    const snow = (ctx: CanvasRenderingContext2D) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const d = ctx.createImageData(w, h);
      const b = new Uint32Array(d.data.buffer);
      const len = b.length;

      for (let i = 0; i < len; i++) {
        b[i] = ((255 * Math.random()) | 0) << 24;
      }

      ctx.putImageData(d, 0, 0);
    };

    const animate = () => {
      snow(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();
    console.log("CRT noise animation started");

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOn]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const isMobile = window.innerWidth <= 768;
        canvasRef.current.width = isMobile ? window.innerWidth / 4 : window.innerWidth / 3;
        canvasRef.current.height = isMobile ? (window.innerWidth * 0.5625) / 4 : (window.innerWidth * 0.5625) / 3;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (textRef.current && textRef.current.children.length === 1) {
      const originalSpan = textRef.current.firstElementChild;
      if (originalSpan) {
        for (let i = 0; i < 4; i++) {
          const span = originalSpan.cloneNode(true) as HTMLElement;
          textRef.current.appendChild(span);
        }
      }
    }
  }, []);

  return (
    <main className={`${styles.scanlines} ${isOn ? styles.on : styles.off}`}>
      <div className={styles.screen}>
        <canvas id="canvas" ref={canvasRef} className={styles.picture} />

        <div className={styles.overlay}>
          <div className={styles.text} ref={textRef}>
            <span>pplx.fm</span>
          </div>
            {liveVideoId && (
              <YouTubeLivePlayer videoId={liveVideoId} className="" />
            )}
          {/* <div className={styles.menu}>
            <header>Main Menu</header>
            <ul>
              {menuItems.map((item, index) => (
                <li 
                  key={index} 
                  className={index === activeMenuIndex ? styles.active : ''}
                >
                  <a href={item.href || '#'}>{item.label}</a>
                </li>
              ))}
            </ul>
            <footer>
              <div className={styles.key}>
                Exit: <span>1</span>
              </div>
              <div className={styles.key}>
                Select: <span>2</span>
              </div>
            </footer>
          </div> */}
          {children && <div className={styles.customContent}>{children}</div>}
          {/* YouTube video behind CRT effects */}
          <Footer />
        </div>
      </div>
    </main>
  );
}
