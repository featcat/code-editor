import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { URI } from 'vscode/vscode/vs/base/common/uri';
import { createConfiguredEditor, createModelReference, IReference, ITextFileEditorModel } from 'vscode/monaco';
import { RegisteredFileSystemProvider, registerFileSystemOverlay, RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';
import { CodeEditorProps } from '../types';
import clsx from 'clsx';
import styles from './CodeEditor.module.css';
import { useLsp, getLanguageExtension } from '../hooks/useLsp';
import RunnerControls from './RunnerControls';

type Disposable = { dispose(): void };

let fileSystemProvider: RegisteredFileSystemProvider | undefined;

const CodeEditor: React.FC<CodeEditorProps> = (props: CodeEditorProps) => {
    const {
        language,
        value,
        onChange,
        theme = 'vs-dark',
        lsp,
        runner,
        className,
        style,
        availableLanguages,
        onLanguageChange
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const modelRefRef = useRef<any>(null);

    // Initialize LSP
    const { initialized } = useLsp({
        language,
        lspUrl: lsp?.serverUrl,
        fileContent: value
    });

    // Initialize editor
    useEffect(() => {
        if (!containerRef.current || !initialized) return;

        const disposables: Disposable[] = [];
        let isCancelled = false;

        const initEditor = async () => {
            try {
                const ext = getLanguageExtension(language);
                const fileUri = URI.file(`/workspace/main.${ext}`);

                if (!fileSystemProvider) {
                    fileSystemProvider = new RegisteredFileSystemProvider(false);
                    registerFileSystemOverlay(1, fileSystemProvider);
                }

                const file = new RegisteredMemoryFile(fileUri, value);
                fileSystemProvider.registerFile(file);

                const modelRef = await createModelReference(fileUri, value) as unknown as IReference<ITextFileEditorModel>;

                if (isCancelled) {
                    modelRef.dispose();
                    return;
                }
                disposables.push(modelRef);
                modelRefRef.current = modelRef;

                modelRef.object.setLanguageId(language);

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
                    onChange?.(newValue);
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
    }, [language, initialized, theme]);

    // Handle value changes from props
    useEffect(() => {
        if (!modelRefRef.current?.object?.textEditorModel) return;
        const currentModelValue = modelRefRef.current.object.textEditorModel.getValue();
        if (currentModelValue !== value) {
            modelRefRef.current.object.textEditorModel.setValue(value);
        }
    }, [value]);

    return (
        <div className={clsx(styles.container, className)} style={style}>
            <RunnerControls
                language={language}
                code={value}
                runnerUrl={runner?.endpoint}
                runnerAuth={runner?.authorization}
                theme={theme}
                availableLanguages={availableLanguages}
                onLanguageChange={onLanguageChange}
            />
            <div
                ref={containerRef}
                style={{ width: '100%', flex: 1, minHeight: 0 }}
            />
        </div>
    );
};

export default CodeEditor;

