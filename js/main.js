import { initTheme } from "./theme.js";
import { initLanguage, applyLanguage } from "./language.js";
import { supabaseReady, supabase, onAuthStateChanged } from "./supabase.js";
import { subscribeGuides, subscribeCareers, saveMessage, getLocalCurrentUser, getLocalSession, baseCareerOptions, getMostViewedGuides, incrementGuideViews } from "./guides.js";
import { ejecutarMigracionAutomatica } from "./migrar.js";

let guides = [];
let careers = baseCareerOptions();
let activeCareer = "all"; // Track the currently selected career filter
let activeSemester = "all"; // Track the currently selected semester filter

// Selectores dinámicos compatibles con tu HTML
const guidesGrid = document.querySelector("#guidesContainer") || document.querySelector("#guidesGrid");
const careersGrid = document.querySelector("#careersContainer") || document.querySelector("#careersGrid");
const emptyGuides = document.querySelector("#emptyGuides");
const semesterFilter = document.querySelector("#semesterFilter");
const contactCareer = document.querySelector("#contactCareer");
const modal = document.querySelector("#guideModal");
const modalBody = document.querySelector("#modalBody");
// Selector para el grid de guías más vistas
const mostViewedGrid = document.querySelector("#mostViewedGrid");
const emptyMostViewed = document.querySelector("#emptyMostViewed");

// ============================================================
// CONTEO DINÁMICO E INTELIGENTE DE GUÍAS (INCLUYE GENERALES)
// ============================================================
function countGuides(careerKey) {
  // Función auxiliar para quitar acentos de un texto
  const cleanText = (str) => String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const keyClean = cleanText(careerKey);
  
  const especificas = guides.filter((guide) => {
    const guideCareerClean = cleanText(guide.career);
    return guideCareerClean.includes(keyClean);
  }).length;
  
  const generales = guides.filter((guide) => cleanText(guide.career) === "general").length;
  
  return especificas + generales;
}

// Inicializadores base
initTheme();
initLanguage();
initSessionUi();
renderCareers();
renderCareerOptions();

document.querySelector("#menuToggle")?.addEventListener("click", () => {
  document.querySelector("#navLinks")?.classList.toggle("open");
});

document.querySelector("#modalClose")?.addEventListener("click", () => modal.close());

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    activeCareer = button.dataset.filter;
    renderGuides();
    // Update most viewed section when filter changes
    renderMostViewed();
  });
});

if (semesterFilter) {
  semesterFilter.addEventListener("change", () => {
    activeSemester = semesterFilter.value || "all";
    renderGuides();
  });
}

// ESCUCHADOR DE CARRERAS (SUPABASE / LOCAL)
subscribeCareers((items) => {
  console.log("Carreras recibidas:", items);
  careers = normalizeCareers(items);
  
  renderCareers();
  renderCareerOptions();
  renderGuides();
});

// ESCUCHADOR DE GUÍAS (SUPABASE / LOCAL)
subscribeGuides((items) => {
  console.log("Guías recibidas:", items);
  guides = items;
  
  renderStats();
  renderSemesterOptions();
  renderCareers(); // Re-renderiza las tarjetas para que se actualicen los números en tiempo real
  renderGuides();
  // Renderizar la sección de más vistos con filtro de carrera activo
  renderMostViewed();
});

document.querySelector("#contactForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.querySelector("#contactStatus");
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await saveMessage(data);
    event.currentTarget.reset();
    if (status) status.textContent = "Mensaje enviado correctamente.";
  } catch (error) {
    if (status) status.textContent = error.message;
  }
});

// ==========================================
// MOST VIEWED SECTION FUNCTIONALITY
// ==========================================
function renderMostViewed() {
  if (!mostViewedGrid) return;

  // 1. Filtrar PRIMERO para que solo entren guías que tengan al menos 1 vista
  let guidesToSort = guides.filter((guide) => (guide.views || 0) > 0);
  
  // 2. Si hay un filtro por carrera activo, aplicar la validación inteligente
  if (activeCareer !== "all") {
    const keyLower = String(activeCareer).toLowerCase();
    guidesToSort = guidesToSort.filter((guide) => {
      const guideCareer = String(guide.career || "").toLowerCase();
      return guideCareer.includes(keyLower) || guideCareer === "general";
    });
  }
  
  // 3. Ordenar usando tu función importada
  const mostViewed = getMostViewedGuides(guidesToSort).slice(0, 6);

  // Si no hay guías con más de 0 vistas, ocultar el contenedor o mostrar el estado vacío
  if (!mostViewed.length) {
    mostViewedGrid.innerHTML = "";
    if (emptyMostViewed) emptyMostViewed.style.display = "block";
    return;
  }

  if (emptyMostViewed) emptyMostViewed.style.display = "none";

  mostViewedGrid.innerHTML = mostViewed.map((guide) => `
    <article class="guide-card most-viewed-card" data-guide="${guide.id}">
      <div class="guide-meta" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span class="pill">${careerName(guide.career)}</span>
        <span class="pill view-count-badge" style="background: var(--accent); color: #fff;" data-guide-id="${guide.id}">${guide.views || 0} vistas</span>
      </div>
      <h3>${guide.title}</h3>
      <p>${guide.desc}</p>
      <div class="guide-actions" style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <span class="pill">Sem. ${guide.sem}</span>
        <button class="btn-primary" data-guide="${guide.id}" type="button">Ver guía</button>
      </div>
    </article>
  `).join("");

  mostViewedGrid.querySelectorAll("button[data-guide]").forEach((button) => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      openGuide(newButton.dataset.guide);
    });
  });
}

function renderStats() {
  const publicStats = document.querySelectorAll("#publicStats strong");
  if (!publicStats || publicStats.length === 0) return;
  
  const semesters = new Set(guides.map((guide) => guide.sem));
  const values = [guides.length, careers.length, semesters.size];
  publicStats.forEach((node, index) => {
    node.textContent = values[index] || 0;
  });
}

function renderCareers() {
  if (!careersGrid) return;
  
  careersGrid.innerHTML = careers.map((career) => {
    const cid = career.key || career.id;
    const cColor = career.color || "#00d4ff";
    const cName = career.name || "";
    const cDesc = career.desc || "";
    const shortName = cName.slice(0, 2).toUpperCase();

    return `
      <article class="career-card" style="border-top: 4px solid ${cColor}; cursor: pointer;" data-career="${cid}">
        <div class="career-icon" style="background: ${cColor}20; color: ${cColor}; display: inline-block; padding: 10px; border-radius: 50%; font-weight: bold; margin-bottom: 10px;">
          ${shortName}
        </div>
        <h3>${cName}</h3>
        <p>${cDesc}</p>
        <span class="pill" style="background: ${cColor}15; color: ${cColor}; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold;">
          ${countGuides(cid)} guías
        </span>
      </article>
    `;
  }).join("");

  careersGrid.querySelectorAll("[data-career]").forEach((card) => {
    card.addEventListener("click", () => {
      activeCareer = card.dataset.career;
      
      document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.filter === activeCareer);
      });
      
      renderGuides();
      renderMostViewed();
      document.querySelector("#guias")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function renderCareerOptions() {
  if (!contactCareer) return;
  const options = normalizeCareers(careers).map((career) => `<option value="${career.key || career.id}">${career.name}</option>`).join("");
  contactCareer.innerHTML = `<option value="">General</option>${options}`;
}

function renderSemesterOptions() {
  if (!semesterFilter) return;
  const current = semesterFilter.value || "all";
  const semesters = [...new Set(guides.map((guide) => Number(guide.sem)).filter(Boolean))].sort((a, b) => a - b);
  semesterFilter.innerHTML = `<option value="all" data-i18n="filters.semester">Todos los semestres</option>${semesters.map((sem) => `<option value="${sem}">Semestre ${sem}</option>`).join("")}`;
  semesterFilter.value = semesters.includes(Number(current)) ? current : "all";
  activeSemester = semesterFilter.value || "all";
  if (typeof applyLanguage === "function") applyLanguage();
}

function renderGuides() {
  if (!guidesGrid) return;
  
  const currentCareer = activeCareer || "all";
  const currentSemester = activeSemester || "all";
  const keyLower = String(currentCareer).toLowerCase();

  const filtered = guides.filter((guide) => {
    const guideCareer = String(guide.career || "").toLowerCase();
    
    // Pasa si es "all", si el nombre largo incluye la clave corta de la carrera, o si es "general"
    const matchesCareer = currentCareer === "all" || 
                          guideCareer.includes(keyLower) || 
                          guideCareer === "general";
                          
    const matchesSemester = currentSemester === "all" || String(guide.sem) === String(currentSemester);
    return matchesCareer && matchesSemester;
  });

  if (filtered.length === 0) {
    guidesGrid.innerHTML = "";
    if (emptyGuides) emptyGuides.style.display = "block";
    return;
  }
  if (emptyGuides) emptyGuides.style.display = "none";

  guidesGrid.innerHTML = filtered.map((guide) => `
    <article class="guide-card">
      <div class="guide-meta" style="display: flex; gap: 5px; margin-bottom: 10px;">
        <span class="pill">${careerName(guide.career)}</span>
        <span class="pill">Sem. ${guide.sem}</span>
      </div>
      <h3>${guide.title}</h3>
      <p>${guide.desc}</p>
      <div class="guide-actions" style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <span class="pill">${(guide.topics || []).length} temas</span>
        <button class="btn-secondary" data-guide="${guide.id}" type="button">Ver guía</button>
      </div>
    </article>
  `).join("");
  
  // Clonar botones principales para asegurar un único EventListener por click
  guidesGrid.querySelectorAll("button[data-guide]").forEach((button) => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", (e) => {
      e.preventDefault();
      openGuide(newButton.dataset.guide);
    });
  });
}

function openGuide(id) {
  const guide = guides.find((item) => String(item.id) === String(id));
  if (!guide || !modalBody || !modal) return;

  // 1. Incrementar ÚNICAMENTE en el arreglo en memoria
  const guideIndex = guides.findIndex((g) => String(g.id) === String(id));
  if (guideIndex !== -1) {
    guides[guideIndex].views = (guides[guideIndex].views || 0) + 1;
  }

  // 2. Actualizar el texto de las vistas en caliente directo en las tarjetas visibles (sin renderizar todo)
  const badges = document.querySelectorAll(`[data-guide-id="${id}"]`);
  badges.forEach(badge => {
    badge.textContent = `${guides[guideIndex].views} vistas`;
  });

  // 3. Guardar en la base de datos o localStorage en segundo plano
  incrementGuideViews(id).catch((error) => {
    console.error("Failed to persist view count:", error);
  });

  // 4. Renderizar el modal original
  modalBody.innerHTML = `
    <h2>${guide.title}</h2>
    <p class="pill" style="display: inline-block; margin: 10px 0;">${careerName(guide.career)} - Semestre ${guide.sem}</p>
    <p style="margin: 15px 0; line-height: 1.6;">${guide.detail || guide.desc}</p>
    <h3>Temario</h3>
    <div class="filters" style="display: flex; flex-wrap: wrap; gap: 5px; margin: 15px 0;">
      ${(guide.topics || []).map((topic) => `<span class="pill">${topic}</span>`).join("")}
    </div>
    ${guide.fileUrl ? `<p style="margin-top: 20px;"><a class="btn-primary" href="${guide.fileUrl}" target="_blank" rel="noopener">Abrir recurso</a></p>` : ""}
  `;
  modal.showModal();
}

function careerName(key) {
  return careers.find((career) => (career.key || career.id) === key)?.name || key;
}

// Control de Sesión e Interfaz de Usuario
function initSessionUi() {
  const session = getLocalSession();
  const isAdminLocal = session && (session.role === "admin" || session.email === "admin@learnmore.local" || session.email?.includes("admin"));

  if (session?.email) {
    updateSessionUi(true, Boolean(isAdminLocal));
    return;
  }

  if (supabaseReady) {
    onAuthStateChanged((event, nextSession) => {
      const isLoggedIn = Boolean(nextSession?.user);
      if (isLoggedIn) {
        getSupabaseUserProfile(nextSession.user.id).then((profile) => {
          const isAdmin = profile?.role === "admin" || nextSession.user.email?.includes("admin");
          updateSessionUi(true, isAdmin);
        }).catch(() => updateSessionUi(true, false));
      } else {
        updateSessionUi(false, false);
      }
    });
    return;
  }

  const user = getLocalCurrentUser();
  updateSessionUi(Boolean(user), user?.role === "admin");
}

function updateSessionUi(isLoggedIn, isAdmin = false) {
  const loginLink = document.querySelector("#loginNavLink");
  const profileLink = document.querySelector("#profileNavLink");
  const adminLink = document.querySelector("#adminNavLink");

  if (loginLink) {
    loginLink.hidden = isLoggedIn;
    loginLink.textContent = "Entrar";
    loginLink.href = "login.html";
  }
  if (profileLink) profileLink.hidden = !isLoggedIn || isAdmin;
  if (adminLink) adminLink.hidden = !isAdmin;

  document.querySelector("#createAccountBtn")?.toggleAttribute("hidden", isLoggedIn);
  document.querySelector("#heroProfileBtn")?.toggleAttribute("hidden", !isLoggedIn);
  document.querySelector("#heroProfileBtn")?.toggleAttribute("hidden", isAdmin);
  if (typeof applyLanguage === "function") applyLanguage();
}

async function getSupabaseUserProfile(userId) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) return null;
  return data;
}

function normalizeCareers(items) {
  return Array.isArray(items) && items.length ? items : baseCareerOptions();
}
