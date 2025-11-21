import {useEffect, useRef, useState} from 'react';
import * as vscode from 'vscode';
import { URI } from 'vscode/vscode/vs/base/common/uri';
import {whenReady} from '@codingame/monaco-vscode-theme-defaults-default-extension';
import {initServices, MonacoLanguageClient, useOpenEditorStub} from 'monaco-languageclient';
import {CloseAction, ErrorAction, MessageTransports} from 'vscode-languageclient';
import {toSocket, WebSocketMessageReader, WebSocketMessageWriter} from 'vscode-ws-jsonrpc';
import {LogLevel} from 'vscode/services';
import '@codingame/monaco-vscode-python-default-extension';
import '@codingame/monaco-vscode-typescript-basics-default-extension';
import '@codingame/monaco-vscode-json-default-extension';
import '@codingame/monaco-vscode-go-default-extension';
import '@codingame/monaco-vscode-rust-default-extension';
import {registerExtension} from 'vscode/extensions';
import getConfigurationServiceOverride, {
    updateUserConfiguration
} from '@codingame/monaco-vscode-configuration-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getThemeServiceOverride from '@codingame/monaco-vscode-theme-service-override';
import getTextmateServiceOverride from '@codingame/monaco-vscode-textmate-service-override';
import getEditorServiceOverride from '@codingame/monaco-vscode-editor-service-override';

interface UseLspProps {
    language: string;
    lspUrl?: string;
    fileContent?: string;
    onClientReady?: (client: MonacoLanguageClient) => void;
}

// Global flags to ensure services are initialized only once
let servicesInitialized = false;
let servicesInitPromise: Promise<void> | null = null;

// Track registered languages
const registeredLanguages = new Set<string>();

// Track stopping clients to prevent race conditions during restart
const stoppingClients = new Map<string, Promise<void>>();

// Global client and socket tracking to ensure only one client per language
const globalClients = new Map<string, MonacoLanguageClient>();
const globalSockets = new Map<string, WebSocket>();

// Global helper to mapping language to extension
export const languageExtensionMap: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    json: 'json',
    go: 'go',
    rust: 'rs',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    html: 'html',
    css: 'css'
};
export const getLanguageExtension = (language: string) => languageExtensionMap[language] || language;

const createLanguageClient = (transports: MessageTransports, language: string): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name: `${language} Language Client`,
        clientOptions: {
            // use a language id as a document selector
            documentSelector: [language],
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: URI.file('/workspace')
            },
            // disable the default error handler
            errorHandler: {
                error: () => ({action: ErrorAction.Continue}),
                closed: () => ({action: CloseAction.DoNotRestart})
            },
            synchronize: {
                fileEvents: [vscode.workspace.createFileSystemWatcher('**')]
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
};

const initializeServices = async () => {
    if (!servicesInitialized) {
        if (!servicesInitPromise) {
            servicesInitPromise = (async () => {
                try {
                    // Initialize vscode-api services
                    await initServices({
                        userServices: {
                            ...getThemeServiceOverride(),
                            ...getTextmateServiceOverride(),
                            ...getConfigurationServiceOverride(),
                            ...getKeybindingsServiceOverride(),
                            ...getEditorServiceOverride(useOpenEditorStub)
                        },
                        debugLogging: true,
                        workspaceConfig: {
                            workspaceProvider: {
                                trusted: true,
                                workspace: {
                                    workspaceUri: URI.file('/workspace')
                                },
                                async open() {
                                    return false;
                                }
                            },
                            developmentOptions: {
                                logLevel: LogLevel.Debug
                            }
                        }
                    });

                    // Wait for theme to be ready
                    await whenReady();

                    updateUserConfiguration(`{
                        "editor.fontSize": 14,
                        "workbench.colorTheme": "Default Dark Modern",
                        "editor.acceptSuggestionOnEnter": "on"
                    }`);

                    servicesInitialized = true;
                    console.log('Monaco services initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize Monaco services:', error);
                    servicesInitPromise = null;
                    throw error;
                }
            })();
        }
        await servicesInitPromise;
    }
};

const registerLanguage = (language: string) => {
    if (registeredLanguages.has(language)) return;

    const languageConfigMap: Record<string, any> = {
        python: {
            extensions: ['.py', '.pyi'],
            aliases: ['Python'],
            commands: [
                {
                    command: 'pyright.restartserver',
                    title: 'Pyright: Restart Server',
                    category: 'Pyright'
                },
                {
                    command: 'pyright.organizeimports',
                    title: 'Pyright: Organize Imports',
                    category: 'Pyright'
                }
            ]
        },
        javascript: {
            extensions: ['.js', '.mjs', '.cjs'],
            aliases: ['JavaScript']
        },
        typescript: {
            extensions: ['.ts', '.tsx'],
            aliases: ['TypeScript']
        },
        json: {
            extensions: ['.json', '.jsonc'],
            aliases: ['JSON']
        },
        go: {
            extensions: ['.go'],
            aliases: ['Go']
        },
        rust: {
            extensions: ['.rs'],
            aliases: ['Rust']
        }
    };

    const config = languageConfigMap[language] || {
        extensions: [`.${language}`],
        aliases: [language]
    };

    const extension = {
        name: `${language}-client`,
        publisher: 'monaco-languageclient-project',
        version: '1.0.0',
        engines: {
            vscode: '^1.78.0'
        },
        contributes: {
            languages: [{
                id: language,
                aliases: config.aliases,
                extensions: config.extensions
            }],
            commands: config.commands,
            keybindings: config.commands ? [{
                key: 'ctrl+k',
                command: `${language}.restartserver`,
                when: 'editorTextFocus'
            }] : undefined
        }
    };

    registerExtension(extension, 1 /* ExtensionHostKind.LocalProcess */);
    registeredLanguages.add(language);
    console.log(`Registered extension for ${language}`);
};

export const useLsp = ({language, lspUrl, fileContent, onClientReady}: UseLspProps) => {
    const clientRef = useRef<MonacoLanguageClient | null>(null);
    const socketRef = useRef<WebSocket | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!lspUrl) return;

        let isMounted = true;
        let currentClient: MonacoLanguageClient | null = null;
        let currentSocket: WebSocket | null = null;

        const initializeLsp = async () => {
            try {
                // Clean up any existing client for this language first (handles React StrictMode double-mount)
                if (globalClients.has(language) || globalSockets.has(language)) {
                    console.log(`Cleaning up existing ${language} client before creating new one...`);

                    const existingClient = globalClients.get(language);
                    const existingSocket = globalSockets.get(language);

                    if (existingClient) {
                        const stopPromise = existingClient.stop().catch(e => {
                            if (!e?.message?.includes('Pending response rejected')) {
                                console.warn(`Error stopping existing ${language} client:`, e);
                            }
                        });
                        stoppingClients.set(language, stopPromise);
                        await stopPromise;
                        stoppingClients.delete(language);
                        globalClients.delete(language);
                    }

                    if (existingSocket) {
                        existingSocket.onclose = null;
                        existingSocket.onerror = null;
                        existingSocket.onopen = null;
                        existingSocket.close();
                        globalSockets.delete(language);
                    }
                }

                // Ensure services are initialized first
                await initializeServices();

                // Ensure language extension is registered
                const currentLanguage = language === 'go' ? 'go' : language; // Safety check
                registerLanguage(currentLanguage);

                setInitialized(true);

                if (isMounted) {
                    setInitialized(true);
                }

                if (!isMounted) return;

                // Create WebSocket connection
                console.log(`Connecting to LSP: ${lspUrl}`);
                const socket = new WebSocket(lspUrl);
                currentSocket = socket;
                socketRef.current = socket;
                globalSockets.set(language, socket);

                socket.onopen = async () => {
                    if (!isMounted) {
                        socket.close();
                        return;
                    }

                    console.log(`WebSocket connected for ${language} LSP`);

                    // Wait for any pending stop operations for this language to avoid command registration conflicts
                    if (stoppingClients.has(language)) {
                        console.log(`Waiting for previous ${language} client to stop...`);
                        await stoppingClients.get(language);
                    }

                    if (!isMounted) {
                        socket.close();
                        return;
                    }

                    const socketConnection = toSocket(socket);
                    const reader = new WebSocketMessageReader(socketConnection);
                    const writer = new WebSocketMessageWriter(socketConnection);

                    const languageClient = createLanguageClient({
                        reader,
                        writer
                    }, language);

                    currentClient = languageClient;
                    clientRef.current = languageClient;
                    globalClients.set(language, languageClient);

                    try {
                        await languageClient.start();
                        console.log(`${language} Language Client started`);

                        // Notify parent component that client is ready
                        if (isMounted) {
                            onClientReady?.(languageClient);
                        }
                    } catch (e) {
                        console.error(`${language} Client start failed:`, e);
                    }

                    reader.onClose(() => {
                        console.log(`${language} Client reader closed`);
                        languageClient.stop();
                    });
                };

                socket.onerror = (error) => {
                    console.error(`WebSocket error for ${language} LSP:`, error);
                };

                socket.onclose = () => {
                    if (isMounted) {
                        console.log(`WebSocket closed for ${language} LSP`);
                    }
                };
            } catch (error) {
                console.error('Service initialization failed, aborting LSP setup:', error);
            }
        };

        initializeLsp();

        return () => {
            isMounted = false;
            console.log(`Cleaning up ${language} LSP...`);

            // Only clean up if this is still the current client/socket
            if (currentClient && globalClients.get(language) === currentClient) {
                // Stop client and ignore potential errors during shutdown
                const stopPromise = currentClient.stop().catch(e => {
                    // Ignore "Pending response rejected" errors which are expected during quick switching
                    if (e?.message?.includes('Pending response rejected')) return;
                    console.warn('Error stopping client:', e);
                });

                // Track the stopping promise
                stoppingClients.set(language, stopPromise);
                stopPromise.finally(() => {
                    stoppingClients.delete(language);
                });

                clientRef.current = null;
                globalClients.delete(language);
            }
            if (currentSocket && globalSockets.get(language) === currentSocket) {
                // Remove listeners to prevent noise
                currentSocket.onclose = null;
                currentSocket.onerror = null;
                currentSocket.onopen = null;
                currentSocket.close();
                socketRef.current = null;
                globalSockets.delete(language);
            }
        };
    }, [language, lspUrl, fileContent, onClientReady]);

    return {client: clientRef.current, initialized};

};
