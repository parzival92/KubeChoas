'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';

export default function GameControls() {
  const { 
    isGameRunning, 
    startGame, 
    stopGame, 
    gameStartTime, 
    score,
    activeEvents 
  } = useGameStore();
  
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second when game is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGameRunning && gameStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameStartTime.getTime()) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameRunning, gameStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${minsStr}:${secsStr}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Game Controls</h2>
      
      {/* Game Status */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Game Status</span>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isGameRunning 
              ? 'bg-green-600 text-green-100' 
              : 'bg-gray-600 text-gray-300'
          }`}>
            {isGameRunning ? 'RUNNING' : 'STOPPED'}
          </div>
        </div>
        
        {isGameRunning && (
          <div className="text-sm text-gray-300">
            <div>Elapsed Time: {formatTime(elapsedTime)}</div>
            <div>Active Events: {activeEvents.length}</div>
            <div>Total Score: {score.totalScore}</div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="space-y-3">
        {!isGameRunning ? (
          <button
            onClick={startGame}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            🚀 Start Chaos Game
          </button>
        ) : (
          <button
            onClick={stopGame}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            ⏹️ Stop Game
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-white">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors">
            📊 View Score Details
          </button>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm transition-colors">
            📋 View Game History
          </button>
          <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm transition-colors">
            ⚙️ Game Settings
          </button>
        </div>
      </div>

      {/* Game Tips */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-400">💡 Game Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Use &quot;kubectl get pods&quot; to check pod status</li>
          <li>• Use &quot;kubectl logs &lt;pod&gt;&quot; to investigate issues</li>
          <li>• Monitor the dashboard for real-time updates</li>
          <li>• Resolve incidents quickly to improve your score</li>
        </ul>
      </div>

      {/* Chaos Events Info */}
      <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-red-400">💥 Chaos Events</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>• <strong>Pod Crashes:</strong> Check logs and restart pods</div>
          <div>• <strong>High CPU:</strong> Monitor resource usage</div>
          <div>• <strong>DNS Failures:</strong> Check service connectivity</div>
          <div>• <strong>Service Down:</strong> Verify endpoints and routing</div>
        </div>
      </div>
    </div>
  );
} 