const bouncePattern = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];

const createBounceCards = (images, {
  className = '',
  onSelect,
  preview = false,
  selectedIndex = -1,
} = {}) => {
  const root = document.createElement('div');
  root.className = `bounce-cards ${className}`.trim();
  root.setAttribute('aria-label', `${images.length} event photos`);
  if (preview) root.setAttribute('aria-hidden', 'true');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = images.map((image, index) => {
    const card = document.createElement(preview ? 'div' : 'button');
    card.className = 'bounce-cards__card';
    if (!preview) {
      card.type = 'button';
      card.setAttribute('aria-label', image.caption || image.alt || `Event photo ${index + 1}`);
      card.setAttribute('aria-pressed', String(index === selectedIndex));
    }

    const photo = document.createElement('img');
    photo.src = image.src;
    photo.alt = preview ? '' : image.alt || '';
    photo.loading = 'lazy';
    photo.draggable = false;
    photo.addEventListener('error', () => card.classList.add('bounce-cards__card--unavailable'), { once: true });
    card.append(photo);
    if (index === selectedIndex) card.dataset.selected = '';
    root.append(card);
    return card;
  });

  const count = cards.length;
  if (!count) return root;
  const middle = (count - 1) / 2;
  const bodies = cards.map((_, index) => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: reducedMotion ? 1 : 0,
    vx: 0,
    vy: 0,
    vr: 0,
    vs: 0,
  }));
  let hovered = -1;
  let animationFrame = 0;
  let startTime = performance.now();
  let previousTime = startTime;

  const getSlots = () => {
    const width = root.clientWidth;
    const size = Math.min(190, Math.max(100, (width - 24) / (1 + 0.42 * Math.max(0, count - 1))));
    const spread = count > 1 ? Math.min(82, (width - size) / (count - 1)) : 0;
    return cards.map((_, index) => {
      const offset = index - middle;
      return {
        x: offset * spread,
        y: 18 * (offset / Math.max(1, middle)) ** 2,
        rotate: 10 * bouncePattern[index % bouncePattern.length],
        size,
      };
    });
  };

  let slots = getSlots();
  cards.forEach((card, index) => {
    card.style.width = `${slots[index].size}px`;
  });

  const step = (value, velocity, target, stiffness, damping, delta) => {
    const nextVelocity = velocity + ((target - value) * stiffness - velocity * damping) * delta;
    return [value + nextVelocity * delta, nextVelocity];
  };

  const animate = (now) => {
    animationFrame = 0;
    const delta = Math.min(1 / 30, Math.max(1 / 240, (now - previousTime) / 1000));
    previousTime = now;
    const elapsed = (now - startTime) / 1000;
    let moving = 0;

    cards.forEach((card, index) => {
      const slot = slots[index];
      const body = bodies[index];
      const appeared = reducedMotion || elapsed >= 0.35 + index * 0.07;
      let targetX = slot.x;
      let targetY = slot.y;
      let targetRotate = slot.rotate;
      let targetScale = appeared ? 1 : 0;

      if (hovered >= 0 && appeared) {
        if (index === hovered) {
          targetY -= slot.size * 0.04;
          targetRotate = 0;
          targetScale = 1.06;
        } else {
          targetX += Math.sign(index - hovered) * Math.min(120, slot.size * 0.8);
        }
      }

      const substeps = Math.ceil(delta / (1 / 240));
      const subDelta = delta / substeps;
      for (let stepIndex = 0; stepIndex < substeps; stepIndex += 1) {
        [body.x, body.vx] = step(body.x, body.vx, targetX, 210, 21, subDelta);
        [body.y, body.vy] = step(body.y, body.vy, targetY, 210, 21, subDelta);
        [body.rotate, body.vr] = step(body.rotate, body.vr, targetRotate, 210, 21, subDelta);
        if (reducedMotion) {
          body.scale = targetScale;
        } else {
          [body.scale, body.vs] = step(body.scale, body.vs, targetScale, 170, 2 * 0.98 * Math.sqrt(170), subDelta);
        }
      }

      moving += Math.abs(body.vx) + Math.abs(body.vy) + Math.abs(body.vr) + Math.abs(body.vs) * 100;
      moving += Math.abs(targetX - body.x) + Math.abs(targetY - body.y) + Math.abs(targetRotate - body.rotate);
      moving += Math.abs(targetScale - body.scale) * 100 + (appeared ? 0 : 1);
      card.style.transform = `translate(-50%, -50%) translate3d(${body.x.toFixed(2)}px, ${body.y.toFixed(2)}px, 0) rotate(${body.rotate.toFixed(2)}deg) scale(${Math.max(0, body.scale).toFixed(3)})`;
      card.style.zIndex = String(index === hovered ? count + 1 : index + 1);
    });

    if (moving > 0.02) animationFrame = requestAnimationFrame(animate);
  };

  const wake = () => {
    if (animationFrame) return;
    previousTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  };

  const pickCard = (event) => {
    const bounds = root.getBoundingClientRect();
    const x = event.clientX - bounds.left - bounds.width / 2;
    const y = event.clientY - bounds.top - bounds.height / 2;
    let nearest = -1;
    let distance = Infinity;
    slots.forEach((slot, index) => {
      const nextDistance = Math.abs(x - slot.x);
      if (nextDistance < distance) {
        nearest = index;
        distance = nextDistance;
      }
    });
    if (nearest >= 0 && Math.abs(y - slots[nearest].y) <= slots[nearest].size / 2 + 12
      && distance <= slots[nearest].size / 2 + 12) {
      return nearest;
    }
    return -1;
  };

  const selectCard = (index) => {
    if (index < 0 || !onSelect) return;
    cards.forEach((card, cardIndex) => {
      card.toggleAttribute('data-selected', cardIndex === index);
      card.setAttribute('aria-pressed', String(cardIndex === index));
    });
    if (!reducedMotion) bodies[index].vs -= 2.2;
    wake();
    onSelect(index);
  };

  root.addEventListener('click', (event) => {
    if (preview) return;
    const focusedCard = cards.findIndex((card) => card === event.target || card.contains(event.target));
    selectCard(focusedCard >= 0 ? focusedCard : pickCard(event));
  });
  root.addEventListener('pointermove', (event) => {
    const next = pickCard(event);
    if (next !== hovered) {
      hovered = next;
      wake();
    }
  });
  root.addEventListener('pointerleave', () => {
    hovered = -1;
    wake();
  });
  root.addEventListener('focusin', (event) => {
    const index = cards.indexOf(event.target);
    if (index >= 0) {
      hovered = index;
      wake();
    }
  });
  root.addEventListener('focusout', () => {
    hovered = -1;
    wake();
  });
  if (!preview) {
    cards.forEach((card) => card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCard(cards.indexOf(card));
      }
    }));
  }

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      slots = getSlots();
      cards.forEach((card, index) => {
        card.style.width = `${slots[index].size}px`;
      });
      wake();
    });
    resizeObserver.observe(root);
  }
  wake();
  return root;
};
