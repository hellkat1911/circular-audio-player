class AudioControls {
  constructor(audio, btn, timer, prog) {
    this.audio = audio;
    this.btn = btn;
    this.timer = timer;

    this.dataUrl = 'data.json';

    this.progBar = new ProgressBar.Circle(prog, {
      color: '#a100ff',
      strokeWidth: 2,
      svgStyle: {
        // width: '100%',
      },
      trailColor: '#ccc',
      trailWidth: 1.8,
    });

    this.progBar.overlay = this.createOverlayPath();

    $(this.progBar.trail).attr('stroke-dasharray', 1);

    this.init();
  }

  init() {
    fetch(this.dataUrl)
      .then(raw => raw.json())
      .then(data => {
        const latest = data[0];
        audio.type = latest.type;
        audio.src = latest.src;

        this.audio.onloadedmetadata = () => {
          this.updateTimer(0.0);
        };

        this.audio.onended = () => {
          // this.btn.textContent = 'Play Test Audio';
        };

        this.btn.addEventListener(
          'click',
          () => {
            if (this.audio.paused) {
              this.playAudio();
            } else {
              this.pauseAudio();
            }
          },
          false
        );

        this.progBar.overlay.addEventListener('click', evt => {
          const $circle = $('#tr-prog-bar > svg');
          const PI2 = Math.PI * 2;

          const offset = $circle.get(0).getBoundingClientRect();

          const height = $circle.height();
          const width = $circle.width();

          const radius = width / 2;

          const centerX = Math.round(offset.left + width / 2);
          const centerY = Math.round(offset.top + height / 2);

          const p1 = { x: centerX, y: centerY - radius }; // tdc
          const p2 = { x: evt.clientX, y: evt.clientY };

          const deltaX = p2.x - p1.x;
          const deltaY = p2.y - p1.y;

          const angleDeg = (Math.atan2(deltaY, deltaX) * 360) / Math.PI;

          const arcLength = (angleDeg / 360) * (PI2 * radius);

          const circumference = Math.round(PI2 * radius);

          console.debug(`Circumference: ${circumference}`);
          console.debug(`Radius: ${width / 2}`);
          console.debug(`Center: ${centerX}, ${centerY}`);
          console.debug(`TDC: ${p1.x}, ${p1.y}`);
          console.debug(`Clicked: ${p2.x}, ${p2.y}`);
          console.debug(`Deltas: ${deltaX}, ${deltaY}`);
          console.debug(`Angle (degrees): ${angleDeg}`);
          console.debug(`Arc length: ${arcLength}`);
          console.debug(`Total progress: ${arcLength / circumference}`);
          console.debug('==================================');

          this.progBar.set(arcLength / circumference);
        });

        // browser quirk : sometimes 'onloadedmetadata'
        // event fires before script eval
        if (this.timer.innerHTML === '') {
          this.updateTimer(0.0);
        }
      });
  }

  createOverlayPath() {
    const $overlay = $(this.progBar.trail).clone();
    $overlay.attr('stroke', 'transparent');
    $overlay.attr('fill', 'none');

    $(this.progBar.svg).append($overlay);

    return $overlay.get(0);
  }

  playAudio() {
    this.audio.play();
    this.updateProgress(true);
  }

  pauseAudio() {
    this.audio.pause();
    this.updateProgress(false);
  }

  secondsToTime(seconds) {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0'),
      m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0'),
      s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return h + ':' + m + ':' + s;
  }

  updateTimer(current) {
    this.timer.innerHTML = `${this.secondsToTime(
      current
    )} / ${this.secondsToTime(this.audio.duration)}`;
  }

  updateProgress(command) {
    let cycle;

    if (command) {
      cycle = setInterval(() => {
        this.updateTimer(this.audio.currentTime);
        this.progBar.set(this.audio.currentTime / this.audio.duration);
      }, 16.6667);
    } else {
      clearInterval(cycle);
    }
  }
}
