import React, { useState, useCallback } from 'react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import { generateAttractScript } from './services/geminiService';
import { InputType, ParsedScript } from './types';

const Header = () => (
    <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
                <span className="w-10 h-10 bg-morich-red rounded-full flex items-center justify-center text-white font-bold text-xl">m</span>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                    morich Attract Scripter
                </h1>
            </div>
        </div>
    </header>
);

const App: React.FC = () => {
    const [jobSeekerInfo, setJobSeekerInfo] = useState('');
    const [jobOfferInfo, setJobOfferInfo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [parsedScript, setParsedScript] = useState<ParsedScript>([]);
    const [rawScript, setRawScript] = useState('');

    const parseResponse = (text: string): ParsedScript => {
        if (text.startsWith('エラーが発生しました:')) {
            setError(text);
            return [];
        }

        // Find the start of the actual script content to ignore any conversational filler.
        const scriptStartIndex = text.indexOf('### ');
        if (scriptStartIndex === -1) {
             console.error("Parsing Error: '### ' marker not found in response.");
             setError('生成されたスクリプトの形式が正しくありません。');
             // Fallback to show the raw response
             return [{ title: '解析不能なスクリプト', content: text }];
        }

        const scriptContent = text.substring(scriptStartIndex);
        const sections = scriptContent.split('### ').filter(s => s.trim() !== '');

        return sections.map(section => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            return { title, content };
        }).filter(s => s.title && s.content); // Ensure we don't have empty sections
    };

    const handleGenerate = useCallback(async () => {
        if (!jobSeekerInfo.trim() || !jobOfferInfo.trim()) {
            setError('求職者の情報と求人情報の両方を入力してください。');
            return;
        }

        setIsLoading(true);
        setError(null);
        setParsedScript([]);
        setRawScript('');

        try {
            const result = await generateAttractScript(jobSeekerInfo, jobOfferInfo);
            setRawScript(result);
            setParsedScript(parseResponse(result));
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            setParsedScript([]);
            setRawScript('');
        } finally {
            setIsLoading(false);
        }
    }, [jobSeekerInfo, jobOfferInfo]);

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8">
                    <InputSection
                        step={1}
                        title="求職者の情報を入力"
                        textLabel="求職者の職務経歴書・プロフィール"
                        textPlaceholder="ここに職務経歴書や面談でヒアリングした内容を貼り付けてください..."
                        pdfLabel="職務経歴書のPDFファイルをアップロード"
                        value={jobSeekerInfo}
                        onValueChange={setJobSeekerInfo}
                        allowedInputTypes={[InputType.Text, InputType.Pdf]}
                    />

                    <InputSection
                        step={2}
                        title="提案する求人情報を入力"
                        textLabel="提案したい求人情報"
                        textPlaceholder="ここに求人票の「職務内容」「応募資格」「企業の魅力」「年収」などを貼り付けてください..."
                        pdfLabel="求人票のPDFファイルをアップロード"
                        urlLabel="求人情報のWebページURL"
                        urlPlaceholder="https://..."
                        value={jobOfferInfo}
                        onValueChange={setJobOfferInfo}
                        allowedInputTypes={[InputType.Text, InputType.Pdf, InputType.Url]}
                    />
                </div>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !jobSeekerInfo || !jobOfferInfo}
                        className="bg-morich-red text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {isLoading ? '生成中...' : '最高のアトラクトトークを生成する'}
                    </button>
                </div>
                
                <OutputSection 
                    isLoading={isLoading}
                    error={error}
                    script={parsedScript}
                    rawScript={rawScript}
                />
            </main>
        </div>
    );
};

export default App;