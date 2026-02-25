import { useEffect, useState } from "react";

export default function IMUComponent() {
  const [motion, setMotion] = useState(null);

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
      console.log("Non-iOS??");
      // DeviceMotionEvent.requestPermission();
      // Non-iOS devices
      window.addEventListener("devicemotion", handleMotion);
    }
  };

  const handleMotion = (event) => {
    console.log(motion);
    setMotion({
      x: event.accelerationIncludingGravity?.x,
      y: event.accelerationIncludingGravity?.y,
      z: event.accelerationIncludingGravity?.z,
    });
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
