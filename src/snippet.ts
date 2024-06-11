// const snippet = document.getElementById("code-snippet");

const increment = 1;
const inSine = (t: number) => -Math.cos((t * Math.PI) / 2) + 1;

type AnimationProps = {
  easing: (t: number) => number;
  onProgress: (value: any) => void;
  onComplete: (detlaTime: number) => void;
  from?: number;
  to?: number;
  duration?: number;
};

function animate(options: AnimationProps) {
  options = options || {};

  // defaults
  const duration = options.duration || 500,
    ease = options.easing || ((a) => a),
    onProgress = options.onProgress || ((_) => _),
    onComplete = options.onComplete || ((_) => _),
    from = options.from || 0,
    to = options.to || 0;

  // runtime variables
  const startTime = Date.now();

  function update() {
    let deltaTime = Date.now() - startTime,
      progress = Math.min(deltaTime / duration, 1),
      factor = ease(progress);

    onProgress(from + (to - from) * factor);

    if (progress === 1) {
      onComplete(deltaTime);
    } else {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

export function createToggle(id: string) {
  const snippet = document.getElementById(id);
  if (!snippet) {
    throw new Error(`Couldn't find HTMLElement for ${id}`);
  }

  const width = snippet.clientWidth;
  const margin = -width;

  let animating = false;
  let expanded = false;

  return () => {
    // Debounce
    if (animating) {
      return;
    }

    animating = true;

    animate({
      easing: inSine,
      onProgress: (a) => {
        snippet.style.marginLeft = `${a}px`;
      },
      onComplete: () => {
        expanded = !expanded;
        animating = false;
      },
      from: expanded ? 0 : margin,
      to: expanded ? margin : 0,
    });
  };
}
