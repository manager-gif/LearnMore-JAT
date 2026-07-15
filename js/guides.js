// js/guides.js íƒÆ’í‚Â¢íƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÂ¢í¢â€šÂ¬í‚Â solo importar supabase, nada míƒÆ’í†â€™íƒâ€ší‚Â¡s
import { supabase } from './supabase.js';

// TambiíƒÆ’í†â€™íƒâ€ší‚Â©n necesitas esta variable que uses en el cíƒÆ’í†â€™íƒâ€ší‚Â³digo pero no estíƒÆ’í†â€™íƒâ€ší‚Â¡ definida localmente:
const supabaseReady = !!supabase;
// Si Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo, usaremos localStorage como respaldo
// (Manteniendo la misma líƒÆ’í†â€™íƒâ€ší‚Â³gica que antes para el modo local)

const KEYS = {
  guides: "learnmore.guides",
  careers: "learnmore.careers",
  messages: "learnmore.messages",
  users: "learnmore.users",
  activity: "learnmore.activity",
  reviews: "learnmore.reviews",
};

// Default data for local storage seeding
export const defaultCareers = [
  {
    id: "mecatronica",
    key: "01",
    name: "MecatríƒÆ’í†â€™íƒâ€ší‚Â³nica",
    desc: "Carrera de MecatríƒÆ’í†â€™íƒâ€ší‚Â³nica",
    color: "#00d4ff"
  },
  {
    id: "ti",
    key: "02",
    name: "TI e InnovaciíƒÆ’í†â€™íƒâ€ší‚Â³n Digital",
    desc: "Carrera de TecnologíƒÆ’í†â€™íƒâ€ší‚Â­as de la InformaciíƒÆ’í†â€™íƒâ€ší‚Â³n e InnovaciíƒÆ’í†â€™íƒâ€ší‚Â³n Digital",
    color: "#7c3aed"
  },
  {
    id: "procesos",
    key: "03",
    name: "Procesos Industriales",
    desc: "Carrera de Procesos Industriales",
    color: "#10b981"
  }
];

export const defaultGuides = [];

// Funciones para modo local (idíƒÆ’í†â€™íƒâ€ší‚Â©nticas a las originales)
function readLocal(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("learnmore:local-change", { detail: { key } }));
}

export function ensureLocalSeed() {
  if (!localStorage.getItem(KEYS.careers)) writeLocal(KEYS.careers, defaultCareers);
  if (!localStorage.getItem(KEYS.guides)) writeLocal(KEYS.guides, defaultGuides);
  if (!localStorage.getItem(KEYS.messages)) writeLocal(KEYS.messages, []);
  if (!localStorage.getItem(KEYS.users)) writeLocal(KEYS.users, []);
  if (!localStorage.getItem(KEYS.activity)) writeLocal(KEYS.activity, []);
}

function localSubscribe(key, fallback, callback) {
  ensureLocalSeed();
  callback(readLocal(key, fallback));
  const handler = (event) => {
    if (!event.detail || event.detail.key === key) callback(readLocal(key, fallback));
  };
  window.addEventListener("learnmore:local-change", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("learnmore:local-change", handler);
    window.removeEventListener("storage", handler);
  };
}

// Funciones para modo Supabase
async function subscribeSupabaseTable(tableName, fallback, callback) {
  if (!supabaseReady) {
    return localSubscribe(KEYS[tableName], fallback, callback);
  }

  // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬ FIX: tablas opcionales que pueden no existir aíƒÆ’í†â€™íƒâ€ší‚Âºn íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬
  const optionalTables = ["gmailMessages"];
  if (optionalTables.includes(tableName)) {
    // Intentar fetch; si falla con 404/42P01 simplemente usar fallback silencioso
    const { data: initialData, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Tabla no existe todavíƒÆ’í†â€™íƒâ€ší‚Â­a íƒÆ’í‚Â¢íƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÂ¢í¢â€šÂ¬í‚Â usar fallback sin spam de errores
      callback(fallback);
      return () => {};
    }

    callback(initialData?.length ? initialData : fallback);

    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        supabase.from(tableName).select('*').order('created_at', { ascending: false })
          .then(({ data, error }) => { if (!error) callback(data || []); });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
  // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬

  // Primero, obtener los datos actuales
  const { data: initialData, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return localSubscribe(KEYS[tableName], fallback, callback);
  }

  // Si la tabla de carreras esta vacia, mantener las opciones base
  callback(initialData?.length ? initialData : fallback);

  // Configurar suscripciíƒÆ’í†â€™íƒâ€ší‚Â³n en tiempo real
  const channel = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
      supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error) callback(data || []);
          else console.error(`Error in real-time update for ${tableName}:`, error);
        });
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

function localUpsert(key, data) {
  const list = readLocal(key, []);
  const id = data.id || `${Date.now()}`;
  const next = [{ ...data, id, updatedAt: new Date().toISOString() }, ...list.filter((item) => item.id !== id)];
  writeLocal(key, next);
  return id;
}

function localDelete(key, id) {
  writeLocal(key, readLocal(key, []).filter((item) => item.id !== id));
}

// ==========================================
// FUNCIíƒÆ’í†â€™íƒÂ¢í¢â€šÂ¬í…â€œN DE NORMALIZACIíƒÆ’í†â€™íƒÂ¢í¢â€šÂ¬í…â€œN
// ==========================================
export function normalizeTopics(value) {
  if (Array.isArray(value)) return value;
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

// ==========================================
// FUNCIONES DE SUPABASE PARA COLECCIONES
// ==========================================

export function collection(tableName) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  return supabase.from(tableName);
}

export function doc(tableName, id) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  return supabase.from(tableName).eq('id', id);
}

export async function addDoc(tableReference, data) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  const { data: result, error } = await supabase
    .from(tableReference)
    .insert({
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function setDoc(docReference, data, options = {}) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  throw new Error("setDoc no implementado. Use funciones especíƒÆ’í†â€™íƒâ€ší‚Â­ficas (saveGuide, saveUser, etc.).");
}

export async function deleteDoc(docReference) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  throw new Error("deleteDoc no implementado. Use funciones especíƒÆ’í†â€™íƒâ€ší‚Â­ficas (deleteGuide, deleteUser, etc.).");
}

export async function getDoc(docReference) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");
  throw new Error("getDoc no implementado. Use funciones especíƒÆ’í†â€™íƒâ€ší‚Â­ficas.");
}

export function onSnapshot(tableReference, callback) {
  if (!supabaseReady) {
    return localSubscribe("temp", [], callback);
  }
  return subscribeSupabaseTable("temp", [], callback);
}

export function serverTimestamp() {
  return new Date();
}

export function ref(storageInstance, path) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");

  return {
    path
  };
}
export async function uploadBytes(fileRef, file) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");

  const bucket = "guides"; // <-- cambia esto si tu bucket tiene otro nombre

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileRef.path, file, {
      upsert: true
    });

  if (error) {
    console.error("UPLOAD ERROR:", error);
    throw error;
  }

  return data;
}

export async function getDownloadURL(fileRef) {
  if (!supabaseReady) throw new Error("Supabase no estíƒÆ’í†â€™íƒâ€ší‚Â¡ listo");

  const bucket = "guides"; // <-- mismo nombre del bucket

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileRef.path);

  return data.publicUrl;
}
// ==========================================
// FUNCIONES ESPECíƒÆ’í†â€™íƒâ€ší‚ÂFICAS PARA CADA COLECCIíƒÆ’í†â€™íƒÂ¢í¢â€šÂ¬í…â€œN
// ==========================================

export const subscribeGuides        = (callback) => subscribeSupabaseTable("guides",        defaultGuides,  callback);
export const subscribeCareers       = (callback) => subscribeSupabaseTable("careers",       defaultCareers, callback);
export const subscribeMessages      = (callback) => subscribeSupabaseTable("messages",      [],             callback);
export const subscribeGmailMessages = (callback) => subscribeSupabaseTable("gmailMessages", [],             callback);
export const subscribeUsers         = (callback) => subscribeSupabaseTable("users",         [],             callback);
export const subscribeActivity      = (callback) => subscribeSupabaseTable("activity",      [],             callback);
export const subscribeReviews       = (callback) => subscribeSupabaseTable("reviews",       [],             callback);

// Funciones de guardado especíƒÆ’í†â€™íƒâ€ší‚Â­ficas
export async function saveGuide(data) {
  const payload = {
    ...data,
    sem: Number(data.sem || 1),
    topics: normalizeTopics(data.topics)
  };

  if (!supabaseReady) {
    const id = localUpsert(KEYS.guides, payload);
    addActivity({ type: "guide", text: `Guia guardada: ${payload.title}` });
    return id;
  }

if (payload.file && payload.file instanceof File) {

  const filePath =
    `${Date.now()}-${payload.file.name.replace(/\s+/g, "_")}`;

  const uploaded = await uploadBytes(
    ref(supabase.storage, filePath),
    payload.file
  );

  payload.fileUrl = await getDownloadURL({
    path: uploaded.path
  });
}
  delete payload.file;
  const id = payload.id;
  delete payload.id;

  const timestamp = new Date().toISOString();
  const dataToSave = {
    ...payload,
    views: id ? payload.views : (payload.views || 0),
    updated_at: timestamp,
    ...(id ? {} : { created_at: timestamp })
  };

  try {
    if (id) {
      const { error } = await supabase.from("guides").update(dataToSave).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("guides").insert(dataToSave).select().single();
      if (error) throw error;
    }

    await saveActivity({ type: "guide", text: `Guia guardada: ${payload.title || "(Sin tíƒÆ’í†â€™íƒâ€ší‚Â­tulo)"}` });
    return id || Date.now();
  } catch (error) {
    console.error("Error saving guide:", error);
    throw error;
  }
}

export async function saveCareer(data) {
  const payload = { ...data, key: String(data.key || "").trim().toLowerCase() };

  if (!supabaseReady) {
    return localUpsert(KEYS.careers, { ...payload, id: payload.id || payload.key });
  }

  const id = payload.id || payload.key;
  delete payload.id;

  const timestamp = new Date().toISOString();
  const dataToSave = {
    ...payload,
    updated_at: timestamp,
    ...(id ? {} : { created_at: timestamp })
  };

  try {
    if (id) {
      const { error } = await supabase.from("careers").update(dataToSave).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("careers").insert(dataToSave).select().single();
      if (error) throw error;
    }
    return id;
  } catch (error) {
    console.error("Error saving career:", error);
    throw error;
  }
}

export async function saveMessage(data) {
  const payload = { ...data, status: "nuevo", created_at: new Date().toISOString() };

  if (!supabaseReady) {
    return localUpsert(KEYS.messages, payload);
  }

  try {
    const { data: result, error } = await supabase
      .from("messages")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    const fnUrl = (window.__LEARNMORE_SEND_CONTACT_EMAIL_URL__ || "");
    if (fnUrl) {
      try {
        await fetch(fnUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            email: payload.email,
            subject: payload.subject,
            message: payload.message,
          }),
        });
      } catch (e) {
        console.warn("No se pudo enviar email al admin:", e);
      }
    } else {
      console.warn("Falta configurar window.__LEARNMORE_SEND_CONTACT_EMAIL_URL__");
    }

    return result.id;
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function saveReview(data) {
  const payload = { ...data, created_at: new Date().toISOString() };

  if (!supabaseReady) {
    const id = localUpsert(KEYS.reviews, payload);
    return id;
  }

  try {
    const { data: result, error } = await supabase
      .from("reviews")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return result.id;
  } catch (error) {
    console.error("Error saving review:", error);
    throw error;
  }
}

export async function updateMessageStatus(id, status) {
  if (!supabaseReady) {
    const list = readLocal(KEYS.messages, []).map((item) =>
      item.id === id ? { ...item, status } : item
    );
    return writeLocal(KEYS.messages, list);
  }

  try {
    const { error } = await supabase
      .from("messages")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return id;
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
}

export async function saveUser(data) {
  const payload = {
    ...data,
    role: data.role || "user",
    email: String(data.email || "").trim().toLowerCase(),
  };

  // El id puede venir del objeto o usamos el email como identificador
  const id = payload.id || payload.email;

  // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬ FIX: si el id no es un UUID víƒÆ’í†â€™íƒâ€ší‚Â¡lido (ej. admin@learnmore.local), guardar solo local íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (!supabaseReady || !isUUID) {
    const existing = readLocal(KEYS.users, []).find((item) => item.id === id);
    const saved = { ...payload, id };
    if (!saved.password && existing?.password) saved.password = existing.password;
    if (!saved.password) delete saved.password;
    const result = localUpsert(KEYS.users, saved);
    addActivity({ type: "user", text: `Usuario guardado: ${payload.email}` });
    return result;
  }

  // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬ FIX: limpiar campos que no van a la BD íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬
  delete payload.password;
  delete payload.photoFile;

  const timestamp = new Date().toISOString();

  // Construir objeto limpio con id explíƒÆ’í†â€™íƒâ€ší‚Â­cito
  const dataToSave = {
    id,                          // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚Â íƒâ€ší‚Â id siempre presente para el upsert
    ...payload,
    updated_at: timestamp,
    created_at: timestamp,       // Supabase lo ignora si la fila ya existe
  };

  // Asegurarse de que no haya id duplicado dentro del spread
  delete dataToSave.id;          // borramos el que viene del spread de payload
  dataToSave.id = id;            // y lo ponemos una sola vez al final

  try {
    // íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬ FIX: upsert con onConflict explíƒÆ’í†â€™íƒâ€ší‚Â­cito en la columna id íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬íƒÆ’í‚Â¢íƒÂ¢í¢â€šÂ¬í‚ÂíƒÂ¢í¢â‚¬Å¡í‚Â¬
    const { error } = await supabase
      .from("users")
      .upsert(dataToSave, { onConflict: "id", ignoreDuplicates: false });

    if (error) throw error;

    await saveActivity({ type: "user", text: `Usuario guardado: ${payload.email}` });
    return id;
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
}

export async function deleteGuide(id) {
  if (!supabaseReady) return localDelete(KEYS.guides, id);

  try {
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (error) throw error;
    await saveActivity({ type: "guide", text: `Guia eliminada: ${id}` });
    return id;
  } catch (error) {
    console.error("Error deleting guide:", error);
    throw error;
  }
}

export async function deleteCareer(id) {
  if (!supabaseReady) return localDelete(KEYS.careers, id);

  try {
    const { error } = await supabase.from("careers").delete().eq("id", id);
    if (error) throw error;
    return id;
  } catch (error) {
    console.error("Error deleting career:", error);
    throw error;
  }
}

export async function deleteUser(id) {
  if (!supabaseReady) return localDelete(KEYS.users, id);

  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    return id;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function saveActivity(activity) {

  if (!supabaseReady) {
    localUpsert(KEYS.activity, {
      ...activity,
      createdAt: new Date().toISOString()
    });
    return;
  }

  try {

    const { error } = await supabase
      .from("activity")
      .insert([{
        type: activity.type || "system",
        text: activity.text || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error("Activity Error:", error);
    }

  } catch (err) {
    console.error("Activity Catch:", err);
  }
}
// Funciones de modo local (mantener compatibilidad)
export function saveLocalUser(user) {
  if (supabaseReady) return;
  localUpsert(KEYS.users, { ...user, role: user.role || "user" });
}

export function localUsers() {
  ensureLocalSeed();
  return readLocal(KEYS.users, []);
}

export function getLocalSession() {
  try {
    return JSON.parse(sessionStorage.getItem("learnmore.session"));
  } catch {
    return null;
  }
}

export function setLocalSession(session) {
  sessionStorage.setItem("learnmore.session", JSON.stringify(session));
}

export function clearLocalSession() {
  sessionStorage.removeItem("learnmore.session");
}

export function getLocalCurrentUser() {
  const session = getLocalSession();
  if (!session?.email) return null;
  return localUsers().find((user) => user.email === session.email) || session;
}

export function addActivity(activity) {
  if (supabaseReady) {
    saveActivity(activity);
    return;
  }
  localUpsert(KEYS.activity, { ...activity, createdAt: new Date().toISOString() });
}

// Helper functions for matricula generation
export function getCuatrimestreFromDate(date) {
  const month = date.getMonth() + 1;
  if (month >= 9 && month <= 12) return 0;
  else if (month >= 1 && month <= 4) return 1;
  else return 2;
}

export function getCareerCodeFromName(careerName) {
  if (!careerName) return "00";

  const normalized = careerName.toLowerCase().trim();

  if (normalized === "01") return "01";
  if (normalized === "02") return "02";
  if (normalized === "03") return "03";

  if (normalized.includes("mecatronica") || normalized.includes("mecatríƒÆ’í†â€™íƒâ€ší‚Â³nica")) return "01";
  else if (normalized.includes("ti") || normalized.includes("innovacion") || normalized.includes("innovaciíƒÆ’í†â€™íƒâ€ší‚Â³n") || normalized.includes("digital")) return "02";
  else if (normalized.includes("procesos") || normalized.includes("industriales")) return "03";
  else return "01";
}

export function getCareerNameFromCode(code) {
  const normalized = String(code || "").trim();
  if (normalized === "01") return "Mecatronica";
  if (normalized === "02") return "TI e Innovacion Digital";
  if (normalized === "03") return "Procesos Industriales";
  return "";
}

export function baseCareerOptions() {
  return defaultCareers.map((career) => ({ ...career }));
}

export function getCurrentAcademicPeriodIndex(date = new Date()) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const block = month >= 9 ? 0 : month <= 4 ? 1 : 2;
  const academicYear = block === 0 ? year : year - 1;
  return academicYear * 3 + block;
}

export function getMatriculaInfo(value, referenceDate = new Date()) {
  const normalized = String(value || "").trim().toUpperCase();
  const match = normalized.match(/^(\d{2})-(\d{2})-(\d{3})$/);

  if (!match) {
    return {
      isValid: false,
      matricula: normalized,
      generationYear: null,
      careerCode: "",
      careerName: "",
      studentNumber: "",
      semester: "",
    };
  }

  const generationYear = 2000 + Number(match[1]);
  const careerCode = match[2];
  const studentNumber = match[3];
  const startPeriod = generationYear * 3;
  const semester = Math.max(0, getCurrentAcademicPeriodIndex(referenceDate) - startPeriod);

  return {
    isValid: ["01", "02", "03"].includes(careerCode),
    matricula: normalized,
    generationYear,
    careerCode,
    careerName: getCareerNameFromCode(careerCode),
    studentNumber,
    semester,
  };
}

export async function generateMatricula(careerName) {
  try {
    const currentYear = new Date().getFullYear();
    const generation = String(currentYear - 2000);
    const careerCode = getCareerCodeFromName(careerName);
    const now = new Date();
    const cuatrimestre = getCuatrimestreFromDate(now);

    let count = 0;

    if (supabaseReady) {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, career, created_at")
        .eq("role", "user");

      if (error) throw error;

      if (users) {
        count = users.filter(user => {
          const userCareerCode = getCareerCodeFromName(user.career);
          if (userCareerCode !== careerCode) return false;
          const registrationDate = new Date(user.created_at);
          const userCuatrimestre = getCuatrimestreFromDate(registrationDate);
          return userCuatrimestre === cuatrimestre;
        }).length;
      }
    } else {
      const users = localUsers();
      count = users.filter(user => {
        const userCareerCode = getCareerCodeFromName(user.career);
        if (userCareerCode !== careerCode) return false;
        const registrationDate = new Date(user.createdAt || user.created_at);
        const userCuatrimestre = getCuatrimestreFromDate(registrationDate);
        return userCuatrimestre === cuatrimestre;
      }).length;
    }

    const consecutive = String(count + 1).padStart(3, '0');
    return `${generation}-${careerCode}-${consecutive}`;
  } catch (error) {
    console.error("Error generating matricula:", error);
    const currentYear = new Date().getFullYear();
    const generation = String(currentYear - 2000);
    return `${generation}-00-${Date.now().toString().slice(-3).padStart(3, '0')}`;
  }
}

// ==========================================
// VIEW COUNTER - CONTADOR DE VISTAS
// ==========================================

// FunciíƒÆ’í†â€™íƒâ€ší‚Â³n para incrementar el contador de vistas de una guíƒÆ’í†â€™íƒâ€ší‚Â­a en Supabase
// ParíƒÆ’í†â€™íƒâ€ší‚Â¡metro: guideId - ID íƒÆ’í†â€™íƒâ€ší‚Âºnico de la guíƒÆ’í†â€™íƒâ€ší‚Â­a a la que se le suma una vista
// Esta funciíƒÆ’í†â€™íƒâ€ší‚Â³n actualiza la base de datos directamente para persistencia
// CRITICAL: Returns a Promise and updates both Supabase AND localStorage as fallback
export async function incrementGuideViews(guideId) {
  if (!supabaseReady) {
    const storedGuides = readLocal(KEYS.guides, []);
    const guideIndex = storedGuides.findIndex(g => String(g.id) === String(guideId));
    if (guideIndex !== -1) {
      storedGuides[guideIndex].views = (storedGuides[guideIndex].views || 0) + 1;
      localStorage.setItem(KEYS.guides, JSON.stringify(storedGuides));
      window.dispatchEvent(new CustomEvent("learnmore:views-updated"));
    }
    return Promise.resolve();
  }

  try {
    // IMPORTANTE: Para evitar problemas con bigint y condiciones de carrera en tiempo real,
    // usamos la funciíƒÆ’í†â€™íƒâ€ší‚Â³n rpc() de Supabase para incrementar directamente en la base de datos de un solo golpe.
    // Nota: Debes tener la funciíƒÆ’í†â€™íƒâ€ší‚Â³n 'increment_views' creada en tu base de datos (abajo te dejo el SQL).
    const { error: rpcError } = await supabase
      .rpc('increment_views', { row_id: guideId });

    // Si por alguna razíƒÆ’í†â€™íƒâ€ší‚Â³n la funciíƒÆ’í†â€™íƒâ€ší‚Â³n RPC no estíƒÆ’í†â€™íƒâ€ší‚Â¡ creada, usamos este plan de respaldo optimizado:
    if (rpcError) {
      const { data: currentGuide, error: fetchError } = await supabase
        .from("guides")
        .select("views")
        .eq("id", guideId)
        .single();

      if (!fetchError && currentGuide) {
        const newViews = (parseInt(currentGuide.views) || 0) + 1;
        await supabase
          .from("guides")
          .update({ views: newViews })
          .eq("id", guideId);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error updating view count:", error);
    return Promise.resolve();
  }
}

// FunciíƒÆ’í†â€™íƒâ€ší‚Â³n para obtener guíƒÆ’í†â€™íƒâ€ší‚Â­as ordenadas por vistas (míƒÆ’í†â€™íƒâ€ší‚Â¡s populares)
// ParíƒÆ’í†â€™íƒâ€ší‚Â¡metros: allGuides - array de todas las guíƒÆ’í†â€™íƒâ€ší‚Â­as disponibles
// Retorna: array de guíƒÆ’í†â€™íƒâ€ší‚Â­as ordenadas de mayor a menor níƒÆ’í†â€™íƒâ€ší‚Âºmero de vistas (solo guíƒÆ’í†â€™íƒâ€ší‚Â­as con > 0 vistas)
export function getMostViewedGuides(allGuides) {
  const sorted = [...allGuides].sort((a, b) => {
    const viewsA = a.views || 0;
    const viewsB = b.views || 0;
    if (viewsB !== viewsA) return viewsB - viewsA;
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB - dateA;
  });
  return sorted.slice(0, 6);
}
/* created by JAT */

