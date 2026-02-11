import { useEffect, useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import CameraStream from "./components/CameraStream";
import { API_BASE } from "./config";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  fetch(`${API_BASE}/api/get_count`)
    .then((res) => {
      if (!res.ok) return Promise.reject(res);
      return res.json();
    })
    .then((data) => {
      // do something with data
      setCount(data.count);
    })
    .catch(console.error);

  useEffect(() => {
    fetch("/api/time")
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button
          onClick={() => {
            fetch(`${API_BASE}/api/increase_count`, {
              method: "POST",
              body: JSON.stringify({
                message: "hello",
              }),
              headers: { "content-type": "application/json" },
            })
              .then((res) => {
                if (!res.ok) return Promise.reject(res);
                return res.json();
              })
              .then((data) => {
                // do something with data
                setCount(data.count);
              })
              .catch(console.error);
          }}
        >
          count is {count}
        </button>
        <p>
          The current time is {new Date(currentTime * 1000).toLocaleString()}.
        </p>
        <CameraStream />
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
