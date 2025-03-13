<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@bigmistqke/solid-regex-component&background=tiles&project=%20" alt="@bigmistqke/solid-regex-component">
</p>

# @bigmistqke/solid-regex-component

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

solid component rendering text according to given regexes

## Quick start

Install it:

```bash
npm i @bigmistqke/solid-regex-component
# or
yarn add @bigmistqke/solid-regex-component
# or
pnpm add @bigmistqke/solid-regex-component
```

Use it:

```tsx
import @bigmistqke/solid-regex-component from '@bigmistqke/solid-regex-component'

function App(){
  return <RegexComponent
    value="*this* is a [*link*](https://www.example.com)"
    regexes={{
      '/\\*(.*?)\\*/g': (match, [content], recurse) => {
        return <b>*{recurse(content)}*</b>
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
      }
    }}
  >
}
```
