
export const generateAttractScript = async (jobSeekerInfo: string, jobOfferInfo: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobSeekerInfo, jobOfferInfo }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    return data.script;
    
  } catch (error) {
    console.error("Error generating script from API:", error);
    if (error instanceof Error) {
        return `エラーが発生しました: ${error.message}`;
    }
    return "不明なエラーが発生しました。";
  }
};
