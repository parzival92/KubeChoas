'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function GameLoop() {
  const { isGameRunning, generateRandomChaosEvent, activeEvents } = useGameStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isGameRunning) {
      // Generate chaos events every 30 seconds
      intervalRef.current = setInterval(() => {
        generateRandomChaosEvent();
      }, 30000); // 30 seconds

      // Generate first event after 10 seconds
      const initialEventTimeout = setTimeout(() => {
        generateRandomChaosEvent();
      }, 10000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        clearTimeout(initialEventTimeout);
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isGameRunning, generateRandomChaosEvent]);

  // Show notification when new events occur
  useEffect(() => {
    if (activeEvents.length > 0) {
      const latestEvent = activeEvents[activeEvents.length - 1];
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('KubeChaos Alert', {
          body: `${latestEvent.type.toUpperCase()}: ${latestEvent.description}`,
          icon: '/favicon.ico'
        });
      }

      // Play sound effect (if we had audio files)
      // const audio = new Audio('/alert.mp3');
      // audio.play().catch(() => {}); // Ignore errors if audio fails
    }
  }, [activeEvents]);

  return null; // This component doesn't render anything
} 