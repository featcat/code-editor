/*[object Object]*/
// eslint-disable-next-line header/header
import React, {useState} from 'react';
import {Button, Drawer, Form, InputNumber, Select, Spin, Switch} from 'antd';
import {PlayCircleOutlined, SettingOutlined} from '@ant-design/icons';
import styles from './RunnerControls.module.css';
import JsonEditor from './JsonEditor';

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

const RunnerControls: React.FC<RunnerControlsProps> = (props: RunnerControlsProps) => {
    const {language, code, runnerUrl, availableLanguages, onLanguageChange, theme = 'vs-dark'} = props;
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState<string[]>([]);

    const isDark = theme === 'vs-dark';
    const textColor = isDark ? '#ffffff' : '#616161';

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
        setOutput(['Running...']);

        if (!runnerUrl) {
            setOutput((prev: string[]) => [...prev, 'Error: No runner URL configured for this language.']);
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

                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, {stream: true});
                    const lines = chunk.split('\n').filter(line => line.trim() !== '');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                setOutput((prev: string[]) => [...prev, `[${data.type}] ${data.data}`]);
                            } catch (e) {
                                console.error('Failed to parse SSE data', e);
                            }
                        }
                    }
                }
            } else {
                const result = await response.json();
                if (result.error) {
                    setOutput((prev: string[]) => [...prev, `Error: ${result.error.msg}`]);
                } else {
                    if (result.run_info?.logs && Array.isArray(result.run_info.logs)) {
                        setOutput((prev: string[]) => [...prev, ...result.run_info.logs]);
                    }
                    if (result.return) {
                        setOutput((prev: string[]) => [...prev, `Result: ${JSON.stringify(result.return, null, 2)}`]);
                    }
                    if (result.run_info?.since) {
                        setOutput((prev: string[]) => [...prev, `Execution time: ${result.run_info.since}ms`]);
                    }
                }
            }
        } catch (error: any) {
            setOutput((prev: string[]) => [...prev, `Execution Error: ${error.message}`]);
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
                title="Execution Output"
                placement="bottom"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                height={300}
                getContainer={false}
                className={isDark ? styles.darkDrawer : styles.lightDrawer}
            >
                <div className={styles.output}>
                    {output.map((line: string, i: number) => (
                        <div key={i} className={styles.line}>{line}</div>
                    ))}
                    {loading && <Spin size="small"/>}
                </div>
            </Drawer>
        </>
    );
};

export default RunnerControls;
