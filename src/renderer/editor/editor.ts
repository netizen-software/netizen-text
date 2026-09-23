import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'
import {
  SearchQuery,
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  openSearchPanel,
  replaceAll,
  replaceNext,
  search,
  searchKeymap,
  setSearchQuery,
} from '@codemirror/search'
import { EditorView, keymap } from '@codemirror/view'
import type { ViewUpdate } from '@codemirror/view'

type ChangeListener = (contents: string) => void

const createButton = (label: string, onClick: () => void): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'search-button'
  button.textContent = label
  button.addEventListener('click', onClick)
  return button
}

const createSearchPanel = (view: EditorView) => {
  let query = getSearchQuery(view.state)
  const panel = document.createElement('form')
  panel.className = 'search-panel'
  panel.addEventListener('submit', (event) => {
    event.preventDefault()
    findNext(view)
  })

  const findInput = document.createElement('input')
  findInput.type = 'search'
  findInput.placeholder = 'Find'
  findInput.autocomplete = 'off'
  findInput.dataset.searchFind = 'true'
  findInput.setAttribute('main-field', 'true')

  const replaceInput = document.createElement('input')
  replaceInput.type = 'text'
  replaceInput.placeholder = 'Replace'
  replaceInput.autocomplete = 'off'
  replaceInput.dataset.searchReplace = 'true'

  const caseSensitive = document.createElement('input')
  caseSensitive.type = 'checkbox'
  caseSensitive.id = 'search-case-sensitive'
  const caseLabel = document.createElement('label')
  caseLabel.className = 'case-toggle'
  caseLabel.htmlFor = caseSensitive.id
  caseLabel.append(caseSensitive, 'Match case')

  const commitQuery = (): void => {
    const nextQuery = new SearchQuery({
      search: findInput.value,
      replace: replaceInput.value,
      caseSensitive: caseSensitive.checked,
    })
    if (!nextQuery.eq(query)) {
      query = nextQuery
      view.dispatch({ effects: setSearchQuery.of(query) })
    }
  }

  findInput.addEventListener('input', () => {
    commitQuery()
    findNext(view)
  })
  replaceInput.addEventListener('input', commitQuery)
  caseSensitive.addEventListener('change', commitQuery)

  const controls = document.createElement('div')
  controls.className = 'search-controls'
  controls.append(
    createButton('Previous', () => {
      commitQuery()
      findPrevious(view)
    }),
    createButton('Next', () => {
      commitQuery()
      findNext(view)
    }),
    createButton('Replace', () => {
      commitQuery()
      replaceNext(view)
    }),
    createButton('Replace All', () => {
      commitQuery()
      replaceAll(view)
    }),
    createButton('Close', () => {
      closeSearchPanel(view)
      view.focus()
    }),
  )

  panel.append(findInput, replaceInput, caseLabel, controls)

  const setQuery = (nextQuery: SearchQuery): void => {
    query = nextQuery
    findInput.value = query.search
    replaceInput.value = query.replace
    caseSensitive.checked = query.caseSensitive
  }

  setQuery(query)
  return {
    dom: panel,
    top: true,
    mount: () => findInput.focus(),
    update: (update: ViewUpdate) => {
      for (const transaction of update.transactions) {
        for (const effect of transaction.effects) {
          if (effect.is(setSearchQuery) && !effect.value.eq(query)) {
            setQuery(effect.value)
          }
        }
      }
    },
  }
}

export class TextEditor {
  private readonly view: EditorView
  private applyingDocument = false

  constructor(parent: HTMLElement, onChange: ChangeListener) {
    const state = EditorState.create({
      doc: '',
      extensions: [
        history(),
        search({ createPanel: createSearchPanel }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          {
            key: 'Mod-h',
            run: () => {
              this.openSearch(true)
              return true
            },
          },
        ]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !this.applyingDocument) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#17191d', color: '#d8ded7' },
          '.cm-content': {
            caretColor: '#b8d45c',
            fontFamily: '"IBM Plex Mono", "JetBrains Mono", "Liberation Mono", monospace',
            fontSize: '14px',
            lineHeight: '1.65',
            padding: '22px 24px 56px',
          },
          '.cm-gutters': { backgroundColor: '#17191d', color: '#6b736d', border: 'none' },
          '.cm-activeLine': { backgroundColor: '#1d211f' },
          '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
            backgroundColor: '#39462b',
          },
          '.cm-searchMatch': { backgroundColor: '#6f7d3d', outline: 'none' },
          '.cm-searchMatch.cm-searchMatch-selected': {
            backgroundColor: '#b8d45c',
            color: '#17191d',
          },
          '&.cm-focused': { outline: 'none' },
        }),
      ],
    })

    this.view = new EditorView({ state, parent })
  }

  getContents(): string {
    return this.view.state.doc.toString()
  }

  setContents(contents: string): void {
    this.applyingDocument = true
    this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: contents } })
    this.applyingDocument = false
    this.view.focus()
  }

  openFind(): void {
    this.openSearch(false)
  }

  openReplace(): void {
    this.openSearch(true)
  }

  private openSearch(focusReplace: boolean): void {
    openSearchPanel(this.view)
    queueMicrotask(() => {
      const selector = focusReplace ? '[data-search-replace]' : '[data-search-find]'
      this.view.dom.querySelector<HTMLInputElement>(selector)?.focus()
    })
  }
}
