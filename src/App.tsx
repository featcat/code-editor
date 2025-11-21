import React from 'react';
import {CodeEditor} from './index';
import {Typography} from 'antd';

const {Title} = Typography;

const App: React.FC = () => {
    const config = {
        python: {
            initValue: 'print("Hello, World!") keyword\n',
            lspUrl: 'ws://localhost:30001/python?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        json: {
            initValue: '{\n  "message": "Hello, World!"\n}\n',
            lspUrl: 'ws://localhost:30000/json?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        go: {
            initValue: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("keyword!") keyword\n}\n',
            lspUrl: 'ws://10.4.4.122:30005/golang?authorization=UserAuth',
            runnerUrl: 'http://localhost:9080/execute',
        },
        rust: {
            initValue: 'fn main() {\n    println!("Hello, World!");\n}\n',
            lspUrl: 'ws://localhost:30006/rust?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        },
        typescript: {
            initValue: 'console.log("Hello, World!");\n',
            lspUrl: 'ws://localhost:30002/typescript?authorization=UserAuth',
            runnerUrl: 'http://localhost:8080/run',
        }
    };

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px'}}>
            <div style={{marginBottom: '20px'}}>
                <Title level={3}>Monaco Editor Runner Demo</Title>
            </div>

            <div style={{flex: 1, border: '1px solid #ccc'}}>
                <CodeEditor
                    config={config}
                    theme="vs-dark"
                    defaultLanguage="go"
                    onChange={(val, lang) => console.log(`Code changed (${lang}):`, val)}
                    onLanguageChange={(lang) => console.log('Language changed:', lang)}
                />
            </div>
        </div>
    );
};

export default App;
