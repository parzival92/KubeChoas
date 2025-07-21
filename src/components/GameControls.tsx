'use client';

import { useGameStore } from '@/store/gameStore';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Info, Flame, Settings, History, BarChart2, Play, StopCircle } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
    <Card className="bg-gray-900/80 backdrop-blur-md shadow-2xl border border-emerald-900/30 rounded-2xl p-8">
      <h2 className="text-2xl font-extrabold mb-6 text-emerald-400 flex items-center gap-2">
        <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
        Game Controls
      </h2>
      {/* Game Status */}
      <div className="mb-6 p-4 bg-gray-800/80 rounded-xl flex items-center justify-between shadow-inner border border-gray-700">
        <span className="text-white font-medium">Game Status</span>
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${
          isGameRunning 
            ? 'bg-emerald-600/80 text-emerald-100 border-emerald-500 animate-pulse' 
            : 'bg-gray-700 text-gray-300 border-gray-600'
        }`}>
          {isGameRunning ? <span className="flex items-center gap-1"><Play className="w-4 h-4" /> RUNNING</span> : <span className="flex items-center gap-1"><StopCircle className="w-4 h-4" /> STOPPED</span>}
        </div>
      </div>
      {isGameRunning && (
        <div className="text-sm text-gray-300 mb-6 flex gap-6">
          <div>Elapsed: <span className="font-mono text-emerald-300">{formatTime(elapsedTime)}</span></div>
          <div>Events: <span className="font-mono text-red-400">{activeEvents.length}</span></div>
          <div>Score: <span className="font-mono text-blue-400">{score.totalScore}</span></div>
        </div>
      )}
      {/* Control Buttons */}
      <div className="space-y-3 mb-8">
        {!isGameRunning ? (
          <Button onClick={startGame} className="w-full font-bold text-lg py-3 bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg" variant="default">
            <Play className="inline-block mr-2" /> Start Chaos Game
          </Button>
        ) : (
          <Button onClick={stopGame} className="w-full font-bold text-lg py-3 bg-red-600 hover:bg-red-700 transition-colors shadow-lg" variant="destructive">
            <StopCircle className="inline-block mr-2" /> Stop Game
          </Button>
        )}
      </div>
      {/* Quick Actions */}
      <div className="mt-2">
        <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" /> Quick Actions</h3>
        <TooltipProvider>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-2" variant="secondary" onClick={() => setShowScoreModal(true)}>
                  <BarChart2 className="w-5 h-5" /> View Score Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>See your score breakdown and MTTR</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-2" variant="secondary" onClick={() => setShowHistoryModal(true)}>
                  <History className="w-5 h-5" /> View Game History
                </Button>
              </TooltipTrigger>
              <TooltipContent>See all commands and outputs</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-2" variant="secondary" onClick={() => setShowSettingsModal(true)}>
                  <Settings className="w-5 h-5" /> Game Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Adjust game settings</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {/* Chaos Events Info */}
      <div className="mt-6 p-4 bg-red-900/30 border border-red-500/30 rounded-xl shadow-inner">
        <h3 className="text-lg font-semibold mb-2 text-red-400 flex items-center gap-2"><Flame className="w-5 h-5 animate-pulse" /> Chaos Events</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>• <strong>Pod Crashes:</strong> Check logs and restart pods</div>
          <div>• <strong>High CPU:</strong> Monitor resource usage</div>
          <div>• <strong>DNS Failures:</strong> Check service connectivity</div>
          <div>• <strong>Service Down:</strong> Verify endpoints and routing</div>
        </div>
      </div>
      {/* Score Details Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-md bg-gray-900 border border-emerald-900/40 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 text-center flex items-center gap-2 justify-center"><BarChart2 className="w-6 h-6" /> Score Details</DialogTitle>
          </DialogHeader>
          <div className="divide-y divide-gray-700">
            <div className="flex justify-between text-lg py-2">
              <span className="text-gray-300">Total Score:</span>
              <span className="font-bold text-emerald-400">{score.totalScore}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-300">MTTR:</span>
              <span className="font-bold text-blue-400">{score.mttr.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-300">Incidents Resolved:</span>
              <span className="font-bold text-yellow-400">{score.incidentsResolved}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-300">Commands Used:</span>
              <span className="font-bold text-purple-400">{score.commandsUsed}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-300">Proactive Checks:</span>
              <span className="font-bold text-pink-400">{score.proactiveChecks}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Game History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border border-purple-900/40 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-center flex items-center gap-2 justify-center"><History className="w-6 h-6" /> Game History</DialogTitle>
          </DialogHeader>
          <div className="bg-black rounded p-4 mb-4 max-h-96 overflow-y-auto border border-gray-700 text-emerald-400 font-mono text-sm">
            {terminalHistory.length === 0 ? (
              <div className="text-gray-400">No history yet.</div>
            ) : (
              terminalHistory.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap">{line}</div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Game Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md bg-gray-900 border border-yellow-900/40 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-center flex items-center gap-2 justify-center"><Settings className="w-6 h-6" /> Game Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 divide-y divide-gray-700">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Chaos Event Interval</span>
              <span className="text-white font-mono">30s</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Difficulty</span>
              <span className="text-white font-mono">Normal</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Sound Notifications</span>
              <span className="text-white font-mono">On</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Theme</span>
              <span className="text-white font-mono">Dark</span>
            </div>
            <div className="text-xs text-gray-400 text-center mt-4">(Settings are currently placeholders. Customization coming soon!)</div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 