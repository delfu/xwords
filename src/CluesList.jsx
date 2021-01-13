import React, { useCallback, useContext } from "react";
import { CluesContext } from "./App";

const CluesList = ({ game, direction, highlighted }) => {
  const cluesMap = direction === 0 ? game.cluesAcross : game.cluesDown;
  const clues = Object.keys(cluesMap).map((id) => cluesMap[id]);
  const { currentClueIndices } = useContext(CluesContext);

  const className = useCallback(
    (clue) => {
      if (direction === 0 && clue.cn === currentClueIndices.across) {
        return "selected";
      } else if (direction === 1 && clue.cn === currentClueIndices.down) {
        return "selected";
      }
      return null;
    },
    [currentClueIndices, direction]
  );

  return (
    <div className="clue-list" key={`clues-list-${direction}`}>
      <h2>{direction === 0 ? "Across" : "Down"}</h2>
      {clues.map((clue) => (
        <div key={`clue-${direction}-${clue.cn}`} className={className(clue)}>
          <span>{clue.cn}.&nbsp;</span>
          {decodeURIComponent(clue.c)}
        </div>
      ))}
    </div>
  );
};

export default CluesList;
