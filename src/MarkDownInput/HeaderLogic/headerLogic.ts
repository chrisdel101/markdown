import { getStartIndexesOfEachLineArr, indexInsideInputString, removePreviousSymbols } from '../markDownInputUtils';
import React from 'react';
import { CursorState } from '../MarkDownInput';

interface HeaderLogic {
  currentClick: string;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  cursorIndexes: CursorState;
}
const headerLogic = ({ inputValue, currentClick, setInputValue, cursorIndexes }: HeaderLogic) => {
  let splitInputOnNewlines = inputValue.split('\n');
  // assign so each index is the start of a new line
  const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1);
  console.log('indexesArr', indexesArr);
  // use array to get index within string where this part starts
  let clickedIndex = indexInsideInputString(indexesArr, cursorIndexes);
  console.log('clicked Index', clickedIndex);
  let inputArr = inputValue.split('');
  console.log('inputArr', inputArr);
  switch (currentClick) {
    case 'h1':
      console.log('h1');
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '#') {
        inputArr.splice(clickedIndex, 0, `# `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
    case 'h2':
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '##') {
        inputArr.splice(clickedIndex, 0, `## `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
    case 'h3':
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '###') {
        inputArr.splice(clickedIndex, 0, `### `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
    case 'h4':
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '####') {
        inputArr.splice(clickedIndex, 0, `#### `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
    case 'h5':
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '######') {
        inputArr.splice(clickedIndex, 0, `##### `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
    case 'h6':
      inputArr = removePreviousSymbols(inputArr, clickedIndex, setInputValue);
      if (inputArr[clickedIndex] !== '#######') {
        inputArr.splice(clickedIndex, 0, `###### `);
        let y = inputArr.join('');
        setInputValue(y);
      }
      break;
  }
};

export default headerLogic;
