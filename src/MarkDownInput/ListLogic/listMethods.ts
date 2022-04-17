import { first } from 'lodash'
import { ButtonState, CursorState, ActiveListIndex } from '../MarkDownInput'
import {
  getStartIndexesOfEachLineArr,
  onAddSpaceLineFormatter,
  isNumber,
  regex,
  calculateCursorMoveIndex,
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
  cursorIndexes: CursorState
}
export interface ListContructorInput {
  lineNumberStart: number
  startIndex: number
  endIndex: number
  content?: string[]
  lineIndexes: Array<number>
  listType: ListTypes.list | ListTypes.listOl
  listsArr: List[]
  itemIndexes?: number[]
}
export enum ListTypes {
  listOl = 'listOl',
  list = 'list',
}
export enum ListSymbols {
  listOl = '',
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
export interface ListValues {
  listNumber?: number
  itemIndexes?: number[]
  lineNumberStart: number
  startIndex: number
  endIndex: number
  content?: string[]
  lineIndexes: Array<number>
  listType: ListTypes.list | ListTypes.listOl
  setEndIndex: (index: number, type: ListIndexSetter) => void
  addItemIndex: (itemIndex: number) => void
  writeLineIndexToInput: () => string
  indexSymbolLength: () => number
}
export class List {
  private _listNumber?: number
  private _lineNumberStart: number
  private _itemIndexes: Array<number>
  private _listType: ListTypes.list | ListTypes.listOl
  private _startIndex: number
  private _lineIndexes: number[]
  private _endIndex: number
  private _content: string[] | undefined

  // setEndIndex: (index: number, type: ListIndexSetter) => void;
  addItemIndex: (itemIndex: number) => void
  // writeLineIndexToInput: () => string;
  constructor({
    itemIndexes,
    startIndex,
    endIndex,
    content,
    lineNumberStart,
    listType,
    listsArr,
    lineIndexes,
  }: ListContructorInput) {
    this._startIndex = startIndex
    this._endIndex = endIndex
    this._content = content
    this._lineIndexes = lineIndexes
    this._lineNumberStart = lineNumberStart
    this._itemIndexes = itemIndexes ?? [1]
    this._listType = listType
    this._listNumber = listsArr.length
    this.addItemIndex = (itemIndex: number) => {
      console.log('THIS', this)
      // console.log('curent', this._itemIndexes)
      console.log('push item', itemIndex)
      this._itemIndexes.push(itemIndex)
      // console.log('THIS', this)
    }
  }
  get listType() {
    return this._listType
  }
  get lineNumberStart() {
    return this._lineNumberStart
  }
  get listNumber() {
    return this._listNumber
  }
  get lineIndexes() {
    return this._lineIndexes
  }
  set lineIndexes(newLineIndexes: number[]) {
    this._lineIndexes = newLineIndexes
  }
  get content() {
    return this._content ?? []
  }
  set content(strArr: string[]) {
    this._content = strArr
  }
  get endIndex() {
    return this._endIndex
  }
  set endIndex(num: number) {
    this._endIndex = num
  }
  get startIndex() {
    return this._startIndex
  }
  set startIndex(num: number) {
    this._startIndex = num
  }
  get itemIndexes() {
    return this._itemIndexes
  }
  // used only when adjusting a list, not when add new items
  set itemIndexes(itemIndexes: number[]) {
    this._itemIndexes = itemIndexes
  }
  addSingleLineIndex = (lineIndex: number) => {
    this._lineIndexes.push(lineIndex)
  }
  removeSingleLineIndex = () => {
    this._lineIndexes.pop()
  }
  removeItemIndex = () => {
    this._itemIndexes.pop()
    // console.log('THIS pop', this)
  }
  writeLineIndexToInput = () => {
    // console.log('write line index')
    const lineIndex =
      this._listType === ListTypes.list.valueOf()
        ? `* `
        : `${this._itemIndexes.length}. `
    // console.log('writeLineIndexToInput', lineIndex)
    return lineIndex
  }
  indexSymbolLength = () => {
    const symbolLength =
      this._listType === ListTypes.list.valueOf()
        ? `* `.length + 1
        : `${this._itemIndexes.length}. `.length + 1
    // console.log('writeLineIndexToInput', lineIndex)
    return symbolLength
  }
  // setEndIndex = (index: number, type: ListIndexSetter) => {
  //   console.log('END INEDX', index)
  //   console.log('END INEDX', type)
  //   console.log('this.endIndex', this.endIndex)
  //   // console.log('END INEDX', type);
  //   if (type === ListIndexSetter.Set) {
  //     const itemIndexLen = ListTypes.list.valueOf()
  //       ? `* `.length
  //       : `${this._itemIndexes.length}. `.length
  //     const newIndex = index + itemIndexLen
  //     return newIndex
  //   } else if (type === ListIndexSetter.Add) {
  //     const newIndex = this.endIndex + index
  //     console.log('ADD', newIndex)
  //     return newIndex
  //   } else if (type === ListIndexSetter.Subtract) {
  //     const newIndex = this.endIndex - index
  //     console.log('SUB', newIndex)
  //     return newIndex
  //   }
  //   return 0
  // }
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
//     writeLineIndexToInput: listType === ListTypes.list.valueOf() ? `* ` : `${(itemIndexes.slice(-1)[0] + 1).toString()}. `,
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
  console.log('newList', newList)

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
  // console.log('splitInputOnNewlines input', splitInputOnNewlines)
  // console.log('currentLineNumber', currentLineNumber)
  // console.log('---@index:', cursorIndexes.startIndex);

  // const currentListIndex = getCurrentListIndex() || 0;
  // console.log('activeListIndexState', activeListIndexState);
  const listIndex = isNumber(activeListIndexState.currentListIndex)
    ? activeListIndexState.currentListIndex
    : activeListIndexState.prevListIndex
  const currentList = isNumber(listIndex) && listsArr[listIndex!]
  console.log('currentList', currentList)
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
  // console.log('sliceInputValueStart input', sliceInputValueStart)
  // console.log('sliceInputValueEnd input', sliceInputValueEnd)
  // console.log('slice off last 2', sliceInputValueStart?.slice(-2))
  //CONTENT: split list content
  // get each identical section from each source
  const currentLineInputValue = sliceInputValueEnd?.[lineNumInCurrentList]
  const currentLineListContentStr =
    currentList?.content?.[lineNumInCurrentList] || ''
  // console.log('list content', currentList?.content)
  // console.log('currentLineListContentStr', currentLineListContentStr)
  // DIFF: compare list saved content to current page inputValue
  console.log('---@index:', cursorIndexes.startIndex)
  console.log(
    '---input split currentLineInputValue split:',
    //@ts-ignore
    currentLineInputValue?.split()
  )
  console.log(
    '---content split currentLineListContentStr split:',
    //@ts-ignore
    currentLineListContentStr
  )
  if (currentLineInputValue !== currentLineListContentStr) {
    console.log('CHECKER FOUND DIFF')
    // console.log('curentList', currentList)
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
    currentList.lineIndexes = sliceLineIndexesEnd
    currentList.endIndex = newEndIndex
    currentList.startIndex = sliceLineIndexesEnd[0]
    currentList.content = sliceInputValueEnd

    // let newList = {
    //   ...currentList,
    //   // assign lineIIndexes of list in progress
    //   // lineIndexes: sliceLineIndexesEnd,
    //   // reassign first as start
    //   startIndex: sliceLineIndexesEnd[0],
    //   // endIndex: newEndIndex,
    //   content: sliceInputValueEnd,
    // }
    // console.log('New newList create', newList)

    const listsArrCopy = [...listsArr]
    // console.log('32', newList);
    // re-write list
    if (isNumber(listIndex)) listsArrCopy[listIndex!] = currentList
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
  let currentList = listsArr[activeListIndexState.currentListIndex || 0]
  console.log('currentList', currentList)
  // assign new endIndex
  let newEndIndex = currentList.endIndex
  if (listType === ListTypes.listOl.valueOf()) {
    newEndIndex = currentList.endIndex && currentList.endIndex - 4
  } else if (listType === ListTypes.list.valueOf()) {
    newEndIndex = currentList.endIndex && currentList.endIndex - 3
  }
  currentList.removeItemIndex()
  currentList.removeSingleLineIndex()
  currentList.content = currentList.content?.slice(0, -1)
  currentList.endIndex = newEndIndex
  // let obj = {
  //   ...currentList,
  //   // lineIndexes: currentList.lineIndexes?.slice(
  //   //   0,
  //   //   currentList.itemIndexes.length - 1
  //   // ),
  //   content: currentList._content?.slice(0, -1),
  //   endIndex: newEndIndex,
  // }
  console.log('currentList', currentList)
  let listsArrCopy = [...listsArr]
  // pop off last copy
  listsArrCopy.pop()
  // console.log('CC', listsArrCopy);
  // replace with new copy
  listsArrCopy.push(currentList)
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
  cursorIndexes,
}: ContinueListInput): ContinueListOutput => {
  console.log('------MIDDLE--------')
  console.log('splitInputOnNewlines', splitInputOnNewlines)
  const currentListNumber = activeListIndexState.currentListIndex
  const currentList = listsArr[activeListIndexState.currentListIndex || 0]

  console.log('currentList', currentList)
  console.log('currentList', currentList.itemIndexes)
  console.log('currentList', currentList.itemIndexes.length + 1)

  currentList.addItemIndex(currentList.itemIndexes.length + 1)
  console.log('currentList', currentList)

  const splitInputOnNewlinesCopy = [...(splitInputOnNewlines || [])]
  // set default values for cursor to move to next line
  let _cursorMovestoNextLine = listType === ListTypes.list ? 3 : 4
  let newContentArr: string[] = []
  // splice item index into inputValue
  if (listType === ListTypes.listOl.valueOf()) {
    splitInputOnNewlinesCopy.splice(
      currentLineNumber + 1,
      0,
      currentList.writeLineIndexToInput()
    )
  } else if (listType === ListTypes.list.valueOf()) {
    splitInputOnNewlinesCopy.splice(
      currentLineNumber + 1,
      0,
      currentList.writeLineIndexToInput()
    )
  }
  const sliceInputValueStart = splitInputOnNewlinesCopy.slice(
    currentList.lineNumberStart
  )
  // console.log('sliceInputValueStart input', sliceInputValueStart);
  let sliceInputValueEnd = sliceInputValueStart.includes('')
    ? // white space is the cut off point
      sliceInputValueStart
        .slice(0, sliceInputValueStart.indexOf(''))
        .filter(Boolean)
    : // else its the start of the list so make the same
      sliceInputValueStart
  console.log('sliceInputValueStart input', sliceInputValueStart)
  console.log('sliceInputValueEnd input', sliceInputValueEnd)
  // newContentArr = `${currentList.content}\n${currentList.itemIndexes?.slice(-1)[0] + 1}. `;
  newContentArr = sliceInputValueEnd
  // console.log('newContentArr', newContentArr);

  // console.log('indexesArr', indexesArr)
  currentList.addSingleLineIndex(indexesArr[currentLineNumber + 1])

  // console.log('lineIndexes', currentList.lineIndexes)
  // set basic endIndexs as start of newline - this is default
  currentList.endIndex = currentList.lineIndexes.slice(-1)[0] || 0
  // console.log('default endIndex', currentList.endIndex)

  // console.log('curentListCopy.itemIndexes', currentList.itemIndexes);
  // console.log('indexesArr', indexesArr);

  // check for midline break - check if 2nd last item is a list index alone on line - like 2 - ['1. ', '2. ', 'hello']
  if (
    regex.isOrderedListItemAloneOnLine.test(
      newContentArr[currentList.itemIndexes.length - 1]
    ) ||
    regex.isListItemAloneOnLine.test(
      newContentArr[currentList.itemIndexes.length - 1]
    )
  ) {
    // console.log('check if fired', currentList.itemIndexes.length)
    // check if current item after list items is not blank , like hello  - ['1. ', '2. ', 'hello']
    if (newContentArr[currentList.itemIndexes.length] !== undefined) {
      // this part should combine w prev - make new content
      console.log(
        'check if fired2',
        newContentArr[currentList.itemIndexes.length]
      )
      // when cursor is on first char of line or before 1 .hello - before h
      // check if first item before current is a list item alone , like 1.  - ['1. ', '2. ', 'hello']
      if (newContentArr[currentList.itemIndexes.length - 2] !== undefined) {
        if (
          regex.isOrderedListItemAloneOnLine.test(
            newContentArr[currentList.itemIndexes.length - 2]
          ) ||
          regex.isListItemAloneOnLine.test(
            newContentArr[currentList.itemIndexes.length - 2]
          )
        ) {
          // console.log('currentList endIndex', currentList.endIndex);
          console.log('check if fired3')

          // trim any list indexes alone on line - trim the 1 - ['1.', '2. hello']
          const itemIndexAlone =
            newContentArr[currentList.itemIndexes.length - 1]
          const itemIndexAloneLen = itemIndexAlone.length
          const itemIndexAloneTrimmed = itemIndexAlone.trim()
          const itemIndexAloneTrimmedLen = itemIndexAloneTrimmed.length
          const amountTrimmed = itemIndexAloneLen - itemIndexAloneTrimmedLen
          console.log('trim', itemIndexAlone)
          console.log('amountTrimmed', amountTrimmed)
          console.log('newContentArr', newContentArr)
          console.log('endIndex b4 trim', currentList.endIndex)
          // insert over top if old version
          newContentArr[currentList.itemIndexes.length - 1] = itemIndexAlone
          // console.log('newContentArr ', newContentArr);
          // subtract trimmed amonut from endIndex
          const trimmedEndIndex = currentList.endIndex - amountTrimmed
          currentList.endIndex = trimmedEndIndex
          _cursorMovestoNextLine -= amountTrimmed
          console.log('endIndex after trim', currentList.endIndex)
        }
      }
      // when cursor is after first char of line 1. hello - after h
      // this means combine the prev item and the current - ['1. ', '2. hello']
      console.log('check if fired4')
      const combineTwoItems = `${
        newContentArr[currentList.itemIndexes.length - 1]
      }${newContentArr[currentList.itemIndexes.length]}`
      // console.log('combine', combineTwoItems);
      const addToEndIndex = newContentArr[currentList.itemIndexes.length].length
      console.log('combine', combineTwoItems)
      // insert over top if old first section - insert over 2 - ['1. ', '2. hello'] - ['1. ', '2. hello', 'hello']
      newContentArr[currentList.itemIndexes.length - 1] = combineTwoItems
      // console.log('newContentArr', newContentArr);
      // delete the old second of 2 sections - ['1. ', '2. hello', empty]
      delete newContentArr[currentList.itemIndexes.length]
      // console.log('newContentArr', newContentArr);
      // filter out empty slots
      newContentArr = newContentArr.filter(String)
      const addedToEndIndex = currentList.endIndex + addToEndIndex
      currentList.endIndex = addedToEndIndex
      console.log('end index', currentList.endIndex)
    }
  }

  // console.log('newEndIndex', newEndIndex);
  // console.log('newContentArr', newContentArr);
  currentList.content = newContentArr
  currentList.endIndex =
    listType === ListTypes.listOl.valueOf()
      ? currentList.endIndex + 3
      : currentList.endIndex + 2
  // const newList = {
  //   ...currentList,
  //   content: newContentArr,
  //   endIndex:
  //     listType === ListTypes.listOl.valueOf()
  //       ? currentList.endIndex + 3
  //       : currentList.endIndex + 2,
  // }
  // console.log('newList', currentList)

  const addNewLineCharsArr = onAddSpaceLineFormatter(
    splitInputOnNewlinesCopy,
    listType
  )
  console.log('addNewLineCharsArr', addNewLineCharsArr)
  const _newLineListStr = addNewLineCharsArr.join('')
  // console.log('_newLineListStr', _newLineListStr);
  const moveToIndex = calculateCursorMoveIndex(
    _newLineListStr,
    currentList,
    cursorIndexes,
    currentLineNumber,
    splitInputOnNewlines
  )
  console.log('moveToIndex', moveToIndex)
  let listsArrCopy = [...listsArr]
  if (isNumber(currentListNumber)) {
    // console.log('1', listsArrCopy)

    delete listsArrCopy[currentListNumber!]
    // console.log('2', listsArrCopy)

    listsArrCopy[currentListNumber!] = currentList
    // console.log('3', listsArrCopy)
  } else {
    // console.log('bottom', listsArrCopy)

    listsArrCopy.push(currentList)
  }
  // console.log('final', listsArrCopy)

  // console.log('_cursorMovestoNextLine', _cursorMovestoNextLine)
  return {
    _cursorMovestoNextLine: moveToIndex || _cursorMovestoNextLine,
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
