// lib/huggingFaceTranslate.ts
export async function hfTranslate(
  text: string,
  targetLang: 'qu' | 'ay'
): Promise<string> {
  const model = targetLang === 'qu' 
    ? 'somosnlp-hackathon-2022/spanish-to-quechua'
    : 'Helsinki-NLP/opus-mt-es-ay';

  const url = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      // Intento fallback para quechua
      if (targetLang === 'qu' && response.status === 503) {
        const fallbackModel = 'Helsinki-NLP/opus-mt-es-qu';
        const fallbackResponse = await fetch(
          `https://api-inference.huggingface.co/models/${fallbackModel}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inputs: text,
              options: { wait_for_model: true },
            }),
          }
        );
        if (!fallbackResponse.ok) throw new Error(`Fallback HTTP ${fallbackResponse.status}`);
        const fallbackData = await fallbackResponse.json();
        if (Array.isArray(fallbackData) && fallbackData[0]?.translation_text) {
          return fallbackData[0].translation_text;
        }
        if (fallbackData?.translation_text) return fallbackData.translation_text;
        throw new Error('Formato de respuesta inesperado');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      if (data[0].translation_text) return data[0].translation_text;
      if (data[0].generated_text) return data[0].generated_text;
    }
    if (data.translation_text) return data.translation_text;
    if (data.generated_text) return data.generated_text;

    console.warn('Respuesta inesperada:', data);
    return text;
  } catch (error) {
    console.error('❌ Error en Hugging Face:', error);
    throw error;
  }
}