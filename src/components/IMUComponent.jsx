import { useEffect, useRef, useState } from "react";

export default function IMUComponent({ socket, sendData }) {
  const [motion, setMotion] = useState("");
  const motionRef = useRef("");
  const intervalRef = useRef(null);

  const requestPermission = async () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === "granted") {
          window.addEventListener("devicemotion", handleMotion);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }
  };

  useEffect(() => {
    if (sendData) {
      intervalRef.current = setInterval(() => {
        console.log("Sending IMU", motionRef.current);

        socket.emit("imu", {
          imu: motionRef.current,
        });
      }, 50);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sendData, socket]);

  const handleMotion = (event) => {
    const data = JSON.stringify({
      x: event.accelerationIncludingGravity?.x,
      y: event.accelerationIncludingGravity?.y,
      z: event.accelerationIncludingGravity?.z,
    });

    motionRef.current = data; // always latest
    setMotion(data); // UI update
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  return (
    <div>
      <button onClick={requestPermission}>Enable Motion</button>
      {motion && <pre>{JSON.stringify(motion, null, 2)}</pre>}
    </div>
  );
}
