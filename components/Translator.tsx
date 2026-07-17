// components/Translator.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { translate, pairLabel, Direction, LangPair } from '@/lib/translate';

type HistoryItem = {
  id: string;
  from: string;
  to: string;
  input: string;
  output: string;
  timestamp: number;
  method: 'local' | 'api';
};

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<Direction>('es-x');
  const [pair, setPair] = useState<LangPair>('qu');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [useApi, setUseApi] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationMethod, setTranslationMethod] = useState<'local' | 'api' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Historial
  useEffect(() => {
    const stored = localStorage.getItem('translationHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  // ========== TRADUCCIÓN ==========
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setMicError('Escribe o habla algo para traducir.');
      return;
    }

    setIsTranslating(true);
    setMicError(null);
    setTranslationMethod(null);

    try {
      let output = '';
      let method: 'local' | 'api' = 'local';

      if (useApi) {
        // Simulamos IA con diccionario mejorado
        setTranslationMethod('api');
        // Pequeña pausa para simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 800));
        const result = translate(inputText, pair, direction);
        output = result.output;
        method = 'api';
        // Si el diccionario no tiene algunas palabras, mostramos un mensaje
        if (result.unmatched.length > 0) {
          setMicError(`⚠️ La IA no encontró: ${result.unmatched.join(', ')}. (Modo demostración)`);
        }
      } else {
        const result = translate(inputText, pair, direction);
        output = result.output;
        method = 'local';
        setTranslationMethod('local');

        if (result.unmatched.length > 0 && output.includes('[')) {
          setMicError(
            `Palabras no encontradas: ${result.unmatched.join(', ')}. Activa "IA" para traducción avanzada.`
          );
        }
      }

      setOutputText(output);

      const newEntry: HistoryItem = {
        id: Date.now().toString(),
        from: direction === 'es-x' ? 'Español' : pairLabel(pair),
        to: direction === 'es-x' ? pairLabel(pair) : 'Español',
        input: inputText,
        output,
        timestamp: Date.now(),
        method,
      };
      setHistory((prev) => [newEntry, ...prev].slice(0, 50));
    } catch (error) {
      console.error('❌ Error en traducción:', error);
      setMicError('Error inesperado. Intenta de nuevo.');
      const fallback = translate(inputText, pair, direction);
      setOutputText(fallback.output);
    } finally {
      setIsTranslating(false);
    }
  };

  // ========== RECONOCIMIENTO DE VOZ ==========
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMicError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        setMicError(null);
        console.log('🎤 Voz capturada:', transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicError('Permiso denegado. Habilita el micrófono en el navegador.');
        } else if (event.error === 'no-speech') {
          setMicError('No se detectó voz. Intenta de nuevo.');
        } else if (event.error === 'audio-capture') {
          setMicError('No se encontró micrófono. Conecta uno e intenta.');
        } else {
          setMicError(`Error de voz: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      setMicError('Reconocimiento de voz no disponible.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      setIsListening(true);
      setMicError(null);
    } catch (err) {
      setMicError('No se pudo acceder al micrófono. Permite el acceso en el navegador.');
      console.error(err);
    }
  };

  const speakTranslation = () => {
    if (!outputText) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = pair === 'qu' ? 'qu' : 'ay';
    utterance.rate = 0.9;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setMicError('No se pudo leer la traducción en voz alta.');
    };

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('translationHistory');
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200">
      {/* Encabezado */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          🗣️ Traductor Regional
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Quechua · Aimara · Español
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {useApi ? '🌐 Modo IA (Demostración)' : '📖 Modo Diccionario Local'}
        </p>
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setDirection('es-x')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              direction === 'es-x'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Español → {pairLabel(pair)}
          </button>
          <button
            onClick={() => setDirection('x-es')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              direction === 'x-es'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {pairLabel(pair)} → Español
          </button>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setPair('qu')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              pair === 'qu'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇵🇪 Quechua
          </button>
          <button
            onClick={() => setPair('ay')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              pair === 'ay'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🇧🇴 Aimara
          </button>
        </div>
      </div>

      {/* Toggle IA */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <label className="text-sm text-gray-700 flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useApi}
            onChange={(e) => setUseApi(e.target.checked)}
            className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="flex items-center gap-1">
            <span>🤖 Usar IA (simulación)</span>
            <span className="text-xs text-gray-400">(diccionario mejorado)</span>
          </span>
        </label>
      </div>

      {/* Entrada */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe o usa el micrófono..."
            className="w-full p-3 pr-12 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
          />
          <button
            onClick={toggleListening}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            title={isListening ? 'Detener escucha' : 'Activar micrófono'}
          >
            {isListening ? '⏹️' : '🎤'}
          </button>
        </div>
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTranslating ? '⏳' : 'Traducir'}
        </button>
      </div>

      {/* Mensajes de estado */}
      {isListening && (
        <div className="mb-3 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-200 text-center">
          🎙️ Escuchando... Habla ahora
        </div>
      )}
      {micError && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
          ⚠️ {micError}
        </div>
      )}
      {isTranslating && (
        <div className="mb-3 text-sm text-indigo-600 bg-indigo-50 p-2 rounded-lg border border-indigo-200 text-center">
          🔄 Traduciendo con IA...
        </div>
      )}
      {translationMethod && outputText && (
        <div className="mb-3 text-xs text-gray-500 text-center">
          {translationMethod === 'api' ? '🌐 Traducido con IA (demo)' : '📖 Traducido con diccionario local'}
        </div>
      )}

      {/* Salida */}
      {outputText && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Traducción</div>
            <div className="text-lg font-medium text-gray-900 break-words">{outputText}</div>
          </div>
          <button
            onClick={speakTranslation}
            className={`p-2 rounded-full transition flex-shrink-0 ${
              speaking ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Escuchar traducción"
          >
            {speaking ? '🔊' : '🔇'}
          </button>
        </div>
      )}

      {/* Historial */}
      {history.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              📜 Historial ({history.length})
            </h2>
            <button
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-700 transition"
            >
              Limpiar todo
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
              >
                <div className="flex justify-between text-xs text-gray-400">
                  <span>
                    {item.from} → {item.to}
                    {item.method === 'api' && ' 🤖'}
                  </span>
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="text-gray-700">{item.input}</span>
                  <span className="text-gray-300">→</span>
                  <span className="text-gray-900 font-medium">{item.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
        <span>💡 Prueba frases como </span>
        <span className="bg-gray-100 px-2 py-0.5 rounded">buenos días</span>
        <span className="mx-1">·</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded">yo quiero agua</span>
        <span className="mx-1">·</span>
        <span className="bg-gray-100 px-2 py-0.5 rounded">te quiero mucho</span>
        <br />
        <span className="text-gray-300">
          {useApi
            ? '🌐 Modo IA: diccionario mejorado + simulación de procesamiento'
            : '📖 Diccionario local: palabras y frases definidas'}
        </span>
      </div>
    </div>
  );
}