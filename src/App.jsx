import { useEffect, useState } from "react";
import "./App.css";

const MODES = {
  focus: {
    label: "Focus",
    minutes: 25,
  },
  shortBreak: {
    label: "Short Break",
    minutes: 5,
  },
  longBreak: {
    label: "Long Break",
    minutes: 15,
  },
};

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function App() {
  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} - ${MODES[mode].label}`;
  }, [secondsLeft, mode]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          handleTimerComplete();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, mode, completedFocusSessions]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setSecondsLeft(MODES[nextMode].minutes * 60);
    setIsRunning(false);
  }

  function handleTimerComplete() {
    setIsRunning(false);

    if (mode === "focus") {
      const nextCompletedSessions = completedFocusSessions + 1;
      setCompletedFocusSessions(nextCompletedSessions);

      if (nextCompletedSessions % 4 === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }

      return;
    }

    switchMode("focus");
  }

  function resetTimer() {
    setSecondsLeft(MODES[mode].minutes * 60);
    setIsRunning(false);
  }

  return (
    <main className="app">
      <section className="timer-card">
        <div className="mode-buttons">
          <button
            className={mode === "focus" ? "active" : ""}
            onClick={() => switchMode("focus")}
          >
            Focus
          </button>

          <button
            className={mode === "shortBreak" ? "active" : ""}
            onClick={() => switchMode("shortBreak")}
          >
            Short Break
          </button>

          <button
            className={mode === "longBreak" ? "active" : ""}
            onClick={() => switchMode("longBreak")}
          >
            Long Break
          </button>
        </div>

        <p className="mode-label">{MODES[mode].label}</p>

        <h1 className="timer">{formatTime(secondsLeft)}</h1>

        <div className="controls">
          <button onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "Pause" : "Start"}
          </button>

          <button onClick={resetTimer}>Reset</button>
        </div>

        <p className="sessions">
          Focus sessions completed: {completedFocusSessions}
        </p>
      </section>
    </main>
  );
}

export default App;