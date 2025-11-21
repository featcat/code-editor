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
    /**
     * Configuration object.
     * Can be a map of "language_id" -> LanguageConfig for multi-language support,
     * or a single LanguageConfig object for single-language mode.
     */
    config: Record<string, LanguageConfig> | LanguageConfig;

    /**
     * Base theme for Monaco Editor.
     * 'vs-dark' for Dark Mode, 'vs' for Light Mode.
     * Default is 'vs-dark'.
     */
    theme?: 'vs-dark' | 'vs';

    /** Default language to select initially */
    defaultLanguage?: string;

    /** Callback when content changes */
    onChange?: (value: string | undefined, language: string) => void;

    /** Callback when language changes */
    onLanguageChange?: (language: string) => void;

    /** Class name for the container */
    className?: string;
    /** Style for the container */
    style?: React.CSSProperties;
}
