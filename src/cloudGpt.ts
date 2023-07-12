/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import axios from 'axios';

type AuthInfo = {apiKey?: string};
type Settings = {selectedInsideCodeblock?: boolean, codeblockWithLanguageId?: false, pasteOnClick?: boolean, keepConversation?: boolean, timeoutLength?: number, model?: string, apiUrl?: string};

const BASE_URL = 'https://cloudgpt.azurewebsites.net/api/cloud-gpt/scenario/azurearcdev';

export class CloudGPTViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'chatView';
    private _view?: vscode.WebviewView;
    private _conversation?: any;

    private _response?: string;
    private _prompt?: string;
    private _fullPrompt?: string;
    private _currentMessageNumber = 0;

    private _settings: Settings =
    {
        selectedInsideCodeblock: false,
        codeblockWithLanguageId: false,
        pasteOnClick: true,
        keepConversation: true,
        timeoutLength: 60,
        apiUrl: BASE_URL,
        model: 'gpt-3.5-turbo'
    };

    private _authInfo?: AuthInfo;

    // In the constructor, we store the URI of the extension
    constructor(private readonly _extensionUri: vscode.Uri) { }
    
    // Set the API key and create a new API instance based on this key
    public setAuthenticationInfo(authInfo: AuthInfo)
    {
        this._authInfo = authInfo;
    }

    public setSettings(settings: Settings)
    {
        this._settings = {...this._settings, ...settings};
    }

    public getSettings()
    {
        return this._settings;
    }

    public resolveWebviewView
    (
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    )
    {
        this._view = webviewView;

        // set options for the webview, allow scripts
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        // set the HTML for the webview
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // add an event listener for messages received by the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'codeSelected':
                    {
                        // do nothing if the pasteOnClick option is disabled
                        if (!this._settings.pasteOnClick) {
                            break;
                        }
                        let code = data.value;
                        const snippet = new vscode.SnippetString();
                        snippet.appendText(code);
                        // insert the code as a snippet into the active text editor
                        vscode.window.activeTextEditor?.insertSnippet(snippet);
                        break;
                    }
                case 'prompt':
                    {
                        this.search(data.value);
                    }
            }
        });
    }

    public async resetConversation()
    {
        console.log(this, this._conversation);
        if (this._conversation)
        {
            this._conversation = null;
        }
        this._prompt = '';
        this._response = '';
        this._fullPrompt = '';
        this._view?.webview.postMessage({ type: 'setPrompt', value: '' });
        this._view?.webview.postMessage({ type: 'addResponse', value: '' });
    }

    public async search(prompt?:string)
    {
        if (this._settings?.apiUrl === undefined)
        {
            await vscode.window.showErrorMessage("API Url (cloudgpt.apiUrl) is not configured");
            return;
        }

        if (this._authInfo?.apiKey === undefined)
        {
            await vscode.window.showErrorMessage("API key (cloudgpt.apiKey) is not configured");
            return;
        }

        this._prompt = prompt;
        if (!prompt) {
            prompt = '';
        };

        // focus gpt activity from activity bar
        if (!this._view)
        {
            await vscode.commands.executeCommand('azurearc.chatView.focus');
        }
        else
        {
            this._view?.show?.(true);
        }

        let response = '';
        this._response = '';

        // Get the selected text of the active editor
        const selection = vscode.window.activeTextEditor?.selection;
        const selectedText = vscode.window.activeTextEditor?.document.getText(selection);

        // Get the language id of the selected text of the active editor
        // If a user does not want to append this information to their prompt, leave it as an empty string
        const languageId =
            (this._settings.codeblockWithLanguageId ? vscode.window.activeTextEditor?.document?.languageId : undefined) || "";
        let searchPrompt = '';

        if (selection && selectedText)
        {
            // If there is a selection, add the prompt and the selected text to the search prompt
            if (this._settings.selectedInsideCodeblock)
            {
                searchPrompt = `${prompt}\n\`\`\`${languageId}\n${selectedText}\n\`\`\``;
            }
            else
            {
                searchPrompt = `${prompt}\n${selectedText}\n`;
            }
        }
        else
        {
            // Otherwise, just use the prompt if user typed it
            searchPrompt = prompt;
        }

        this._fullPrompt = searchPrompt;

        // Increment the message number
        this._currentMessageNumber++;
        let currentMessageNumber = this._currentMessageNumber;

        console.log("sendMessage");
        
        // Make sure the prompt is shown
        this._view?.webview.postMessage({ type: 'setPrompt', value: this._prompt });
        this._view?.webview.postMessage({ type: 'addResponse', value: '...' });

        // const agent = this._chatGPTAPI;
        // try
        // {
        //     // Send the search prompt to the ChatGPTAPI instance and store the response
        //     const res = await agent.sendMessage(searchPrompt, {
        //         onProgress: (partialResponse) => {
        //             // If the message number has changed, don't show the partial response
        //             if (this._currentMessageNumber !== currentMessageNumber) {
        //                 return;
        //             }
        //             console.log("onProgress");
        //             if (this._view && this._view.visible) {
        //                 response = partialResponse.text;
        //                 this._response = response;
        //                 this._view.webview.postMessage({ type: 'addResponse', value: response });
        //             }
        //         },
        //         timeoutMs: (this._settings.timeoutLength || 60) * 1000,
        //         ...this._conversation
        //     });

        //     if (this._currentMessageNumber !== currentMessageNumber)
        //     {
        //         return;
        //     }

        //     console.log(res);

        //     response = res.text;
        //     if (res.detail?.usage?.total_tokens) {
        //         response += `\n\n---\n*<sub>Tokens used: ${res.detail.usage.total_tokens} (${res.detail.usage.prompt_tokens}+${res.detail.usage.completion_tokens})</sub>*`;
        //     }

        //     if (this._settings.keepConversation){
        //         this._conversation = {
        //             parentMessageId: res.id
        //         };
        //     }
        // }
        // catch (e:any)
        // {
        //     console.error(e);
        //     if (this._currentMessageNumber === currentMessageNumber)
        //     {
        //         response = this._response;
        //         response += `\n\n---\n[ERROR] ${e}`;
        //     }
        // }

        // if (this._currentMessageNumber !== currentMessageNumber) {
        //     return;
        // }

        const headers = {
            "Content-Type": "application/json",
            "api-key": this._authInfo.apiKey
        };

        const data = { question: this._fullPrompt };
        await axios.post(this._settings.apiUrl, data, { headers })
            .then(res => response = res.data.reply)
            .catch((e) => {
                console.error(e);
                return;
            });

        // Saves the response
        this._response = response;

        // Show the view and send a message to the webview with the response
        if (this._view) {
            this._view.show?.(true);
            this._view.webview.postMessage({ type: 'addResponse', value: response });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview)
    {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const microlightUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'microlight.min.js'));
        const tailwindUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'showdown.min.js'));
        const showdownUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'scripts', 'tailwind.min.js'));

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="${tailwindUri}"></script>
                <script src="${showdownUri}"></script>
                <script src="${microlightUri}"></script>
                <style>
                .code {
                    white-space: pre;
                }
                p {
                    padding-top: 0.3rem;
                    padding-bottom: 0.3rem;
                }
                /* overrides vscodes style reset, displays as if inside web browser */
                ul, ol {
                    list-style: initial !important;
                    margin-left: 10px !important;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-weight: bold !important;
                }
                </style>
            </head>
            <body>
                <input class="h-10 w-full text-white bg-stone-700 p-4 text-sm" placeholder="Ask CloudGPT something" id="prompt-input" />
                
                <div id="response" class="pt-4 text-sm">
                </div>

                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}