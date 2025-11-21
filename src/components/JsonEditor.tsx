import React, {useEffect, useRef} from 'react';
import * as monaco from 'monaco-editor';

interface JsonEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    theme?: 'vs' | 'vs-dark';
    height?: number | string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
    value = '',
    onChange,
    theme = 'vs-dark',
    height = 200
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        if (!editorRef.current) {
            editorRef.current = monaco.editor.create(containerRef.current, {
                value,
                language: 'json',
                theme,
                minimap: {enabled: false},
                scrollBeyondLastLine: false,
                automaticLayout: true,
                lineNumbers: 'off',
                folding: false,
                glyphMargin: false,
                contextmenu: false,
                fixedOverflowWidgets: true
            });

            editorRef.current.onDidChangeModelContent(() => {
                const newValue = editorRef.current?.getValue() || '';
                onChange?.(newValue);
            });
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            monaco.editor.setTheme(theme);
        }
    }, [theme]);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.getValue()) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    return (
        <div
            ref={containerRef}
            style={{
                height,
                width: '100%',
                border: `1px solid ${theme === 'vs-dark' ? '#3e3e42' : '#d9d9d9'}`,
                borderRadius: '2px' // Match Ant Design input border radius
            }}
        />
    );
};

export default JsonEditor;
