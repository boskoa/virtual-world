const ctx = myCanvas.getContext("2d");
let analyzer = null;
let engine = null;

window.addEventListener("click", () => {
  engine = new Engine();
  /* 
  beep(400);
  setTimeout(() => {
    beep(400);
    setTimeout(() => {
      beep(400);
      setTimeout(() => {
        beep(600);
      }, 1000);
    }, 1000);
  }, 1000);
   */
});

animate();

function animate() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  if (analyzer) {
    const data = new Uint8Array(analyzer.fftSize);
    analyzer.getByteTimeDomainData(data);

    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (myCanvas.width * i) / data.length;
      const y = data[i];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  requestAnimationFrame(animate);
}

function beep(frequency) {
  const audioContext = new AudioContext();
  const osc = audioContext.createOscillator();
  const envelope = audioContext.createGain();

  osc.frequency.setValueAtTime(frequency, 0);
  osc.connect(envelope);
  osc.start();
  osc.stop(0.4);

  envelope.gain.value = 0.1;
  envelope.gain.linearRampToValueAtTime(1, 0.1);
  envelope.gain.linearRampToValueAtTime(0, 0.4);
  envelope.connect(audioContext.destination);

  analyzer = audioContext.createAnalyser();
  analyzer.fftSize = 2 ** 15;
  envelope.connect(analyzer);
}

class Engine {
  constructor() {
    const audioContext = new AudioContext();
    const osc = audioContext.createOscillator();
    const masterGain = audioContext.createGain();

    osc.frequency.setValueAtTime(200, 0);
    osc.connect(masterGain);
    osc.start();

    masterGain.gain.value = 0.2;
    masterGain.connect(audioContext.destination);

    const lfo = audioContext.createOscillator();
    lfo.frequency.setValueAtTime(30, 0);
    const mod = audioContext.createGain();
    mod.gain.value = 60;
    lfo.connect(mod);
    mod.connect(osc.frequency);
    lfo.start();

    this.volume = masterGain.gain;
    this.frequency = osc.frequency;

    analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 2 ** 15;
    masterGain.connect(analyzer);
  }

  setVolume(percent) {
    this.volume.value = percent;
  }

  setPitch(percent) {
    this.frequency.setValueAtTime(percent * 200 + 100, 0);
  }
}
