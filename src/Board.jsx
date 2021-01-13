import React, {
  useState,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";

import { GameContext } from "./App";

const BoardContext = createContext({
  cursorX: 0,
  cursorY: 0,
  currRange: [],
  direction: 0,
  onCellClick: (x, y) => {},
  lastGuessed: "",
  clueMap: {},
});

const Cell = ({ content, reference, x, y }) => {
  let className = "cell";
  let displayContent = content;
  const { onCellClick, cursorX, cursorY, clueMap, currRange } = useContext(
    BoardContext
  );
  const onClick = useCallback(() => {
    if (content !== null) {
      onCellClick(x, y);
    }
  }, [onCellClick, x, y, content]);

  if (content === null) {
    className += " blank";
    displayContent = "\xa0";
  }

  if (x === cursorX && y === cursorY) {
    className += " selected";
  }

  if (content !== "" && content !== null && content !== reference) {
    className += " incorrect";
  }

  if (currRange.filter((r) => r[0] === x && r[1] === y).length > 0) {
    className += " in-range";
  }

  let indicator = null;
  if (clueMap[y][x] && clueMap[y][x].across.isStart) {
    indicator = <span className="indicator">{clueMap[y][x].across.index}</span>;
  } else if (clueMap[y][x] && clueMap[y][x].down.isStart) {
    indicator = <span className="indicator">{clueMap[y][x].down.index}</span>;
  }

  return (
    <span className={className} onClick={onClick}>
      {indicator}
      {displayContent}
    </span>
  );
};

const Row = ({ row, refRow, y }) => {
  return (
    <div>
      {row.map((cell, c) => (
        <Cell
          key={`${row}:${c}`}
          content={cell}
          reference={refRow[c]}
          x={c}
          y={y}
        />
      ))}
    </div>
  );
};

const Board = ({ game }) => {
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);
  const [currRange, setCurrRange] = useState([]);
  const [direction, setDirection] = useState(0);
  const [lastGuessed, setLastGuessed] = useState(null);
  const { onCellChanged } = useContext(GameContext);
  const setBoardCursor = useCallback(
    (game) => {
      setCursorX(game.cursorX);
      setCursorY(game.cursorY);
      setCurrRange(game.currentWordRange());
      setDirection(game.direction);
      onCellChanged();
    },
    [onCellChanged]
  );
  const onCellClick = useCallback(
    (newX, newY) => {
      if (game.cursorX === newX && game.cursorY === newY) {
        game.changeDirection();
      }
      game.setCursor(newX, newY);
      setBoardCursor(game);
    },
    [game, setBoardCursor]
  );
  const onKeydown = useCallback(
    (event) => {
      game.keypress(event.key, event.shiftKey);
      setLastGuessed(`${game.cursorX}:${game.cursorY}:${event.key}`);
      setBoardCursor(game);
      event.preventDefault();
      return false;
    },
    [game, setBoardCursor]
  );
  useEffect(() => {
    setBoardCursor(game);
  }, [game, setBoardCursor]);
  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);
  return (
    <div className="board">
      <BoardContext.Provider
        value={{
          cursorX,
          cursorY,
          currRange,
          direction,
          onCellClick,
          lastGuessed,
          clueMap: game.clueMap,
        }}
      >
        {game.guesses.map((row, r) => {
          return <Row row={row} refRow={game.reference[r]} key={r} y={r} />;
        })}
      </BoardContext.Provider>
    </div>
  );
};

export default Board;
