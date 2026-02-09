"""
Local Autonomous Vehicle Control Server (Serverless / Point-to-Point).
Serves the React UI and handles WebRTC signaling + camera stream + control data channel.
Run on the vehicle; clients connect to http://<VEHICLE_IP>:5000

Signaling: server creates the offer (and data channel). Client POSTs /offer, then POSTs /answer.
Uses a single long-lived event loop in a background thread so aiortc connections
don't see "Event loop is closed" when closing.
"""
import asyncio
import json
import os
import threading
import time
import uuid
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame

# Serve React build: Vite outputs to 'dist'. Change if your build folder differs.
BUILD_DIR = os.path.join(os.path.dirname(__file__), "dist")
if not os.path.isdir(BUILD_DIR):
    BUILD_DIR = os.path.join(os.path.dirname(__file__), "build")

app = Flask(__name__, static_folder=BUILD_DIR, static_url_path="/")
CORS(app)

# Single event loop for all WebRTC (run in background thread to avoid "Event loop is closed")
_loop = None
_loop_ready = threading.Event()


def _run_loop():
    global _loop
    _loop = asyncio.new_event_loop()
    asyncio.set_event_loop(_loop)
    _loop_ready.set()
    _loop.run_forever()


def _run_async(coro, timeout=30):
    if _loop is None:
        _loop_ready.wait(timeout=5)
    if _loop is None:
        raise RuntimeError("WebRTC event loop not ready")
    future = asyncio.run_coroutine_threadsafe(coro, _loop)
    return future.result(timeout=timeout)


threading.Thread(target=_run_loop, daemon=True).start()

# --- Hardware / Camera ---
class CameraVideoStreamTrack(VideoStreamTrack):
    def __init__(self):
        super().__init__()
        self.cap = cv2.VideoCapture(0)  # Open default camera

    async def recv(self):
        pts, time_base = await self.next_timestamp()
        ret, frame = self.cap.read()
        if not ret:
            return None
        frame = cv2.resize(frame, (640, 480))
        av_frame = VideoFrame.from_ndarray(frame, format="bgr24")
        av_frame.pts = pts
        av_frame.time_base = time_base
        return av_frame


# --- Global state: offerId -> RTCPeerConnection (pending answer) ---
pending_pcs = {}


# --- Web endpoints ---
@app.route("/")
def index():
    return app.send_static_file("index.html")


@app.route("/offer", methods=["GET", "POST"])
def offer():
    """Server creates the offer (and data channel). Returns offerId + SDP for client."""
    try:
        result = _run_async(offer_async())
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if result is None:
        return jsonify({"error": "Failed to create offer"}), 500
    return jsonify(result)


async def offer_async():
    pc = RTCPeerConnection()
    # Add camera track first so the offer SDP includes video (server → client stream)
    video_track = CameraVideoStreamTrack()
    pc.addTrack(video_track)
    pc.createDataChannel("controls")

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            try:
                data = json.loads(message)
                print(f"Control received: {data}")
                # TODO: Hardware code here (e.g. GPIO, motor driver)
            except json.JSONDecodeError:
                print(f"Control (raw): {message}")

    @pc.on("connectionstatechange")
    async def on_connectionstatechange():
        if pc.connectionState == "failed":
            await pc.close()
            for offer_id, p in list(pending_pcs.items()):
                if p is pc:
                    pending_pcs.pop(offer_id, None)
                    break

    offer_sdp = await pc.createOffer()
    await pc.setLocalDescription(offer_sdp)

    offer_id = str(uuid.uuid4())
    pending_pcs[offer_id] = pc

    return {
        "offerId": offer_id,
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    }


@app.route("/answer", methods=["POST"])
def answer():
    """Client sends back the answer. Server sets it and completes the connection."""
    params = request.get_json(force=True, silent=True) or {}
    try:
        ok = _run_async(answer_async(params))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    if not ok:
        return jsonify({"error": "Invalid or expired offer"}), 400
    return jsonify({"ok": True})


async def answer_async(params):
    if not params or "offerId" not in params or "sdp" not in params or "type" not in params:
        return False
    offer_id = params.get("offerId")
    pc = pending_pcs.pop(offer_id, None)
    if pc is None:
        return False
    answer_sdp = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    await pc.setRemoteDescription(answer_sdp)
    return True


if __name__ == "__main__":
    # For production, use an ASGI server (e.g. Hypercorn) for proper async support.
    app.run(host="0.0.0.0", port=5000)
