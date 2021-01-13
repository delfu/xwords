import "./App.css";
import React, { useEffect, useState, createContext, useCallback } from "react";
import xml2js from "xml2js";

import Crossword from "./crossword";
import Board from "./Board";
import CluesList from "./CluesList";
import Gamebar from "./Gamebar";

const corsAnywhere = "https://cors-anywhere.herokuapp.com/";

export const GameContext = createContext({
  currentClueIndices: {},
  onCellChanged: () => {},
  onPlayPause: (b) => {},
});

function App() {
  const [crossword, setCrossword] = useState();
  const [currentClueIndices, setCurrentClueIndices] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
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

  const onPlayPause = (isPlaying) => {
    setIsPlaying(isPlaying);
  };

  return (
    <div className="App">
      {crossword && (
        <div>
          <GameContext.Provider
            value={{
              currentClueIndices,
              onCellChanged,
              onPlayPause,
            }}
          >
            <Gamebar />
            <div
              className={`game-container ${isPlaying ? "playing" : "paused"}`}
            >
              <div className={`game-area`}>
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
              </div>
              <div className="veil"></div>
            </div>
          </GameContext.Provider>
        </div>
      )}
    </div>
  );
}

export default App;
