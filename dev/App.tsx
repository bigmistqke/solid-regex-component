import { ContentEditable } from '@bigmistqke/solid-contenteditable'
import { Component, type JSX } from 'solid-js'
import { RegexComponent } from '../src'

function Hidden(props: { children: JSX.Element }) {
  return <span style={{ display: 'none' }}>{props.children}</span>
}

const App: Component = () => {
  return (
    <div class="card">
      <h2>Regex Component Demo</h2>
      <div style={{ 'margin-top': '1rem', 'white-space': 'pre-wrap' }}>
        <ContentEditable
          textContent={`Here's a [*link*](https://www.example.com) and some *bold* text with _italic_ text, ~~strikethrough~~ and __underlined__ formatting. Another [link](https://solidjs.com)

Unordered list:
- _First_ *item*
- Second item
- Third item

Ordered list:
1. First numbered *item*
2. Second numbered item
3. Third numbered item`}
          render={content => (
            <RegexComponent
              value={content()}
              regexes={{
                // Match ordered list items (e.g., "1. Item")
                '/(?:^\\d+\\. .+$(?:\r?\n|$))+/gm': (match, _, recurse) => {
                  console.log('Creating ordered list:', match)
                  return (
                    <ol style={{ 'white-space': 'nowrap' }}>
                      <RegexComponent
                        value={match}
                        regexes={{
                          '/^(\\d+. )(.+)$/gm': (match, [prefix, content]) => {
                            console.log('Creating unordered list item:', content)
                            return (
                              <li>
                                <Hidden>{prefix}</Hidden>
                                {recurse(content)}
                              </li>
                            )
                          },
                        }}
                      />
                    </ol>
                  )
                  //
                },
                // Match unordered list items (e.g., "- Item")
                '/(?:^- .+$(?:\r?\n|$))+/gm': (match, _, recurse) => {
                  console.log('Creating unordered list:', match)
                  return (
                    <ul style={{ 'white-space': 'nowrap' }}>
                      <RegexComponent
                        value={match}
                        regexes={{
                          '/^(- )(.+)$/gm': (match, [prefix, content]) => {
                            console.log('Creating unordered list item:', content)
                            return (
                              <li>
                                <Hidden>{prefix}</Hidden>
                                {recurse(content)}
                              </li>
                            )
                          },
                        }}
                      />
                    </ul>
                  )
                },
                '/\\[([^\\]]+)\\]\\(([^)]+)\\)/g': (match, [content, link], recurse) => {
                  return (
                    <>
                      [{recurse(content)}](
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                      </a>
                      )
                    </>
                  )
                },
                '/\\*(.*?)\\*/g': (match, [content], recurse) => {
                  console.log('Creating bold element:', content)
                  return <b>*{recurse(content)}*</b>
                },
                '/_(.*?)_/g': (match, [content], recurse) => {
                  console.log('Creating italic element:', content)
                  return <i>_{recurse(content)}_</i>
                },
                '/~~(.*?)~~/g': (match, [content], recurse) => {
                  console.log('Creating strikethrough element:', content)
                  return <s>~~{recurse(content)}~~</s>
                },
                '/__([^_]+)__/g': (match, [content], recurse) => {
                  console.log('Creating underline element:', content)
                  return <u>__{recurse(content)}__</u>
                },
              }}
            />
          )}
        />
      </div>
    </div>
  )
}

export default App
