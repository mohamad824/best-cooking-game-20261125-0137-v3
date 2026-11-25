// Keyboard + mouse input. Tracks held keys and fires one-shot presses
// (E, Q, M, digits, Enter, Space) through callbacks set by main.js.
export class Input {
  constructor(canvas) {
    this.keys = { left: false, right: false, up: false, down: false, e: false };
    this.onPressE = null;
    this.onPressQ = null;
    this.onPressM = null;
    this.onDigit = null;
    this.onConfirm = null;
    this.onClick = null;
    this._down = (ev) => {
      const k = ev.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
      if (k === 'arrowleft' || k === 'a') this.keys.left = true;
      if (k === 'arrowright' || k === 'd') this.keys.right = true;
      if (k === 'arrowup' || k === 'w') this.keys.up = true;
      if (k === 'arrowdown' || k === 's') this.keys.down = true;
      if ((k === 'e' || k === ' ') && !ev.repeat) {
        this.keys.e = true;
        this.onPressE?.();
      }
      if (k === 'q' && !ev.repeat) this.onPressQ?.();
      if (k === 'm' && !ev.repeat) this.onPressM?.();
      if (k === 'enter' && !ev.repeat) this.onConfirm?.();
      if (/^[1-6]$/.test(k) && !ev.repeat) this.onDigit?.(Number(k));
    };
    this._up = (ev) => {
      const k = ev.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') this.keys.left = false;
      if (k === 'arrowright' || k === 'd') this.keys.right = false;
      if (k === 'arrowup' || k === 'w') this.keys.up = false;
      if (k === 'arrowdown' || k === 's') this.keys.down = false;
      if (k === 'e' || k === ' ') this.keys.e = false;
    };
    this._click = (ev) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 1280;
      const y = ((ev.clientY - rect.top) / rect.height) * 720;
      this.onClick?.(x, y);
    };
    window.addEventListener('keydown', this._down);
    window.addEventListener('keyup', this._up);
    canvas.addEventListener('click', this._click);
  }
}
