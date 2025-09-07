const video = document.getElementById('video');

// AIモデルの読み込み（感情、顔のランドマークなどを認識するモデル）
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.faceExpressionNet.loadFromUri('models')
])

// ウェブカメラを起動する関数
async function startVideo() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        console.error(err);
    }
}

// ビデオが再生されたら、顔認識を開始
video.addEventListener('play', () => {
    // 描画用のcanvasを作成し、ビデオの上に重ねる
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    // 100ミリ秒ごとに顔認識を実行
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        
        // 画面の描画をクリア
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // 認識結果を描画
        faceapi.draw.drawDetections(canvas, resizedDetections); // 顔の枠線
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections); // 感情
    }, 100);
});
