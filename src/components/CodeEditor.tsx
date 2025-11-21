import React, {useEffect, useRef, useState, useMemo} from 'react';
import * as monaco from 'monaco-editor';
import * as vscode from 'vscode';
import { createConfiguredEditor, createModelReference, IReference, ITextFileEditorModel } from 'vscode/monaco';
import { RegisteredFileSystemProvider, registerFileSystemOverlay, RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';
import {CodeEditorProps, LanguageConfig} from '../types';
import clsx from 'clsx';
import styles from './CodeEditor.module.css';
import {useLsp, getLanguageExtension} from '../hooks/useLsp';
import RunnerControls from './RunnerControls';

let fileSystemProvider: RegisteredFileSystemProvider | undefined;

const CodeEditor: React.FC<CodeEditorProps> = (props: CodeEditorProps) => {
    const {
        config,
        theme = 'vs-dark',
        defaultLanguage,
        onChange,
        onLanguageChange,
        className,
        style
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const modelRefRef = useRef<any>(null);

    // Determine if config is multi-language
    const isMultiLanguage = useMemo(() => {
        const keys = Object.keys(config);
        if (keys.length === 0) return false;
        // Check if it's a map of configs
        return !('initValue' in config || 'lspUrl' in config || 'runnerUrl' in config);
    }, [config]);

    const availableLanguages = useMemo(() => {
        return isMultiLanguage ? Object.keys(config) : [];
    }, [config, isMultiLanguage]);

    const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
        if (defaultLanguage && availableLanguages.includes(defaultLanguage)) {
            return defaultLanguage;
        }
        if (isMultiLanguage) {
            return Object.keys(config)[0] || 'plaintext';
        }
        return 'plaintext';
    });

    // Notify parent when language changes
    const handleLanguageChange = (lang: string) => {
        setCurrentLanguage(lang);
        onLanguageChange?.(lang);
    };

    // Get current config object
    const currentConfig: LanguageConfig = useMemo(() => {
        if (isMultiLanguage) {
            return (config as Record<string, LanguageConfig>)[currentLanguage] || {};
        }
        return config as LanguageConfig;
    }, [config, isMultiLanguage, currentLanguage]);

    // Local state to track editor content
    const [value, setValue] = useState<string>('');

    // Stable initial code
    const initialCode = useMemo(() => currentConfig.initValue || '', [currentConfig.initValue]);

    // Initialize LSP
    const { initialized } = useLsp({
        language: currentLanguage,
        lspUrl: currentConfig.lspUrl,
        fileContent: initialCode
    });



    // Initialize editor
    useEffect(() => {
        if (!containerRef.current || !initialized) return;

        const disposables: vscode.Disposable[] = [];
        let isCancelled = false;

        const initEditor = async () => {
            try {
                const ext = getLanguageExtension(currentLanguage);
                const fileUri = vscode.Uri.file(`/workspace/main.${ext}`);

                setValue(initialCode);

                if (!fileSystemProvider) {
                    fileSystemProvider = new RegisteredFileSystemProvider(false);
                    registerFileSystemOverlay(1, fileSystemProvider);
                }

                const file = new RegisteredMemoryFile(fileUri, initialCode);
                fileSystemProvider.registerFile(file);

                const modelRef = await createModelReference(fileUri, initialCode) as unknown as IReference<ITextFileEditorModel>;

                if (isCancelled) {
                    modelRef.dispose();
                    return;
                }
                disposables.push(modelRef);
                modelRefRef.current = modelRef;

                modelRef.object.setLanguageId(currentLanguage);

                if (!containerRef.current) return;

                // Apply base theme
                monaco.editor.setTheme(theme);

                const editor = createConfiguredEditor(containerRef.current!, {
                    model: modelRef.object.textEditorModel,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fixedOverflowWidgets: true,
                    wordBasedSuggestions: 'off',
                    theme: theme
                });

                if (isCancelled) {
                    editor.dispose();
                    return;
                }
                disposables.push(editor);
                editorRef.current = editor;

                const contentChangeDisposable = modelRef.object.textEditorModel?.onDidChangeContent(() => {
                    const newValue = modelRef.object.textEditorModel?.getValue() || '';
                    setValue(newValue);
                    onChange?.(newValue, currentLanguage);
                });
                if (contentChangeDisposable) {
                    disposables.push(contentChangeDisposable);
                }

            } catch (error) {
                console.error('Failed to initialize editor:', error);
            }
        };

        initEditor();

        return () => {
            isCancelled = true;
            disposables.reverse().forEach(d => d.dispose());
            editorRef.current = null;
            modelRefRef.current = null;
        };
    }, [currentLanguage, initialized, initialCode, theme]);

    // Handle initValue changes
    useEffect(() => {
        if (!modelRefRef.current?.object?.textEditorModel) return;
        const currentModelValue = modelRefRef.current.object.textEditorModel.getValue();
        if (currentModelValue !== initialCode) {
            modelRefRef.current.object.textEditorModel.setValue(initialCode);
            setValue(initialCode);
        }
    }, [initialCode]);

    return (
        <div className={clsx(styles.container, className)} style={style}>
            <RunnerControls
                language={currentLanguage}
                code={value}
                runnerUrl={currentConfig.runnerUrl}
                availableLanguages={isMultiLanguage ? availableLanguages : undefined}
                onLanguageChange={handleLanguageChange}
                theme={theme}
            />
            <div
                ref={containerRef}
                style={{ width: '100%', flex: 1, minHeight: 0 }}
            />
        </div>
    );
};

export default CodeEditor;
