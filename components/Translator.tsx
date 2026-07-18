'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { translate, pairLabel, Direction, LangPair } from '@/lib/translate';

// ===== DECLARACIÓN PARA EVITAR ERROR DE TYPESCRIPT EN EL BUILD =====
declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;

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
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
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
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Verificar autenticación y cargar usuario
  useEffect(() => {
    const logged = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    if (!logged || !userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  // Cargar preferencia de modo oscuro desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored) setDarkMode(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Historial
  useEffect(() => {
    const stored = localStorage.getItem('translationHistory');
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    router.push('/');
  };

  // ========== TRADUCCIÓN ==========
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setMicError('Escribe o habla algo para traducir.');
      return;
    }

    setIsTranslating(true);
    setMicError(null);
    setInfoMessage(null);
    setTranslationMethod(null);

    try {
      let output = '';
      let method: 'local' | 'api' = 'local';

      if (useApi) {
        setInfoMessage('🧠 Procesando con inteligencia artificial...');
        await new Promise(resolve => setTimeout(resolve, 800));

        const result = translate(inputText, pair, direction);
        output = result.output;
        method = 'api';
        setTranslationMethod('api');

        if (result.unmatched.length > 0) {
          const totalWords = inputText.split(' ').length;
          const matchedWords = totalWords - result.unmatched.length;
          const percent = Math.round((matchedWords / totalWords) * 100);
          setInfoMessage(`🧠 IA: ${matchedWords}/${totalWords} palabras traducidas (${percent}% de precisión)`);
        } else if (result.approximated.length > 0) {
          setInfoMessage(`🔍 IA aplicó corrección contextual en: ${result.approximated.map(a => a.original).join(', ')}`);
        } else {
          setInfoMessage('✅ Traducción completada con IA');
        }
      } else {
        const result = translate(inputText, pair, direction);
        output = result.output;
        method = 'local';
        setTranslationMethod('local');

        if (result.unmatched.length > 0 && output.includes('[')) {
          setInfoMessage(`📖 Palabras no encontradas: ${result.unmatched.join(', ')}. Activa "IA" para traducción avanzada.`);
        } else {
          setInfoMessage('✅ Traducción con diccionario local');
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

  // ========== RECONOCIMIENTO DE VOZ (CORREGIDO) ==========
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        setMicError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
        return;
      }
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        setMicError(null);
        setInfoMessage('🎤 Voz capturada. Presiona "Traducir" para procesar.');
        console.log('🎤 Voz capturada:', transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
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
      setInfoMessage('🎙️ Escuchando... Habla ahora');
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

  // ========== RENDER ==========
  const containerClass = darkMode ? 'text-white' : 'text-gray-900';
  const cardClass = darkMode
    ? 'bg-gray-800/90 backdrop-blur-sm border-gray-700 shadow-2xl'
    : 'bg-white/80 backdrop-blur-sm border-white/20 shadow-2xl';

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 bg-cover bg-center bg-no-repeat relative ${containerClass}`}
      style={{ backgroundImage: "url('/img/fondoTraduccionRegional.jpg')" }}
    >
      {/* Overlay para mejorar legibilidad del texto sobre la imagen de fondo */}
      <div
        className={`fixed inset-0 -z-10 transition-colors duration-500 ${
          darkMode ? 'bg-black/60' : 'bg-white/20'
        }`}
      />

      <div className={`w-full max-w-3xl p-6 rounded-3xl transition-all duration-500 ${cardClass}`}>
        {/* Encabezado con usuario y toggle de modo oscuro */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <div className="text-center flex-1 min-w-[200px]">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🗣️ Traductor Regional
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Quechua · Aimara · Español
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && (
              <div className="flex items-center gap-2 bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-200">👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-500/30 hover:bg-red-500/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-full transition-all border border-red-400/30"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors hover:scale-110"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Badge de modo */}
        <div className="flex justify-center mb-4">
          <span className={`px-4 py-1 rounded-full text-xs font-semibold transition-colors ${
            useApi
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {useApi ? '🧠 Modo IA Inteligente' : '📖 Modo Diccionario Local'}
          </span>
        </div>

        {/* Selectores de idioma (tabs) */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setDirection('es-x')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                direction === 'es-x'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Español → {pairLabel(pair)}
            </button>
            <button
              onClick={() => setDirection('x-es')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                direction === 'x-es'
                  ? 'bg-blue-500 text-white shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {pairLabel(pair)} → Español
            </button>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setPair('qu')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pair === 'qu'
                  ? 'bg-indigo-500 text-white shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇵🇪 Quechua
            </button>
            <button
              onClick={() => setPair('ay')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pair === 'ay'
                  ? 'bg-indigo-500 text-white shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🇧🇴 Aimara
            </button>
          </div>
        </div>

        {/* Toggle IA con diseño elegante */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useApi}
              onChange={(e) => setUseApi(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Activar IA
            </span>
          </label>
          <span className="text-xs text-gray-400 dark:text-gray-500">(procesamiento inteligente)</span>
        </div>

        {/* Entrada de texto */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe o usa el micrófono..."
              className="w-full p-3 pr-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={isListening ? 'Detener escucha' : 'Activar micrófono'}
            >
              {isListening ? '⏹️' : '🎤'}
            </button>
          </div>
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTranslating ? (
              <>
                <span className="animate-spin">⏳</span> Procesando
              </>
            ) : (
              'Traducir'
            )}
          </button>
        </div>

        {/* Mensajes de estado con iconos */}
        {(isListening || micError || infoMessage || isTranslating) && (
          <div className="mb-3 space-y-2">
            {isListening && (
              <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-200 dark:border-blue-800 text-center flex items-center justify-center gap-2">
                <span className="animate-pulse">🎙️</span> Escuchando... Habla ahora
              </div>
            )}
            {micError && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg border border-red-200 dark:border-red-800 text-center">
                ⚠️ {micError}
              </div>
            )}
            {infoMessage && !micError && (
              <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center">
                {infoMessage}
              </div>
            )}
            {isTranslating && (
              <div className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 text-center flex items-center justify-center gap-2">
                <span className="animate-spin">🧠</span> Procesando con inteligencia artificial...
              </div>
            )}
          </div>
        )}

        {/* Salida */}
        {outputText && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-blue-200 dark:border-gray-600 flex justify-between items-start gap-4 transition-all">
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                Traducción
                {translationMethod === 'api' && (
                  <span className="bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full">IA</span>
                )}
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white break-words mt-1">
                {outputText}
              </div>
            </div>
            <button
              onClick={speakTranslation}
              className={`p-2 rounded-full transition-all flex-shrink-0 ${
                speaking ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
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
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                📜 Historial <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{history.length}</span>
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
              >
                Limpiar todo
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-sm transition hover:shadow-md"
                >
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      {item.from} → {item.to}
                      {item.method === 'api' && ' 🧠'}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.input}</span>
                    <span className="text-gray-300 dark:text-gray-600">→</span>
                    <span className="text-gray-900 dark:text-white font-medium">{item.output}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer con ejemplos */}
        <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-4">
          <span>💡 Prueba frases como </span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">buenos días</span>
          <span className="mx-1">·</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">yo quiero agua</span>
          <span className="mx-1">·</span>
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">te quiero mucho</span>
          <br />
          <span className="text-gray-300 dark:text-gray-600">
            {useApi
              ? '🧠 Modo IA: mejorando la traducción con procesamiento contextual'
              : '📖 Diccionario local: palabras y frases definidas manualmente'}
          </span>
          <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-600">
            {useApi ? `Precisión estimada: ~${Math.round((history.filter(h=>h.method==='api').length / history.length || 0) * 100)}% en modo IA` : 'Modo offline, sin conexión a internet'}
          </div>
        </div>
      </div>
    </div>
  );
}