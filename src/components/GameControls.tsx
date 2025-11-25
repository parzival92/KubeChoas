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
    <Card className="bg-[#0d1117]/90 backdrop-blur-xl shadow-2xl border border-white/10 rounded-2xl p-8 h-full">
      <h2 className="text-2xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
        <Flame className="w-6 h-6 text-emerald-400 animate-pulse" />
        Game Controls
      </h2>
      {/* Game Status */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl flex items-center justify-between border border-white/5 backdrop-blur-sm">
        <span className="text-gray-200 font-medium">Game Status</span>
        <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm border ${isGameRunning
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse'
            : 'bg-gray-700/50 text-gray-400 border-gray-600'
          }`}>
          {isGameRunning ? <span className="flex items-center gap-1"><Play className="w-4 h-4" /> RUNNING</span> : <span className="flex items-center gap-1"><StopCircle className="w-4 h-4" /> STOPPED</span>}
        </div>
      </div>
      {isGameRunning && (
        <div className="text-sm text-gray-300 mb-6 flex gap-6 justify-center bg-white/5 p-3 rounded-lg border border-white/5">
          <div>Time: <span className="font-mono text-emerald-300 font-bold">{formatTime(elapsedTime)}</span></div>
          <div>Events: <span className="font-mono text-red-400 font-bold">{activeEvents.length}</span></div>
          <div>Score: <span className="font-mono text-blue-400 font-bold">{score.totalScore}</span></div>
        </div>
      )}
      {/* Control Buttons */}
      <div className="space-y-3 mb-8">
        {!isGameRunning ? (
          <Button onClick={startGame} className="w-full font-bold text-lg py-6 bg-emerald-600 hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/20" variant="default">
            <Play className="inline-block mr-2 w-6 h-6" /> Start Chaos Game
          </Button>
        ) : (
          <Button onClick={stopGame} className="w-full font-bold text-lg py-6 bg-red-600 hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-400/20" variant="destructive">
            <StopCircle className="inline-block mr-2 w-6 h-6" /> Stop Game
          </Button>
        )}
      </div>
      {/* Quick Actions */}
      <div className="mt-auto">
        <h3 className="text-lg font-semibold mb-3 text-gray-200 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-400" /> Quick Actions</h3>
        <TooltipProvider>
          <div className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-3 justify-start bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300" variant="secondary" onClick={() => setShowScoreModal(true)}>
                  <BarChart2 className="w-5 h-5 text-blue-400" /> View Score Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>See your score breakdown and MTTR</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-3 justify-start bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300" variant="secondary" onClick={() => setShowHistoryModal(true)}>
                  <History className="w-5 h-5 text-purple-400" /> View Game History
                </Button>
              </TooltipTrigger>
              <TooltipContent>See all commands and outputs</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="w-full flex items-center gap-3 justify-start bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300" variant="secondary" onClick={() => setShowSettingsModal(true)}>
                  <Settings className="w-5 h-5 text-yellow-400" /> Game Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent>Adjust game settings</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {/* Score Details Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-emerald-400 text-center flex items-center gap-2 justify-center text-2xl"><BarChart2 className="w-6 h-6" /> Score Details</DialogTitle>
          </DialogHeader>
          <div className="divide-y divide-white/10">
            <div className="flex justify-between text-lg py-3">
              <span className="text-gray-400">Total Score:</span>
              <span className="font-bold text-emerald-400 text-xl">{score.totalScore}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">MTTR:</span>
              <span className="font-bold text-blue-400">{score.mttr.toFixed(1)}s</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Incidents Resolved:</span>
              <span className="font-bold text-yellow-400">{score.incidentsResolved}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Commands Used:</span>
              <span className="font-bold text-purple-400">{score.commandsUsed}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-gray-400">Proactive Checks:</span>
              <span className="font-bold text-pink-400">{score.proactiveChecks}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Game History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-2xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-center flex items-center gap-2 justify-center text-2xl"><History className="w-6 h-6" /> Game History</DialogTitle>
          </DialogHeader>
          <div className="bg-black/50 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto border border-white/10 text-emerald-400 font-mono text-sm custom-scrollbar">
            {terminalHistory.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">No history yet. Start playing!</div>
            ) : (
              terminalHistory.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap border-b border-white/5 py-1 last:border-0">{line}</div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Game Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-md bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-center flex items-center gap-2 justify-center text-2xl"><Settings className="w-6 h-6" /> Game Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 divide-y divide-white/10">
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Chaos Event Interval</span>
              <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">30s</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Difficulty</span>
              <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">Normal</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Sound Notifications</span>
              <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded">On</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Theme</span>
              <span className="text-purple-400 font-mono bg-purple-500/10 px-2 py-1 rounded">Cyberpunk</span>
            </div>
            <div className="text-xs text-gray-500 text-center mt-4 italic">(Settings are currently placeholders. Customization coming soon!)</div>
          </div>
        </DialogContent>
      </Dialog>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </Card>
  );
}