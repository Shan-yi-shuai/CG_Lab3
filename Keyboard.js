
"use strict";

class KeyboardController {
  constructor() {
    this.last = 0;
    this.keyMap = new Map();

    document.addEventListener('keydown', (event)=> {
      if (!this.keyMap.get(event.key)) return;
      this.keyMap.get(event.key).on();
    });
    document.addEventListener('keyup', (event)=> {
      if (!this.keyMap.get(event.key)) return;
      this.keyMap.get(event.key).off();
    })
  }

  bind(key, callback) {
    this.keyMap.set(key, callback);
    return this;
  }
}