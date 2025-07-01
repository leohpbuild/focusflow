
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, Play, Pause, RotateCcw, Settings, Settings2 as FullResetIcon } from 'lucide-react';

const DEFAULT_WORK_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

type SessionType = 'work' | 'break';

interface PomodoroTimerProps {
  onWorkSessionStart?: () => void;
}

export default function PomodoroTimer({ onWorkSessionStart }: PomodoroTimerProps) {
  const [editableWorkMinutes, setEditableWorkMinutes] = useState(String(DEFAULT_WORK_MINUTES));
  const [editableBreakMinutes, setEditableBreakMinutes] = useState(String(DEFAULT_BREAK_MINUTES));
  
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_MINUTES * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const getDurationInSeconds = useCallback((type: SessionType, workMinsStr: string, breakMinsStr: string) => {
    const minutesStr = type === 'work' ? workMinsStr : breakMinsStr;
    const defaultMinutes = type === 'work' ? DEFAULT_WORK_MINUTES : DEFAULT_BREAK_MINUTES;
    let parsedMinutes = parseInt(minutesStr, 10);
    
    return (isNaN(parsedMinutes) || parsedMinutes <= 0) 
      ? defaultMinutes * 60 
      : parsedMinutes * 60;
  }, []);

  const currentWorkDurationSec = useCallback(() => {
    return getDurationInSeconds('work', editableWorkMinutes, editableBreakMinutes);
  }, [editableWorkMinutes, editableBreakMinutes, getDurationInSeconds]);

  const currentBreakDurationSec = useCallback(() => {
    return getDurationInSeconds('break', editableWorkMinutes, editableBreakMinutes);
  }, [editableWorkMinutes, editableBreakMinutes, getDurationInSeconds]);


  const resetCurrentInterval = useCallback((currentSessionType: SessionType) => {
    setIsActive(false);
    setTimeLeft(currentSessionType === 'work' ? currentWorkDurationSec() : currentBreakDurationSec());
  }, [currentWorkDurationSec, currentBreakDurationSec]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      
      if (sessionType === 'work') {
        setCompletedWorkSessions(prev => prev + 1);
        setSessionType('break');
        setTimeLeft(currentBreakDurationSec());
      } else { 
        setSessionType('work');
        setTimeLeft(currentWorkDurationSec());
        
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, sessionType, currentWorkDurationSec, currentBreakDurationSec]);

  const toggleTimer = () => {
    if (!isActive && sessionType === 'work' && timeLeft === currentWorkDurationSec()) {
      if (onWorkSessionStart) {
        onWorkSessionStart();
      }
    }
    setIsActive(!isActive);
  };

  const handleResetCurrentIntervalClick = () => {
    resetCurrentInterval(sessionType);
  };
  
  const handleSkipSession = () => {
    setIsActive(false); 
    if (sessionType === 'work') {
      setSessionType('break');
      setTimeLeft(currentBreakDurationSec());
    } else { 
      setSessionType('work');
      setTimeLeft(currentWorkDurationSec());
      
    }
  };

  const handleFullReset = () => {
    setIsActive(false);
    setSessionType('work');
    setEditableWorkMinutes(String(DEFAULT_WORK_MINUTES));
    setEditableBreakMinutes(String(DEFAULT_BREAK_MINUTES));
    setTimeLeft(DEFAULT_WORK_MINUTES * 60);
    setCompletedWorkSessions(0);
    
    setShowSettings(false);
  };

  const handleWorkDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWorkMinutes = e.target.value;
    setEditableWorkMinutes(newWorkMinutes);
    if (!isActive && sessionType === 'work') {
        const newTime = parseInt(newWorkMinutes, 10);
        setTimeLeft((isNaN(newTime) || newTime <=0) ? DEFAULT_WORK_MINUTES * 60 : newTime * 60);
    }
  };

  const handleBreakDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBreakMinutes = e.target.value;
    setEditableBreakMinutes(newBreakMinutes);
    if (!isActive && sessionType === 'break') {
        const newTime = parseInt(newBreakMinutes, 10);
        setTimeLeft((isNaN(newTime) || newTime <=0) ? DEFAULT_BREAK_MINUTES * 60 : newTime * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Timer className="h-6 w-6 mr-2 text-primary" />
            <CardTitle className="font-headline text-2xl text-primary">
              Pomodoro
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Completed: {completedWorkSessions}
            </p>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Timer settings"
              className="text-muted-foreground hover:text-primary"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 text-center flex flex-col items-center justify-center">
         <p className="text-base font-medium text-muted-foreground mb-1">
          {sessionType === 'work' ? 'Work Time' : 'Short Break'}
        </p>
        
        {showSettings && (
          <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-xs border-y py-4 my-2 border-border/50">
            <div>
              <Label htmlFor="work-duration" className="text-sm font-medium text-muted-foreground">Work (min)</Label>
              <Input 
                id="work-duration" 
                type="number" 
                value={editableWorkMinutes} 
                onChange={handleWorkDurationChange}
                disabled={isActive}
                min="1"
                className="mt-1 text-center"
              />
            </div>
            <div>
              <Label htmlFor="break-duration" className="text-sm font-medium text-muted-foreground">Break (min)</Label>
              <Input 
                id="break-duration" 
                type="number" 
                value={editableBreakMinutes} 
                onChange={handleBreakDurationChange}
                disabled={isActive}
                min="1"
                className="mt-1 text-center"
              />
            </div>
          </div>
        )}

        <div className="text-6xl font-bold text-foreground my-4 tabular-nums" aria-live="polite">
          {formatTime(timeLeft)}
        </div>
        <div className="flex space-x-2 mb-2 w-full justify-center flex-wrap">
          <Button 
            onClick={toggleTimer} 
            variant="outline" 
            className="bg-accent text-accent-foreground hover:bg-accent/90 w-28"
            aria-label={isActive ? "Pause timer" : "Start timer"}
          >
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button 
            onClick={handleResetCurrentIntervalClick} 
            variant="outline" 
            className="w-28"
            aria-label="Reset current interval"
            >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>
         <div className="flex space-x-2 mb-4 w-full justify-center">
          <Button 
            onClick={handleSkipSession} 
            variant="link" 
            size="sm"
            className="text-muted-foreground hover:text-primary"
            aria-label={`Skip to ${sessionType === 'work' ? 'Break' : 'Work'}`}
            >
            Skip to {sessionType === 'work' ? 'Break' : 'Work'}
          </Button>
          <Button
            onClick={handleFullReset}
            variant="link"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            aria-label="Reset settings and count"
          >
            <FullResetIcon className="mr-1 h-4 w-4" />
            Full Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
