# Procedural Hex Planet Generation

## Prerequisites

Before you are able to compile and run `planetgen`, you need the typescript compiler installed on your machine. To do so, ensure that you have NPM, and then type the following on your command line:

```
npm install -g typescript
```

## Compiling

To compile the planet generation code, simply run:

```
tsc --out game.js src/Game.ts
```

## Running

Once compiled, ensure that `index.html` and `game.js` are hosted within a web server such as Apache, Nginx or Python SimpleHTTPServer, and navigate to the target URL within the browser.
