import { createEffect, createMemo, For, type JSX } from 'solid-js'

type RegexReplacer = (...matches: string[]) => JSX.Element

interface RegexProps {
  value: string
  regexes: Record<string, RegexReplacer>
}

interface Match {
  type: 'text' | 'element'
  content: string
  pattern?: string
  index: number
  length: number
  matchIndex?: number
}

interface ElementData {
  matches: string[]
  element: JSX.Element
}

interface PatternState {
  pattern: RegExp
  replacer: RegexReplacer
  matchCount: number
  elements: ElementData[]
}

/**********************************************************************************/
/*                                                                                */
/*                                      Utils                                     */
/*                                                                                */
/**********************************************************************************/

// Helper function to compare arrays
function arraysEqual(a: any[], b: any[]): boolean {
  return a.length === b.length && a.every((val, index) => val === b[index])
}

/**********************************************************************************/
/*                                                                                */
/*                                 Regex Component                                */
/*                                                                                */
/**********************************************************************************/

export function RegexComponent(props: RegexProps) {
  const patternStates = new Map<string, PatternState>()

  const segments = createMemo(() => {
    const matches: Match[] = []
    let text = props.value

    // Process each pattern and update their states
    Object.entries(props.regexes).forEach(([patternStr, replacer]) => {
      const pattern = new RegExp(
        patternStr.replace(/^\/|\/[gimuy]*$/g, ''),
        patternStr.match(/\/([gimuy]*)$/)?.[1] || '',
      )

      // Get or create pattern state
      let state = patternStates.get(patternStr)
      if (!state) {
        state = {
          pattern,
          replacer,
          matchCount: 0,
          elements: [],
        }
        patternStates.set(patternStr, state)
      }

      // Reset match count for this pattern
      state.matchCount = 0

      // Find all matches for this pattern
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text)) !== null) {
        const matchIndex = state.matchCount
        const matchStrings = [...match]

        // Check if we need to create a new element or if the match content changed
        let elementData = state.elements[matchIndex]
        if (!elementData || !arraysEqual(elementData.matches, matchStrings)) {
          console.log(`Creating/updating element for pattern ${patternStr} at index ${matchIndex}`)
          elementData = {
            matches: matchStrings,
            element: replacer(...matchStrings),
          }
          state.elements[matchIndex] = elementData
        }

        matches.push({
          type: 'element',
          content: match[0],
          pattern: patternStr,
          index: match.index,
          length: match[0].length,
          matchIndex,
        })

        state.matchCount++
      }

      // Cleanup excess elements
      if (state.elements.length > state.matchCount) {
        console.log(`Cleaning up excess elements for pattern ${patternStr}`)
        state.elements.length = state.matchCount
      }
    })

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index)

    // Fill in text segments between matches
    const result: Match[] = []
    let lastIndex = 0

    matches.forEach(match => {
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
          index: lastIndex,
          length: match.index - lastIndex,
        })
      }
      result.push(match)
      lastIndex = match.index + match.length
    })

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
        index: lastIndex,
        length: text.length - lastIndex,
      })
    }

    return result
  })

  const renderSegment = (segment: Match) => {
    if (segment.type === 'text') {
      return segment.content
    }

    const state = patternStates.get(segment.pattern!)
    if (!state || segment.matchIndex === undefined) {
      return segment.content
    }

    return state.elements[segment.matchIndex].element
  }

  createEffect(() => console.log('segments()', segments()))

  return <For each={segments()}>{segment => renderSegment(segment)}</For>
}
