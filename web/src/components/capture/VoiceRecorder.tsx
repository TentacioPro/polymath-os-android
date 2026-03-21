'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

type RecordingState = 'idle' | 'recording' | 'paused' | 'review';

interface VoiceRecorderProps {
  onSend?: (blob: Blob, durationMs: number) => void;
  onDiscard?: () => void;
}

export function VoiceRecorder({ onSend, onDiscard }: VoiceRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(0.1));
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrame = useRef<number>(undefined);

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const startVisualization = useCallback(() => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
      setWaveformData((prev) => {
        const next = [...prev.slice(1)];
        next.push(0.1 + avg * 0.9);
        return next;
      });
      animFrame.current = requestAnimationFrame(update);
    };
    update();
  }, []);

  const handleRecord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
      recorder.start();
      mediaRecorder.current = recorder;

      setState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 100), 100);
      startVisualization();
    } catch (err) {
      console.error('Microphone access denied', err);
    }
  }, [startVisualization]);

  const handlePause = useCallback(() => {
    mediaRecorder.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    setState('paused');
  }, []);

  const handleResume = useCallback(() => {
    mediaRecorder.current?.resume();
    timerRef.current = setInterval(() => setElapsed((e) => e + 100), 100);
    startVisualization();
    setState('recording');
  }, [startVisualization]);

  const handleStop = useCallback(() => {
    mediaRecorder.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    setState('review');
  }, []);

  const handleSend = useCallback(() => {
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
    onSend?.(blob, elapsed);
  }, [elapsed, onSend]);

  const handleDiscard = useCallback(() => {
    audioChunks.current = [];
    setState('idle');
    setElapsed(0);
    setWaveformData(new Array(40).fill(0.1));
    onDiscard?.();
  }, [onDiscard]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  return (
    <div className="voice-recorder">
      {/* Waveform */}
      <div className="waveform">
        {waveformData.map((amp, i) => (
          <div
            key={i}
            className={`wave-bar ${state === 'review' ? 'review' : ''}`}
            style={{ height: `${Math.max(8, amp * 100)}%` }}
          />
        ))}
      </div>

      {/* Status */}
      <div className="status-row">
        {state === 'recording' && <span className="record-dot" />}
        {state === 'paused' && <span className="pause-dot" />}
        <span className="timer">{formatTime(elapsed)}</span>
        <span className="state-label">
          {state === 'recording' ? 'Recording...' : state === 'paused' ? 'Paused' : state === 'review' ? 'Review' : ''}
        </span>
      </div>

      {/* Controls */}
      <div className="controls">
        {state === 'idle' && (
          <button className="primary-btn" onClick={handleRecord}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>
            Tap to record
          </button>
        )}
        {state === 'recording' && (
          <>
            <button className="icon-btn" onClick={handlePause} title="Pause">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button className="icon-btn error" onClick={handleStop} title="Stop">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            </button>
          </>
        )}
        {state === 'paused' && (
          <>
            <button className="icon-btn" onClick={handleResume} title="Resume">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            </button>
            <button className="icon-btn error" onClick={handleStop} title="Stop">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            </button>
          </>
        )}
        {state === 'review' && (
          <>
            <button className="icon-btn" onClick={handleDiscard} title="Discard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            <button className="send-btn" onClick={handleSend}>
              Send
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .voice-recorder {
          background: var(--m3-surface-container);
          border-radius: 28px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .waveform {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          gap: 2px;
        }
        .wave-bar {
          width: 3px;
          border-radius: 2px;
          background: var(--m3-primary);
          transition: height 100ms ease;
          min-height: 4px;
        }
        .wave-bar.review {
          background: var(--m3-on-surface-variant);
          opacity: 0.5;
        }
        .status-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .record-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--m3-error);
          animation: pulse 1.2s ease-in-out infinite;
        }
        .pause-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--m3-warning);
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .timer { font-weight: 600; color: var(--m3-on-surface); }
        .state-label { font-size: 12px; color: var(--m3-on-surface-variant); }
        .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }
        .primary-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: 9999px;
          background: var(--m3-primary-container);
          color: var(--m3-on-primary-container);
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 150ms;
        }
        .primary-btn:hover { opacity: 0.85; }
        .icon-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--m3-surface-container-high);
          color: var(--m3-on-surface);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 150ms;
        }
        .icon-btn:hover { background: var(--m3-surface-container-highest); }
        .icon-btn.error {
          background: var(--m3-error-container, rgba(255,0,0,0.1));
          color: var(--m3-error);
        }
        .send-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 9999px;
          background: var(--m3-primary);
          color: var(--m3-on-primary);
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .send-btn:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}
