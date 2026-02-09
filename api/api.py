import time
from flask import Flask, Response
import cv2

app = Flask(__name__)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


camera = cv2.VideoCapture(1, cv2.CAP_AVFOUNDATION)

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break

        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # MJPEG stream format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/api/video_feed')
def video_feed():
    return Response(
        generate_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
