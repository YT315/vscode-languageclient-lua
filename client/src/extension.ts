import * as WebSocket from 'ws';
import { 
	workspace, 
	window, 
	commands,
	ExtensionContext,
	 OutputChannel
	} from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const socketPort = workspace.getConfiguration('luaLanguageServer').get('port', 7000);
	let socket: WebSocket | null = null;
	
	commands.registerCommand('luaLanguageServer.startStreaming', () => {
		// Establish websocket connection
		socket = new WebSocket(`ws://localhost:${socketPort}`);
	});

	// The log to send
	let log = '';
	const websocketOutputChannel: OutputChannel = {
		name: 'websocket',
		// Only append the logs but send them later
		append(value: string) {
			log += value;
			console.log(value);
		},
		appendLine(value: string) {
			log += value;
			// Don't send logs until WebSocket initialization
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(log);
			}
			log = '';
		},
		clear() {},
		show() {},
		hide() {},
		dispose() {}
	};


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
		documentSelector: [{language:"lua",scheme:"file",pattern:"*.lua"}],
		synchronize: {
			configurationSection: 'luaLanguageServer',
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher(window.activeTextEditor.document.fileName)
		},
			// Hijacks all LSP logs and redirect them to a specific port through WebSocket connection
			//outputChannel: websocketOutputChannel
	};

	// Create the language client and start the client.
	let disp = new LanguageClient(
		'luaLanguageServer',
		'lua-Language-Server-go',
		serverOptions,
		clientOptions
	).start();

	// Start the client. This will also launch the server
	context.subscriptions.push(disp);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
