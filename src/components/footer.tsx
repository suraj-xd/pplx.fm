"use client";

import styles from "./footer.module.css";

function Footer() {
  return (
    <div className={styles.footer + " opacity-50"}>
      <div className={styles.footerContent}>
        <div className={styles.leftSection}>
          <span>Hosted on </span>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Vercel
          </a>
        </div>
        <div className={styles.rightSection}>
          <span>Ideated with </span>
          <a
          href="https://v0.app/chat/retro-ai-interface-ljDDFEDpwnT"
          target="_blank"
          >

          <svg
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 24 24"
            className={styles.icon}
            >
            <path
              clipRule="evenodd"
              d="M14.252 8.25h5.624c.088 0 .176.006.26.018l-5.87 5.87a1.889 1.889 0 01-.019-.265V8.25h-2.25v5.623a4.124 4.124 0 004.125 4.125h5.624v-2.25h-5.624c-.09 0-.179-.006-.265-.018l5.874-5.875a1.9 1.9 0 01.02.27v5.623H24v-5.624A4.124 4.124 0 0019.876 6h-5.624v2.25zM0 7.5v.006l7.686 9.788c.924 1.176 2.813.523 2.813-.973V7.5H8.25v6.87L2.856 7.5H0z"
              ></path>
          </svg>
              </a>
          <span> by </span>
          <a
            href="https://github.com/suraj-xd"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            surajgaud
          </a>
        </div>
      </div>
    </div>
  );
}

export { Footer };