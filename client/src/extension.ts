import { 
	workspace, 
	window, 
	ExtensionContext,
	} from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	let serverOptions: ServerOptions = {
		command: '../lua-language-server-go/main',
		args: [],
		options: {
			env: {
				...process.env
			}
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{language:"lua",scheme:"file"}],
		synchronize: {
			configurationSection: 'luaLanguageServer',
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher(window.activeTextEditor.document.fileName)
		},
			// Hijacks all LSP logs and redirect them to a specific port through WebSocket connection
			//outputChannel: websocketOutputChannel
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'luaLanguageServer',
		'lua-Language-Server-go',
		serverOptions,
		clientOptions
	);
	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
