const video = document.getElementById('video');
const moodStatus = document.getElementById('mood-status');

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => { video.srcObject = stream; })
    .catch(err => console.error("Error accessing webcam: ", err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector('.video-container').append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (detections.length > 0) {
      const exp = detections[0].expressions;
      updateEmotionTable(exp);
    }
  }, 200);
});

function updateEmotionTable(expressions) {
  document.getElementById('happy').textContent = expressions.happy.toFixed(2);
  document.getElementById('sad').textContent = expressions.sad.toFixed(2);
  document.getElementById('angry').textContent = expressions.angry.toFixed(2);
  document.getElementById('surprised').textContent = expressions.surprised.toFixed(2);
  document.getElementById('neutral').textContent = expressions.neutral.toFixed(2);

  const mood = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
  moodStatus.textContent = `Current Mood: ${getEmoji(mood)} ${capitalize(mood)}`;
}

function getEmoji(mood) {
  const emojis = { happy: '😊', sad: '😢', angry: '😡', surprised: '😲', neutral: '😐' };
  return emojis[mood] || '😐';
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
