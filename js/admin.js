import { initTheme } from "./theme.js";
import { initLanguage } from "./language.js";
import { supabase, supabaseReady } from './supabase.js';
import {
  subscribeGuides,
  subscribeCareers,
  subscribeMessages,
  subscribeGmailMessages,
  subscribeUsers,
  subscribeActivity,
  saveGuide,
  deleteGuide,
  saveCareer,
  deleteCareer,
  updateMessageStatus,
  saveUser,
  deleteUser,
  baseCareerOptions,
} from "./guides.js";
// import { ejecutarMigracionAutomatica } from "./migrar.js";

initTheme();
initLanguage();

let guides = [];
let careers = baseCareerOptions();
let contactMessages = [];
let gmailMessages = [];
let users = [];
let activity = [];

renderCareerSelect();
renderCareers();

// ==========================================
// SUSCRIPTORES DE COLECCIONES
// ==========================================
subscribeCareers((items) => {
  careers = normalizeCareers(items);
  renderCareerSelect();
  renderCareers();
  renderDashboard();
});
subscribeGuides((items) => {
  guides = items;
  renderGuides();
  renderDashboard();
});
subscribeMessages((items) => {
  contactMessages = items;
  renderMessages();
  renderDashboard();
});
subscribeGmailMessages((items) => {
  gmailMessages = items;
  renderMessages();
  renderDashboard();
});
subscribeUsers((items) => {
  users = items;
  renderUsers();
  renderDashboard();
});
subscribeActivity((items) => {
  activity = items;
  renderActivity();
});

// ==========================================
// GUARDIÁN (solo Supabase)
// ==========================================
const session = getLocalSession();
const isAdminLocal = session && (session.role === "admin" || session.email === "admin@learnmore.local" || session.email?.includes("admin"));

if (isAdminLocal) {
  setTimeout(async () => {
    try {
      await saveUser({
        id: session.email,
        name: session.name || "Administrador",
        email: session.email,
        role: "admin",
      });
    } catch (e) {
      console.error("Error al registrar el perfil local de administrador:", e);
    }
  }, 100);
} else if (supabaseReady) {
  supabase.auth.onAuthStateChange((event, nextSession) => {
    if (nextSession?.user) {
      if (!nextSession?.user) return;
      getUserProfile(nextSession.user.id).then((profile) => {
        const isAdmin = profile?.role === "admin" || nextSession.user.email?.includes("admin");
        if (!isAdmin) window.location.href = "login.html";
      }).catch(() => {
        if (!nextSession.user.email?.includes("admin")) window.location.href = "login.html";
      });
    }
    if (event === "SIGNED_OUT") window.location.href = "login.html";
  });
} else {
  if (!session || session.role !== "admin") window.location.href = "login.html";
}

// ==========================================
// UI
// ==========================================
// Cambios de vista
document.querySelectorAll(".admin-tab").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

// Logout
// (En Supabase, el logout se maneja con supabase.auth.signOut)

document.querySelector("#logoutBtn")?.addEventListener("click", async () => {
  try {
    if (supabaseReady) await supabase.auth.signOut();
  } catch (e) {
    console.warn("Logout error:", e);
  }
  sessionStorage.removeItem("learnmore.session");
  window.location.href = "login.html";
});

// ==========================================
// FORMULARIOS (Guides/Careers/Users)
// ==========================================
document.querySelector("#guideForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const statusElement = document.querySelector("#guideStatus");
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  data.file = form.file?.files[0] || null;
  const topicsRaw = formData.get("topics") || data.topics || "";
  data.topics = String(topicsRaw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  data.sem = Number(data.sem || 1);

  try {
    if (statusElement) statusElement.textContent = "Guardando guía...";
    await saveGuide(data);
    form.reset();
    if (form.id) form.id.value = "";
    if (statusElement) statusElement.textContent = "Guia guardada correctamente.";
  } catch (error) {
    if (statusElement) statusElement.textContent = `Error: ${error.message}`;
  }
});

document.querySelector("#clearGuideForm")?.addEventListener("click", () => {
  const form = document.querySelector("#guideForm");
  if (form) {
    form.reset();
    if (form.id) form.id.value = "";
  }
});

// Career

document.querySelector("#careerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  await saveCareer(Object.fromEntries(new FormData(form)));
  form.reset();
  if (form.color) form.color.value = "#00d4ff";
});

// Users

document.querySelector("#userForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const statusElement = document.querySelector("#userStatus");
  try {
    await saveUser(Object.fromEntries(new FormData(form)));
    form.reset();
    if (form.id) form.id.value = "";
    if (statusElement) statusElement.textContent = "Usuario guardado correctamente.";
  } catch (error) {
    if (statusElement) statusElement.textContent = `Error: ${error.message}`;
  }
});

document.querySelector("#clearUserForm")?.addEventListener("click", () => {
  const form = document.querySelector("#userForm");
  if (form) {
    form.reset();
    if (form.id) form.id.value = "";
  }
});

document.querySelector("#userSearch")?.addEventListener("input", renderUsers);
document.querySelector("#userRoleFilter")?.addEventListener("change", renderUsers);

// ==========================================
// Render
// ==========================================
function switchView(view) {
  document.querySelectorAll(".admin-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  document.querySelectorAll(".admin-view").forEach((panel) => panel.classList.toggle("active", panel.id === `${view}View`));
  const viewTitle = document.querySelector("#viewTitle");
  if (viewTitle) viewTitle.textContent = viewLabel(view);
}

function viewLabel(view) {
  return { dashboard: "Dashboard", guides: "Guias", careers: "Carreras", messages: "Mensajes", users: "Usuarios" }[view] || view;
}

function renderDashboard() {
  const metricGrid = document.querySelector("#metricGrid");
  if (!metricGrid) return;

  const semesters = new Set(guides.map((guide) => guide.sem));
  const metrics = [
    ["Guias", guides.length],
    ["Carreras", careers.length],
    ["Semestres", semesters.size],
    ["Mensajes", contactMessages.length + gmailMessages.length],
    ["Usuarios", users.length],
    ["Supabase", supabaseReady ? "Activo" : "Local"],
  ];

  metricGrid.innerHTML = metrics
    .map(([label, value]) => `<article class="metric-card"><strong>${value}</strong><span>${label}</span></article>`)
    .join("");
}

function renderActivity() {
  const activityList = document.querySelector("#activityList");
  if (!activityList) return;

  const list = activity.slice(0, 8);
  activityList.innerHTML = list.length
    ? list.map((item) => `<article class="list-item"><strong>${item.text || item.type}</strong><p>${formatDate(item.createdAt)}</p></article>`).join("")
    : `<p class="form-note">Sin actividad reciente.</p>`;
}

function renderCareerSelect() {
  const guideCareer = document.querySelector("#guideCareer");
  if (!guideCareer) return;

  guideCareer.innerHTML = normalizeCareers(careers)
    .map((career) => `<option value="${career.key || career.id}">${career.name}</option>`)
    .join("");
}

function renderGuides() {
  const guideList = document.querySelector("#guideList");
  if (!guideList) return;

  guideList.innerHTML = guides
    .map(
      (guide) => `
      <article class="list-item">
        <header><strong>${guide.title}</strong><span class="pill">Sem. ${guide.sem}</span></header>
        <p>${guide.desc}</p>
        <div class="item-actions">
          <button class="small-btn" data-edit-guide="${guide.id}" type="button">Editar</button>
          <button class="danger-btn" data-delete-guide="${guide.id}" type="button">Eliminar</button>
        </div>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-edit-guide]").forEach((button) => button.addEventListener("click", () => fillGuide(button.dataset.editGuide)));
  document.querySelectorAll("[data-delete-guide]").forEach((button) => button.addEventListener("click", () => deleteGuide(button.dataset.deleteGuide)));
}

function fillGuide(id) {
  const guide = guides.find((item) => item.id === id);
  if (!guide) return;

  const form = document.querySelector("#guideForm");
  if (!form) return;

  form.id.value = guide.id;
  if (form.title) form.title.value = guide.title || "";
  if (form.desc) form.desc.value = guide.desc || "";
  if (form.detail) form.detail.value = guide.detail || "";
  if (form.career) form.career.value = guide.career || "";
  if (form.sem) form.sem.value = guide.sem || "";
  if (form.topics) form.topics.value = (guide.topics || []).join(", ");
  if (form.fileUrl) form.fileUrl.value = guide.fileUrl || "";

  switchView("guides");
}

function renderCareers() {
  const careerList = document.querySelector("#careerList");
  if (!careerList) return;

  careerList.innerHTML = careers
    .map(
      (career) => `
      <article class="list-item">
        <header><strong>${career.name}</strong><span class="pill">${career.key || career.id}</span></header>
        <p>${career.desc}</p>
        <div class="item-actions">
          <button class="small-btn" data-edit-career="${career.id}" type="button">Editar</button>
          <button class="danger-btn" data-delete-career="${career.id}" type="button">Eliminar</button>
        </div>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-edit-career]").forEach((button) => button.addEventListener("click", () => fillCareer(button.dataset.editCareer)));
  document.querySelectorAll("[data-delete-career]").forEach((button) => button.addEventListener("click", () => deleteCareer(button.dataset.deleteCareer)));
}

function fillCareer(id) {
  const career = careers.find((item) => item.id === id);
  if (!career) return;

  const form = document.querySelector("#careerForm");
  if (!form) return;

  form.id.value = career.id;
  if (form.key) form.key.value = career.key || career.id;
  if (form.name) form.name.value = career.name || "";
  if (form.desc) form.desc.value = career.desc || "";
  if (form.color) form.color.value = career.color || "#00d4ff";

  switchView("careers");
}

function renderMessages() {
  const messageList = document.querySelector("#messageList");
  if (!messageList) return;

  const combined = [];

  // Contact messages (Supabase 'messages')
  contactMessages.forEach((msg) => {
    const date = msg.created_at ? new Date(msg.created_at) : new Date();
    combined.push({
      id: msg.id,
      type: "contact",
      subject: msg.subject || "Mensaje",
      name: msg.name || "",
      email: msg.email || "",
      message: msg.message || "",
      status: msg.status || "nuevo",
      date,
    });
  });

  // Gmail messages (if you keep the Firestore sync; otherwise may remain empty)
  gmailMessages.forEach((msg) => {
    const date = msg.receivedAt ? new Date(msg.receivedAt) : msg.syncedAt ? new Date(msg.syncedAt) : new Date();
    combined.push({
      id: msg.id,
      type: "gmail",
      subject: msg.subject || "(Sin asunto)",
      name: msg.from || "",
      email: "",
      message: msg.body || "",
      status: "nuevo",
      date,
    });
  });

  combined.sort((a, b) => b.date - a.date);

  messageList.innerHTML = combined
    .map(
      (message) => `
      <article class="list-item">
        <header><strong>${message.subject}</strong><span class="pill">${message.status}</span></header>
        <p>${message.name} - ${message.email}</p>
        <p>${message.message}</p>
        <div class="item-actions">
          ${message.type === "contact" ? `<button class="small-btn" data-message-read="${message.id}" type="button">Marcar revisado</button>` : ""}
        </div>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-message-read]").forEach((button) => {
    button.addEventListener("click", () => updateMessageStatus(button.dataset.messageRead, "revisado"));
  });
}

function renderUsers() {
  const userList = document.querySelector("#userList");
  if (!userList) return;

  const search = document.querySelector("#userSearch")?.value.trim().toLowerCase() || "";
  const roleFilter = document.querySelector("#userRoleFilter")?.value || "all";

  const filtered = users.filter((user) => {
    const role = user.role || "user";
    const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();
    const matchesSearch = !search || text.includes(search);
    const matchesRole = roleFilter === "all" || role === roleFilter;
    return matchesSearch && matchesRole;
  });

  userList.innerHTML = filtered.length
    ? filtered
        .map(
          (user) => `
        <article class="list-item">
          <header><strong>${user.name || user.email}</strong><span class="pill">${user.role || "user"}</span></header>
          <p>${user.email}</p>
          <div class="item-actions">
            <button class="small-btn" data-edit-user="${user.id}" type="button">Editar</button>
            <button class="small-btn" data-role-user="${user.id}" data-role="${user.role === "admin" ? "user" : "admin"}" type="button">
              ${user.role === "admin" ? "Quitar admin" : "Hacer admin"}
            </button>
            <button class="danger-btn" data-delete-user="${user.id}" type="button">Eliminar</button>
          </div>
        </article>`
        )
        .join("")
    : `<p class="form-note">No hay usuarios con esos filtros.</p>`;

  document.querySelectorAll("[data-edit-user]").forEach((button) => button.addEventListener("click", () => fillUser(button.dataset.editUser)));
  document.querySelectorAll("[data-role-user]").forEach((button) => button.addEventListener("click", () => changeUserRole(button.dataset.roleUser, button.dataset.role)));
  document.querySelectorAll("[data-delete-user]").forEach((button) => button.addEventListener("click", () => deleteUser(button.dataset.deleteUser)));
}

function fillUser(id) {
  const user = users.find((item) => item.id === id);
  if (!user) return;

  const form = document.querySelector("#userForm");
  if (!form) return;

  form.id.value = user.id;
  if (form.name) form.name.value = user.name || "";
  if (form.email) form.email.value = user.email || "";
  if (form.role) form.role.value = user.role || "user";
  if (form.password) form.password.value = user.password || "";

  switchView("users");
}

async function changeUserRole(id, role) {
  const user = users.find((item) => item.id === id);
  if (!user) return;
  await saveUser({ ...user, role });
}

function formatDate(value) {
  if (!value) return "Ahora";
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString();
  return new Date(value).toLocaleString();
}

function getLocalSession() {
  try {
    return JSON.parse(sessionStorage.getItem("learnmore.session"));
  } catch {
    return null;
  }
}

async function getUserProfile(userId) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  return data;
}

function normalizeCareers(items) {
  return Array.isArray(items) && items.length ? items : baseCareerOptions();
}
