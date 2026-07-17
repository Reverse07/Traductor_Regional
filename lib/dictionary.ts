// lib/dictionary.ts
export type LangPair = 'qu' | 'ay';

export interface DictionaryEntry {
  es: string;
  qu: string;
  ay: string;
  phrase?: boolean;
}

// ==================== BASE DE PALABRAS (expandible) ====================
const BASE_WORDS: DictionaryEntry[] = [
  // --- SALUDOS Y CORTESÍA ---
  { es: 'hola', qu: 'rimaykullayki', ay: 'kamisaraki' },
  { es: 'adiós', qu: 'tupananchiskama', ay: 'jakatakiwa' },
  { es: 'gracias', qu: 'añay', ay: 'yuspagara' },
  { es: 'muchas gracias', qu: 'añay sumaq', ay: 'yuspagara wali' },
  { es: 'por favor', qu: 'maypichus', ay: 'por favor' },
  { es: 'perdón', qu: 'pampachaykuway', ay: 'pampachayitu' },
  { es: 'buenos días', qu: 'allin punchaw', ay: 'wali uru', phrase: true },
  { es: 'buenas tardes', qu: 'allin ch\'isi', ay: 'wali jay\'p\'i', phrase: true },
  { es: 'buenas noches', qu: 'allin tuta', ay: 'wali aruma', phrase: true },
  { es: '¿cómo estás?', qu: '¿imaynallataq kashanki?', ay: '¿kamisaraki?', phrase: true },
  { es: 'estoy bien', qu: 'allinmi kashani', ay: 'waliwa', phrase: true },
  { es: 'hasta luego', qu: 'minchakama', ay: 'jikakipana', phrase: true },

  // --- FAMILIA ---
  { es: 'padre', qu: 'tayta', ay: 'tata' },
  { es: 'madre', qu: 'mama', ay: 'mama' },
  { es: 'hermano', qu: 'wawqi', ay: 'jilata' },
  { es: 'hermana', qu: 'ñaña', ay: 'kullaka' },
  { es: 'hijo', qu: 'churi', ay: 'yuqa' },
  { es: 'hija', qu: 'warmi churi', ay: 'phucha' },
  { es: 'amigo', qu: 'masin', ay: 'amigu' },
  { es: 'mujer', qu: 'warmi', ay: 'palliri' },
  { es: 'hombre', qu: 'qhari', ay: 'chacha' },
  { es: 'niño', qu: 'wawa', ay: 'wawa' },
  { es: 'anciano', qu: 'machu', ay: 'achachi' },
  { es: 'persona', qu: 'runa', ay: 'jaqi' },

  // --- NATURALEZA ---
  { es: 'agua', qu: 'yaku', ay: 'uma' },
  { es: 'sol', qu: 'inti', ay: 'willka' },
  { es: 'luna', qu: 'killa', ay: 'phaxsi' },
  { es: 'estrella', qu: 'ch\'aska', ay: 'warawara' },
  { es: 'tierra', qu: 'allpa', ay: 'pacha' },
  { es: 'montaña', qu: 'urqu', ay: 'qullu' },
  { es: 'río', qu: 'mayu', ay: 'jawira' },
  { es: 'árbol', qu: 'sach\'a', ay: 'quqa' },
  { es: 'flor', qu: 't\'ika', ay: 'panqara' },
  { es: 'animal', qu: 'uywa', ay: 'uywa' },
  { es: 'pájaro', qu: 'pisqu', ay: 'jamach\'i' },
  { es: 'pescado', qu: 'challwa', ay: 'challwa' },
  { es: 'viento', qu: 'wayra', ay: 'thaya' },
  { es: 'lluvia', qu: 'para', ay: 'jallu' },
  { es: 'fuego', qu: 'nina', ay: 'nina' },

  // --- COMIDA ---
  { es: 'comer', qu: 'mikhuy', ay: 'manq\'aña' },
  { es: 'beber', qu: 'upyay', ay: 'umaña' },
  { es: 'cocinar', qu: 'yank\'ay', ay: 'phayña' },
  { es: 'pan', qu: 't\'anta', ay: 't\'anta' },
  { es: 'maíz', qu: 'sara', ay: 'tunqu' },
  { es: 'papa', qu: 'papa', ay: 'papa' },
  { es: 'carne', qu: 'aycha', ay: 'aycha' },
  { es: 'fruta', qu: 'ruru', ay: 'ruru' },

  // --- CASA Y OBJETOS ---
  { es: 'casa', qu: 'wasi', ay: 'uta' },
  { es: 'escuela', qu: 'yachaywasi', ay: 'yatiñani' },
  { es: 'profesor', qu: 'yachachiq', ay: 'yatichiri' },
  { es: 'libro', qu: 'qillqa', ay: 'liwru' },
  { es: 'cuaderno', qu: 'qillqana', ay: 'qilqataña' },
  { es: 'lapicero', qu: 'qillqa t\'ika', ay: 'lapicero' },
  { es: 'puerta', qu: 'punku', ay: 'punku' },
  { es: 'ventana', qu: 'wintana', ay: 'wintana' },
  { es: 'mesa', qu: 'mesa', ay: 'mesa' },
  { es: 'silla', qu: 'tiana', ay: 'tiana' },
  { es: 'ciudad', qu: 'llaqta', ay: 'marka' },
  { es: 'pueblo', qu: 'pueblo', ay: 'pueblo' },

  // --- VERBOS ---
  { es: 'ir', qu: 'riy', ay: 'saraña' },
  { es: 'venir', qu: 'hamuy', ay: 'jutaña' },
  { es: 'hablar', qu: 'rimay', ay: 'arx\'aña' },
  { es: 'escuchar', qu: 'uyariy', ay: 'isathaña' },
  { es: 'ver', qu: 'rikuy', ay: 'uñjaña' },
  { es: 'trabajar', qu: 'llamk\'ay', ay: 'irnaña' },
  { es: 'dormir', qu: 'puñuy', ay: 'ikiña' },
  { es: 'caminar', qu: 'puriy', ay: 'sartaña' },
  { es: 'leer', qu: 'qillqay', ay: 'liyt\'aña' },
  { es: 'escribir', qu: 'qelqay', ay: 'qilqaña' },
  { es: 'aprender', qu: 'yachay', ay: 'yatiña' },
  { es: 'enseñar', qu: 'yachachiy', ay: 'yatichayaña' },
  { es: 'buscar', qu: 'mask\'ay', ay: 'thaqhaña' },
  { es: 'encontrar', qu: 'taripay', ay: 'jikxataña' },

  // --- ADJETIVOS ---
  { es: 'grande', qu: 'hatun', ay: 'jach\'a' },
  { es: 'pequeño', qu: 'uchuy', ay: 'jisk\'a' },
  { es: 'bueno', qu: 'allin', ay: 'wali' },
  { es: 'malo', qu: 'millay', ay: 'ñuju' },
  { es: 'bonito', qu: 'sumaq', ay: 'suma' },
  { es: 'feo', qu: 'q\'ara', ay: 'k\'ari' },
  { es: 'rápido', qu: 'utqay', ay: 'ch\'amaka' },
  { es: 'lento', qu: 'llanta', ay: 'jani ch\'amaka' },
  { es: 'caliente', qu: 'q\'uñi', ay: 'junt\'u' },
  { es: 'frío', qu: 'chiri', ay: 'thaya' },
  { es: 'nuevo', qu: 'musuq', ay: 'macha' },

  // --- NÚMEROS (1-10) ---
  { es: 'uno', qu: 'huk', ay: 'maya' },
  { es: 'dos', qu: 'iskay', ay: 'paya' },
  { es: 'tres', qu: 'kinsa', ay: 'kimsa' },
  { es: 'cuatro', qu: 'tawa', ay: 'pusi' },
  { es: 'cinco', qu: 'pichqa', ay: 'phisqa' },
  { es: 'seis', qu: 'suqta', ay: 'suxta' },
  { es: 'siete', qu: 'qanchis', ay: 'paqallqu' },
  { es: 'ocho', qu: 'pusaq', ay: 'kimsaqallqu' },
  { es: 'nueve', qu: 'isqun', ay: 'llatunka' },
  { es: 'diez', qu: 'chunka', ay: 'tunka' },

  // --- COLORES ---
  { es: 'rojo', qu: 'puka', ay: 'ch\'uxña' },
  { es: 'azul', qu: 'anqas', ay: 'q\'uñi' },
  { es: 'verde', qu: 'q\'omer', ay: 'ch\'umphu' },
  { es: 'amarillo', qu: 'q\'ellu', ay: 'q\'illu' },
  { es: 'blanco', qu: 'yuraq', ay: 'janq\'u' },
  { es: 'negro', qu: 'yana', ay: 'ch\'iyara' },

  // --- DÍAS DE LA SEMANA ---
  { es: 'lunes', qu: 'killachaw', ay: 'killachaw' },
  { es: 'martes', qu: 'atipachaw', ay: 'atipachaw' },
  { es: 'miércoles', qu: 'quyllurchaw', ay: 'quyllurchaw' },
  { es: 'jueves', qu: 'illapachaw', ay: 'illapachaw' },
  { es: 'viernes', qu: 'ch\'askachaw', ay: 'ch\'askachaw' },
  { es: 'sábado', qu: 'k\'uychichaw', ay: 'k\'uychichaw' },
  { es: 'domingo', qu: 'intichaw', ay: 'intichaw' },

  // --- MESES ---
  { es: 'enero', qu: 'iniru', ay: 'iniru' },
  { es: 'febrero', qu: 'p\'ewriri', ay: 'p\'ewriri' },
  { es: 'marzo', qu: 'marsu', ay: 'marsu' },
  { es: 'abril', qu: 'awril', ay: 'awril' },
  { es: 'mayo', qu: 'mayu', ay: 'mayu' },
  { es: 'junio', qu: 'hunyu', ay: 'hunyu' },
  { es: 'julio', qu: 'huliyu', ay: 'huliyu' },
  { es: 'agosto', qu: 'agustu', ay: 'agustu' },
  { es: 'septiembre', qu: 'siptiyimri', ay: 'siptiyimri' },
  { es: 'octubre', qu: 'uktuwri', ay: 'uktuwri' },
  { es: 'noviembre', qu: 'nuwiyimri', ay: 'nuwiyimri' },
  { es: 'diciembre', qu: 'tisiyimri', ay: 'tisiyimri' },


{ es: 'perro', qu: 'allqu', ay: 'anuj' },
{ es: 'gato', qu: 'michi', ay: 'phisi' },
{ es: 'caballo', qu: 'kawallu', ay: 'kawallu' },
{ es: 'vaca', qu: 'waka', ay: 'waka' },
{ es: 'cerdo', qu: 'khuchu', ay: 'khuchi' },
{ es: 'gallina', qu: 'wallpa', ay: 'wallpa' },
{ es: 'pato', qu: 'pato', ay: 'pato' },
{ es: 'condor', qu: 'kuntur', ay: 'kunturi' },
{ es: 'zorro', qu: 'atoc', ay: 't\'ula' },
{ es: 'conejo', qu: 'quwi', ay: 'k\'uyu' },
{ es: 'oveja', qu: 'uwi', ay: 'iwija' },
{ es: 'burro', qu: 'asnu', ay: 'asnu' },
{ es: 'mono', qu: 'kuru', ay: 'kuru' },
{ es: 'oso', qu: 'ukuku', ay: 'ukuku' },
{ es: 'hormiga', qu: "sik'i", ay: "sik'i" },
{ es: 'abeja', qu: 'wayu', ay: 'wayu' },
{ es: 'mariposa', qu: 'pillpintu', ay: 'pillpintu' },
{ es: 'araña', qu: 'apu', ay: 'apu' },
{ es: 'lagarto', qu: 'qarwa', ay: 'qarwa' },
{ es: 'serpiente', qu: 'katari', ay: 'katari' },
{ es: 'tortuga', qu: 'charapa', ay: 'charapa' },
{ es: 'paloma', qu: 'urpai', ay: 'urpai' },
{ es: 'gorrión', qu: 'chiwanku', ay: 'chiwanku' },

{ es: 'camisa', qu: 'chumpi', ay: 'chumpi' },
{ es: 'pantalón', qu: 'llakwa', ay: 'llakwa' },
{ es: 'zapato', qu: 'zapatu', ay: 'zapatu' },
{ es: 'sombrero', qu: 'chuku', ay: 'chuku' },
{ es: 'chalina', qu: 'q\'aytu', ay: 'q\'aytu' },
{ es: 'poncho', qu: 'punku', ay: 'punku' },
{ es: 'vestido', qu: 'anaku', ay: 'anaku' },
{ es: 'falda', qu: 'pallqa', ay: 'pallqa' },
{ es: 'blusa', qu: 'chompa', ay: 'chompa' },
{ es: 'medias', qu: 'pillu', ay: 'pillu' },
{ es: 'guantes', qu: 'maqlla', ay: 'maqlla' },
{ es: 'bufanda', qu: 'q\'aytu', ay: 'q\'aytu' },
{ es: 'cinturón', qu: 'waska', ay: 'waska' },
{ es: 'bolsa', qu: 'wasi', ay: 'wasi' },
{ es: 'mochila', qu: 'q\'ipi', ay: 'q\'ipi' },


{ es: 'auto', qu: 'awtu', ay: 'awtu' },
{ es: 'bus', qu: 'bus', ay: 'bus' },
{ es: 'camión', qu: 'kamyun', ay: 'kamyun' },
{ es: 'avión', qu: 'awyan', ay: 'awyan' },
{ es: 'tren', qu: 'tren', ay: 'tren' },
{ es: 'bicicleta', qu: 'bisiklita', ay: 'bisiklita' },
{ es: 'motocicleta', qu: 'mutur', ay: 'mutur' },
{ es: 'barco', qu: 'barku', ay: 'barku' },
{ es: 'lancha', qu: 'lancha', ay: 'lancha' },
{ es: 'helicóptero', qu: 'helikoptiru', ay: 'helikoptiru' },

{ es: 'computadora', qu: 'komputadora', ay: 'komputadora' },
{ es: 'teléfono', qu: 'telefono', ay: 'telefono' },
{ es: 'celular', qu: 'celular', ay: 'celular' },
{ es: 'tablet', qu: 'tablet', ay: 'tablet' },
{ es: 'televisión', qu: 'telewisyun', ay: 'telewisyun' },
{ es: 'radio', qu: 'radyu', ay: 'radyu' },
{ es: 'internet', qu: 'internet', ay: 'internet' },
{ es: 'cámara', qu: 'kamara', ay: 'kamara' },
{ es: 'reloj', qu: 'reloj', ay: 'reloj' },
{ es: 'batería', qu: 'batirya', ay: 'batirya' },
{ es: 'cargador', qu: 'kargadur', ay: 'kargadur' },

{ es: 'fútbol', qu: 'futbol', ay: 'futbol' },
{ es: 'básquet', qu: 'basqit', ay: 'basqit' },
{ es: 'tenis', qu: 'tenis', ay: 'tenis' },
{ es: 'natación', qu: 'natasyon', ay: 'natasyon' },
{ es: 'correr', qu: 'paqta', ay: 'paqta' },
{ es: 'saltar', qu: 'wayta', ay: 'wayta' },
{ es: 'bailar', qu: 'tusuy', ay: 'tusuy' },
{ es: 'cantar', qu: 'takiy', ay: 'takiy' },
{ es: 'pintar', qu: 'pintay', ay: 'pintay' },
{ es: 'dibujar', qu: 'dibujay', ay: 'dibujay' },
{ es: 'jugar', qu: 'pukllay', ay: 'pukllay' },
{ es: 'viajar', qu: 'viajay', ay: 'viajay' },


{ es: 'mañana', qu: 'paqarin', ay: 'paqarin' },
{ es: 'tarde', qu: 'ch\'isi', ay: 'jayp\'u' },
{ es: 'noche', qu: 'tuta', ay: 'aruma' },
{ es: 'hora', qu: 'pacha', ay: 'pacha' },
{ es: 'minuto', qu: 'minutu', ay: 'minutu' },
{ es: 'segundo', qu: 'sikundu', ay: 'sikundu' },
{ es: 'ayer', qu: 'punchaw', ay: 'punchaw' },
{ es: 'hoy', qu: 'kunan', ay: 'kunan' },
{ es: 'mañana (futuro)', qu: 'mincha', ay: 'mincha' },
{ es: 'calor', qu: 'q\'uñi', ay: 'junt\'u' },
{ es: 'frío', qu: 'chiri', ay: 'thaya' },
{ es: 'lluvioso', qu: 'paray', ay: 'jalluy' },

{ es: 'bienvenido', qu: 'allin hamuy', ay: 'wali juta', phrase: true },
{ es: '¿cómo te llamas?', qu: '¿imataq sutiyki?', ay: '¿kawsa sutimaxa?', phrase: true },
{ es: 'me llamo', qu: 'sutiyqa...', ay: 'sutijax...', phrase: true },
{ es: '¿de dónde eres?', qu: '¿maymanta kanki?', ay: '¿kawkit manta?', phrase: true },
{ es: 'soy de', qu: '...manta kani', ay: '...manta', phrase: true },
{ es: '¿cuánto cuesta?', qu: '¿qayna qhatu?', ay: '¿qawsa qhatu?', phrase: true },
{ es: '¿qué hora es?', qu: '¿imapacha?', ay: '¿kawsa pacha?', phrase: true },
{ es: 'tengo hambre', qu: 'yarqay', ay: 'yarqhay', phrase: true },
{ es: 'tengo sed', qu: 'ch\'aqway', ay: 'thakay', phrase: true },
{ es: 'tengo sueño', qu: 'puñunay', ay: 'ikiñay', phrase: true },


  // --- FRASES COMUNES (expansión) ---
  { es: 'yo quiero agua', qu: 'yakutam munani', ay: 'uma muniwa', phrase: true },
  { es: 'yo quiero comer', qu: 'mikhuyta munani', ay: 'manq\'a muniwa', phrase: true },
  { es: '¿dónde está la escuela?', qu: '¿maypitaq yachaywasi?', ay: '¿kawkit yatiñani?', phrase: true },
  { es: 'gracias por todo', qu: 'llapanmanta añay', ay: 'tukin yuspagara', phrase: true },
  { es: 'te quiero mucho', qu: 'kunankama munayki', ay: 'mati munasma', phrase: true },
  { es: 'buen viaje', qu: 'allin viaje', ay: 'wali viaje', phrase: true },
  { es: 'feliz cumpleaños', qu: 'kusi punchaw', ay: 'kusi uru', phrase: true },
];

// ==================== GENERADOR DE DICCIONARIO MASIVO ====================
/**
 * Genera un diccionario masivo a partir de la base, añadiendo:
 * - Artículos (el, la, los, las, un, una)
 * - Plurales (solo para sustantivos que terminan en a/o)
 * - Combinaciones con verbos (yo quiero + sustantivo, yo tengo + sustantivo, etc.)
 */
function generateMassiveDictionary(): DictionaryEntry[] {
  const result: DictionaryEntry[] = [];

  // Añadir todas las entradas base
  result.push(...BASE_WORDS);

  // 1. Artículos (muchos más)
  const articles = ['el', 'la', 'los', 'las', 'un', 'una', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'mi', 'tu', 'su'];
  for (const entry of BASE_WORDS) {
    if (entry.phrase) continue;
    for (const article of articles) {
      result.push({
        es: `${article} ${entry.es}`,
        qu: entry.qu,
        ay: entry.ay,
        phrase: false,
      });
    }
  }

  // 2. Plurales mejorados (más variantes)
  for (const entry of BASE_WORDS) {
    if (entry.phrase) continue;
    const word = entry.es;
    let plural = '';
    if (word.endsWith('a') || word.endsWith('o')) {
      plural = word.slice(0, -1) + (word.endsWith('a') ? 'as' : 'os');
    } else if (word.endsWith('e')) {
      plural = word + 's';
    } else {
      plural = word + 'es';
    }
    if (plural !== word) {
      result.push({ es: plural, qu: entry.qu, ay: entry.ay, phrase: false });
      // También con artículos (el, la, los, las)
      for (const article of ['los', 'las']) {
        result.push({ es: `${article} ${plural}`, qu: entry.qu, ay: entry.ay, phrase: false });
      }
    }
  }

  // 3. Combinaciones con muchos verbos y sujetos
  const sujetos = ['yo', 'tú', 'él', 'ella', 'nosotros', 'ellos', 'ellas'];
  const verbos = ['quiero', 'tengo', 'necesito', 'busco', 'veo', 'escucho', 'amo', 'odio', 'compro', 'vendo', 'deseo', 'espero', 'entiendo', 'comprendo'];
  const nouns = BASE_WORDS.filter(e => !e.phrase && !['ir','venir','hablar','escuchar','ver','trabajar','dormir','caminar','leer','escribir','aprender','enseñar','buscar','encontrar','comer','beber','cocinar','correr','saltar','bailar','cantar','pintar','dibujar','jugar','viajar'].includes(e.es));
  
  for (const noun of nouns) {
    for (const verbo of verbos) {
      for (const sujeto of sujetos) {
        result.push({
          es: `${sujeto} ${verbo} ${noun.es}`,
          qu: `${noun.qu}ta munani`, // simplificado
          ay: `${noun.ay} muniwa`, // simplificado
          phrase: true,
        });
      }
    }
  }

  // 4. Negaciones con todos los verbos y sujetos
  const verbEntries = BASE_WORDS.filter(e => !e.phrase && ['ir','venir','hablar','escuchar','ver','trabajar','dormir','caminar','leer','escribir','aprender','enseñar','buscar','encontrar','comer','beber','cocinar','correr','saltar','bailar','cantar','pintar','dibujar','jugar','viajar'].includes(e.es));
  for (const verb of verbEntries) {
    for (const sujeto of sujetos) {
      result.push({
        es: `${sujeto} no ${verb.es}`,
        qu: `mana ${verb.qu}`,
        ay: `jani ${verb.ay}`,
        phrase: true,
      });
    }
  }

  // 5. Preguntas comunes
  const preguntas = ['¿qué?', '¿quién?', '¿dónde?', '¿cuándo?', '¿cómo?', '¿por qué?'];
  for (const pregunta of preguntas) {
    for (const verb of verbEntries) {
      result.push({
        es: `${pregunta} ${verb.es}?`,
        qu: `${pregunta} ${verb.qu}?`,
        ay: `${pregunta} ${verb.ay}?`,
        phrase: true,
      });
    }
  }

  // 6. Frases con "¿puedes?" y "¿quieres?"
  const auxiliares = ['puedes', 'quieres', 'necesitas', 'vas a'];
  for (const aux of auxiliares) {
    for (const verb of verbEntries) {
      result.push({
        es: `¿${aux} ${verb.es}?`,
        qu: `¿${aux} ${verb.qu}?`,
        ay: `¿${aux} ${verb.ay}?`,
        phrase: true,
      });
    }
  }

  return result;
}

// ==================== EXPORTACIÓN FINAL ====================
export const DICTIONARY: DictionaryEntry[] = generateMassiveDictionary();

// Opcional: imprime la cantidad en consola (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log(`📚 Diccionario generado con ${DICTIONARY.length} entradas.`);
}