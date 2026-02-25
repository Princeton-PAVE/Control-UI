import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import io from "socket.io-client";
import CameraStream from "./components/CameraStream";
import IMUComponent from "./components/IMUComponent";
import PhoneCamera from "./components/PhoneCamera";
import { API_BASE } from "./config";

const socket = io(API_BASE);

function App() {
  const [count, setCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [position, setPosition] = useState([40.3504, -74.6571]);
  const [sendData, setSendData] = useState(false);

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

    fetch(`${API_BASE}/coords`)
      .then((res) => res.json())
      .then((data) => {
        let coords = data.coords.split(",");
        let x = Number(coords[0]);
        let y = Number(coords[1]);
        console.log([x, y]);
        setPosition([x, y]);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <h1>Socket.IO Only App</h1>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>{position.join(", ")}</Popup>
        </Marker>
      </MapContainer>
      <button
        onClick={() => {
          socket.emit("increase_count");
        }}
      >
        count is {count}
      </button>
      <button
        onClick={() => {
          setSendData(!sendData);
        }}
      >
        Current send data: {sendData.toString()}
      </button>
      <p>The current time is {new Date(currentTime * 1000).toLocaleString()}</p>
      <CameraStream socket={socket} />
      <PhoneCamera socket={socket} sendData={sendData} />
      <IMUComponent />
    </>
  );
}

export default App;
