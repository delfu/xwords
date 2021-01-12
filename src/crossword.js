class Crossword {
  reference = null;
  guesses = null;
  width = 0;
  height = 0;
  cursorX = 0;
  cursorY = 0;
  direction = 0; // 0 for horizontal, 1 for vert
  constructor(data) {
    data = data.crossword;
    this.width = parseInt(data.Width[0].$.v || 0);
    this.height = parseInt(data.Height[0].$.v || 0);

    const across = data.across[0];
    const acrossKeys = Object.keys(across).map((a) => {
      const entry = across[a][0].$;
      const row = ((parseInt(entry.n) - 1) / this.width) >> 0;
      const col = (parseInt(entry.n) - 1) % this.width;
      entry.row = row;
      entry.col = col;
      return entry;
    });
    this.reference = [];
    this.guesses = [];
    for (let i = 0; i < this.height; i++) {
      const row = [];
      for (let j = 0; j < this.width; j++) {
        row.push(null);
      }
      this.guesses.push(row);
      const refRow = [];
      for (let j = 0; j < this.width; j++) {
        refRow.push(null);
      }
      this.reference.push(refRow);
    }

    for (let i = 0; i < acrossKeys.length; i++) {
      const entry = acrossKeys[i];
      const { row, col } = entry;
      for (let c = 0; c < entry.a.length; c++) {
        this.reference[row][c + col] = entry.a[c];
        this.guesses[row][c + col] = "";
      }
    }
  }

  setCursor(x, y) {
    if (x < this.width && x >= 0 && y < this.height && y >= 0) {
      this.cursorX = x;
      this.cursorY = y;
    }
    return {
      x: this.cursorX,
      y: this.cursorY,
    };
  }

  _movement(inner) {
    do {
      inner();
    } while (
      this.cursorX < this.width &&
      this.cursorY < this.height &&
      this.reference[this.cursorY][this.cursorX] === null
    );
    return this.setCursor(
      Math.max(0, Math.min(this.cursorX, this.width - 1)),
      Math.max(0, Math.min(this.cursorY, this.height - 1))
    );
  }

  right() {
    return this._movement(() => (this.cursorX += 1));
  }
  down() {
    return this._movement(() => (this.cursorY += 1));
  }
  up() {
    return this._movement(() => (this.cursorY -= 1));
  }
  left() {
    return this._movement(() => (this.cursorX -= 1));
  }

  next() {
    if (this.direction === 0) {
      return this.right();
    } else if (this.direction === 1) {
      return this.down();
    }
  }
  prev() {
    if (this.direction === 0) {
      return this.left();
    } else if (this.direction === 1) {
      return this.up();
    }
  }
  nextWord() {
    // TODO: implement
    return this.next();
  }
  changeDirection() {
    this.direction = (this.direction + 1) % 2;
  }

  keypress(char) {
    char = char.toUpperCase();
    const isAlpha = /[A-Z]/.test(char);

    if (char === "ARROWRIGHT") {
      this.right();
    } else if (char === "ARROWDOWN") {
      this.down();
    } else if (char === "ARROWLEFT") {
      this.left();
    } else if (char === "ARROWUP") {
      this.up();
    } else if (char === "ENTER") {
      this.changeDirection();
    } else if (char === "TAB") {
      this.nextWord();
    } else if (char === "BACKSPACE") {
      this.guesses[this.cursorY][this.cursorX] = " ";
      this.prev();
    } else if (isAlpha && char.length === 1) {
      this.guesses[this.cursorY][this.cursorX] = char;
      if (char === this.reference[this.cursorY][this.cursorX]) {
        this.next();
      }
    } else if (char === " ") {
      this.next();
    }
    return {
      x: this.cursorX,
      y: this.cursorY,
    };
  }
}

export default Crossword;
