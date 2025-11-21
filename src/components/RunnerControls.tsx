import React, {useState, useRef, useEffect} from 'react';
import {Button, Drawer, Form, InputNumber, Select, Spin, Switch} from 'antd';
import {PlayCircleOutlined, SettingOutlined, CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons';
import styles from './RunnerControls.module.css';
import JsonEditor from './JsonEditor';
import CollapsibleJson from './CollapsibleJson';

interface RunnerControlsProps {
    language: string;
    code: string;
    runnerUrl?: string;
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
    const {language, code, runnerUrl, availableLanguages, onLanguageChange, theme = 'vs-dark'} = props;
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
        return saved ? JSON.parse(saved) : {params: '{}', timeout: 30, stream: false};
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
            setOutput([{type: 'error', content: 'Error: No runner URL configured for this language.'}]);
            setHasError(true);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(runnerUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
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
                    const {done, value} = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, {stream: true});
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
                                setOutput((prev: OutputItem[]) => [...prev, {type: itemType, content: data.data}]);
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
                    newOutput.push({type: 'error', content: result.error});
                    errorDetected = true;
                }
                // Check for code execution error (inside result)
                else if (result.error?.msg) {
                    newOutput.push({type: 'error', content: result.error.msg});
                    errorDetected = true;
                }

                // Process successful result
                if (result.run_info?.logs && Array.isArray(result.run_info.logs)) {
                    result.run_info.logs.forEach((log: string) => {
                        newOutput.push({type: 'log', content: log});
                    });
                }
                if (result.return) {
                    newOutput.push({type: 'result', content: result.return});
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
            setOutput((prev: OutputItem[]) => [...prev, {type: 'error', content: `Execution Error: ${error.message}`}]);
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
                        <Select
                            value={language}
                            onChange={onLanguageChange}
                            style={{width: 100}}
                            options={availableLanguages.map(lang => ({value: lang, label: lang}))}
                            bordered={true}
                            size="small"
                            suffixIcon={<span style={{color: textColor}}>▼</span>}
                            className="language-select"
                            popupClassName={isDark ? styles.darkDropdown : ''}
                            dropdownStyle={{
                                backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                                color: textColor,
                                border: isDark ? '1px solid #454545' : '1px solid #d9d9d9'
                            }}
                        />
                    )}
                </div>
                <div className={styles.rightControls}>
                    <Button
                        icon={<SettingOutlined/>}
                        onClick={() => setSettingsVisible(true)}
                        type="text"
                        style={{ color: textColor, marginRight: 8 }}
                        size="small"
                    >
                        Settings
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined/>}
                        onClick={handleRun}
                        loading={loading}
                        disabled={!runnerUrl}
                        style={{ backgroundColor: '#4CAF50', borderColor: '#4CAF50', color: '#ffffff' }} // Green run button
                        size="small"
                    >
                        Run
                    </Button>
                </div>
            </div>

            <Drawer
                title="Settings"
                placement="right"
                onClose={() => setSettingsVisible(false)}
                open={settingsVisible}
                width={400}
                getContainer={false}
                className={isDark ? styles.darkDrawer : styles.lightDrawer}
            >
                <Form
                    initialValues={settings}
                    onFinish={handleSaveSettings}
                    layout="vertical"
                >
                    <Form.Item
                        label="Params (JSON)"
                        name="params"
                        rules={[
                            {
                                validator: (_, value) => {
                                    try {
                                        if (value) JSON.parse(value);
                                        return Promise.resolve();
                                    } catch (e) {
                                        return Promise.reject(new Error('Invalid JSON format'));
                                    }
                                }
                            }
                        ]}
                    >
                        <JsonEditor theme={theme} height={150} />
                    </Form.Item>
                    <Form.Item label="Timeout (seconds)" name="timeout">
                        <InputNumber min={1} max={300}/>
                    </Form.Item>
                    <Form.Item label="Stream Output" name="stream" valuePropName="checked">
                        <Switch/>
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Save</Button>
                </Form>
            </Drawer>

            <Drawer
                title={
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
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
                                {hasError ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                                {executionTime} ms
                            </span>
                        )}
                    </div>
                }
                placement="bottom"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                height={300}
                getContainer={false}
                className={isDark ? styles.darkDrawer : styles.lightDrawer}
            >
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
                    {loading && <Spin size="small" tip="Running..." />}
                </div>
            </Drawer>
        </>
    );
};

export default RunnerControls;
