import sys
import time
import base64
import cv2
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit

import re
import json
import urllib3

url = 'http://ipinfo.io/json'
response = urllib3.request("GET", url)
location = response.json()["loc"]

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

count = 0

currentFrame = None

# Camera setup
# if sys.platform == "win32":
#     camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
# else:
#     camera = cv2.VideoCapture(1, cv2.CAP_AVFOUNDATION)

# if not camera.isOpened():
#     camera = cv2.VideoCapture(0)


# 🔌 CONNECTION EVENTS
@socketio.on("connect")
def handle_connect():
    print("Client connected")

    emit("connected", {"message": "Connected to server"})

    # send initial state
    emit("count_update", {"count": count})
    emit("time_update", {"time": time.time()})


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


@app.route("/coords")
def handle_coords():
    data = {
        "coords": location
    }
    return jsonify(data)

# 🔢 COUNT EVENTS
@socketio.on("increase_count")
def handle_increase_count():
    global count
    count += 1

    socketio.emit("count_update", {"count": count})  # broadcast


@socketio.on("get_count")
def handle_get_count():
    emit("count_update", {"count": count})


# ⏱ TIME STREAM
def time_loop():
    while True:
        socketio.emit("time_update", {"time": time.time()})
        socketio.sleep(1)


# 🎥 CAMERA STREAM
# def camera_loop():
#     while True:
#         # success, frame = camera.read()
#         # if not success:
#         #     continue

#         # _, buffer = cv2.imencode(".jpg", frame)
#         # jpg_as_text = base64.b64encode(buffer).decode("utf-8")

#         socketio.emit("video_frame", {"frame": jpg_as_text})
#         socketio.sleep(0.03)  # ~30 FPS

@socketio.on("video_frame")
def handle_video_frame(data):
    # data = { frame: base64 string }

    # broadcast to all OTHER clients (computer)
    emit("video_frame", data, broadcast=True, include_self=False)


streamsStarted = False
# 🚀 START BACKGROUND TASKS
@socketio.on("start_streams")
def start_streams():
    global streamsStarted
    if not streamsStarted:
        streamsStarted = True
        print("start streams")
        socketio.start_background_task(time_loop)
        # socketio.start_background_task(camera_loop)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000, debug=False, ssl_context='adhoc')
