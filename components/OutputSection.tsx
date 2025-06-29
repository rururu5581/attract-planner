import React from 'react';
import { ParsedScript } from '../types';
import CopyButton from './CopyButton';

interface OutputSectionProps {
  isLoading: boolean;
  error: string | null;
  script: ParsedScript;
  rawScript: string;
}

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-morich-red"></div>
    </div>
);

// Helper to render text with markdown-style bolding, "例：" styling, and paragraph spacing.
const renderHighlightedText = (text: string) => {
    if (!text) return null;

    // Split into paragraphs by newline.
    const paragraphs = text.trim().split('\n').filter(p => p.trim() !== '');

    return paragraphs.map((paragraph, pIndex) => {
        // First, split the paragraph by the bold markdown (`**...**`) to isolate bolded text.
        const parts = paragraph.split(/(\*\*.*?\*\*)/g).filter(Boolean);

        const content = parts.map((part, partIndex) => {
            // If the part is bolded text, render it with styling.
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={partIndex} className="font-bold text-morich-red">
                        {part.substring(2, part.length - 2)}
                    </strong>
                );
            }

            // For regular text parts, we now handle the "例：" marker.
            // Split the non-bold part by the "例：" marker to isolate it.
            const exampleParts = part.split(/(例\s?[:：])/g).filter(Boolean);
            return exampleParts.map((examplePart, exIndex) => {
                if (/(例\s?[:：])/.test(examplePart)) {
                    // If the part is the marker itself, style it.
                    return (
                        <span key={`${partIndex}-${exIndex}`} className="text-gray-500">
                            例：
                        </span>
                    );
                }
                // Otherwise, it's just regular text.
                return <span key={`${partIndex}-${exIndex}`}>{examplePart}</span>;
            });
        });

        // Reassemble the parts into a paragraph with spacing.
        return <p key={pIndex} className="mb-3 last:mb-0">{content.flat()}</p>;
    });
};


const OutputSection: React.FC<OutputSectionProps> = ({ isLoading, error, script, rawScript }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="text-center py-10">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600 font-medium">最高のアトラクトトークを生成中です...</p>
          </div>
      );
    }
    if (error) {
      return <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
    }
    if (script.length === 0) {
      return (
        <div className="text-center py-20 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg">上に情報を入力して、スクリプトを生成してください。</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {script.map((section, index) => {
           if (section.title === '【響くキーワード】') {
               const keywords = section.content.split(',').map(k => k.trim()).filter(Boolean);
               return (
                   <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                       <h3 className="text-lg font-bold text-morich-red mb-4">{section.title}</h3>
                       <div className="flex flex-wrap gap-3">
                           {keywords.map((keyword, i) => (
                               <span key={i} className="bg-red-50 text-morich-red text-sm font-medium px-3 py-1.5 rounded-full flex items-center border border-red-200 shadow-sm">
                                   <span className="font-semibold text-red-400 mr-1.5">#</span>
                                   {keyword}
                               </span>
                           ))}
                       </div>
                   </div>
               );
           }
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
                 <div className="absolute top-4 right-4">
                    <CopyButton textToCopy={section.content} className="bg-gray-100 text-gray-600 hover:bg-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-morich-red mb-3">{section.title}</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {renderHighlightedText(section.content)}
                </div>
              </div>
            );
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">生成されたアトラクト・スクリプト</h2>
        {script.length > 0 && !isLoading && (
            <CopyButton textToCopy={rawScript} className="bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold" />
        )}
      </div>
      <div className="bg-gray-50 p-4 sm:p-6 rounded-md min-h-[200px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputSection;