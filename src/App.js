import "./App.css";
import React, { useEffect, useState } from "react";
import xml2js from "xml2js";

const corsAnywhere = "https://cors-anywhere.herokuapp.com/";

function App() {
  const [crossword, setCrossword] = useState();
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
        console.log(obj);
      });
  }, []);
  return <div className="App"></div>;
}

export default App;
