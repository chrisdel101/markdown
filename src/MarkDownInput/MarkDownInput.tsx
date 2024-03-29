import React, {
  useState,
  useRef,
  useEffect,
  useReducer,
  useCallback,
} from 'react'
import ReactMarkDown from 'react-markdown'
// @ts-ignore
import remarkGfm from 'remark-gfm'
import { InputType } from 'reactstrap/lib/Input'
import {
  Col,
  FormGroup,
  Label,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
} from 'reactstrap'
import styled from 'styled-components'
import {
  faBold,
  faItalic,
  faStrikethrough,
  faList,
  faListOl,
  faCode,
  faHeading,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import headerLogic from './HeaderLogic/headerLogic'
import iconLogic from './IconLogic/iconLogic'
import { List, ListTypes } from './ListLogic/listMethods'
import {
  createList,
  CreateListOutput,
  continueList,
  ContinueListOutput,
  breakOutList,
  BreakOutListOutput,
  updateListLine,
} from './ListLogic/listMethods'
import { IconLogicOutput } from './IconLogic/iconLogic'
import {
  onAddSpaceLineFormatter,
  anyButtonStateTrue,
  regex,
  isCursorInsideList,
  getCurrentListIndex,
  getCurrentLine,
  getFirstLineIndex,
  isNumber,
  checkListContentIndex,
  calculateNewList,
  getStartIndexesOfEachLineArr,
  indexInsideInputString,
  getCurrentLineInsideList,
  adjustListIndexes,
  adjustCurrentListIndexes,
  calculateCursorMoveIndex,
} from './markDownInputUtils'
import useDebounce from './useDebounce'

export interface CursorState {
  startIndex: number
  endIndex: number
}
export interface CursorStateWrapper extends CursorState {
  type?: string | undefined
  keyType?: string
}
export interface FocusState {
  currentClick: ClickType
  previousClick: ClickType
  previousInputValue: string
}
export interface ButtonState {
  input: boolean
  bold: boolean
  italics: boolean
  strike: boolean
  listOl: boolean
  list: boolean
  code: boolean
}
enum ClickType {
  Empty = '',
  Input = 'input',
  Bold = 'bold',
  Italics = 'italics',
  Strike = 'strink',
  Code = 'code',
  ListOl = 'listOl',
  List = 'list',
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

interface IconButtonStyles {
  buttonState: boolean
}
interface IProps {
  preview?: boolean
  inputType: InputType
  inputName: string
  previewName: string
}

enum DispatchType {
  Click = 'click',
  Reset = 'reset',
  Keyup = 'keyup',
  Mouseup = 'mouseup',
  SingleSpace = 'singleSpace',
  Manual = 'manual',
  Update = 'update',
  List = 'list',
  Enter = 'enter',
}
interface Action {
  updateType: string
  payload?: CursorState
  refCurrent?: HTMLTextAreaElement | null
  keyType?: string
  cursorWrapperInit?: CursorStateWrapper
}
export interface ActiveListIndex {
  currentListIndex?: number
  prevListIndex?: number
}
const initActiveListIndex = {
  currentListIndex: undefined,
  prevListIndex: undefined,
}
const cursorIndexesInitState = {
  startIndex: 0,
  endIndex: 0,
}
const cursorWrapperInit: CursorStateWrapper = {
  ...cursorIndexesInitState,
  type: undefined,
}

function cursorStatereducer(cursorIndexes: CursorState, action: Action) {
  // console.log('state b4 update', cursorIndexes);
  // console.log('action', action);
  switch (action.updateType) {
    case 'singleSpace': {
      let obj: CursorStateWrapper = {
        ...action.payload!,
        type: DispatchType.SingleSpace,
      }
      return obj
    }
    case 'mouseup': {
      let obj: CursorStateWrapper = {
        startIndex: action.refCurrent?.selectionStart || 0,
        endIndex: action.refCurrent?.selectionEnd || 0,
        type: DispatchType.Mouseup,
        keyType: action?.keyType,
      }
      return obj
    }
    case 'keyup': {
      let obj: CursorStateWrapper = {
        startIndex: action.refCurrent?.selectionStart || 0,
        endIndex: action.refCurrent?.selectionEnd || 0,
        type: DispatchType.Keyup,
        keyType: action?.keyType,
      }
      return obj
    }
    case 'enter': {
      let obj: CursorStateWrapper = {
        startIndex: action.refCurrent?.selectionStart || 0,
        endIndex: action.refCurrent?.selectionEnd || 0,
        type: DispatchType.Enter,
        keyType: action?.keyType,
      }
      return obj
    }
    case 'click': {
      let obj: CursorStateWrapper = {
        ...action.payload!,
        type: DispatchType.Click,
      }
      return obj
    }
    case 'update': {
      let obj: CursorStateWrapper = {
        ...action.payload!,
        type: DispatchType.Click,
      }
      return obj
    }
    case 'list': {
      // console.log('B4', cursorIndexes);
      // console.log('here');
      let obj: CursorStateWrapper = {
        ...action.payload!,
        type: DispatchType.List,
      }
      // console.log('after', obj);
      return obj
    }
    case 'reset': {
      return init(action.cursorWrapperInit!)
    }
    default:
      throw new Error()
  }
}
function init(cursorWrapperInit: CursorStateWrapper) {
  return cursorWrapperInit
}
const MarkDownInput = (props: IProps) => {
  const [cursorIndexes, dispatch] = useReducer(
    cursorStatereducer,
    cursorWrapperInit,
    init
  )
  const [activeListIndexState, setActiveListIndexState] =
    useState<ActiveListIndex>(initActiveListIndex)
  const [listsArr, setListsArr] = useState<List[]>([])
  const [dropDownOpen, setDropDownOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')
  const [currentLineNumber, setCurrentLineNumber] = useState<number>(0)
  const [buttonState, setButtonState] = useState<ButtonState>({
    input: false,
    bold: false,
    italics: false,
    strike: false,
    listOl: false,
    list: false,
    code: false,
  })
  const [inputFocusState, setInputFocusState] = useState<FocusState>({
    currentClick: ClickType.Empty,
    previousClick: ClickType.Empty,
    previousInputValue: '',
  })
  const [lastKeyEvent, setLastKeyEvent] =
    useState<React.KeyboardEvent<HTMLTextAreaElement>>()
  const [lastClickEvent, setLastClickEvent] = useState<ClickType>()
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const debouncedInputValue = useDebounce(inputValue)

  const textRef = useRef<HTMLTextAreaElement | null>(null)
  useEffect(() => {
    // reset state on empty input
    if (inputValue.length <= 0) resetAllState()
  }, [inputValue])
  useEffect(() => {
    const splitInputOnNewlines = inputValue.split('\n')
    const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
    console.log('splitInputOnNewlines', splitInputOnNewlines)
    if (lastKeyEvent?.key !== 'Enter') {
      // all keyups not enter
      dispatch({
        updateType: DispatchType.Keyup,
        refCurrent: textRef.current,
        keyType: lastKeyEvent?.key,
      })
      return
    }
    console.log('----------ENTER------------')
    // adjust cursor position to new line
    dispatch({
      updateType: DispatchType.Enter,
      refCurrent: textRef.current,
      keyType: lastKeyEvent?.key,
    })
    if (splitInputOnNewlines[currentLineNumber] === '') return
    if (!buttonState['listOl'] && !buttonState['list']) {
      manageSingleSpaceLogic()
      return
    }
    // if next item falsy then breaout of list
    const isListBreakPoint = splitInputOnNewlines[currentLineNumber + 1]
      ? false
      : true
    if (!isNumber(activeListIndexState.currentListIndex)) return
    const currentList = listsArr[activeListIndexState.currentListIndex!]
    const { listType } = currentList
    // break out of list - check if previous line has only list index
    if (
      (regex.isOrderedListItemAloneOnLine.test(
        splitInputOnNewlines[currentLineNumber]
      ) ||
        regex.isListItemAloneOnLine.test(
          splitInputOnNewlines[currentLineNumber]
        )) &&
      isListBreakPoint
    ) {
      console.log('BREAKOUT')
      const {
        _inputValue,
        _listsArr,
        _activeListIndexState,
        _buttonState,
      }: BreakOutListOutput = breakOutList({
        listType,
        splitInputOnNewlines,
        currentLineNumber,
        listsArr,
        activeListIndexState,
        cursorIndexes,
        buttonState,
      })
      setListsArr(_listsArr)
      setInputValue(_inputValue)
      setActiveListIndexState(_activeListIndexState)
      setButtonState(_buttonState)
      const newCursorIndex = calculateCursorMoveIndex({
        formattedInputVal: _inputValue,
        currentList,
        cursorIndexes,
        currentLineNumber,
        splitInputOnNewlines,
      })
      console.log('_newCursorIndex', newCursorIndex)
      updateCursorPositionManually(
        {
          startIndex: currentList.endIndex + 1,
          endIndex: currentList.endIndex + 1,
        },
        DispatchType.List
      )
      return
    }
    // console.log('indexesArr2', indexesArr)
    // console.log('listsArr', listsArr)

    const {
      _listsArr,
      _inputValue,
      _buttonState,
      _cursorMovestoNextLine,
    }: ContinueListOutput = continueList({
      listType,
      splitInputOnNewlines,
      indexesArr,
      listsArr,
      currentLineNumber,
      activeListIndexState,
      buttonState,
      cursorIndexes,
      inputValue,
    })
    console.log('_cursorMovestoNextLine', _cursorMovestoNextLine)
    console.log('cursorIndexes', cursorIndexes)
    setListsArr(_listsArr)
    setInputValue(_inputValue)
    setButtonState(_buttonState)
    const newCursorIndex = calculateCursorMoveIndex({
      formattedInputVal: _inputValue,
      currentList,
      cursorIndexes,
      currentLineNumber,
      splitInputOnNewlines,
    })
    console.log('_newCursorIndex', newCursorIndex)
    updateCursorPositionManually(
      {
        startIndex:
          newCursorIndex ?? cursorIndexes.startIndex + _cursorMovestoNextLine,
        endIndex:
          newCursorIndex ?? cursorIndexes.endIndex + _cursorMovestoNextLine,
      },
      DispatchType.List
    )

    // } else {
    // all keyups not enter
    // dispatch({
    //   updateType: DispatchType.Keyup,
    //   refCurrent: textRef.current,
    //   keyType: lastKeyEvent?.key,
    // })
    // if (lastKeyEvent?.key === 'Backspace' || lastKeyEvent?.key === 'Delete') {
    //   // listLogic('delete');
    // } else if (
    //   ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'].some(
    //     (key) => key === lastKeyEvent?.key
    //   )
    // ) {
    // if button off, toggle button true TODO - add mouse
    // if (!buttonState['listOl'] && !buttonState['list']) {
    //   // if (getCurrentListIndex() !== undefined) {
    //   //   let buttonStateCopy = { ...buttonState };
    //   //   buttonStateCopy.listOl = true;
    //   //   setButtonState(buttonStateCopy);
    //   //   let currentList = getCurrentList();
    //   // console.log(' IS INSIDE LIST', isInsideList);
    //   // }
    // } else {
    //   // if button on, perform logic to update conent and indexes
    //   if (buttonState['listOl'] || buttonState['list']) {
    //     console.log('INSIDE LIST');
    //     // listLogic('arrows');
    //   }
    // }
    // }
    // }
  }, [lastKeyEvent])
  useEffect(() => {
    // console.log('TOP isTyping', isTyping)
    // console.log('lastKeyEvent', lastKeyEvent)
    const listUpdate = true
    //temp switch - remove after dev
    if (listUpdate) {
      if (buttonState['listOl'] || buttonState['list']) {
        let splitInputOnNewlines = inputValue.split('\n')
        const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
        const whichLineNumOnNow = getCurrentLine(indexesArr, cursorIndexes) || 0
        if (!isTyping) {
          splitInputOnNewlines = debouncedInputValue.split('\n')
          // console.log('DE-splitInputOnNewlines', splitInputOnNewlines)
          const listUpdates = updateListLine({
            splitInputOnNewlines,
            activeListIndexState,
            listsArr,
            currentLineNumber: whichLineNumOnNow,
            cursorIndexes,
            buttonState,
          })
          if (listUpdates !== undefined) {
            const { _listsArr, _buttonState } = listUpdates
            setListsArr(_listsArr)
            setButtonState(_buttonState)
            // // console.log('listUpdates', listUpdates)
            // // console.log('activeListIndexState', activeListIndexState)
            // // if active we're inside a list
            // if (isNumber(activeListIndexState.currentListIndex)) {
            //   if (listUpdates?._listsArr) {
            //     setListsArr(listUpdates?._listsArr)
            //   }
            //   // were outside a list
            // } else {
            //   if (listUpdates?._listsArr) {
            //     setListsArr(listUpdates?._listsArr)
            //   }
            //   if (listUpdates?._buttonState) {
            //     setButtonState(listUpdates._buttonState)
            //   }
            // }
            // check for deleted lines
          }
          // console.log('------HERE-------')
          const currentList = isNumber(activeListIndexState.currentListIndex)
            ? listsArr[activeListIndexState.currentListIndex!]
            : undefined
          // cast to get rid of nevers
          const updatedCurrentList: List = adjustCurrentListIndexes(
            currentList!,
            inputValue,
            listsArr
          ) as List
          // returns empty array when no change
          if (updatedCurrentList) {
            console.log('---ADJUST CURRENT LIST----', updatedCurrentList)
            listsArr[activeListIndexState.currentListIndex!] =
              updatedCurrentList
          }
        }
      }
    }
  }, [isTyping]) //debounce call after typing stops
  useEffect(() => {
    // console.log('ISE', isTyping)
    setIsTyping(true)
    const handler: NodeJS.Timeout = setTimeout(() => {
      setIsTyping(false)
    }, 300)
    // / Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [
    debouncedInputValue,
    cursorIndexes,
    lastKeyEvent,
    buttonState,
    lastClickEvent,
  ])
  useEffect(() => {
    let splitInputOnNewlines = inputValue.split('\n')
    const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
    const whichLineNumOnNow = getCurrentLine(indexesArr, cursorIndexes) || 0
    // set currentine when index moves
    setCurrentLineNumber(whichLineNumOnNow)

    if (buttonState['listOl'] || buttonState['list']) {
      if (
        cursorIndexes.type === 'mouseup' ||
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(
          cursorIndexes.keyType ?? ''
        )
      ) {
        // toggle off buttonState/activeList if clicked before start of list, or after end
        if (isNumber(activeListIndexState.currentListIndex)) {
          const currentList = listsArr[activeListIndexState.currentListIndex!]
          // console.log('cursorIndexes', cursorIndexes)
          console.log('currentList.startIndex', currentList)
          if (
            cursorIndexes.startIndex < currentList.startIndex ||
            cursorIndexes.endIndex > currentList.endIndex
          ) {
            setButtonState({
              ...buttonState,
              [currentList.listType as keyof ButtonState]: false,
            })
            setActiveListIndexState({
              currentListIndex: undefined,
              prevListIndex: activeListIndexState.currentListIndex,
            })
          }
        }
        // console.log('CCC', cursorIndexes?.keyType)
        // console.log('CCC', cursorIndexes?.type)
      }

      // check if we move cursor inside a list
    } else if (!buttonState['list'] && !buttonState['listOl']) {
      // console.log('fired ')
      if (cursorIndexes?.type === 'keyup') {
        // console.log('keyup', cursorIndexes?.keyType)
        const keyType: string | undefined = cursorIndexes?.keyType
        // console.log('keyType', keyType)
        const keyTypes: string[] = [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
        ]
        //includes won't work here
        const checkKey = keyType && keyTypes.indexOf(keyType) !== -1
        // console.log('check key is arrow', checkKey)
        if (checkKey) {
          const insideList = isCursorInsideList(listsArr, cursorIndexes)
          if (!insideList) return
          // console.log('activeListIndexState', activeListIndexState)
          console.log('INN arrow', insideList)
          const currentListIndex =
            insideList && getCurrentListIndex(listsArr, cursorIndexes)
          if (typeof currentListIndex !== 'number') return
          const currentList = listsArr && listsArr[currentListIndex]
          // console.log('currentList', currentList)
          // console.log('activeListIndexState', activeListIndexState);
          // set list to active
          const newActiveListIndexState: ActiveListIndex = {
            ...activeListIndexState,
            currentListIndex,
          }
          setActiveListIndexState(newActiveListIndexState)
          setButtonState({
            ...buttonState,
            [currentList?.listType as keyof ButtonState]: true,
          })
        }
      } else if (cursorIndexes?.type === 'mouseup') {
        const insideList = isCursorInsideList(listsArr, cursorIndexes)
        if (!insideList) return
        // console.log('activeListIndexState', activeListIndexState);
        console.log('INN mouse', insideList)
        const currentListIndex =
          insideList && getCurrentListIndex(listsArr, cursorIndexes)
        if (typeof currentListIndex !== 'number') return
        const currentList = listsArr && listsArr[currentListIndex]
        console.log('currentList', currentList)
        // console.log('activeListIndexState', activeListIndexState);
        // set list to active
        const newActiveListIndexState: ActiveListIndex = {
          ...activeListIndexState,
          currentListIndex,
        }
        setActiveListIndexState(newActiveListIndexState)
        setButtonState({
          ...buttonState,
          [currentList?.listType as keyof ButtonState]: true,
        })
      }
    }
    // cast to get rid of nevers
    const adjustedListsArr: List[] = adjustListIndexes(
      listsArr,
      inputValue,
      activeListIndexState.currentListIndex
    ) as List[]
    // console.log('adjustedListsArr', adjustedListsArr)

    // returns empty array when no change
    if (adjustedListsArr && adjustedListsArr.length) {
      // TODO - make more effiecent
      // const :List[] = adjustedListsArr as List[]
      console.log('---ADJUST ALL LISTS----', adjustedListsArr)
      setListsArr(adjustedListsArr)
    }

    // console.log('ref', textRef.current?.selectionStart);
  }, [cursorIndexes, buttonState, isTyping])
  // use isInsideListPrev to toggle list buttons

  const focusTextRef = () => {
    // console.log('TEST', textRef);
    if (textRef) {
      textRef?.current?.focus()
    }
  }
  const resetAllState = () => {
    if (anyButtonStateTrue(buttonState)) {
      //reset button state when empty input
      resetButtonState()
    }
    setCurrentLineNumber(0)
    // setIsInsideListPrev(false);
    dispatch({ updateType: DispatchType.Reset, cursorWrapperInit })
    setActiveListIndexState(initActiveListIndex)
    setListsArr([])
  }
  const resetButtonState = (exceptions?: string[]) => {
    //reset all button states to false
    const _buttonState = { ...buttonState }
    //@ts-ignore
    Object.keys(_buttonState).map((state: string) => {
      if (!exceptions?.some((exception) => exception === state)) {
        return (_buttonState[state as keyof ButtonState] = false)
      }
    })
    setButtonState(_buttonState)
  }
  const toggleDropDown = () => {
    setDropDownOpen(!dropDownOpen)
  }
  // call on mouse, and click events
  const handleMouseup = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.type)
      if (e.type === 'mouseup') {
        dispatch({
          updateType: DispatchType.Mouseup,
          refCurrent: textRef.current,
        })
      }
  }
  const updateCursorPositionManually = (
    newCursorIndexes: CursorState,
    dispatchType: DispatchType
  ) => {
    // console.log('manual update', newCursorIndexes);
    // dispatch({ updateType: 'manual' });
    // https://stackoverflow.com/a/62250053/5972531
    window.requestAnimationFrame(() => {
      if (textRef && textRef.current) {
        // console.log('XXX', textRef.current.selectionStart);
        textRef.current.setSelectionRange(
          newCursorIndexes.startIndex,
          newCursorIndexes.endIndex
        )
        // console.log('XXX', textRef.current.selectionStart);
        dispatch({ updateType: dispatchType, payload: newCursorIndexes })
      } else {
        console.error('Error on updateCursorPositionManually')
      }
    })
    // setCursorIndexes(newCursorIndexes);
  }
  const trackClickState = (currentClick: ClickType) => {
    let x = inputFocusState.currentClick
    let y = inputValue
    // console.log('current', x, 'inputValue', y);
    setInputFocusState({
      currentClick: currentClick,
      previousClick: x,
      previousInputValue: y,
    })
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }
  // add double space after each \n to achieve single spacing
  // https://github.com/remarkjs/react-markdown/issues/273#issuecomment-495701177
  const manageSingleSpaceLogic = () => {
    // split into arr of words
    const splitInputOnNewlines = inputValue.split('\n')
    // format each line of arr
    const formattedArr = onAddSpaceLineFormatter(splitInputOnNewlines)
    setInputValue(formattedArr.join(''))
    console.log('singlespace')
    // dispatch({ updateType:DispatchType.ClickSingleSpaceDispatchType.Click    // setCursorIndexes({ startIndex: cursorIndexes.startIndex + 3, endIndex: cursorIndexes.endIndex + 3 });
    updateCursorPositionManually(
      {
        startIndex: cursorIndexes.endIndex + 3,
        endIndex: cursorIndexes.endIndex + 3,
      },
      DispatchType.List
    )
  }

  const handleClick = (currentClick: ClickType) => {
    const splitInputOnNewlines = inputValue.split('\n')
    const indexesArr = getStartIndexesOfEachLineArr(splitInputOnNewlines, 1)
    const indexAtStartOfCurrentLine = indexInsideInputString(
      indexesArr,
      cursorIndexes
    )
    setLastClickEvent(ClickType.Input)
    const splitOnSpacesArr = inputValue.split('')
    // console.log('STR', str, index);
    switch (currentClick) {
      case ClickType.Input: {
        // turn off button state on input click
        if (anyButtonStateTrue(buttonState)) {
          resetButtonState(['list', 'listOl'])
        }
        trackClickState(currentClick)
        break
      }
      case ClickType.Bold: {
        const { _inputValue, _cursorIndexes, _buttonState }: IconLogicOutput =
          iconLogic({
            currentClick,
            inputValue,
            buttonState,
            cursorIndexes,
            inputFocusState,
            markdownSymbol: '**',
          })
        setInputValue(_inputValue)
        // setCursorIndexes(_cursorIndexes);
        dispatch({ updateType: DispatchType.Click, payload: _cursorIndexes })
        focusTextRef()
        setButtonState(_buttonState)
        trackClickState(currentClick)
        break
      }
      case ClickType.Italics: {
        const { _inputValue, _cursorIndexes, _buttonState }: IconLogicOutput =
          iconLogic({
            currentClick,
            inputValue,
            buttonState,
            cursorIndexes,
            inputFocusState,
            markdownSymbol: '*',
          })
        setInputValue(_inputValue)
        // setCursorIndexes(_cursorIndexes);
        dispatch({ updateType: DispatchType.Click, payload: _cursorIndexes })
        focusTextRef()
        setButtonState(_buttonState)
        trackClickState(currentClick)
        break
      }
      case ClickType.Strike: {
        const { _inputValue, _cursorIndexes, _buttonState }: IconLogicOutput =
          iconLogic({
            currentClick,
            inputValue,
            buttonState,
            cursorIndexes,
            inputFocusState,
            markdownSymbol: '~',
          })
        setInputValue(_inputValue)
        // setCursorIndexes(_cursorIndexes);
        dispatch({ updateType: DispatchType.Click, payload: _cursorIndexes })
        focusTextRef()
        setButtonState(_buttonState)
        trackClickState(currentClick)
        break
      }
      case ClickType.Code: {
        const { _inputValue, _cursorIndexes, _buttonState }: IconLogicOutput =
          iconLogic({
            currentClick,
            inputValue,
            buttonState,
            cursorIndexes,
            inputFocusState,
            markdownSymbol: '`',
          })
        setInputValue(_inputValue)
        // setCursorIndexes(_cursorIndexes);
        dispatch({ updateType: DispatchType.Click, payload: _cursorIndexes })
        focusTextRef()
        setButtonState(_buttonState)
        trackClickState(currentClick)
        break
      }
      case ClickType.ListOl: {
        // check if first char of current line is NOT an ordered list list item, or is a blank space/empty line.
        if (
          (splitInputOnNewlines[currentLineNumber] &&
            !regex.isOrderedListIndexAtLineStart.test(
              splitInputOnNewlines[currentLineNumber]
            )) ||
          splitInputOnNewlines[currentLineNumber] === ''
        ) {
          const {
            _inputValue,
            _buttonState,
            _activeListIndexState,
            _listsArr,
            _cursorIndexes,
          }: CreateListOutput = createList({
            listType: ListTypes.listOl,
            splitOnSpacesArr,
            indexAtStartOfCurrentLine,
            indexesArr,
            cursorIndexes,
            currentLineNumber,
            listsArr,
            buttonState,
            textRefElem: textRef.current,
            activeListIndexState,
          })
          updateCursorPositionManually(_cursorIndexes, DispatchType.List)
          // dispatch({ updateType: DispatchType.List, payload: _cursorIndexes });
          setInputValue(_inputValue)
          setButtonState(_buttonState)
          setActiveListIndexState(_activeListIndexState)
          setListsArr(_listsArr)
          focusTextRef()
        } else {
          setButtonState({ ...buttonState, ['listOl']: !buttonState['listOl'] })
        }
        // updateCursorPositionManually({
        //   startIndex: cursorIndexes?.startIndex && cursorIndexes?.startIndex + 3,
        //   endIndex: cursorIndexes?.endIndex && cursorIndexes?.endIndex + 3,
        // });
        trackClickState(currentClick)
        break
      }
      case ClickType.List: {
        // check if current line does not start with new line symbol
        if (
          (splitInputOnNewlines[currentLineNumber] &&
            !regex.isListSymbolAtLineStart.test(
              splitInputOnNewlines[currentLineNumber]
            )) ||
          splitInputOnNewlines[currentLineNumber] === ''
        ) {
          const {
            _inputValue,
            _buttonState,
            _activeListIndexState,
            _listsArr,
            _cursorIndexes,
          }: CreateListOutput = createList({
            listType: ListTypes.list,
            splitOnSpacesArr,
            indexAtStartOfCurrentLine,
            indexesArr,
            cursorIndexes,
            currentLineNumber,
            listsArr,
            buttonState,
            textRefElem: textRef.current,
            activeListIndexState,
          })
          setInputValue(_inputValue)
          setButtonState(_buttonState)
          setActiveListIndexState(_activeListIndexState)
          setListsArr(_listsArr)
          focusTextRef()
          updateCursorPositionManually(_cursorIndexes, DispatchType.List)
        } else {
          setButtonState({ ...buttonState, ['list']: !buttonState['list'] })
        }
        trackClickState(currentClick)
        break
      }
      case ClickType.H1:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
      case ClickType.H2:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
      case ClickType.H3:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
      case ClickType.H4:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
      case ClickType.H5:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
      case ClickType.H6:
        headerLogic({ currentClick, inputValue, setInputValue, cursorIndexes })
        break
    }
  }
  function handleKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    setLastKeyEvent(event)
  }
  return (
    <>
      <StyledRow>
        <Col md={6}>
          <FormGroup>
            <Label htmlFor={props.inputName}>{props.inputName}</Label>
            <IconNavWrapper>
              <Nav>
                <Dropdown nav isOpen={dropDownOpen} toggle={toggleDropDown}>
                  <DropdownToggle nav caret>
                    <FontAwesomeIcon icon={faHeading} />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleClick(ClickType.H1)}>
                      <h1>Heading1</h1>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleClick(ClickType.H2)}>
                      <h2>Heading2</h2>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleClick(ClickType.H3)}>
                      <h3>Heading3</h3>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleClick(ClickType.H4)}>
                      <h4>Heading4</h4>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleClick(ClickType.H5)}>
                      <h5>Heading5</h5>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleClick(ClickType.H6)}>
                      <h6>Heading6</h6>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.bold}>
                    <NavLink onClick={() => handleClick(ClickType.Bold)}>
                      <FontAwesomeIcon icon={faBold} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.italics}>
                    <NavLink onClick={() => handleClick(ClickType.Italics)}>
                      {' '}
                      <FontAwesomeIcon icon={faItalic} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.strike}>
                    <NavLink onClick={() => handleClick(ClickType.Strike)}>
                      <FontAwesomeIcon icon={faStrikethrough} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.listOl}>
                    <NavLink onClick={() => handleClick(ClickType.ListOl)}>
                      <FontAwesomeIcon icon={faListOl} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.list}>
                    <NavLink onClick={() => handleClick(ClickType.List)}>
                      <FontAwesomeIcon icon={faList} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
                <NavItem>
                  <IconButtonClick buttonState={buttonState.code}>
                    <NavLink onClick={() => handleClick(ClickType.Code)}>
                      <FontAwesomeIcon icon={faCode} />
                    </NavLink>
                  </IconButtonClick>
                </NavItem>
              </Nav>
            </IconNavWrapper>
            <TextAreaStyles>
              <textarea
                autoFocus
                value={inputValue}
                ref={textRef}
                onChange={handleInputChange}
                onMouseUp={handleMouseup}
                className="form-control"
                onClick={() => handleClick(ClickType.Input)}
                onKeyUp={(e) => {
                  handleKeyUp(e)
                }}
              ></textarea>
            </TextAreaStyles>
          </FormGroup>
        </Col>
        {props.preview && (
          <Col md={6}>
            <FormGroup>
              <Label htmlFor={props.previewName}>{props.previewName}</Label>
              <PreviewWrapper>
                <ReactMarkDown
                  children={inputValue}
                  remarkPlugins={[remarkGfm]}
                />
              </PreviewWrapper>
            </FormGroup>
          </Col>
        )}
      </StyledRow>
    </>
  )
}

export default MarkDownInput

const StyledRow = styled(Row)`
  border: solid 1px black;
  height: 500px;
  width: 90%;
  margin: auto;
  margin-top: 10px;
`
const PreviewWrapper = styled.div`
  display: block;
  min-height: 100px;
  border: 1px solid grey;
  border-radius: 5px;
  background-color: #f5f5f5;
  padding: 10px;
  resize: both;
  overflow: auto;
`
const IconNavWrapper = styled.div`
  display: flex;
  background-color: #f5f5f5;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  border-left: 1px solid #ced4da;
  border-right: 1px solid #ced4da;
  border-top: 1px solid #ced4da;
  & .nav {
    height: 100%;
    width: 100%;
    margin-bottom: 5px;
  }
  & li {
    flex-grow: 1;
    transition-duration: 0.3s;
  }
  & li:hover {
    background-color: #ced4da;
  }
`
const TextAreaStyles = styled.div`
  textarea {
    border-top: none;
    height: 100%;
  }
  height: 200px;
`
const IconButtonClick = styled.div<IconButtonStyles>`
   {
    transition-duration: 0.3s;
    &:hover {
      background-color: #ced4da;
    }
    background-color: ${(props) => (props.buttonState ? '#ced4da' : '#f5f5f5')};
    a {
      color: ${(props) => (props.buttonState ? '#0056b3' : '')};
    }
  }
`
