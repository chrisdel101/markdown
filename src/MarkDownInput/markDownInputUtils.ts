import { CursorState, ButtonState } from './MarkDownInput'
import { List, ListTypes } from './ListLogic/listMethods'

export const regex = {
  isOrderListIndexAtLineStartWithContent: /^\d+\.\s\w+/,
  isListIndexAtLineStartWithContent: /^\*\s\w+/,
  isOrderedListIndexAtLineStart: /^\d+\.\s/,
  isListSymbolAtLineStart: /^\*\s/,
  isOrderedListItemAloneOnLine: /^\d+\.\s?$/,
  isListItemAloneOnLine: /^\*\s?$/,
  lineNotWhiteSpace: /\S/,
  isOnlyNewlineChar: /^\n$/,
}
export const onDeleteSpaceAndLineFormatter = (
  strSplitOnNewLines: string[],
  currentLineNumber: number
) => {
  // console.log('current');
  return strSplitOnNewLines.map((line, index) => {
    // console.log('line', line);
    // check to avoid touching blank string at end
    if (strSplitOnNewLines[index + 1] !== undefined) {
      // on delete, add double space to list previous line
      if (index === currentLineNumber - 1) {
        return `${line.trim()}  \n`
        // if list is part of a list just trim
      } else if (
        regex.isOrderedListIndexAtLineStart.test(line) ||
        regex.isListSymbolAtLineStart.test(line)
      ) {
        return `${line.trim()}\n`
        // if not list items
      } else {
        // if not whitespace
        if (regex.lineNotWhiteSpace.test(line)) {
          // trim and re-add proper space and lines
          return `${line.trim()}  \n`
        } else {
          // if whitepspace add single space
          return `\n`
        }
      }
    }
    return line
  })
}
export const onAddSpaceLineFormatter = (
  strSplitOnNewLines: string[],
  listType?: ListTypes
) => {
  const aloneRegex = (line: string) => {
    return listType === ListTypes.list
      ? regex.isListItemAloneOnLine.test(line)
      : regex.isOrderedListItemAloneOnLine.test(line)
  }
  const startRegex = (line: string) => {
    return listType === ListTypes.list
      ? regex.isListIndexAtLineStartWithContent.test(line)
      : regex.isOrderListIndexAtLineStartWithContent.test(line)
  }
  return strSplitOnNewLines.map((line, index) => {
    // console.log('input', line);
    // check to avoid touching blank string at end
    if (strSplitOnNewLines[index + 1] === undefined) return line
    // if list is part of a list just trim
    if (aloneRegex(line)) {
      if (!strSplitOnNewLines[index + 1]) {
        // if next item, like 2, is also a num alone, then prob a broken-up line so add line break after solo digit ['1. ', '2. ', 'hello']
        return line
      } else if (aloneRegex(strSplitOnNewLines[index + 1])) {
        // console.log('item alone here');
        return `${line.trim()}\n`
        // if next item starts with item index and has content like,  3. hello
      } else if (startRegex(strSplitOnNewLines[index + 1])) {
        return `${line.trim()}\n`
      } else {
        console.log('item alone   ', line)
        return line
      }
    } else if (startRegex(line)) {
      return `${line.trim()}\n`
    } else if (regex.lineNotWhiteSpace.test(line)) {
      //  checl if prev item is index item alone, means midline break
      if (
        strSplitOnNewLines[index - 1] !== 'undefined' &&
        aloneRegex(strSplitOnNewLines[index - 1])
      ) {
        // console.log('midline break', line);
        // it's a mid-list item, so trim it, single space
        return `${line.trim()}\n`
      } else {
        // console.log('normal');
        // trim and re-add proper space and lines
        return `${line.trim()}  \n`
      }
    } else {
      // console.log('whitesapce');
      // if whitepspace add single space
      return `\n`
    }
  })
}
export const removePreviousSymbols = (
  inputArr: string[],
  ind: number,
  setInputValue: React.Dispatch<React.SetStateAction<string>>
) => {
  let _inputArrCopy = [...inputArr]
  // loop unitl # symbol is not found
  for (
    let counter = ind;
    inputArr[counter] === '#' || inputArr[counter] === ` `;
    counter++
  ) {
    // remove one item from each counter iteration
    // use delete to keep indexes intact for now
    delete _inputArrCopy[counter]
  }
  // filter out deleted cells
  _inputArrCopy = _inputArrCopy.filter((i) => i)
  let y = _inputArrCopy.join('').trim()
  setInputValue(y)
  return _inputArrCopy
}
export const indexInsideInputString = (
  indexesArr: number[],
  cursorIndexes: CursorState
) => {
  // default to zero
  let clickedIndex = 0
  for (let j = indexesArr.length - 1; j >= 0; j--) {
    if (cursorIndexes.startIndex >= indexesArr[j]) {
      clickedIndex = indexesArr[j]
      return clickedIndex
    }
  }
  return clickedIndex
}
// used to update state of currnetLineNumber
export const getCurrentLine = (
  indexesArr: number[],
  cursorIndexes: CursorState
) => {
  // console.log('CURRENT', cursorIndexes.start);
  for (let j = indexesArr.length - 1; j >= 0; j--) {
    // console.log('index', indexesArr[j]);
    if (cursorIndexes.startIndex >= indexesArr[j]) {
      return j
    }
  }
  return 0
}
// get line cursor is on inside a list
// used to update state of currnetLineNumber
export const getCurrentLineInsideList = (
  list: List,
  cursorIndexes: CursorState
) => {
  // console.log('CURRENT', cursorIndexes.startIndex);
  for (let j = list.lineIndexes.length - 1; j >= 0; j--) {
    // console.log('index', list.lineIndexes[j]);
    if (cursorIndexes.startIndex >= list.lineIndexes[j]) {
      return j
    }
  }
}
// takes list split on new lines and gives index where each line starts in array
// spaceToAdd - split strips out some whitespaces so this extra spaces adds them back in
export const getStartIndexesOfEachLineArr = (
  splitInputOnNewlines: string[],
  spacesToAdd: number
) => {
  // console.log('INPUT', splitInputOnNewlines);
  // console.log('NUM', spacesToAdd);
  let obj = {}
  let prevLength = 0
  return splitInputOnNewlines
    .map((word) => {
      // console.log('word', word, word.length);
      //@ts-ignore
      // console.log('word splitArr', word.split(''));
      let tempLen = prevLength
      // add spaces at end of each line
      prevLength += word.length + spacesToAdd
      //@ts-ignore
      obj[word] = {
        start: tempLen,
        end: prevLength,
      }
      // console.log('OBJ', obj);
      return tempLen
    }) //filter out undefined to get empty arr
    .filter((i) => {
      if (i !== undefined && i !== null) return true
    })
}
// return index to index of each list
export const getListRanges = (listsArr: List[], listsArrParam?: List[]) => {
  if (listsArrParam && listsArrParam.length > 0) {
    return listsArrParam.map((obj) => {
      return { startIndex: obj.startIndex, endIndex: obj.endIndex }
    })
  } else if (listsArr.length > 0) {
    return listsArr.map((obj) => {
      return { startIndex: obj.startIndex, endIndex: obj.endIndex }
    })
  }
}
// check if cursor is inside list listRanges, return list index or undefined - for when we are clicking on a list to know which list
export const getCurrentListIndex = (
  listsArr: List[],
  cursorIndexes: CursorState
) => {
  // console.log('listsArr', listsArr);
  // call getListRanges with param for more uptodate result
  const listRanges = getListRanges(listsArr) || []
  for (let index = 0; index < listRanges.length; index++) {
    let { startIndex, endIndex } = listRanges[index]
    // console.log('listsArr', listsArr);
    // console.log('obj', listRanges[index]);
    // console.log('cursorIndexes', cursorIndexes);
    if (
      cursorIndexes.startIndex >= startIndex &&
      cursorIndexes.startIndex <= (endIndex || 0)
    ) {
      // console.log('cursor', cursorIndexes.startIndex);
      // console.log('list', startIndex, endIndex);
      return index
    }
  }
}
export const getInputValueLineNumber = (
  splitInputOneNewLines: string[],
  cursorIndexes: CursorState
) => {}
export const isCursorInsideList = (
  listsArr: List[],
  cursorIndexes: CursorState
) => {
  return getCurrentListIndex(listsArr, cursorIndexes) !== undefined
    ? true
    : false
}
export const anyButtonStateTrue = (buttonState: ButtonState) => {
  return Object.values(buttonState).includes(true)
}
export const isNumber = (input: any) => {
  return typeof input === 'number'
}
export const checkListContentIndex = (
  contentToCheck?: string,
  inputStr?: string
) => {
  if (!contentToCheck || !inputStr) return
  let re = new RegExp(`${contentToCheck}`, 'g')
  // https://stackoverflow.com/a/3410557
  let result
  let indices = []
  while ((result = re.exec(inputStr))) {
    indices.push(result.index)
  }
  return indices
}
export const getFirstLineIndex = (
  splitInputOnNewlines: string[],
  list: List
) => {
  if (!splitInputOnNewlines || !list) return []
  const indexes = splitInputOnNewlines.flatMap((line: string, i: number) => {
    if (list?.content?.[0] === line) {
      return [i]
    }
    return []
  })
  return !indexes ? [] : indexes
  // returns an array of strs - not using for now
  // return splitInputOnNewlines.reduce((total: number[], line: string, i: number) => {
  //   console.log('total', typeof total);
  //   if (list?.content?.[0] === line) {
  //     return total.concat(i);
  //   } else {
  //     return total;
  //   }
  // });
}
// takes a list + new starting indexes, return updated list
export const calculateNewList = (
  list: List,
  newStartIndex: number,
  splitInputOneNewLines: string[]
) => {
  const newStartLine = getFirstLineIndex(splitInputOneNewLines, list)
  const indexChange = newStartIndex - list.startIndex
  const lineChange = newStartLine[0] - list.lineNumberStart
  // console.log('list', list);
  // console.log('newStartLine', newStartLine);
  // console.log('indexChange', indexChange);
  // console.log('lineChange', lineChange);

  let newList: List = {
    ...list,
    lineNumberStart: list.lineNumberStart + lineChange,
    startIndex: list.startIndex + indexChange,
    endIndex: list.endIndex + indexChange,
    lineIndexes: list.lineIndexes.map((line) => line + lineChange),
  }
  // console.log('new list', newList);
  return newList
}
// use the list in context of inputValue to find indexes
export const adjustListIndexes = (
  listsArr: List[],
  inputValue: string,
  activeListIndex?: number
) => {
  //never is empty arr
  // console.log('active', activeListIndex);
  const splitInputOnNewlines = inputValue.split('\n')
  if (listsArr.length) {
    // console.log('------ADJUST--------');
    // console.log('adjustListIndexes', splitInputOnNewlines);
  }
  // / loop over startIndexes, retu rn new start indexes if changed
  const newStartIndexes = listsArr
    .map((list, i) => {
      // console.log('i', i);
      // console.log('activeListIndex', activeListIndex);
      // console.log('list', list);
      // make sure we don't modify a list we're active in
      if (i !== activeListIndex) {
        if (list?.content) {
          // find the start of list in inputValue
          const findListStartIndex = inputValue.indexOf(list?.content?.[0])
          // if indexes don't match then list start has changed
          if (findListStartIndex !== list.startIndex) {
            console.log('findListStartIndex', findListStartIndex)
            console.log('list.startIndex', list.startIndex)

            // make new list with values
            const newList = calculateNewList(
              listsArr[i],
              findListStartIndex,
              splitInputOnNewlines
            )
            // console.log('new list', newList);
            return newList
          } //else {
          //   return []
          // }
        } //else {
        //   return []
        // }
      } // {
      //   return []
      // }
    })
    // https://stackoverflow.com/a/57989288/5972531
    .filter((list): list is List => Boolean(list))
  // })

  console.log('new', newStartIndexes)
  return newStartIndexes
  // if (newStartIndexes?.[0]) {
  //   listsArr?.[0] && calculateNewList(listsArr[0], newStartIndexes[0], currentLineNumber);
  // }

  // }
}
export const debounce = (func: (...args: any) => void, wait: number) => {
  let timeout: any

  return function executedFunction(...args: any[]) {
    const _args = [...args]
    const later = () => {
      clearTimeout(timeout)
      func(_args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
