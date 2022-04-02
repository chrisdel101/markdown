import { ButtonState, FocusState, CursorState } from '../MarkDownInput';

interface IconLogicInput {
  currentClick: string;
  inputValue: string;
  buttonState: ButtonState;
  cursorIndexes: CursorState;
  markdownSymbol: string;
  inputFocusState: FocusState;
}
export interface IconLogicOutput {
  _inputValue: string;
  _cursorIndexes: CursorState;
  _buttonState: ButtonState;
}

const IconLogic = ({
  currentClick,
  inputValue,
  buttonState,
  cursorIndexes,
  markdownSymbol,
  inputFocusState,
}: IconLogicInput) => {
  let buttonStateCopy = { ...buttonState };
  // logic for highlighting text
  if (cursorIndexes.startIndex !== cursorIndexes.endIndex && cursorIndexes.endIndex !== 0) {
    // toggle state of button clicked on highlght only
    //@ts-ignore
    let buttonStateCopy = { ...buttonState, [currentClick]: !buttonState[currentClick as keyof typeof ButtonState] };
    //@ts-ignore
    if (buttonStateCopy[currentClick]) {
      // handle multiple icons clicked at once - uses button state
      if (Object.values(buttonState).includes(true)) {
        // console.log('middle');
        let inputArr = inputValue.split('');
        inputArr.splice(cursorIndexes.startIndex, 0, markdownSymbol);
        inputArr.splice(cursorIndexes.endIndex + markdownSymbol.length, 0, markdownSymbol);
        let y = inputArr.join('');
        return {
          _inputValue: y,
          _cursorIndexes: {
            startIndex: cursorIndexes.startIndex,
            endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
          },
          _buttonState: buttonStateCopy,
        };
        // setInputValue(y);
        // setCursorIndexes({
        //   startIndex: cursorIndexes.startIndex,
        //   endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
        // });
      } else {
        // handle single icon click
        console.log('highlight');
        let inputArr = inputValue.split('');
        inputArr.splice(cursorIndexes.startIndex, 0, markdownSymbol);
        inputArr.splice(cursorIndexes.endIndex + 1, 0, markdownSymbol);
        let y = inputArr.join('');
        let markdownSymbolsLength = markdownSymbol.length;
        return {
          _inputValue: y,
          _cursorIndexes: {
            startIndex: cursorIndexes.startIndex,
            endIndex: cursorIndexes.endIndex + markdownSymbolsLength + markdownSymbolsLength,
          },
          _buttonState: buttonStateCopy,
        };
        // setInputValue(y);
        // setCursorIndexes({
        //   startIndex: cursorIndexes.startIndex,
        //   endIndex: cursorIndexes.endIndex + markdownSymbolsLength + markdownSymbolsLength,
        // });
      }
    } else {
      // toggle off highighted text
      console.log('highlight off');
      let markdownSymbolsLength = markdownSymbol.length;
      let inputArr = inputValue.split('');
      inputArr.splice(cursorIndexes.startIndex, markdownSymbolsLength);
      inputArr.splice(cursorIndexes.endIndex - markdownSymbolsLength - markdownSymbolsLength, markdownSymbolsLength);
      let y = inputArr.join('');
      return {
        _inputValue: y,
        _cursorIndexes: {
          startIndex: cursorIndexes.startIndex,
          endIndex: cursorIndexes.endIndex - markdownSymbolsLength - markdownSymbolsLength,
        },
        _buttonState: buttonStateCopy,
      };
      // setInputValue(y);
      // setCursorIndexes({
      //   startIndex: cursorIndexes.startIndex,
      //   endIndex: cursorIndexes.endIndex - markdownSymbolsLength - markdownSymbolsLength,
      // });
    }
  } else {
    // if input value has NOT changed then user has clicked inside the box, so moves cursor to this position in middle of string
    if (inputValue === inputFocusState.previousInputValue) {
      console.log('here1');
      let inputArr = inputValue.split('');
      inputArr.splice(cursorIndexes.startIndex, 0, markdownSymbol);
      inputArr.splice(cursorIndexes.endIndex + 1, 0, markdownSymbol);
      let y = inputArr.join('');
      return {
        _inputValue: y,
        _cursorIndexes: {
          startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
          endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
        },
        _buttonState: buttonStateCopy,
      };
      // setInputValue(y);
      // // manually move cursor
      // setCursorIndexes({
      //   startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
      //   endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
      // });
      // when adding multiple icons the same in a row
    } else if (inputFocusState.currentClick === currentClick && inputFocusState.currentClick !== 'input') {
      console.log('click2');
      let inputArr = inputValue.split('');
      inputArr.splice(cursorIndexes.startIndex, 0, markdownSymbol);
      inputArr.splice(cursorIndexes.endIndex, 0, markdownSymbol);
      let y = inputArr.join('');
      return {
        _inputValue: y,
        _cursorIndexes: {
          startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
          endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
        },
        _buttonState: buttonStateCopy,
      };
      // setInputValue(y);
      // setCursorIndexes({
      //   startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
      //   endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
      // });
      // if field complety empty and button click occurs
    } else if (!inputFocusState.currentClick) {
      console.log('start Fresh');
      let temp = `${inputValue}${markdownSymbol}${markdownSymbol}`;
      return {
        _inputValue: temp,
        _cursorIndexes: {
          startIndex: inputValue.length + 4,
          endIndex: inputValue.length + 4,
        },
        _buttonState: buttonStateCopy,
      };
      // setInputValue(temp);
      // setCursorIndexes({
      //   startIndex: inputValue.length + 4,
      //   endIndex: inputValue.length + 4,
      // });
    } else {
      //NEED LOGIC TO CHECK IF SAME SYMBOL IN MIDDLE OR new AT END
      console.log('here2');
      if (cursorIndexes.endIndex === inputValue.length) {
        console.log('top');
        // user has not clicked, so put symbols at end of line
        let temp = `${inputValue}${markdownSymbol}${markdownSymbol}`;
        return {
          _inputValue: temp,
          _cursorIndexes: {
            startIndex: inputValue.length + 4,
            endIndex: inputValue.length + 4,
          },
          _buttonState: buttonStateCopy,
        };
        // setInputValue(temp);
        // setCursorIndexes({
        //   startIndex: inputValue.length + 4,
        //   endIndex: inputValue.length + 4,
        // });
      } else {
        console.log('bottom');
        let inputArr = inputValue.split('');
        inputArr.splice(cursorIndexes.startIndex, 0, markdownSymbol);
        inputArr.splice(cursorIndexes.endIndex, 0, markdownSymbol);
        let y = inputArr.join('');
        return {
          _inputValue: y,
          _cursorIndexes: {
            startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
            endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
          },
          _buttonState: buttonStateCopy,
        };
        // setInputValue(y);
        // setCursorIndexes({
        //   startIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
        //   endIndex: cursorIndexes.endIndex + markdownSymbol.length + markdownSymbol.length,
        // });
      }
    }
  }
};

export default IconLogic;
