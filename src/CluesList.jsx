import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  createRef,
} from "react";
import { GameContext } from "./App";

function clueKey(cn, direction) {
  return `clue-${direction}-${cn}`;
}

function decode(string) {
  const matches = string.match(/%[0-9][0-9]/g) || [];
  matches.forEach((m) => {
    string = string.replaceAll(m, decodeURIComponent(m));
  });
  return string;
}

const CluesList = ({ game, direction, highlighted }) => {
  const [currCn, setCurrCn] = useState(0);

  const cluesMap = direction === 0 ? game.cluesAcross : game.cluesDown;
  const clues = Object.keys(cluesMap).map((id) => cluesMap[id]);
  const { currentClueIndices } = useContext(GameContext);

  const refs = clues.reduce((acc, clue) => {
    acc[clueKey(clue.cn, direction)] = createRef();
    return acc;
  }, {});

  const scrollToClue = useCallback(
    (id) => {
      if (!refs[id]) {
        return;
      }

      refs[id].current.scrollIntoView({
        behavior: "auto",
        block: "center",
      });
    },
    [refs]
  );

  useEffect(() => {
    let retval = "";
    if (direction === 0) {
      retval = currentClueIndices.across;
    } else {
      retval = currentClueIndices.down;
    }
    setCurrCn(retval);
    const clueToScrollTo = clueKey(retval, direction);
    scrollToClue(clueToScrollTo);
  }, [currentClueIndices, direction, scrollToClue]);

  const className = useCallback(
    (clue) => {
      if (clue.cn === currCn) {
        return highlighted ? "selected highlighted" : "selected";
      }
      return null;
    },
    [currCn, highlighted]
  );

  return (
    <div>
      <h2>{direction === 0 ? "Across" : "Down"}</h2>
      <div className="clue-list" key={`clues-list-${direction}`}>
        {clues.map((clue) => (
          <div
            key={clueKey(clue.cn, direction)}
            ref={refs[clueKey(clue.cn, direction)]}
            className={className(clue, highlighted)}
          >
            <span>{clue.cn}.&nbsp;</span>
            {decode(clue.c)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CluesList;
