# README

This repository implements a VS Code extension to help Arc extension developers.

## Features
Get started with samples and create your own project based on project templates.

Provision local K8S and AKS clusters for testing.

Provision Azure/Arc resources.

## Requirements

This extension requires AZD and AKS VS code extensions.

## Build
The project contains a dotnet project for codegen and the extension itself. Use the build script:

```powershell
.\build.ps1
```

After the build is done, building VSIX package with:

```bash
vsce package
```

## Debugging
<details>
<summary><b>Building from source with chatgpt module</b></summary>

To build the extension from source, clone the repository and run `npm install` to install the dependencies. You have to change some code in `chatgpt` module because VSCode runtime does not support `fetch`. Open `node_modules/chatgpt/dist/index.js` (if not found, check `node_modules\chatgpt\build\index.js` instead) and add the following code at the top of the file:

```js
import fetch from 'node-fetch'
```

Then remove the following lines (around line 20):

```js
// src/fetch.ts
var fetch = globalThis.fetch;
```

You also need to replace the following part near the top of the file:

```js
// src/tokenizer.ts
import { encoding_for_model } from "@dqbd/tiktoken";
var tokenizer = encoding_for_model("text-davinci-003");
function encode(input) {
  return tokenizer.encode(input);
}
```

with

```js
// src/tokenizer.ts
import GPT3TokenizerImport from "gpt3-tokenizer";
var GPT3Tokenizer = typeof GPT3TokenizerImport === "function" ? GPT3TokenizerImport : GPT3TokenizerImport.default;
var tokenizer = new GPT3Tokenizer({ type: "gpt3" });
function encode(input) {
  return tokenizer.encode(input).bpe;
}
```

due to the fact that the `@dqbd/tiktoken` module is causing problems with the VSCode runtime. Delete `node_modules/@dqbd/tiktoken` directory as well. *If you know how to fix this, please let me know.*

In file `node_modules/chatgpt/build/index.d.ts` (or `node_modules\chatgpt\build\index.d.ts`), change line 1 to

```js
import * as Keyv from 'keyv';
```

and line 4 to

```js
type FetchFn = any;
```

</details>


## Extension Settings

None.

## Known Issues

None.

## Release Notes

### 1.0.0

Initial release
