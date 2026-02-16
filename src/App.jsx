import { useEffect, useState } from "react";
import io from "socket.io-client";
import CameraStream from "./components/CameraStream";
import { API_BASE } from "./config";

const socket = io(API_BASE);

function App() {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    socket.on("connected", (data) => {
      console.log(data);
    });

    socket.on("count_update", (data) => {
      setCount(data.count);
    });

    socket.on("time_update", (data) => {
      setCurrentTime(data.time);
    });

    // start background streams
    socket.emit("start_streams");

    return () => {
      // socket.disconnect();
    };
  }, []);

  return (
    <>
      <h1>Socket.IO Only App</h1>

      <button
        onClick={() => {
          socket.emit("increase_count");
        }}
      >
        count is {count}
      </button>

      <p>The current time is {new Date(currentTime * 1000).toLocaleString()}</p>

      <CameraStream socket={socket} />
    </>
  );
}

export default App;
