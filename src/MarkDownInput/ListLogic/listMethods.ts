import { ButtonState, CursorState, ActiveListIndex } from '../MarkDownInput'
import {
  getStartIndexesOfEachLineArr,
  onAddSpaceLineFormatter,
  isNumber,
  regex,
  calcEndIndexFromLineLengths,
} from '../markDownInputUtils'

export interface CreateListInput {
  listType: ListTypes
  splitOnSpacesArr?: string[]
  indexAtStartOfCurrentLine?: number
  indexesArr: number[]
  splitInputOnNewlines?: string[]
  cursorIndexes: CursorState
  currentLineNumber: number
  listsArr: List[]
  activeListIndexState?: ActiveListIndex
  textRefElem: HTMLTextAreaElement | null
  buttonState: ButtonState
}
export interface BreakOutListInput {
  cursorIndexes: CursorState
  listType: ListTypes
  splitInputOnNewlines: string[]
  currentLineNumber: number
  listsArr: List[]
  activeListIndexState: ActiveListIndex
  buttonState: ButtonState
}
export interface ContinueListInput {
  buttonState: ButtonState
  listType: ListTypes
  splitInputOnNewlines: string[]
  currentLineNumber: number
  listsArr: List[]
  activeListIndexState: ActiveListIndex
  indexesArr: number[]
  currentList?: List
}
export interface ListValues {
  listNumber?: number
  itemIndexes: number[]
  lineNumberStart: number
  startIndex: number
  endIndex: number
  content?: string[]
  lineIndexes: Array<number>
  listType: ListTypes.list | ListTypes.listOl
  setEndIndex: (index: number, type: ListIndexSetter) => void
  addItemIndex: (itemIndex: number) => void
  writeLineIndex: () => string
}
export interface ListContructorInput {
  lineNumberStart: number
  startIndex: number
  endIndex: number
  content?: string[]
  lineIndexes: Array<number>
  listType: ListTypes.list | ListTypes.listOl
  listsArr: List[]
}
export enum ListTypes {
  listOl = 'listOl',
  list = 'list',
}
export interface ContinueListOutput {
  _cursorMovestoNextLine: number
  _buttonState: ButtonState
  _listsArr: List[]
  _inputValue: string
}
export interface CreateListOutput {
  _cursorIndexes: CursorState
  _activeListIndexState: ActiveListIndex
  _buttonState: ButtonState
  _listsArr: List[]
  _inputValue: string
}
export interface BreakOutListOutput {
  _listsArr: List[]
  _inputValue: string
  _activeListIndexState: ActiveListIndex
  _buttonState: ButtonState
}
export interface UpdateListInput {
  splitInputOnNewlines: string[]
  activeListIndexState: ActiveListIndex
  listsArr: List[]
  currentLineNumber: number
  cursorIndexes: CursorState
  buttonState: ButtonState
}
export interface UpdateListOutput {
  _listsArr?: List[] | undefined
  _buttonState?: ButtonState | undefined
}
enum ListIndexSetter {
  Set = 'set',
  Add = 'add',
  Subtract = 'subtract',
}

export class List {
  listNumber?: number
  itemIndexes: number[]
  lineNumberStart: number
  startIndex: number
  endIndex: number
  content?: string[]
  lineIndexes: Array<number>
  listType: ListTypes.list | ListTypes.listOl
  // setEndIndex: (index: number, type: ListIndexSetter) => void;
  // addItemIndex: (itemIndex: number) => void;
  // writeLineIndex: () => string;
  constructor({
    startIndex,
    endIndex,
    content,
    lineIndexes,
    lineNumberStart,
    listType,
    listsArr,
  }: ListContructorInput) {
    this.startIndex = startIndex
    this.endIndex = endIndex
    this.content = content
    this.lineIndexes = lineIndexes
    this.lineNumberStart = lineNumberStart
    this.itemIndexes = [1]
    this.listType = listType
    this.listNumber = listsArr.length
  }

  setEndIndex = (index: number, type: ListIndexSetter) => {
    console.log('END INEDX', index)
    console.log('END INEDX', type)
    console.log('this.endIndex', this.endIndex)
    // console.log('END INEDX', type);
    if (type === ListIndexSetter.Set) {
      const itemIndexLen = ListTypes.list.valueOf()
        ? `* `.length
        : `${this.itemIndexes.length}. `.length
      const newIndex = index + itemIndexLen
      return newIndex
    } else if (type === ListIndexSetter.Add) {
      const newIndex = this.endIndex + index
      console.log('ADD', newIndex)
      return newIndex
    } else if (type === ListIndexSetter.Subtract) {
      const newIndex = this.endIndex - index
      console.log('SUB', newIndex)
      return newIndex
    }
    return 0
  }
  addItemIndex = (itemIndex: number) => {
    this.itemIndexes.push(itemIndex)
  }
  writeLineIndex = () => {
    console.log('write line index')
    const lineIndex =
      this.listType === ListTypes.list.valueOf()
        ? `* `
        : `${this.itemIndexes.length}. `
    console.log('writeLineIndex', lineIndex)
    return lineIndex
  }
}
// export const listContructor = ({
//   startIndex,
//   endIndex,
//   content,
//   lineIndexes,
//   lineNumberStart,
//   listType,
//   listsArr,
// }: ListContructorInput) => {
//   const List: List = {
//     startIndex,
//     endIndex,
//     content,
//     lineIndexes,
//     lineNumberStart,
//     itemIndexes: [1],
//     listType,
//     listNumber: listsArr.length,
//     writeLineIndex: listType === ListTypes.list.valueOf() ? `* ` : `${(itemIndexes.slice(-1)[0] + 1).toString()}. `,
//   };
//   return List;
// };
export const createList = ({
  listType,
  splitOnSpacesArr,
  indexAtStartOfCurrentLine,
  indexesArr,
  cursorIndexes,
  currentLineNumber,
  listsArr,
  activeListIndexState,
  buttonState,
}: CreateListInput): CreateListOutput => {
  console.log('------CREATE--------')
  // copy the original arr
  let splitOnSpacesArrCopy = [...(splitOnSpacesArr || [])]
  // console.log('splitOnSpacesArrCopy', splitOnSpacesArrCopy);
  // console.log('cursorIndexes', cursorIndexes);

  if (listType === ListTypes.listOl.valueOf()) {
    // console.log('indexAtStartOfCurrentLine', indexAtStartOfCurrentLine);

    splitOnSpacesArrCopy.splice(indexAtStartOfCurrentLine || 0, 0, '1. ')
  } else if (listType === ListTypes.list.valueOf()) {
    // add symbol to beginning of current line with indexAtStartOfCurrentLine
    // console.log('indexAtStartOfCurrentLine', indexAtStartOfCurrentLine);
    splitOnSpacesArrCopy.splice(indexAtStartOfCurrentLine || 0, 0, '* ')
  }
  // convert newly splice to string
  const splicedInputArrToStr = splitOnSpacesArrCopy.join('')
  let splitOnNewLines = splicedInputArrToStr.split('\n')
  // console.log('splitOnNewLines', splitOnNewLines);
  splitOnNewLines[currentLineNumber] = splitOnNewLines[currentLineNumber].trim()
  // console.log('splitOnNewLines', splitOnNewLines);
  // add formatting to inputValue
  const addNewLineCharsArr = onAddSpaceLineFormatter(splitOnNewLines, listType)
  // console.log('formatInputStr', addNewLineCharsArr.join(''));
  //@ts-ignore
  // console.log('splicedInputArrToStr (split to see better)', splicedInputArrToStr?.split());
  // console.log('clicked extract', extractCurrentItem);
  const newListLineIndexes = getStartIndexesOfEachLineArr(splitOnNewLines, 1)
  // console.log('newListLineIndexes', newListLineIndexes);
  // next item in array is next line index
  const startOfNextLineIndexInArr = currentLineNumber + 1 || 0
  // console.log('startOfNextLineIndexInArr:', startOfNextLineIndexInArr);
  // console.log('startOfNextLineIndexInArr value:', newListLineIndexes?.[startOfNextLineIndexInArr]);
  // console.log('inputvalue len', splicedInputArrToStr.length);
  // get length of line using next line index
  const contenWhenNextLineLength =
    newListLineIndexes?.[startOfNextLineIndexInArr] &&
    newListLineIndexes?.[startOfNextLineIndexInArr] -
      newListLineIndexes?.[currentLineNumber]
  // console.log('contenWhenNextLineLength', contenWhenNextLineLength);
  // console.log('splicedInputArrToStr.length - 1', splicedInputArrToStr.length - 1);
  // console.log('splicedInputArrToStr length', splicedInputArrToStr.length);
  // console.log('newListLineIndexes[currentLineNumber]', newListLineIndexes[currentLineNumber]);
  // get length of line using str length and start ind, when last line of only line
  let contentWhenNoNextLineLength =
    splicedInputArrToStr.length - newListLineIndexes[currentLineNumber]
  // console.log('contentWhenNoNextLineLength', contentWhenNoNextLineLength);
  // console.log('splicedInputArrToStr', splicedInputArrToStr);
  // decide which contentLen from above that not undefined
  let newContentStr = splicedInputArrToStr
    .slice(
      newListLineIndexes?.[currentLineNumber],
      newListLineIndexes?.[currentLineNumber] +
        (contenWhenNextLineLength ?? contentWhenNoNextLineLength)
    )
    ?.trim()
  // 4.log('CONTENT', newContentStr);
  // 4.log('split CONTENT', newContentStr.split('\n'));
  const startOfLineIndexInArrValue =
    newListLineIndexes?.[currentLineNumber] ?? 0
  // 4.log('startOfLineIndexInArrValue', startOfLineIndexInArrValue);
  let endIndex =
    startOfLineIndexInArrValue +
    (contenWhenNextLineLength
      ? contenWhenNextLineLength - 1
      : contentWhenNoNextLineLength)
  // 4.log('END', endIndex);
  const newList: List = new List({
    startIndex: indexAtStartOfCurrentLine || 0,
    content: newContentStr.split('\n').filter(Boolean),
    // endIndex considers the newly added chars`
    endIndex: endIndex,
    lineIndexes: [indexesArr[currentLineNumber]],
    lineNumberStart: currentLineNumber,
    listType: ListTypes[listType as keyof typeof ListTypes],
    listsArr,
  })

  const returnValues: CreateListOutput = {
    // _cursorIndexes: { startIndex: newContentStr.length, endIndex: newContentStr.length },
    _cursorIndexes: {
      startIndex: newList.startIndex + newContentStr.length,
      endIndex: newList.startIndex + newContentStr.length,
    },
    _listsArr: [...listsArr, newList],
    _inputValue: addNewLineCharsArr.join(''),
    _buttonState: { ...buttonState, [listType]: true },
    _activeListIndexState: {
      ...activeListIndexState,
      currentListIndex: isNumber(activeListIndexState?.prevListIndex)
        ? activeListIndexState?.prevListIndex! + 1
        : 0,
    },
  }
  // console.log('returnValues', returnValues);
  return returnValues
}
export const updateList = ({
  splitInputOnNewlines,
  activeListIndexState,
  currentLineNumber,
  listsArr,
  cursorIndexes,
  buttonState,
}: UpdateListInput) => {
  console.log('------UDPATE--------')
  console.log('splitInputOnNewlines input', splitInputOnNewlines)
  // console.log('---@index:', cursorIndexes.startIndex);

  // const currentListIndex = getCurrentListIndex() || 0;
  // console.log('activeListIndexState', activeListIndexState);
  const listIndex = isNumber(activeListIndexState.currentListIndex)
    ? activeListIndexState.currentListIndex
    : activeListIndexState.prevListIndex
  const currentList = isNumber(listIndex) && listsArr[listIndex!]
  // console.log('currentList', currentList);
  // console.log('sliceOffStartIndexes', sliceOffStartIndexes);
  if (!currentList) return
  // find what line number of inputValue is within the list
  let lineNumInCurrentList = currentLineNumber - currentList.lineNumberStart
  // console.log('lineNumInCurrentList', lineNumInCurrentList);
  // INPUTVALUE: slice arrs of inputValue to match current list
  const sliceInputValueStart = splitInputOnNewlines.slice(
    currentList.lineNumberStart
  )
  // console.log('sliceInputValueStart input', sliceInputValueStart)
  // trim empty arr elements off end
  const sliceInputValueEnd = sliceInputValueStart
    .slice(0, currentList.itemIndexes?.slice(-1)[0] + 1)
    .filter(Boolean)
  console.log('sliceInputValueStart input', sliceInputValueStart)
  console.log('sliceInputValueEnd input', sliceInputValueEnd)
  // console.log('slice off last 2', sliceInputValueStart?.slice(-2));
  //CONTENT: split list content
  // const splitOnNewLineListContent = currentList.content?.split('\n');
  // console.log('splitOnNewLineListContent', splitOnNewLineListContent);
  // get each identical section from each source
  const currentLineInputValue = sliceInputValueEnd?.[lineNumInCurrentList]
  const currentLineListContentStr =
    currentList?.content?.[lineNumInCurrentList] || ''
  // DIFF: compare list saved content to current page inputValue
  console.log('---@index:', cursorIndexes.startIndex)
  console.log(
    '---input split currentLineInputValue diff:',
    //@ts-ignore
    currentLineInputValue?.split()
  )
  console.log(
    '---content split currentLineListContentStr diff:',
    //@ts-ignore
    currentLineListContentStr?.split()
  )
  if (currentLineInputValue !== currentLineListContentStr) {
    console.log('CHECKER FOUND DIFF')
    console.log('curentList', currentList)
    // get length of all lines
    const listContentLength = sliceInputValueEnd.join().length
    // add to start inded to get endIndex
    const newEndIndex = currentList.startIndex + listContentLength
    //LINE INDEXES
    // get indexes of current page split inputValue
    let inputLineIndexes = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
    // // slice arrs of inputValue to match current list range
    const sliceLineIndexesStart = inputLineIndexes?.slice(
      currentList.lineNumberStart
    )
    const sliceLineIndexesEnd = sliceLineIndexesStart?.slice(
      0,
      currentList.itemIndexes?.length
    )
    let newList = {
      ...currentList,
      // assign lineIIndexes of list in progress
      lineIndexes: sliceLineIndexesEnd,
      // reassign first as start
      startIndex: sliceLineIndexesEnd[0],
      endIndex: newEndIndex,
      content: sliceInputValueEnd,
    }
    console.log('New newList create', newList)

    const listsArrCopy = [...listsArr]
    // console.log('32', newList);
    if (isNumber(listIndex)) listsArrCopy[listIndex!] = newList
    return {
      _listsArr: listsArrCopy,
      // buttonState doesn't change - just passing for inter
      _buttonState: buttonState,
    }
    // }
  } else {
    console.log('NO DIFF FOUND')
  }
}
export const breakOutList = ({
  listType,
  splitInputOnNewlines,
  currentLineNumber,
  listsArr,
  activeListIndexState,
  cursorIndexes,
  buttonState,
}: BreakOutListInput): BreakOutListOutput => {
  // let splitInputOnNewlines = inputValue.split('\n');
  const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
  //  insert blank line and break out of list
  console.log('------BREAKOUTLIST_LOGIC--------')
  console.log('splitInputOnNewlines', splitInputOnNewlines)
  //make previously inserted list symbol empty
  splitInputOnNewlines[currentLineNumber] = ''
  // console.log('splitInputOnNewlines', splitInputOnNewlines);
  // console.log('text', listContentToSave.split(''));
  // reformat splitInputOnNewlines as
  let newInputValue = `${onAddSpaceLineFormatter(
    splitInputOnNewlines,
    listType
  ).join('')}`
  console.log('newInputValue', newInputValue.split(''))
  // console.log('newInputValue', newInputValue);
  let currentList = { ...listsArr[activeListIndexState.currentListIndex || 0] }
  console.log('currentList', currentList)
  // assign new endIndex
  let newEndIndex = currentList.endIndex
  if (listType === ListTypes.listOl.valueOf()) {
    newEndIndex = currentList.endIndex && currentList.endIndex - 4
  } else if (listType === ListTypes.list.valueOf()) {
    newEndIndex = currentList.endIndex && currentList.endIndex - 3
  }
  let obj = {
    ...currentList,
    itemIndexes: currentList.itemIndexes?.slice(0, -1),
    lineIndexes: currentList.lineIndexes?.slice(
      0,
      currentList.itemIndexes.length - 1
    ),
    content: currentList.content?.slice(0, -1),
    endIndex: newEndIndex,
  }
  console.log('obj', obj)
  let listsArrCopy = [...listsArr]
  // pop off last copy
  listsArrCopy.pop()
  // console.log('CC', listsArrCopy);
  // replace with new copy
  listsArrCopy.push(obj)
  console.log('index end', cursorIndexes.startIndex)
  return {
    _inputValue: newInputValue,
    _listsArr: listsArrCopy,
    _activeListIndexState: {
      currentListIndex: undefined,
      prevListIndex: activeListIndexState?.currentListIndex,
    },
    _buttonState: {
      ...buttonState,
      [listType]: false,
    },
  }
}
export const continueList = ({
  listType,
  listsArr,
  activeListIndexState,
  indexesArr,
  currentLineNumber,
  splitInputOnNewlines,
  buttonState,
}: ContinueListInput): ContinueListOutput => {
  console.log('------MIDDLE--------')
  console.log('splitInputOnNewlines', splitInputOnNewlines)
  const currentListCopy = {
    ...listsArr[activeListIndexState.currentListIndex || 0],
  }
  console.log(
    'activeListIndexState.currentListIndex',
    activeListIndexState.currentListIndex
  )
  console.log('currentListCopy', currentListCopy)
  currentListCopy.addItemIndex(currentListCopy.itemIndexes.length + 1)
  const splitInputOnNewlinesCopy = [...(splitInputOnNewlines || [])]

  let _cursorMovestoNextLine = listType === ListTypes.list ? 3 : 4
  let newContentArr: string[] = []
  // splice item index into inputValue
  if (listType === ListTypes.listOl.valueOf()) {
    splitInputOnNewlinesCopy.splice(
      currentLineNumber + 1,
      0,
      currentListCopy.writeLineIndex()
    )
  } else if (listType === ListTypes.list.valueOf()) {
    splitInputOnNewlinesCopy.splice(
      currentLineNumber + 1,
      0,
      currentListCopy.writeLineIndex()
    )
  }
  const sliceInputValueStart = splitInputOnNewlinesCopy.slice(
    currentListCopy.lineNumberStart
  )
  // console.log('sliceInputValueStart input', sliceInputValueStart);
  let sliceInputValueEnd = sliceInputValueStart.includes('')
    ? // white space is the cut off point
      sliceInputValueStart
        .slice(0, sliceInputValueStart.indexOf(''))
        .filter(Boolean)
    : // else its the start of the list so make the same
      sliceInputValueStart
  // console.log('sliceInputValueStart input', sliceInputValueStart);
  // console.log('sliceInputValueEnd input', sliceInputValueEnd);
  // newContentArr = `${currentListCopy.content}\n${currentListCopy.itemIndexes?.slice(-1)[0] + 1}. `;
  newContentArr = sliceInputValueEnd
  // console.log('newContentArr', newContentArr);

  // console.log('indexesArr', indexesArr)
  currentListCopy.lineIndexes = [
    ...(currentListCopy?.lineIndexes || []),
    indexesArr[currentLineNumber + 1],
  ]
  console.log('lineIndexes', currentListCopy.lineIndexes)
  // set basic endIndexs as start of newline - this is default
  currentListCopy.endIndex = currentListCopy.lineIndexes.slice(-1)[0] || 0
  // console.log('currentListCopy.endIndex', currentListCopy.endIndex);
  // console.log('curentListCopy.itemIndexes', currentListCopy.itemIndexes);
  // console.log('indexesArr', indexesArr);

  // check for midline break - check if 2nd last item is a list index alone on line - like 2 - ['1. ', '2. ', 'hello']
  if (
    regex.isOrderedListItemAloneOnLine.test(
      newContentArr[currentListCopy.itemIndexes.length - 1]
    ) ||
    regex.isListItemAloneOnLine.test(
      newContentArr[currentListCopy.itemIndexes.length - 1]
    )
  ) {
    // console.log('check if fired', currentListCopy.itemIndexes.length);
    // check if current item after list items is not blank , like hello  - ['1. ', '2. ', 'hello']
    if (newContentArr[currentListCopy.itemIndexes.length] !== undefined) {
      // this part should combine w prev - make new content
      // console.log('check if fired2', newContentArr[currentListCopy.itemIndexes.length]);
      // check if first item before current is a list item alone , like 1.  - ['1. ', '2. ', 'hello']
      if (newContentArr[currentListCopy.itemIndexes.length - 2] !== undefined) {
        if (
          regex.isOrderedListItemAloneOnLine.test(
            newContentArr[currentListCopy.itemIndexes.length - 2]
          ) ||
          regex.isListItemAloneOnLine.test(
            newContentArr[currentListCopy.itemIndexes.length - 2]
          )
        ) {
          // console.log('currentList endIndex', currentListCopy.endIndex);

          // trim any list indexes alone on line - trim the 1 - ['1.', '2. hello']
          const itemIndexAlone =
            newContentArr[currentListCopy.itemIndexes.length - 1]
          const itemIndexAloneLen = itemIndexAlone.length
          const itemIndexAloneTrimmed = itemIndexAlone.trim()
          const itemIndexAloneTrimmedLen = itemIndexAloneTrimmed.length
          const amountTrimmed = itemIndexAloneLen - itemIndexAloneTrimmedLen
          // console.log('trim', itemIndexAlone);
          // console.log('amountTrimmed', amountTrimmed);
          // console.log('newContentArr', newContentArr);
          // console.log('endIndex b4 trim', currentListCopy.endIndex);
          // insert over top if old version
          newContentArr[currentListCopy.itemIndexes.length - 1] = itemIndexAlone
          // console.log('newContentArr ', newContentArr);
          // subtract trimmed amonut from endIndex
          currentListCopy.endIndex -= amountTrimmed
          _cursorMovestoNextLine -= amountTrimmed
          // console.log('endIndex after trim', currentListCopy.endIndex);
        }
      }
      // this means combine the prev item and the current - ['1. ', '2. hello']
      const combineTwoItems = `${
        newContentArr[currentListCopy.itemIndexes.length - 1]
      }${newContentArr[currentListCopy.itemIndexes.length]}`
      // console.log('combine', combineTwoItems);
      const addToEndIndex =
        newContentArr[currentListCopy.itemIndexes.length].length
      // console.log('combine', combineTwoItems);
      // insert over top if old first section - insert over 2 - ['1. ', '2. hello'] - ['1. ', '2. hello', 'hello']
      newContentArr[currentListCopy.itemIndexes.length - 1] = combineTwoItems
      // console.log('newContentArr', newContentArr);
      // delete the old second of 2 sections - ['1. ', '2. hello', empty]
      delete newContentArr[currentListCopy.itemIndexes.length]
      // console.log('newContentArr', newContentArr);
      // filter out empty slots
      newContentArr = newContentArr.filter(String)
      currentListCopy.endIndex += addToEndIndex
      // console.log('end index', currentListCopy.endIndex);
    }
  }
  // console.log('newEndIndex', newEndIndex);
  // console.log('newContentArr', newContentArr);

  const newList = {
    ...currentListCopy,
    content: newContentArr,
    endIndex:
      listType === ListTypes.listOl.valueOf()
        ? currentListCopy.endIndex + 3
        : currentListCopy.endIndex + 2,
  }
  // console.log('newList', newList);

  const addNewLineCharsArr = onAddSpaceLineFormatter(
    splitInputOnNewlinesCopy,
    listType
  )
  // console.log('addNewLineCharsArr', addNewLineCharsArr);
  const _newLineListStr = addNewLineCharsArr.join('')
  // console.log('_newLineListStr', _newLineListStr);
  let listsArrCopy = [...listsArr]
  listsArrCopy.pop()
  listsArrCopy.push(newList)
  console.log('_cursorMovestoNextLine', _cursorMovestoNextLine)
  return {
    _cursorMovestoNextLine,
    _listsArr: listsArrCopy,
    _inputValue: _newLineListStr,
    _buttonState: buttonState,
  }
}
// deleteListItem: function (listType: string, indexesArr: number[]) {
//   const currentList = { ...listsArr[activeListIndexState || 0] };
//   const splitInputOnNewlines = inputValue.split('\n');
//   const splitOnSpacesArr = inputValue.split('');

//   console.log('splitOnSpacesArr', splitOnSpacesArr);
//   console.log('splitInputOnNewlines', splitInputOnNewlines);
//   console.log('currentLine', currentLineNumber);
//   console.log('indexesArr', indexesArr);

//   console.log('line', splitInputOnNewlines[currentLineNumber]);
//   // check if  only list number is removed
//   if (!regex.ordListItemIndexStart.test(splitInputOnNewlines[currentLineNumber])) {
//     if (regex.lineNotWhiteSpace) {
//       // if not the first line of list
//       if (currentList.itemIndex! > 1) {
//         const addNewLineCharsArr = onDeleteSpaceAndLineFormatter(splitInputOnNewlines);
//         console.log('addNewLineCharsArr', addNewLineCharsArr);
//         // delete splitOnSpacesArr[indexesArr[currentLineNumber] - 1];
//         // console.log('splitOnSpacesArr', splitOnSpUSERacesArr);
//         // splitOnSpacesArr.splice(indexesArr[currentLineNumber] - 1, 0, '  \n');
//         // splitOnSpacesArr.splice(indexesArr[currentLineNumber] - 2, 0, '');
//         // splitOnSpacesArr.splice(indexesArr[currentLineNumber] - 1, 0, '\n');
//         // console.log('splitOnSpacesArr', splitOnSpacesArr);
//         setInputValue(addNewLineCharsArr.join(''));
//         // let obj = {
//         //   ...currentList,
//         //   content: updateInputValue,
//         //   //@ts-ignore
//         //   itemIndex: currentList?.itemIndex - 1,
//         // };
//         // let listsArrCopy = [...listsArr];
//         // listsArrCopy.pop();
//         // listsArrCopy.push(obj);
//         // // console.log('set list', listsArrCopy);
//         // setListsArr(listsArrCopy);
//         // _buttonState['listOl'] = false;
//       }
//     }
//     // add double new space to previous line but keep space
//     // console.log(currentList);
//   }
// },
