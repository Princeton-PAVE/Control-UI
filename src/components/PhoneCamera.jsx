import { useEffect, useRef } from "react";

export default function PhoneCamera({ socket, sendData }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let stream;

    async function startCamera() {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      videoRef.current.srcObject = stream;
    }

    startCamera();

    return () => {
      // cleanup camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // 🟢 START sending
    if (sendData) {
      intervalRef.current = setInterval(() => {
        if (!videoRef.current) return;

        ctx.drawImage(videoRef.current, 0, 0, 320, 240);

        const data = canvas.toDataURL("image/jpeg", 0.6);

        console.log("Sending video frame");
        socket.emit("video_frame", {
          frame: data.split(",")[1],
        });
      }, 50); // ~20 FPS
    }

    // 🔴 STOP sending
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sendData, socket]);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline width="320" />
      <canvas ref={canvasRef} width="320" height="240" hidden />
    </>
  );
}
