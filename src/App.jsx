import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
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

      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
}

export default App;
