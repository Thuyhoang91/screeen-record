// script.js
document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('start');
  const stopButton = document.getElementById('stop');
  const recordingTypeSelect = document.getElementById('recordingType');
  const statusDiv = document.getElementById('status');
  const previewVideo = document.getElementById('preview');
  const reviewDiv = document.getElementById('review');
  const recordedVideo = document.getElementById('recordedVideo');
  const downloadButton = document.getElementById('downloadButton');
  const fpsInput = document.getElementById('fps');

  let recorder, chunks = [], stream, recordedBlob;
  let recordingType = "screen";

  recordingTypeSelect.addEventListener('change', () => {
    recordingType = recordingTypeSelect.value;
  });

  startButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);

  async function startRecording() {
    statusDiv.textContent = "Starting...";

    try {
      let fps = parseInt(fpsInput.value, 10);
      if (isNaN(fps) || fps < 1) {
        fps = 30;
        alert("Invalid FPS value. Using default FPS: 30");
      }

      let constraints = { video: { frameRate: { ideal: fps, max: fps } }, audio: true };

      if (recordingType === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      } else if (recordingType === "window") {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        throw new Error("Invalid recording type");
      }

      previewVideo.srcObject = stream;

      recorder = new MediaRecorder(stream);

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstart = () => {
        statusDiv.textContent = "Recording...";
      };

      recorder.onstop = () => {
        statusDiv.textContent = "Stopped.";

        recordedBlob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(recordedBlob);

        recordedVideo.src = url;
        reviewDiv.style.display = 'block';
        previewVideo.style.display = 'none';

        downloadButton.onclick = () => {  // Use onclick directly
          const a = document.createElement('a');
          a.href = url;
          a.download = 'screen-recording.webm';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        chunks = []; // Clear chunks for next recording
        stream.getTracks().forEach(track => track.stop());
        stream = null; // Release the stream
      };

      recorder.start();

    } catch (err) {
      console.error("Error accessing screen:", err);
      statusDiv.textContent = "Error: " + err.message;
      alert("Error accessing screen. Please check permissions and try again.");
    }
  }

  function stopRecording() {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }
});