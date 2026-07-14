/// <reference lib="webworker" />

import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

type InitMessage = {
  type: "init";
  wasmRoot: string;
  modelPath: string;
};

type FrameMessage = {
  type: "frame";
  bitmap: ImageBitmap;
  timestamp: number;
};

type WorkerMessage = InitMessage | FrameMessage | { type: "close" };

const workerScope: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;
let landmarker: HandLandmarker | null = null;
let initialization: Promise<void> | null = null;

async function createLandmarker(wasmRoot: string, modelPath: string, delegate: "GPU" | "CPU") {
  const vision = await FilesetResolver.forVisionTasks(wasmRoot);
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: modelPath, delegate },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });
}

async function initialize({ wasmRoot, modelPath }: InitMessage) {
  if (landmarker) return;
  if (initialization) return initialization;

  initialization = (async () => {
    try {
      landmarker = await createLandmarker(wasmRoot, modelPath, "GPU");
      workerScope.postMessage({ type: "ready", delegate: "GPU" });
    } catch {
      landmarker = await createLandmarker(wasmRoot, modelPath, "CPU");
      workerScope.postMessage({ type: "ready", delegate: "CPU" });
    }
  })().catch((error) => {
    workerScope.postMessage({
      type: "error",
      code: "model",
      message: error instanceof Error ? error.message : "Unable to load hand tracking",
    });
    throw error;
  });

  return initialization;
}

workerScope.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  if (message.type === "init") {
    await initialize(message);
    return;
  }

  if (message.type === "close") {
    landmarker?.close();
    landmarker = null;
    initialization = null;
    workerScope.close();
    return;
  }

  if (message.type === "frame") {
    try {
      if (!landmarker) {
        message.bitmap.close();
        workerScope.postMessage({ type: "frame", hands: [], timestamp: message.timestamp });
        return;
      }

      const result = landmarker.detectForVideo(message.bitmap, message.timestamp);
      message.bitmap.close();
      workerScope.postMessage({
        type: "frame",
        hands: result.landmarks.map((hand) => hand.map(({ x, y, z }) => ({ x, y, z }))),
        timestamp: message.timestamp,
      });
    } catch (error) {
      message.bitmap.close();
      workerScope.postMessage({
        type: "error",
        code: "frame",
        message: error instanceof Error ? error.message : "Hand tracking failed",
      });
    }
  }
};

export {};
