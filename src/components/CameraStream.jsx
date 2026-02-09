function CameraStream() {
  return (
    <div>
      <h2>Live Camera Feed</h2>
      <img
        src="http://10.49.223.131:8000/api/video_feed"
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
