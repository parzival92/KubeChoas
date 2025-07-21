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
    activeEvents,
    terminalHistory 
  } = useGameStore();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
            onClick={() => setShowScoreModal(true)}
          >
            📊 View Score Details
          </button>
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded text-sm transition-colors"
            onClick={() => setShowHistoryModal(true)}
          >
            📋 View Game History
          </button>
          <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded text-sm transition-colors"
            onClick={() => setShowSettingsModal(true)}
          >
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
      {/* Score Details Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowScoreModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-green-400 text-center">Score Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-300">Total Score:</span>
                <span className="font-bold text-green-400">{score.totalScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">MTTR:</span>
                <span className="font-bold text-blue-400">{score.mttr.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Incidents Resolved:</span>
                <span className="font-bold text-yellow-400">{score.incidentsResolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Commands Used:</span>
                <span className="font-bold text-purple-400">{score.commandsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Proactive Checks:</span>
                <span className="font-bold text-pink-400">{score.proactiveChecks}</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                onClick={() => setShowScoreModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Game History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowHistoryModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-purple-400 text-center">Game History</h3>
            <div className="bg-black rounded p-4 mb-4 max-h-96 overflow-y-auto border border-gray-700 text-green-400 font-mono text-sm">
              {terminalHistory.length === 0 ? (
                <div className="text-gray-400">No history yet.</div>
              ) : (
                terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))
              )}
            </div>
            <div className="mt-4 text-center">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Game Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowSettingsModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-yellow-400 text-center">Game Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Chaos Event Interval</span>
                <span className="text-white font-mono">30s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Difficulty</span>
                <span className="text-white font-mono">Normal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sound Notifications</span>
                <span className="text-white font-mono">On</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Theme</span>
                <span className="text-white font-mono">Dark</span>
              </div>
              <div className="text-xs text-gray-400 text-center mt-4">(Settings are currently placeholders. Customization coming soon!)</div>
            </div>
            <div className="mt-6 text-center">
              <button
                className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors"
                onClick={() => setShowSettingsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 