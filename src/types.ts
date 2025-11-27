import React from 'react';

export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'go' | 'rust' | 'json' | string;



export interface LanguageConfig {
    /** Initial code value */
    initValue?: string;
    /** LSP WebSocket URL */
    lspUrl?: string;
    /** Runner service URL */
    runnerUrl?: string;

}

export interface CodeEditorProps {
    /** Language ID (e.g., 'go', 'python', 'typescript') */
    language: string;

    /** Current code value */
    value: string;

    /** Callback when content changes */
    onChange?: (value: string | undefined) => void;

    /** Available languages for the switcher */
    availableLanguages?: string[];

    /** Callback when language changes */
    onLanguageChange?: (language: string) => void;

    /**
     * Base theme for Monaco Editor.
     * 'vs-dark' for Dark Mode, 'vs' for Light Mode.
     * Default is 'vs-dark'.
     */
    theme?: 'vs-dark' | 'vs';

    /** LSP Configuration */
    lsp?: {
        serverUrl: string;
        authorization?: string;
    };

    /** Runner Configuration */
    runner?: {
        endpoint: string;
        authorization?: string;
    };

    /** Class name for the container */
    className?: string;
    /** Style for the container */
    style?: React.CSSProperties;
}

