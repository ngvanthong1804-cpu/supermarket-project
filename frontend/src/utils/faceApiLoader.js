import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise = null;

export function loadFaceModels() {
    if (modelsLoaded) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    const MODEL_URL = '/models';

    loadingPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
        modelsLoaded = true;
    });

    return loadingPromise;
}

export async function detectFaceDescriptor(videoEl) {
    const detection = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) return null;
    return Array.from(detection.descriptor);
}

export { faceapi };