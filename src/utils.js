// This function takes the input from the Rust smart contract
// and turns it into what the crossword library would like.
// Opportunity to enhance the library so this isn't necessary.
import * as nearAPI from 'near-api-js';

// Our API could be improved here :)
// See: https://github.com/near/near-api-js/issues/612
async function viewMethodOnContract(nearConfig, method) {
  const provider = new nearAPI.providers.JsonRpcProvider(nearConfig.nodeUrl);
  const rawResult = await provider.query(`call/${nearConfig.contractName}/${method}`, 'AQ4'); // Base 58 of '{}'
  return JSON.parse(rawResult.result.map((x) => String.fromCharCode(x)).join(''));
}

function parseSolutionSeedPhrase(data, gridData) {
  // JavaScript determining what the highest clue number is
  // Example: 10 if there are ten clues, some which have both across and down clues
  let totalClues = Object.keys(data.across).concat(Object.keys(data.down))
    .map(n => parseInt(n))
    .reduce((n, m) => Math.max(n, m));

  let seedPhrase = [];
  // Assume that crossword starts at 1 and goes to totalClues
  for (let i = 1; i <= totalClues; i++) {
    let word = '';
    // If a number has both across and down clues, do across first.
    let iString = i.toString(); // not strictly necessary
    if (data.across.hasOwnProperty(iString)) {
      const answerLength = data.across[i].answer.length;
      for (let j = 0; j < answerLength; j++) {
        word += gridData[data['across'][i].row][data['across'][i].col + j].guess;
      }
      seedPhrase.push(word);
    }
    word = ''; // Clear for items where there's both across and down
    if (data.down.hasOwnProperty(iString)) {
      const answerLength = data.down[i].answer.length;
      for (let j = 0; j < answerLength; j++) {
        word += gridData[data['down'][i].row + j][data['down'][i].col].guess;
      }
      seedPhrase.push(word);
    }
  }
  const finalSeedPhrase = seedPhrase.map(w => w.toLowerCase()).join(' ');
  console.log(`Crossword solution as seed phrase: %c${finalSeedPhrase}`, "color: #00C1DE;");
  return finalSeedPhrase;
}

/* Example of expected data for crossword library
  export const data = {
    across: {
      1: {
        clue: 'one plus one',
        answer: 'TWO',
        row: 0,
        col: 0,
      },
    },
    down: {
      2: {
        clue: 'three minus two',
        answer: 'ONE',
        row: 0,
        col: 2,
      },
    },
  };
*/

module.exports = {
  viewMethodOnContract,
  parseSolutionSeedPhrase
};
