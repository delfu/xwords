function clueParsing(clues, index, width, height) {
  const entry = clues[index][0].$;
  const row = ((parseInt(entry.n) - 1) / width) >> 0;
  const col = (parseInt(entry.n) - 1) % width;
  entry.row = row;
  entry.col = col;
  return entry;
}
class Crossword {
  reference = [];
  guesses = [];
  clueMap = [];
  width = 0;
  height = 0;
  cursorX = 0;
  cursorY = 0;
  direction = 0; // 0 for horizontal, 1 for vert
  cluesDown = {};
  cluesAcross = {};
  constructor(data) {
    data = data.crossword;
    this.width = parseInt(data.Width[0].$.v || 0);
    this.height = parseInt(data.Height[0].$.v || 0);

    const parsedAcross = Object.keys(data.across[0]).map((a) =>
      clueParsing(data.across[0], a, this.width, this.height)
    );
    const parsedDown = Object.keys(data.down[0]).map((a) =>
      clueParsing(data.down[0], a, this.width, this.height)
    );
    parsedDown.forEach((clue) => {
      this.cluesDown[clue.cn] = clue;
    });
    parsedAcross.forEach((clue) => {
      this.cluesAcross[clue.cn] = clue;
    });
    for (let i = 0; i < this.height; i++) {
      const row = [];
      for (let j = 0; j < this.width; j++) {
        row.push(null);
      }
      this.guesses.push([...row]);
      this.reference.push([...row]);
      this.clueMap.push([...row]);
    }

    for (let i = 0; i < parsedAcross.length; i++) {
      const entry = parsedAcross[i];
      const { row, col } = entry;
      for (let c = 0; c < entry.a.length; c++) {
        this.reference[row][col + c] = entry.a[c];
        this.clueMap[row][col + c] = {
          across: {
            index: entry.cn,
            isStart: c === 0,
          },
        };
        this.guesses[row][col + c] = "";
      }
    }
    parsedDown.forEach((entry) => {
      for (let r = 0; r < entry.a.length; r++) {
        this.clueMap[entry.row + r][entry.col].down = {
          index: entry.cn,
          isStart: r === 0,
        };
      }
    });
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
    let newX = this.cursorX;
    let newY = this.cursorY;
    do {
      const { x, y } = inner(newX, newY);
      newX = x;
      newY = y;
    } while (
      newX < this.width &&
      newY < this.height &&
      newX >= 0 &&
      newY >= 0 &&
      this.reference[newY][newX] === null
    );
    return this.setCursor(newX, newY);
  }

  right() {
    return this._movement((x, y) => ({ x: x + 1, y }));
  }
  down() {
    return this._movement((x, y) => ({ x, y: y + 1 }));
  }
  up() {
    return this._movement((x, y) => ({ x, y: y - 1 }));
  }
  left() {
    return this._movement((x, y) => ({ x: x - 1, y }));
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

  currentWordRange() {
    const x = this.cursorX;
    const y = this.cursorY;
    let clue = null;
    const mapping = this.clueMap[y][x];
    if (this.direction === 0) {
      clue = this.cluesAcross[mapping.across.index];
      return clue.a.split("").map((_, i) => [clue.row, clue.col + i]);
    } else if (this.direction === 1) {
      clue = this.cluesDown[mapping.down.index];
      return clue.a.split("").map((_, i) => [clue.row + i, clue.col]);
    }
  }

  currentClueMapping() {
    const x = this.cursorX;
    const y = this.cursorY;
    const mapping = this.clueMap[y][x];
    return mapping;
  }
}

export default Crossword;
