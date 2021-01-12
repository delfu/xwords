import React, {
  useState,
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
const GameContext = createContext({
  cursorX: 0,
  cursorY: 0,
  onCellClick: (x, y) => {},
});

const Cell = ({ content, reference, x, y }) => {
  let className = "cell";
  let displayContent = content;
  const { onCellClick, cursorX, cursorY, clueMap } = useContext(GameContext);
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
  const [direction, setDirection] = useState(0);
  const [lastGuessed, setLastGuessed] = useState(null);
  const onCellClick = useCallback(
    (newX, newY) => {
      if (game.cursorX === newX && game.cursorY === newY) {
        game.changeDirection();
      }
      let { x, y, direction } = game.setCursor(newX, newY);
      setCursorX(x);
      setCursorY(y);
      setDirection(direction);
    },
    [game]
  );
  const onKeydown = useCallback(
    (event) => {
      let { x, y } = game.keypress(event.key);
      setLastGuessed(`${game.cursorX}:${game.cursorY}:${event.key}`);
      setCursorX(x);
      setCursorY(y);
      event.preventDefault();
      return false;
    },
    [game]
  );
  useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);
  return (
    <div className="board">
      <GameContext.Provider
        value={{
          cursorX,
          cursorY,
          direction,
          onCellClick,
          lastGuessed,
          clueMap: game.clueMap,
        }}
      >
        {game.guesses.map((row, r) => {
          return <Row row={row} refRow={game.reference[r]} key={r} y={r} />;
        })}
      </GameContext.Provider>
    </div>
  );
};

export default Board;
