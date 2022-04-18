import { CursorState, ButtonState } from './MarkDownInput'
import { List, ListTypes } from './ListLogic/listMethods'
import { format } from 'path'

export interface CalculateCursorMoveIndexParams {
  formattedInputVal: string
  currentList: List
  cursorIndexes: CursorState
  currentLineNumber: number
  splitInputOnNewlines: string[]
  inputValue?: string
}
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
    return (
      regex.isListItemAloneOnLine.test(line) ||
      regex.isOrderedListItemAloneOnLine.test(line)
    )
  }
  const startRegex = (line: string) => {
    return (
      regex.isListIndexAtLineStartWithContent.test(line) ||
      regex.isOrderListIndexAtLineStartWithContent.test(line)
    )
  }
  return strSplitOnNewLines.map((line, index) => {
    // console.log('input', line)
    // check to avoid touching blank string at end
    if (strSplitOnNewLines[index + 1] === undefined) return line
    // if line is part of a list just trim
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
        // console.log('item alone   ', line)
        return line
      }
    } else if (startRegex(line)) {
      // console.log('here', line)
      // console.log('here');

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
  console.log('CURRENT', cursorIndexes.startIndex)
  for (let j = list.lineIndexes.length - 1; j >= 0; j--) {
    console.log('index', list.lineIndexes[j])
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
  currentList: List,
  newStartIndex: number,
  splitInputOneNewLines: string[],
  listsArr: List[]
) => {
  const newStartLine = getFirstLineIndex(splitInputOneNewLines, currentList)
  const indexChange = newStartIndex - currentList.startIndex
  const lineChange = newStartLine[0] - currentList.lineNumberStart
  // console.log('list', list);
  // console.log('newStartLine', newStartLine);
  // console.log('indexChange', indexChange);
  // console.log('lineChange', lineChange);

  let newList: List = new List({
    itemIndexes: currentList.itemIndexes,
    endIndex: currentList.endIndex + indexChange,
    content: currentList.content ?? [],
    lineNumberStart: currentList.lineNumberStart + lineChange,
    startIndex: currentList.startIndex + indexChange,
    lineIndexes: currentList.lineIndexes.map((line) => line + lineChange),
    listType: currentList.listType,
    listsArr,
  })
  console.log('ADJUST new list', newList)
  return newList
}
// update only the current list
export const adjustCurrentListIndexes = (
  currentList: List,
  inputValue: string,
  listsArr: List[]
): List | undefined => {
  if (!currentList || !inputValue) return
  const splitInputOneNewLines = inputValue.split('\n')
  console.log('splitInputOneNewLines', splitInputOneNewLines)

  // find the start of list in inputValue
  const findListStartIndex = inputValue.indexOf(currentList?.content?.[0])
  // if indexes don't match then list start has changed
  if (findListStartIndex !== currentList.startIndex) {
    console.log('findListStartIndex', findListStartIndex)
    console.log('list.startIndex', currentList.startIndex)

    // make new list with values
    const newList: List = calculateNewList(
      currentList,
      findListStartIndex,
      splitInputOneNewLines,
      listsArr
    )
    console.log('new list', newList)
    return newList
  } else {
    console.log('NO ADJUSTMENT')
  }
}
export const adjustListIndexes = (
  listsArr: List[],
  inputValue: string,
  activeListIndex?: number
) => {
  let changesMade = false
  //never is empty arr
  console.log('active', activeListIndex)
  const splitInputOnNewlines = inputValue.split('\n')
  // / loop over startIndexes, retu rn new start indexes if changed
  const updatedLists = listsArr
    .map((list, i) => {
      // console.log('i', i)
      // console.log('activeListIndex', activeListIndex)
      // console.log('list', list)
      // make sure we don't modify a list we're active in
      if (list?.content) {
        // find the start of list in inputValue
        const findListStartIndex = inputValue.indexOf(list?.content?.[0])
        // if indexes don't match then list start has changed
        if (findListStartIndex !== list.startIndex) {
          changesMade = true
          console.log('findListStartIndex', findListStartIndex)
          console.log('list.startIndex', list.startIndex)

          // make new list with values
          const newList = calculateNewList(
            listsArr[i],
            findListStartIndex,
            splitInputOnNewlines,
            listsArr
          )
          console.log('new list', newList)
          return newList
        } else {
          console.log('NO ADJUSTMENT')
          return list //return as is
        }
      } else {
        console.error('List content empty')
        return list
      }
    })
    // https://stackoverflow.com/a/57989288/5972531
    .filter((list): list is List => Boolean(list))
  if (changesMade) console.log('updatedLists', updatedLists)

  return changesMade ? updatedLists : undefined
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
// returns index where cursor should move after continueList runs
//is used inside continueList atm
export const calculateCursorMoveIndex = ({
  formattedInputVal,
  currentList,
  cursorIndexes,
  currentLineNumber,
  splitInputOnNewlines,
  inputValue,
}: CalculateCursorMoveIndexParams) => {
  const { content, startIndex } = currentList
  const newSplitInputOnNewlines = formattedInputVal.split('\n')
  // console.log('newSplitInputOnNewlines', newSplitInputOnNewlines)
  // console.log('splitInputOneNewLines', splitInputOneNewLines)
  const newIndexArrs = getStartIndexesOfEachLineArr(newSplitInputOnNewlines, 1)
  // console.log('newIndexArrs', newIndexArrs)

  // get new starIndex of list by matching content to string
  const newListStartIndex = formattedInputVal.indexOf(content[0])
  // console.log('newListStartIndex', newListStartIndex)
  const staleListStartIndex = startIndex
  // console.log('staleStartIndex', staleListStartIndex)

  // // extract content from old content
  // const startDiff = newListStartIndex - staleListStartIndex
  // console.log('startDiff', startDiff)

  // const extractLineContent = splitInputOneNewLines[currentLineNumber]
  // // find index inside of old inputValue
  // const oldListStartIndex = currentInputValue.indexOf(extractLineContent)
  // // //@ts-ignore
  // console.log('old', oldListStartIndex)
  // //@ts-ignore
  // console.log('new', formattedInputVal.split())
  // find index inside newSplitInputOnNewlines
  // const newLineStartIndex = formattedInputVal.indexOf(extractLineContent)
  // console.log('extractLineContent', extractLineContent)
  // console.log('oldListStartIndex', oldListStartIndex)
  // console.log('newLineStartIndex', newLineStartIndex)
  if (staleListStartIndex === newListStartIndex) {
    console.log('NO CURSOR ADJ NEEDED')
    return
  }
  console.log('CURSOR ADJ NEEDED')
  const startDiff = newListStartIndex - staleListStartIndex
  // console.log('startDiff', startDiff)
  const newCursorState: CursorState = {
    startIndex: cursorIndexes.startIndex + startDiff,
    endIndex: cursorIndexes.endIndex + startDiff,
  }
  const newCurrentLineNumber = getCurrentLine(newIndexArrs, newCursorState)
  // get length of the line
  const newCurrentLine = newSplitInputOnNewlines[newCurrentLineNumber]
  // console.log('newCurrentLine', newCurrentLine)

  const extractLineContent = splitInputOnNewlines[currentLineNumber]
  // console.log('extractLineContent', extractLineContent)
  const newLineStartIndex = formattedInputVal.indexOf(extractLineContent)
  // console.log('newLineStartIndex', newLineStartIndex)

  const newCurrentLineLength =
    newSplitInputOnNewlines[newCurrentLineNumber].length
  // add line length to curent index, should be line start
  const newEndOfLineIndex = newLineStartIndex + newCurrentLineLength
  // console.log('end of curent line', newEndOfLineIndex)
  // console.log('newSplitInputOnNewlines', newSplitInputOnNewlines)
  // console.log('newListStartIndex', newListStartIndex)
  // console.log('newCurrentLineNumber', newCurrentLineNumber)
  // console.log('newCurrentLineLength', newCurrentLineLength)
  const symbolLength = currentList.indexSymbolLength()
  // console.log('symbolLength', symbolLength)
  if (currentList.listType === ListTypes.list) {
    return newEndOfLineIndex + symbolLength
  } else if (currentList.listType === ListTypes.listOl) {
    return newEndOfLineIndex + symbolLength
  } else {
    console.error('Invalid list type in')
  }
}
