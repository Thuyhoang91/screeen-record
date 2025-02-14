const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const previewVideo = document.getElementById('preview');
const downloadLink = document.getElementById('downloadLink');
const displaySourceSelect = document.getElementById('displaySource');
const recordAudioCheckbox = document.getElementById('recordAudio');
const resolutionSelect = document.getElementById('resolution');
const fpsSelect = document.getElementById('fps');
const recordTimeDisplay = document.getElementById('recordTime');
const reviewVideo = document.getElementById('reviewVideo');

let mediaRecorder;
let recordedChunks = [];
let displayStream;
let selectedResolution = 720;
let selectedFps = 30;
let startTime;
let timerInterval;


resolutionSelect.addEventListener('change', (event)=>{
    selectedResolution = parseInt(event.target.value);
})
fpsSelect.addEventListener('change', (event)=>{
    selectedFps = parseInt(event.target.value);
})
startBtn.addEventListener('click', async () => {
    try {
        const displaySurface = displaySourceSelect.value;
        const recordAudio = recordAudioCheckbox.checked;
        const mediaOptions = {
            video: {
                cursor: "always",
                width: { ideal: selectedResolution },
                height: { ideal: (selectedResolution * 9) / 16 },
                frameRate: { ideal: selectedFps}
            },
            audio: recordAudio,
        };
        if (displaySurface === 'screen') {
            displayStream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
        } else {
            displayStream = await navigator.mediaDevices.getDisplayMedia({ ...mediaOptions, preferCurrentTab: true });
        }
        previewVideo.srcObject = displayStream;
        startRecording();
        startTimer();

        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        console.error('Error accessing display media:', error);
        alert('Failed to access media, likely permission issue');
    }
});

stopBtn.addEventListener('click', () => {
    stopRecording();
    stopTimer();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

function startRecording() {
    recordedChunks = [];

    mediaRecorder = new MediaRecorder(displayStream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        downloadRecording();
        showReviewVideo();
    };

    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    if (displayStream) {
        displayStream.getTracks().forEach((track) => track.stop());
    }
	preview.style.display = 'none';
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = 'screen_recording.webm';
    downloadLink.style.display = 'block';
}


function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000); // Update every second
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');

    recordTimeDisplay.textContent = `${minutes}:${seconds}`;
}

function showReviewVideo() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    reviewVideo.src = url;
    reviewVideo.style.display = 'block';
}