import { createMemo, For, type Accessor, type JSX } from 'solid-js'

type RegexReplacer = (
  match: string,
  groups: Array<string>,
  recurse: (value: string) => JSX.Element,
) => JSX.Element

interface RegexProps {
  value: string
  regexes: Record<string, RegexReplacer>
}

interface Match {
  type: 'text' | 'element'
  content: string
  pattern?: string
  matchIndex?: number
  range: {
    start: number
    end: number
  }
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

function filterMatches(matches: Match[]) {
  return matches.filter((match, index) => {
    const previousMatches = matches.slice(0, index)
    return !previousMatches.find(previousMatch => {
      return (
        previousMatch.range.start <= match.range.start &&
        previousMatch.range.end > match.range.start
      )
    })
  })
}

/**********************************************************************************/
/*                                                                                */
/*                                 Regex Component                                */
/*                                                                                */
/**********************************************************************************/

export function RegexComponent(props: RegexProps) {
  function regexToComponent(value: Accessor<string>) {
    const patternStates = new Map<string, PatternState>()

    const segments = createMemo(() => {
      const matches: Match[] = []
      let text = value()

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
            console.log(
              `Creating/updating element for pattern ${patternStr} at index ${matchIndex}`,
            )
            const [match, ...groups] = matchStrings
            elementData = {
              matches: matchStrings,
              element: replacer(match, groups, value => regexToComponent(() => value)),
            }
            state.elements[matchIndex] = elementData
          }

          matches.push({
            type: 'element',
            content: match[0],
            pattern: patternStr,
            matchIndex,
            range: {
              start: match.index,
              end: match.index + match[0].length,
            },
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
      matches.sort((a, b) => {
        const delta = a.range.start - b.range.start
        if (delta !== 0) return delta
        return b.range.end - a.range.end
      })

      // Fill in text segments between matches
      const result: Match[] = []
      let lastIndex = 0

      filterMatches(matches).forEach(match => {
        if (match.range.start > lastIndex) {
          result.push({
            type: 'text',
            content: text.slice(lastIndex, match.range.start),
            range: {
              start: lastIndex,
              end: match.range.start,
            },
          })
        }
        result.push(match)
        lastIndex = match.range.end
      })

      // Add remaining text
      if (lastIndex < text.length) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex),
          range: {
            start: lastIndex,
            end: text.length,
          },
        })
      }

      return result
    })

    function renderSegment(segment: Match) {
      if (segment.type === 'text') {
        return segment.content
      }

      const state = patternStates.get(segment.pattern!)
      if (!state || segment.matchIndex === undefined) {
        return segment.content
      }

      return state.elements[segment.matchIndex]!.element
    }

    return <For each={segments()}>{segment => renderSegment(segment)}</For>
  }

  return createMemo(() => regexToComponent(() => props.value)) as unknown as JSX.Element
}
