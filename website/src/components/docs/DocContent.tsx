import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import mermaid from 'mermaid';

interface DocContentProps {
    content: string;
}

export const DocContent = ({ content }: DocContentProps) => {
    useEffect(() => {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        mermaid.initialize({
            startOnLoad: true,
            theme: isDarkMode ? 'dark' : 'default',
            securityLevel: 'loose',
            darkMode: isDarkMode,
            themeVariables: isDarkMode ? {
                primaryColor: '#1f2937',
                primaryTextColor: '#e5e7eb',
                primaryBorderColor: '#374151',
                lineColor: '#4b5563',
                secondaryColor: '#374151',
                tertiaryColor: '#1f2937',
                textColor: '#e5e7eb',
                mainBkg: '#111827',
                nodeBkg: '#1f2937',
                nodeBorder: '#374151',
                clusterBkg: '#1f2937',
                clusterBorder: '#374151',
                defaultLinkColor: '#60a5fa',
                edgeLabelBackground: '#374151',
            } : undefined,
        });

        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleThemeChange = (e: MediaQueryListEvent) => {
            mermaid.initialize({
                theme: e.matches ? 'dark' : 'default',
                darkMode: e.matches,
                themeVariables: e.matches ? {
                    primaryColor: '#1f2937',
                    primaryTextColor: '#e5e7eb',
                    primaryBorderColor: '#374151',
                    lineColor: '#4b5563',
                    secondaryColor: '#374151',
                    tertiaryColor: '#1f2937',
                    textColor: '#e5e7eb',
                    mainBkg: '#111827',
                    nodeBkg: '#1f2937',
                    nodeBorder: '#374151',
                    clusterBkg: '#1f2937',
                    clusterBorder: '#374151',
                    defaultLinkColor: '#60a5fa',
                    edgeLabelBackground: '#374151',
                } : undefined,
            });
            mermaid.run();
        };

        mediaQuery.addEventListener('change', handleThemeChange);

        // Update all mermaid diagrams
        setTimeout(() => {
            mermaid.run();
        }, 0);

        return () => {
            mediaQuery.removeEventListener('change', handleThemeChange);
        };
    }, [content]); // Re-run when content changes

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-3
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-gray-800 dark:prose-h2:text-gray-100
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-gray-700 dark:prose-h3:text-gray-200
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-7 prose-p:text-base
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800/60 prose-pre:rounded-lg prose-pre:p-4
                prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700/50
                prose-pre:shadow-sm hover:prose-pre:shadow-md transition-shadow duration-200
                prose-pre:overflow-x-auto
                prose-strong:text-gray-900 dark:prose-strong:text-gray-50 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-4 prose-ul:space-y-1.5
                prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:leading-7
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                prose-blockquote:pl-4 prose-blockquote:italic
                prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300
                prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg
                prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-8
                prose-table:border-collapse prose-table:w-full
                prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
                prose-th:bg-gray-50 dark:prose-th:bg-gray-800/60
                prose-th:px-3 prose-th:py-2 prose-th:text-sm
                prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                prose-td:px-3 prose-td:py-2 prose-td:text-sm
                prose-img:rounded-lg prose-img:shadow-md hover:prose-img:shadow-lg prose-img:mx-auto prose-img:transition-shadow duration-200
                prose-figure:my-6">
                <ReactMarkdown
                    components={{
                        code({ className, children }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (match && match[1] === 'mermaid') {
                                return (
                                    <div className="mermaid my-6">
                                        {String(children).replace(/\n$/, '')}
                                    </div>
                                );
                            }
                            return <code className={className}>{children}</code>;
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}; 