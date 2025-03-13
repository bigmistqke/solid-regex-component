import { Component, createSignal } from 'solid-js'
import { RegexComponent } from '../src'

const App: Component = () => {
  const [text, setText] =
    createSignal(`Here's a [link](https://www.example.com) and some *bold* text with _italic_ text, ~~strikethrough~~ and __underlined__ formatting. Another [link](https://solidjs.com)

Unordered list:
- First item
- Second item
- Third item

Ordered list:
1. First numbered item
2. Second numbered item
3. Third numbered item`)

  return (
    <div class="card">
      <h2>Regex Component Demo</h2>
      <div style={{ 'margin-bottom': '1rem' }}>
        <textarea
          value={text()}
          onInput={e => setText(e.currentTarget.value)}
          style={{ width: '100%', height: '200px' }}
        />
      </div>
      <div style={{ 'margin-top': '1rem' }}>
        <RegexComponent
          value={text()}
          regexes={{
            // Match ordered list items (e.g., "1. Item")
            '/(?:^\\d+\\. .+$(?:\r?\n|$))+/gm': match => {
              console.log('Creating ordered list:', match)
              return (
                <ol>
                  <RegexComponent
                    value={match}
                    regexes={{
                      '/^\\d+. (.+)$/gm': (match, content) => {
                        console.log('Creating unordered list item:', content)
                        return <li>{content}</li>
                      },
                    }}
                  />
                </ol>
              )
              //
            },
            // Match unordered list items (e.g., "- Item")
            '/(?:^- .+$(?:\r?\n|$))+/gm': match => {
              console.log('Creating unordered list:', match)
              return (
                <ul>
                  <RegexComponent
                    value={match}
                    regexes={{
                      '/^- (.+)$/gm': (match, content) => {
                        console.log('Creating unordered list item:', content)
                        return <li>{content}</li>
                      },
                    }}
                  />
                </ul>
              )
            },
            '/\\[([^\\]]+)\\]\\(([^)]+)\\)/g': (match, content, link) => {
              return (
                <>
                  [{content}](
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                  )
                </>
              )
            },
            '/\\*(.*?)\\*/g': (match, content) => {
              console.log('Creating bold element:', content)
              return <b>*{content}*</b>
            },
            '/_(.*?)_/g': (match, content) => {
              console.log('Creating italic element:', content)
              return <i>_{content}_</i>
            },
            '/~~(.*?)~~/g': (match, content) => {
              console.log('Creating strikethrough element:', content)
              return <s>~~{content}~~</s>
            },
            '/__([^_]+)__/g': (match, content) => {
              console.log('Creating underline element:', content)
              return <u>__{content}__</u>
            },
          }}
        />
      </div>
    </div>
  )
}

export default App
