import React, { useState } from 'react';
import styles from './CollapsibleJson.module.css';

interface CollapsibleJsonProps {
    data: any;
    theme?: 'vs' | 'vs-dark';
    label?: string; // 'Result' or 'Message'
}

const CollapsibleJson: React.FC<CollapsibleJsonProps> = ({ data, theme = 'vs-dark', label = 'JSON' }) => {
    const [collapsed, setCollapsed] = useState(true);
    const [copied, setCopied] = useState(false);
    const isDark = theme === 'vs-dark';

    const jsonString = JSON.stringify(data, null, collapsed ? 0 : 2);
    const compressedJson = JSON.stringify(data);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(compressedJson);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
            <div className={styles.header}>
                <div className={styles.headerLeft} onClick={() => setCollapsed(!collapsed)}>
                    <span className={styles.icon}>{collapsed ? '▶' : '▼'}</span>
                    <span className={styles.label}>{label}</span>
                </div>
                <button
                    className={`${styles.copyButton} ${isDark ? styles.copyButtonDark : styles.copyButtonLight}`}
                    onClick={handleCopy}
                    title="Copy JSON"
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
            <pre className={styles.content}>
                {jsonString}
            </pre>
        </div>
    );
};

export default CollapsibleJson;
