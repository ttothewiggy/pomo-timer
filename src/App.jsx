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

function formatLogDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLogTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleTimeString("en-NZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [mode, setMode] = useState("focus");
  const [secondsLeft, setSecondsLeft] = useState(MODES.focus.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [timerLog, setTimerLog] = useState(() => {
    const savedLog = localStorage.getItem("timerLog");

    if (savedLog) {
      return JSON.parse(savedLog);
    }

    return [];
  });

  useEffect(() => {
    document.title = `${formatTime(secondsLeft)} - ${MODES[mode].label}`;
  }, [secondsLeft, mode]);

  useEffect(() => {
    localStorage.setItem("timerLog", JSON.stringify(timerLog));
  }, [timerLog]);

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

  function addTimerLogEntry() {
    const newEntry = {
      id: crypto.randomUUID(),
      mode,
      label: MODES[mode].label,
      startedAt: new Date().toISOString(),
    };

    setTimerLog((currentLog) => [newEntry, ...currentLog]);
  }

  function handleStartPause() {
    if (!isRunning) {
      addTimerLogEntry();
    }

    setIsRunning(!isRunning);
  }

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

  function clearTimerLog() {
    setTimerLog([]);
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
          <button onClick={handleStartPause}>
            {isRunning ? "Pause" : "Start"}
          </button>

          <button onClick={resetTimer}>Reset</button>
        </div>

        <p className="sessions">
          Focus sessions completed: {completedFocusSessions}
        </p>
      </section>

      <aside className="timer-log">
        <div className="timer-log-header">
          <h2>Timer log</h2>

          {timerLog.length > 0 && (
            <button onClick={clearTimerLog}>Clear</button>
          )}
        </div>

        {timerLog.length === 0 ? (
          <p className="empty-log">No timers started yet.</p>
        ) : (
          <ul>
            {timerLog.map((entry) => (
              <li key={entry.id}>
                <span>{entry.label} </span>
                <small>
                  {formatLogDate(entry.startedAt)} at{" "}
                  {formatLogTime(entry.startedAt)}
                </small>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  );
}

export default App;