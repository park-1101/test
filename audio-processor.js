class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = (e) => {
      const { type, data } = e.data;
      if (type === 'toggleRecording') this.isRecording = data.isRecording;
      if (type === 'setThreshold') this.threshold = data.threshold;
    };
    this.isRecording = false;
    this.threshold = 22;
  }

  process(inputs, outputs, parameters) {
    const leftData = inputs[0][0] || new Float32Array(128);
    const rightData = inputs[0][1] || new Float32Array(128);
    let leftMaxDb = -Infinity;
    let rightMaxDb = -Infinity;

    for (let i = 0; i < leftData.length; i++) {
      const leftSample = leftData[i] * 32768;
      const rightSample = rightData[i] * 32768;
      const leftDb = leftSample === 0 ? -Infinity : 20 * Math.log10(Math.abs(leftSample));
      const rightDb = rightSample === 0 ? -Infinity : 20 * Math.log10(Math.abs(rightSample));
      if (leftDb > leftMaxDb) leftMaxDb = leftDb;
      if (rightDb > rightMaxDb) rightMaxDb = rightDb;
    }

    const maxDb = Math.max(leftMaxDb, rightMaxDb);
    this.port.postMessage({
      type: 'audioData',
      data: { leftMaxDb, rightMaxDb, maxDb, timestamp: performance.now() }
    });

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);