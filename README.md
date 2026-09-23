# Netizen Text Editor

A minimal text editor for Fedora and Ubuntu built with TypeScript, Electron, and CodeMirror.

## Features

- Open one text file at a time from the toolbar or terminal.
- Read and write UTF-8 text, including ASCII and Unicode characters.
- Save to the current path or choose a new path with Save As.
- Close the current document and confirm before discarding unsaved changes.
- Find and replace complete words or strings, with optional case-sensitive matching.
- Use the dark editor interface with a themed scrollbar, without native menus or right-click context menus.

## Requirements

- Fedora `>= 26` or Ubuntu `>= 17.10`
- Node.js `24.21.0` (minimum: `22.12.0`)

Electron 44.4.5 embeds Node.js 24.21.0 for the packaged application runtime.

*Note: This project was tested on Ubuntu 24.04 LTS*

## Run In Development

```sh
npm install
npm run dev
```

Pass a text file path after `--` to open it at launch:

```sh
npm run dev -- /path/to/file.txt
```

## Editor Commands

| Command | Keyboard shortcut |
| --- | --- |
| Open | `Ctrl+O` |
| Save | `Ctrl+S` |
| Save As | `Ctrl+Shift+S` |
| Close file | `Ctrl+W` |
| Find | `Ctrl+F` |
| Find and replace | `Ctrl+H` |

The toolbar provides the same commands for mouse-driven use.

## Build

Create the compiled Electron application in `out/`:

```sh
npm run build
```

Build the Linux AppImage:

```sh
npm run package
```

The generated artifact is written to `release/` and is intentionally excluded from Git.

Run the AppImage directly, optionally passing a file path:

```sh
./release/Netizen-Text-Editor-0.1.0.AppImage
./release/Netizen-Text-Editor-0.1.0.AppImage /path/to/file.txt
```

## Test And Validate

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## License

This project is licensed under the **Unlicense** license.\
For more information, click [here](https://unlicense.org/).