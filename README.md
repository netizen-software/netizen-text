# Netizen Text Editor
A minimal text editor for Fedora and Ubuntu built with TypeScript, Electron, and CodeMirror.

## Features

- Open UTF-8 text files, including ASCII and Unicode text
- Open a file from the terminal or the application window
- Save, Save As, and Close the current file
- Find and replace text
- One document at a time, with no settings or context menus

## Requirements

- Linux (Fedora or Ubuntu)
- Node.js 24.21.0 for development and CI

Electron 44.4.5 embeds Node.js 24.21.0 for the packaged application runtime.

## Development

```sh
npm install
npm run dev
```

To open a file at launch, pass its path after `--`:

```sh
npm run dev -- /path/to/file.txt
```

## Validation

```sh
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

## Package

Build the Linux AppImage:

```sh
npm run package
```

The AppImage is written to `release/`. Run it with an optional file path:

```sh
./release/Netizen\ Text\ Editor-0.1.0.AppImage /path/to/file.txt
```

## License
This project is licensed under the **Unlicense** license.\
For more information, click [here](https://unlicense.org/).