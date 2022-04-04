import React, { useEffect } from 'react'

// https://stackoverflow.com/a/67816286/5972531
export default function useDebounce(value: string, delay: number = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  // console.log('VALue', value)
  useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  // console.log('debouncedValue', debouncedValue)
  return debouncedValue
}
