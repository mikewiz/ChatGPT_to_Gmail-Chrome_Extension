# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Manifest V3 Google Chrome extension that injects a ChatGPT-powered "auto-reply" feature into Gmail. When the user clicks **Reply** on an email thread, a content script captures the thread text, sends it to OpenAI via the background service worker, and writes the generated draft back into the Gmail compose textbox.

This is a pure browser-extension project: **there is no build step, bundler, or framework.** The source files are loaded directly by Chrome.

## Commands

There is no build or test infrastructure. The only tooling is ESLint:

```bash
npm install              # install devDependencies (eslint)
npx eslint .             # lint all JS
npx eslint gmail-script.js   # lint a single file
npx eslint --fix .       # auto-fix style issues
```

To run/debug the extension: load the repo root as an unpacked extension via `chrome://extensions` (Developer mode → "Load unpacked"). Reload from that page after changes. Debug the content script in Gmail's DevTools console, and the service worker via the "service worker" link on the extensions page.

## Architecture

Four execution contexts communicate exclusively through `chrome.runtime.sendMessage` and share state via `chrome.storage.sync`. There is no shared module system — each file is an independent script.

- **`gmail-script.js`** — content script injected into `https://mail.google.com/*` at `document_idle`. It scrapes the DOM (no Gmail API): finds the Reply `<span>` by matching `innerText === "Reply"`, replaces the node with a clone to strip Gmail's own listeners, and attaches `replyClickedFunction`. On click it reads the email body from `.adn.ads`, builds a prompt, animates a "Loading..." indicator in the compose box, and round-trips the request to the background worker. The reply textbox is located via `[role=textbox]`; the user's existing signature is captured from it and re-appended to the generated reply.

- **`background.js`** — the service worker and the only context allowed to call OpenAI. It listens for typed messages and routes on `message.type`:
  - `gptRequest` — reads `apiKey` from storage, POSTs to the OpenAI completions endpoint, returns the text. **Must `return true`** to keep the async response channel open.
  - `updateStatus` / `getStatus` — read/write the in-memory + storage `extensionStatus` object surfaced in the popup.
  - `storeUsername`, `gmailUserNameError` — username persistence and error notifications.
  It also contains an OAuth2 (`chrome.identity`) flow for fetching the Google profile name.

- **`popup.js` + `index.html`** — the toolbar popup ("extension status" dashboard): shows last email/response, the obfuscated API key, and an editable "prepend text". Reads/writes `chrome.storage.sync` and queries the worker with `getStatus`.

- **`options.js` + `options.html`** — the setup page (`options_page`) where the user enters their OpenAI API key. Stores `apiKey` plus an `obfuscatedApiKey` (`sk-...` + last 4 chars) for display.

### Cross-cutting conventions

- **Message passing is the contract.** Any new feature that crosses contexts adds a new `message.type` branch in the `background.js` listener; async handlers must `return true`.
- **`chrome.storage.sync` is the source of truth** for persisted state: `apiKey`, `obfuscatedApiKey`, `prependString`/`prependText`, `gmailUsername`, `lastEmailStored`, `lastResponseStored`, and the `extensionStatus` fields. Storage reads are async callbacks — sequence dependent logic inside them.
- **Gmail DOM selectors are fragile** by nature (they target Gmail's markup, which changes). The existing code defends against this with retry loops (`getGmailUserFullName`, `getGmailTextboxText`) and falls back to defaults; preserve that pattern rather than assuming a selector resolves immediately.
- The manifest declares `permissions: identity, storage, notifications, webRequest, tabs` and `host_permissions` for Gmail only. Adding cross-origin fetches or new injection targets requires manifest changes.

### State to be aware of when editing

- The OpenAI call in `background.js` uses the **legacy `/v1/completions` endpoint with `model: "text-davinci-003"`**, which OpenAI has deprecated. Any work touching GPT requests likely needs migration to the chat completions API.
- Several user-/brand-specific strings are **hardcoded**: default name `"Michael Flint"`, brand `"MEP Hot Sauces"`, and prompt prefixes appear in `gmail-script.js` and `popup.js`. The default prompt is also defined in two places (the inline `prependText` in `replyClickedFunction` vs. the popup's saved `prependString`) and they are not synchronized.
- `index.html` references `darkStyles.css` (theme toggle) which does not exist in the repo.

## Code style (enforced by `.eslintrc.js`)

- 2-space indentation, **double quotes**, semicolons required (`eslint:recommended` base).
- `chrome` is a read-only global; browser environment, `ecmaVersion: latest`.
- Per-file overrides: `no-unused-vars` is **off** for `background.js`, and ignores an `event` argument in `gmail-script.js`.

## Security

API keys are user-provided and stored in `chrome.storage.sync` only — never commit a key. Report vulnerabilities per `SECURITY.md` (privately, to the maintainer email) rather than opening a public issue.
