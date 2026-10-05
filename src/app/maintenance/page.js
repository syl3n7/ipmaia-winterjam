"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import styles from './maintenance.module.css';

export default function MaintenancePage() {
  const [status, setStatus] = useState('checking');
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const checkingRef = useRef(false);

  const checkAvailability = useCallback(async () => {
    if (checkingRef.current) return;

    checkingRef.current = true;
    setIsChecking(true);

    try {
      const response = await fetch('/api/health-check', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.status === 'ok') {
        window.location.replace('/');
        return;
      }

      setStatus(result.status === 'maintenance' ? 'maintenance' : 'unavailable');
    } catch {
      setStatus('unavailable');
    } finally {
      checkingRef.current = false;
      setIsChecking(false);
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkAvailability();
    const intervalId = window.setInterval(checkAvailability, 5000);
    return () => window.clearInterval(intervalId);
  }, [checkAvailability]);

  const isUnavailable = status === 'unavailable';
  const statusLabel = status === 'checking'
    ? 'Checking status'
    : isUnavailable
      ? 'Service temporarily unavailable'
      : 'Maintenance in progress';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="WinterJam home">
          <span>IPMAIA</span> WinterJam
        </Link>
        <span className={styles.headerNote}>Game Jam</span>
      </header>

      <main className={styles.main}>
        <section className={styles.content} aria-live="polite" aria-atomic="true">
          <p className={styles.eyebrow}>SCHEDULED MAINTENANCE</p>
          <h1>We&apos;ll be back shortly.</h1>
          <p className={styles.description}>
            We&apos;re performing maintenance to improve the WinterJam website. Service will resume automatically once the work is complete.
          </p>

          <div className={styles.divider} />

          <div className={styles.statusRow}>
            <span className={styles.statusKey}>STATUS</span>
            <span className={styles.statusValue}>
              <span className={`${styles.statusDot} ${isUnavailable ? styles.statusDotMuted : ''}`} />
              {statusLabel}
            </span>
          </div>

          {isUnavailable && (
            <p className={styles.unavailableNote}>We&apos;re unable to reach the site at the moment. Automatic checks will continue.</p>
          )}

          <div className={styles.actions}>
            <button
              className={styles.checkButton}
              type="button"
              onClick={checkAvailability}
              disabled={isChecking}
            >
              <RefreshCw size={16} className={isChecking ? styles.spinning : ''} aria-hidden="true" />
              {isChecking ? 'Checking…' : 'Check now'}
            </button>
            <span className={styles.autoNote}>Automatically checking every 5 seconds</span>
          </div>

          {lastChecked && (
            <p className={styles.lastChecked}>
              Last checked {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Thanks for your patience.</span>
        <a href="https://status.ipmaia-winterjam.pt/" target="_blank" rel="noreferrer">
          Service status <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}
