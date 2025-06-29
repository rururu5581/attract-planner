import React, { useState, useCallback } from 'react';
import { InputType } from '../types';

interface InputSectionProps {
  step: number;
  title: string;
  textLabel: string;
  textPlaceholder: string;
  pdfLabel: string;
  urlLabel?: string;
  urlPlaceholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  allowedInputTypes: InputType[];
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 16v-4a4 4 0 00-4-4H8a4 4 0 00-4 4v4m16 0l-3-3m-13 3l3-3" />
    </svg>
);

const InputSection: React.FC<InputSectionProps> = ({
  step,
  title,
  textLabel,
  textPlaceholder,
  pdfLabel,
  urlLabel,
  urlPlaceholder,
  value,
  onValueChange,
  allowedInputTypes,
}) => {
  const [activeTab, setActiveTab] = useState<InputType>(allowedInputTypes[0]);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handlePdfUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        setPdfError('PDFファイルのみアップロードできます。');
        setFileName('');
        onValueChange('');
        return;
    }

    if (!window.pdfjsLib) {
        setPdfError('PDFリーダーの読み込みに失敗しました。ページを再読み込みしてください。');
        return;
    }
    
    setFileName(file.name);
    setIsParsingPdf(true);
    setPdfError(null);
    onValueChange('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      onValueChange(fullText);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      setPdfError('PDFの解析中にエラーが発生しました。');
      onValueChange('');
    } finally {
      setIsParsingPdf(false);
    }
  }, [onValueChange]);
  
  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-4">
      {allowedInputTypes.map(type => {
        const labels = {
          [InputType.Text]: 'テキストで入力',
          [InputType.Pdf]: 'PDFをアップロード',
          [InputType.Url]: 'URLから読み込み',
        };
        return (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
              activeTab === type
                ? 'border-b-2 border-morich-red text-morich-red'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {labels[type]}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <span className="text-morich-red">STEP {step}:</span> {title}
      </h2>
      {renderTabs()}
      
      {activeTab === InputType.Text && (
        <div>
          <label htmlFor={`text-input-${step}`} className="block text-sm font-medium text-gray-700 mb-1">{textLabel}</label>
          <textarea
            id={`text-input-${step}`}
            value={value}
            onChange={e => onValueChange(e.target.value)}
            placeholder={textPlaceholder}
            className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-morich-red focus:border-morich-red transition"
          />
        </div>
      )}
      
      {activeTab === InputType.Pdf && (
        <div>
           <label htmlFor={`pdf-input-${step}`} className="block text-sm font-medium text-gray-700 mb-2">{pdfLabel}</label>
           <div className="flex items-center justify-center w-full">
               <label htmlFor={`pdf-input-${step}`} className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       <UploadIcon />
                       {isParsingPdf ? (
                           <p className="mt-2 text-sm text-gray-500">解析中...</p>
                       ) : fileName ? (
                            <p className="mt-2 text-sm text-gray-500 font-semibold">{fileName}</p>
                       ) : (
                           <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">クリックしてアップロード</span>またはドラッグ＆ドロップ</p>
                       )}
                       <p className="text-xs text-gray-500">PDF (最大5MB)</p>
                   </div>
                   <input id={`pdf-input-${step}`} type="file" className="hidden" accept=".pdf" onChange={handlePdfUpload}/>
               </label>
           </div>
          {pdfError && <p className="text-sm text-red-600 mt-2">{pdfError}</p>}
        </div>
      )}

      {activeTab === InputType.Url && (
        <div>
          <label htmlFor={`url-input-${step}`} className="block text-sm font-medium text-gray-700 mb-1">{urlLabel}</label>
          <input
            id={`url-input-${step}`}
            type="text"
            placeholder={urlPlaceholder}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-morich-red focus:border-morich-red transition"
            onBlur={() => alert('URLからの直接読み込みは現在サポートされていません。お手数ですが、求人内容をコピーして「テキストで入力」タブに貼り付けてください。')}
          />
          <p className="text-xs text-gray-500 mt-1">※ 現在、URLからの直接読み込みはベータ機能です。</p>
        </div>
      )}
    </div>
  );
};

export default InputSection;
