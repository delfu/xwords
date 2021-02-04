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
  corrects = 0;
  total = 0;
  title = "";
  constructor(data) {
    data = data.crossword;
    this.title = data.Title[0].$.v;
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

    // TODO: this is to initialize the board in case [0,0] is empty
    let start = { row: parsedAcross[0].row, col: parsedAcross[0].col };
    this.cursorX = start.col;
    this.cursorY = start.row;

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
        this.total++;
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

  step() {
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

  _isWordCompleted(clue, direction) {
    for (let i = 0; i < clue.a.length; i++) {
      const y = clue.row + (direction === 1 ? i : 0);
      const x = clue.col + (direction === 0 ? i : 0);
      if (this.guesses[y][x] !== this.reference[y][x]) {
        return {
          isComplete: false,
          x,
          y,
        };
      }
    }
    return {
      isComplete: true,
    };
  }

  // goes to the the next word with empty slot
  _nextWord(inc = 1) {
    const currClue = this.currentClue();
    const clues = this.direction === 0 ? this.cluesAcross : this.cluesDown;
    const indices = Object.keys(clues);
    let currClueIndex = indices.findIndex((cn) => cn === currClue.cn);
    while (currClueIndex + inc < indices.length && currClueIndex + inc >= 0) {
      const nextClue = clues[indices[currClueIndex + inc]];
      const completion = this._isWordCompleted(nextClue, this.direction);
      if (completion.isComplete) {
        currClueIndex += inc;
      } else {
        return this.setCursor(completion.x, completion.y);
      }
    }
    let nextClue = clues[indices[currClueIndex]];
    if (nextClue === currClue) {
      this.changeDirection();
      nextClue = inc > 0 ? this.firstClue() : this.lastClue();
      this.setCursor(nextClue.col, nextClue.row);
      const completion = this._isWordCompleted(nextClue, this.direction);
      if (completion.isComplete) {
        return this._nextWord(inc);
      } else {
        return this.setCursor(completion.x, completion.y);
      }
    }

    return this.setCursor(nextClue.col, nextClue.row);
  }
  nextWord() {
    return this._nextWord(1);
  }
  prevWord() {
    return this._nextWord(-1);
  }
  isBeginningOfWord() {
    const currClue = this.currentClue();
    return this.cursorX === currClue.col && this.cursorY === currClue.row;
  }
  changeDirection() {
    this.direction = (this.direction + 1) % 2;
  }
  _updateGuess(char) {
    if (
      this.guesses[this.cursorY][this.cursorX] ===
      this.reference[this.cursorY][this.cursorX]
    ) {
      this.corrects--;
    }
    this.guesses[this.cursorY][this.cursorX] = char;
    if (
      this.guesses[this.cursorY][this.cursorX] ===
      this.reference[this.cursorY][this.cursorX]
    ) {
      this.corrects++;
    }
  }
  keypress(char, shiftKey) {
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
      if (shiftKey) {
        this.prevWord();
      } else {
        this.nextWord();
      }
    } else if (char === "BACKSPACE") {
      this._updateGuess(" ");
      if (!this.isBeginningOfWord()) {
        this.prev();
      }
    } else if (isAlpha && char.length === 1) {
      this._updateGuess(char);
      if (char === this.reference[this.cursorY][this.cursorX]) {
        const currRange = this.currentWordRange();
        const currCharPos = currRange[currRange.length - 1];
        const isEnd =
          currCharPos[0] === this.cursorX && currCharPos[1] === this.cursorY;
        if (isEnd) {
          this.nextWord();
        } else {
          this.step();
        }
      }
    } else if (char === " ") {
      this.changeDirection();
    }
    return {
      x: this.cursorX,
      y: this.cursorY,
    };
  }

  currentClue() {
    const x = this.cursorX;
    const y = this.cursorY;
    let clue = null;
    const mapping = this.clueMap[y][x];
    if (this.direction === 0) {
      clue = this.cluesAcross[mapping.across.index];
    } else if (this.direction === 1) {
      clue = this.cluesDown[mapping.down.index];
    }
    return clue;
  }

  firstClue() {
    if (this.direction === 0) {
      const firstKey = Object.keys(this.cluesAcross)[0];
      return this.cluesAcross[firstKey];
    } else if (this.direction === 1) {
      const firstKey = Object.keys(this.cluesDown)[0];
      return this.cluesDown[firstKey];
    }
  }
  lastClue() {
    if (this.direction === 0) {
      const lastKey = Object.keys(this.cluesAcross)[
        Object.keys(this.cluesAcross).length - 1
      ];
      return this.cluesAcross[lastKey];
    } else if (this.direction === 1) {
      const lastKey = Object.keys(this.cluesDown)[
        Object.keys(this.cluesDown).length - 1
      ];
      return this.cluesDown[lastKey];
    }
  }

  currentWordRange() {
    const clue = this.currentClue();
    if (this.direction === 0) {
      return clue.a.split("").map((_, i) => [clue.col + i, clue.row]);
    } else if (this.direction === 1) {
      return clue.a.split("").map((_, i) => [clue.col, clue.row + i]);
    }
  }

  currentClueMapping() {
    const x = this.cursorX;
    const y = this.cursorY;
    const mapping = this.clueMap[y][x];
    return mapping;
  }

  isOver() {
    return this.total === this.corrects;
  }
}

export default Crossword;
