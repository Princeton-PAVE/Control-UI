import { API_BASE } from "../config";

function CameraStream() {
  const videoApi = `${API_BASE}/api/video_feed`;

  return (
    <div>
      <h2>Live Camera Feed</h2>
      <img
        src={videoApi}
        alt="Camera Stream"
        style={{
          width: "640px",
          borderRadius: "8px",
          background: "black",
        }}
      />
    </div>
  );
}

export default CameraStream;
