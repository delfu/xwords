import React, { useEffect, useState, useContext } from "react";
import { GameContext } from "./App";

const Gamebar = () => {
  const [secs, setSecs] = useState(0);
  const { onPlayPause, isPlaying } = useContext(GameContext);
  const togglePlay = () => {
    onPlayPause(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      setSecs((s) => s + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isPlaying]);
  return (
    <div className="gamebar">
      {!isPlaying && (
        <span onClick={togglePlay} className="button item">
          <i className="fa fa-play" style={{ marginRight: 5 }}></i>
          Resume
        </span>
      )}
      {isPlaying && (
        <span onClick={togglePlay} className="button item">
          <i className="fa fa-pause" style={{ marginRight: 5 }}></i>
          Pause
        </span>
      )}
      <span className="item">
        {((secs / 60) >> 0).toString().padStart(2, "0")}:
        {(secs % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default Gamebar;
