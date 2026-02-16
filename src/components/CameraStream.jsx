import { useEffect, useState } from "react";

function CameraStream({ socket }) {
  const [frame, setFrame] = useState(null);

  useEffect(() => {
    socket.on("video_frame", (data) => {
      setFrame(`data:image/jpeg;base64,${data.frame}`);
    });

    return () => {
      socket.off("video_frame");
    };
  }, [socket]);

  return (
    <div>
      <h2>Live Camera Feed</h2>
      {frame && (
        <img
          src={frame}
          alt="Camera Stream"
          style={{
            width: "640px",
            borderRadius: "8px",
            background: "black",
          }}
        />
      )}
    </div>
  );
}

export default CameraStream;
