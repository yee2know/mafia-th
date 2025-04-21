export const createEffect = (container: HTMLElement, x: number, y: number, type: 'good' | 'bad') => {
  const effect = document.createElement("div");
  effect.style.position = "absolute";
  effect.style.left = `${x}px`;
  effect.style.top = `${y}px`;
  effect.style.width = "40px";
  effect.style.height = "40px";
  effect.style.backgroundImage = `url("/effects/${type === 'good' ? 'blood' : 'bad'}.gif")`;
  effect.style.backgroundSize = "cover";
  effect.style.zIndex = "1000";
  effect.style.pointerEvents = "none";
  container.appendChild(effect);
  setTimeout(() => effect.remove(), 500);
};
