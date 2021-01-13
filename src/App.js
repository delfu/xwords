import "./App.css";
import React, { useEffect, useState, createContext, useCallback } from "react";
import xml2js from "xml2js";

import Crossword from "./crossword";
import Board from "./Board";
import CluesList from "./CluesList";

const corsAnywhere = "https://cors-anywhere.herokuapp.com/";

export const CluesContext = createContext({
  currentClueIndices: {},
  onCellChanged: () => {},
});

function App() {
  const [crossword, setCrossword] = useState();
  const [currentClueIndices, setCurrentClueIndices] = useState({});
  useEffect(() => {
    let [month, date, year] = new Date().toLocaleDateString("en-US").split("/");
    month = month.padStart(2, "0");
    date = date.padStart(2, "0");
    year = year.slice(2, 4);
    fetch(
      `${corsAnywhere}http://picayune.uclick.com/comics/usaon/data/usaon${year}${month}${date}-data.xml`,
      {
        origin: "http://example.com",
      }
    )
      .then((res) => res.text())
      .then((text) => xml2js.parseStringPromise(text))
      .then((obj) => {
        const game = new Crossword(obj);
        window.game = game;
        setCrossword(game);
      });
  }, []);

  const onCellChanged = useCallback(() => {
    if (!crossword) {
      return;
    }
    const curr = crossword.currentClueMapping();
    setCurrentClueIndices({
      across: curr.across.index,
      down: curr.down.index,
      highlightDirection: crossword.direction,
    });
  }, [crossword]);

  return (
    <div className="App">
      {crossword && (
        <div className="game-area">
          <CluesContext.Provider
            value={{
              currentClueIndices,
              onCellChanged,
            }}
          >
            <Board game={crossword} />
            <div className="clues-area">
              <CluesList
                direction={0}
                highlighted={currentClueIndices.highlightDirection === 0}
                game={crossword}
              />
              <CluesList
                direction={1}
                highlighted={currentClueIndices.highlightDirection === 1}
                game={crossword}
              />
            </div>
          </CluesContext.Provider>
        </div>
      )}
    </div>
  );
}

export default App;
