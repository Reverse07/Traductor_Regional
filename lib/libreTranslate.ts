// lib/libreTranslate.ts
export async function libreTranslate(
  text: string,
  targetLang: string // 'qu' para quechua, 'ay' para aimara
): Promise<string> {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'es', // Siempre traducimos desde español
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error('Error en LibreTranslate:', error);
    return text; // fallback: devuelve el texto original
  }
}