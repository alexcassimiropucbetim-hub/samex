const fs = require('fs');
const sampleRate = 8000;
const duration = 0.15; // seconds
const numSamples = Math.floor(sampleRate * duration);
const buffer = Buffer.alloc(44 + numSamples);

// Write WAV header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // PCM format length
buffer.writeUInt16LE(1, 20); // PCM format
buffer.writeUInt16LE(1, 22); // 1 channel
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate, 28); // byte rate
buffer.writeUInt16LE(1, 32); // block align
buffer.writeUInt16LE(8, 34); // bits per sample
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples, 40);

// Sine wave (ding)
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  // Fade out
  const envelope = Math.max(0, 1 - t / duration);
  const value = Math.sin(t * 2 * Math.PI * 800) * 127 * envelope + 128;
  buffer.writeUInt8(Math.floor(value), 44 + i);
}

fs.writeFileSync('public/notification.wav', buffer);
console.log('notification.wav created');
