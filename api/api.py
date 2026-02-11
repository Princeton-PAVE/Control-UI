import sys
import time
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2

app = Flask(__name__)
CORS(app)

count = 0

# fixing redirect here but might be sketchy 
@app.route('/')
def index():
    return '''<!DOCTYPE html><html><body><h1>Video feed</h1>
<img src="/api/video_feed" alt="feed" style="max-width:100%;" /></body></html>'''

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}


# Windows: DSHOW + camera 0. Mac: AVFOUNDATION + camera 1 (or 0).
if sys.platform == "win32":
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
else:
    camera = cv2.VideoCapture(1, cv2.CAP_AVFOUNDATION)
if not camera.isOpened():
    camera = cv2.VideoCapture(0)

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

@app.route("/api/get_count")
def get_count():
    return jsonify({
        "count": count
    })

@app.route("/api/increase_count", methods=["POST"])
def increase_count():
    global count

    data = request.get_json()
    print(data)  # See what React sent

    count += 1

    return jsonify({
        "message": "Data received!",
        "count": count
        # "you_sent": data
    })

# run through "npm run api" instead
# if __name__ == "__main__":
#     app.run(host="192.168.1.59", port=8000, debug=True)
if __name__ == "__main__":
    host = "127.0.0.1" if sys.platform == "win32" else "192.168.1.59"  #  MAC and windows modification 
    app.run(host=host, port=8000, debug=True)
