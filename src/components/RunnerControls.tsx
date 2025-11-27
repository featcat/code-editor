import React, { useState, useRef, useEffect } from 'react';
import styles from './RunnerControls.module.css';
import JsonEditor from './JsonEditor';
import CollapsibleJson from './CollapsibleJson';

interface RunnerControlsProps {
    language: string;
    code: string;
    runnerUrl?: string;
    runnerAuth?: string;
    availableLanguages?: string[];
    onLanguageChange?: (lang: string) => void;
    theme?: 'vs' | 'vs-dark';
}

interface RunSettings {
    params: string;
    timeout: number;
    stream: boolean;
}

interface OutputItem {
    type: 'log' | 'message' | 'result' | 'error' | 'info';
    content: any;
}

// Helper function to check if string is valid JSON
const isJSON = (str: string): boolean => {
    if (typeof str !== 'string') return false;
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === 'object' && parsed !== null;
    } catch {
        return false;
    }
};

const RunnerControls: React.FC<RunnerControlsProps> = (props: RunnerControlsProps) => {
    const { language, code, runnerUrl, runnerAuth, availableLanguages, onLanguageChange, theme = 'vs-dark' } = props;
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<OutputItem[]>([]);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [hasError, setHasError] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    const isDark = theme === 'vs-dark';
    const textColor = isDark ? '#ffffff' : '#616161';

    // Auto-scroll to bottom when output changes
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const [settings, setSettings] = useState<RunSettings>(() => {
        const saved = localStorage.getItem('code-editor-settings');
        return saved ? JSON.parse(saved) : { params: '{}', timeout: 30, stream: false };
    });

    const handleSaveSettings = (values: RunSettings) => {
        setSettings(values);
        localStorage.setItem('code-editor-settings', JSON.stringify(values));
        setSettingsVisible(false);
    };

    const handleRun = async () => {
        setLoading(true);
        setDrawerVisible(true);
        setOutput([]);
        setExecutionTime(null);
        setHasError(false);
        const startTime = Date.now();

        if (!runnerUrl) {
            setOutput([{ type: 'error', content: 'Error: No runner URL configured for this language.' }]);
            setHasError(true);
            setLoading(false);
            return;
        }

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (runnerAuth) {
                headers['Authorization'] = runnerAuth;
            }

            const response = await fetch(runnerUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    language,
                    code,
                    params: JSON.parse(settings.params || '{}'),
                    timeout: settings.timeout,
                    stream: settings.stream
                })
            });

            if (settings.stream) {
                const reader = response.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) throw new Error('Response body is null');

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                // Filter out START and END events
                                if (data.type === 'start' || data.type === 'end') {
                                    continue;
                                }
                                // Map event types: log, message, error
                                let itemType: OutputItem['type'] = 'info';
                                if (data.type === 'log') {
                                    itemType = 'log';
                                } else if (data.type === 'message') {
                                    itemType = 'message';
                                } else if (data.type === 'error') {
                                    itemType = 'error';
                                }
                                setOutput((prev: OutputItem[]) => [...prev, { type: itemType, content: data.data }]);
                            } catch (e) {
                                console.error('Failed to parse SSE data', e);
                            }
                        }
                    }
                }
                setExecutionTime(Date.now() - startTime);
            } else {
                const result = await response.json();
                const newOutput: OutputItem[] = [];
                let errorDetected = false;

                // Check for service-level error (parameter error, etc.)
                if (typeof result.error === 'string') {
                    newOutput.push({ type: 'error', content: result.error });
                    errorDetected = true;
                }
                // Check for code execution error (inside result)
                else if (result.error?.msg) {
                    newOutput.push({ type: 'error', content: result.error.msg });
                    errorDetected = true;
                }

                // Process successful result
                if (result.run_info?.logs && Array.isArray(result.run_info.logs)) {
                    result.run_info.logs.forEach((log: string) => {
                        newOutput.push({ type: 'log', content: log });
                    });
                }
                if (result.return) {
                    newOutput.push({ type: 'result', content: result.return });
                }

                // Set execution time (use server time if available, otherwise client-side calculated time)
                if (result.run_info?.since !== undefined) {
                    setExecutionTime(result.run_info.since);
                } else {
                    setExecutionTime(Date.now() - startTime);
                }

                setHasError(errorDetected);
                setOutput((prev: OutputItem[]) => [...prev, ...newOutput]);
            }
        } catch (error: any) {
            setOutput((prev: OutputItem[]) => [...prev, { type: 'error', content: `Execution Error: ${error.message}` }]);
            setHasError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`${styles.controls} ${isDark ? styles.dark : styles.light}`}>
                <div className={styles.leftControls}>
                    {availableLanguages && availableLanguages.length > 0 && (
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange?.(e.target.value)}
                            className={styles.select}
                        >
                            {availableLanguages.map((lang) => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    )}
                </div>
                <div className={styles.rightControls}>
                    <button
                        onClick={() => setSettingsVisible(true)}
                        className={styles.textButton}
                        style={{ color: textColor, marginRight: 8 }}
                    >
                        ⚙️ Settings
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={!runnerUrl || loading}
                        className={styles.primaryButton}
                    >
                        ▶ Run
                    </button>
                </div>
            </div>

            {settingsVisible && (
                <div className={`${styles.panel} ${isDark ? styles.darkPanel : styles.lightPanel}`}>
                    <div className={styles.panelHeader}>
                        <span>Settings</span>
                        <button className={styles.textButton} onClick={() => setSettingsVisible(false)}>✕</button>
                    </div>
                    <div className={styles.panelBody}>
                        <div className={styles.formItem}>
                            <label>Params (JSON)</label>
                            <JsonEditor theme={theme} height={150} value={settings.params} onChange={(v) => setSettings((s) => ({ ...s, params: v }))} />
                        </div>
                        <div className={styles.formItem}>
                            <label>Timeout (seconds)</label>
                            <input type="number" min={1} max={300} value={settings.timeout} onChange={(e) => setSettings((s) => ({ ...s, timeout: Number(e.target.value) }))} className={styles.input} />
                        </div>
                        <div className={styles.formItemRow}>
                            <label>Stream Output</label>
                            <input type="checkbox" checked={settings.stream} onChange={(e) => setSettings((s) => ({ ...s, stream: e.target.checked }))} />
                        </div>
                        <div>
                            <button className={styles.primaryButton} onClick={() => handleSaveSettings(settings)}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            {drawerVisible && (
                <div className={`${styles.drawer} ${isDark ? styles.darkDrawer : styles.lightDrawer}`}>
                    <div className={styles.drawerHeader}>
                        <span>Execution Output</span>
                        {executionTime !== null && !loading && (
                            <span style={{
                                fontSize: '12px',
                                fontWeight: 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                color: hasError ? '#ff4d4f' : '#52c41a'
                            }}>
                                {hasError ? '✕' : '✓'} {executionTime} ms
                            </span>
                        )}
                        <button className={styles.textButton} onClick={() => setDrawerVisible(false)}>Close</button>
                    </div>
                    <div className={styles.output} ref={outputRef}>
                        {output.map((item: OutputItem, i: number) => (
                            <div key={i} className={styles.outputItem}>
                                {item.type === 'result' ? (
                                    typeof item.content === 'object' ? (
                                        <CollapsibleJson data={item.content} theme={theme} label="Result" />
                                    ) : (
                                        <div className={`${styles.message} ${isDark ? styles.messageDark : styles.messageLight}`}>
                                            {item.content}
                                        </div>
                                    )
                                ) : item.type === 'message' ? (
                                    typeof item.content === 'string' && isJSON(item.content) ? (
                                        <CollapsibleJson data={JSON.parse(item.content)} theme={theme} label="Message" />
                                    ) : typeof item.content === 'object' ? (
                                        <CollapsibleJson data={item.content} theme={theme} label="Message" />
                                    ) : (
                                        <div className={`${styles.message} ${isDark ? styles.messageDark : styles.messageLight}`}>
                                            {item.content}
                                        </div>
                                    )
                                ) : item.type === 'error' ? (
                                    <div className={styles.error}>{item.content}</div>
                                ) : (
                                    <div className={styles.line}>{item.content}</div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className={styles.loading}>Running...</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default RunnerControls;
