'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function GameLoop() {
  const { isGameRunning, fetchGameState, generateRandomChaosEvent } = useGameStore();

  // Poll backend for state updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchGameState();
    }, 2000); // Poll every 2 seconds

    // Initial fetch
    fetchGameState();

    return () => clearInterval(pollInterval);
  }, [fetchGameState]);

  // Generate chaos events periodically when game is running
  useEffect(() => {
    if (!isGameRunning) return;

    const chaosInterval = setInterval(() => {
      generateRandomChaosEvent();
    }, 15000); // Generate chaos every 15 seconds

    return () => clearInterval(chaosInterval);
  }, [isGameRunning, generateRandomChaosEvent]);

  return null; // This component doesn't render anything
}