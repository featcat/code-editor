import React, {useState} from 'react';
import {CodeEditor} from './index';
import {Space, Switch, Typography} from 'antd';

const {Title} = Typography;

const App: React.FC = () => {
    const [theme, setTheme] = useState<'vs' | 'vs-dark'>('vs-dark');

    const config = {
        go: {
            initValue: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, World!")\n}\n',
            lspUrl: 'ws://localhost:30005/golang?authorization=UserAuth',
            runnerUrl: 'http://localhost:9080/execute',
        },
        python: {
            initValue: 'print("Hello, World!")\n',
            lspUrl: 'ws://localhost:30001/python?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        typescript: {
            initValue: 'console.log("Hello, World!");\n',
            lspUrl: 'ws://localhost:30002/typescript?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        json: {
            initValue: '{\n  "message": "Hello, World!"\n}\n',
            lspUrl: 'ws://localhost:30000/json?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        rust: {
            initValue: 'fn main() {\n    println!("Hello, World!");\n}\n',
            lspUrl: 'ws://localhost:30006/rust?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        }
    };

    const handleThemeChange = (checked: boolean) => {
        setTheme(checked ? 'vs-dark' : 'vs');
    };

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px'}}>
            <div style={{marginBottom: '20px'}}>
                <Space size="large" align="center">
                    <Title level={3} style={{margin: 0}}>Code Editor Demo</Title>
                    <Switch
                        checkedChildren="Dark"
                        unCheckedChildren="Light"
                        defaultChecked
                        onChange={handleThemeChange}
                        style={{
                            backgroundColor: theme === 'vs-dark' ? '#1f1f1f' : undefined
                        }}
                    />
                </Space>
            </div>

            <div style={{flex: 1, border: '1px solid #ccc'}}>
                <CodeEditor
                    config={config}
                    theme={theme}
                    defaultLanguage="go"
                    onChange={(val, lang) => console.log(`Code changed (${lang}):`, val)}
                    onLanguageChange={(lang) => console.log('Language changed:', lang)}
                />
            </div>
        </div>
    );
};

export default App;
