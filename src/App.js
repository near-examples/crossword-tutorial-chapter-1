import './App.css';
import React, { useCallback, useRef, useState } from 'react';
import Crossword from 'react-crossword-near';
import { parseSolutionSeedPhrase } from './utils';
import { createGridData, loadGuesses } from "react-crossword-near/dist/es/util";
import sha256 from 'js-sha256';

const App = ({ data, solutionHash }) => {
  const crossword = useRef();
  const [solutionFound, setSolutionFound] = useState("Not correct yet");

  const onCrosswordComplete = useCallback(
    async (completeCount) => {
      if (completeCount !== false) {
        let gridData = createGridData(data).gridData;
        loadGuesses(gridData, 'guesses');
        await checkSolution(gridData);
      }
    },
    []
  );

  // This function is called when all entries are filled
  async function checkSolution(gridData) {
    let seedPhrase = parseSolutionSeedPhrase(data, gridData);
    let answerHash = sha256.sha256(seedPhrase);
    // Compare crossword solution's public key with the known public key for this puzzle
    // (It was given to us when we first fetched the puzzle in index.js)
    if (answerHash === solutionHash) {
      console.log("You're correct!");
      setSolutionFound("Correct!");
    } else {
      console.log("That's not the correct solution. :/");
      setSolutionFound("Not correct yet");
    }
  }

  return (
    <div id="page">
      <h1>NEAR Crossword Puzzle</h1>
      <div id="crossword-wrapper">
        <h3>Status: { solutionFound }</h3>
        <Crossword
          data={data}
          ref={crossword}
          onCrosswordComplete={onCrosswordComplete}
        />
        <p>Thank you <a href="https://github.com/JaredReisinger/react-crossword" target="_blank" rel="noreferrer">@jaredreisinger/react-crossword</a>!</p>
      </div>
    </div>
  );
}

export default App;
