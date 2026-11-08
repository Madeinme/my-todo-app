# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A practice workspace for small static web pages: plain HTML, CSS and vanilla JavaScript. There is no build step, package manager, linter or test suite, and it is not a git repository. The user writes in Korean, so page content and replies should be in Korean.

## Running

Open a page's `index.html` directly in a browser. No server is needed.

## Structure

Each page is its own folder with a self-contained `index.html`, `style.css` and `main.js`, linked by relative paths.

- `profile/`: a self-introduction card page.
  - `main.js` defines an empty `initApp()`, which runs on `DOMContentLoaded`. Put new page logic there.
  - Theme color is `#667eea`, used in a purple gradient with `#764ba2`.
  - `text.txt` is the user's scratch file, not part of the page.
- `counter/`: a counter app with +, − and reset buttons. Same purple theme as `profile/`; logic lives in `initApp()` in `main.js`.
- `to-do/`: a to-do list app, same purple theme. `initApp()` keeps todos in a `todos` array, loaded from and saved to LocalStorage under the key `todo-app.todos`. `render()` runs after every change; it saves, updates the total/done counts, highlights the current filter and redraws only the todos that match `currentFilter` (`all` / `active` / `done`, not saved). Adding rejects duplicates (case-insensitive). The empty message is shown or hidden by JS through its `hidden` attribute. Each item is `li.todo-item` with a checkbox, a `.todo-text` span and a `.delete-btn`; `.completed` strikes the text through.
- `fxconverter/`: a currency converter, same purple theme. `initApp()` fetches `https://api.exchangerate-api.com/v4/latest/{FROM}` when the 변환 button is clicked and shows `amount × rates[TO]` in `#result` (`.error` for invalid input or failed requests). Currencies: USD, EUR, KRW, JPY. `#swap-btn` (between From and To) swaps the two currencies. Conversion also runs live: 300 ms after typing stops, and immediately on a currency change or swap; in live mode an empty amount clears the result instead of showing an error. Rates are cached per base currency in `ratesCache` for the page session, and `latestRequest` makes late responses from older requests get ignored. The last 5 successful conversions (`{amount, from, to, rate, converted, time}`, newest first) are kept in `history`, saved to LocalStorage under `fxconverter.history` and drawn by `renderHistory()` into `#history`; the section is hidden by JS when empty. Only conversions from the 변환 button are recorded (live conversions are shown but never recorded), and an entry identical to the newest one is not added again. Each history item has a checkbox; checked entries are tracked by their `time` in `selectedTimes` (not saved). `#delete-selected` (disabled when nothing is checked) removes the checked entries, and `#delete-all` removes everything after a `confirm()`. All history changes go through `updateHistory()`, which saves and re-renders. `test.txt` is the user's scratch file.
- `snakegame/`: a snake game, same purple theme. `initApp()` draws a 400×400 canvas as a 20×20 grid and moves the snake via `setInterval`. `gameState` is `ready` / `playing` / `paused` / `over`; `updateControls()` syncs the buttons to it. The interval comes from `getTickMs()`: the `#difficulty` select's value (200 / 150 / 100 / 50 ms, 보통 150 is the default; locked while a game is in progress) minus 10 ms per level, with a 30 ms floor (`MIN_TICK_MS`). The level is `floor(score / 50) + 1`; `checkLevelUp()` restarts the timer at the new speed and replays the `.level-up` animation. `#pause-btn` toggles 일시정지 / 재개 and the canvas draws a pause screen. Arrow keys queue up to 2 turns in `directionQueue` (reversing is ignored, and input is ignored while paused). Food gives +10; hitting a wall or the body ends the game. The best score is saved in LocalStorage under `snakegame.best`. `#overlay` over the canvas holds the start button, which becomes 다시 시작 on game over. `test` is the user's scratch file.

## 주의
-주석은 항상 한국어로 해주세요
