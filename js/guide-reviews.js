// js/guide-reviews.js
// Módulo reutilizable para reseñas por guía con carrusel nativo y CRUD completo.

import { supabase, supabaseReady } from './supabase.js';
import { getLocalCurrentUser } from './guides.js';

const STORAGE_KEY = 'learnmore.pendingReviewer';
const CAROUSEL_SCROLL = 340;

function getCurrentUser() {
  if (supabaseReady) {
    return supabase.auth.getUser().then(({ data }) => data.user).catch(() => null);
  }
  return Promise.resolve(getLocalCurrentUser());
}

function getReviewerId() {
  let pending = null;
  try { pending = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch {}
  return pending?.reviewerId || null;
}

function setReviewerId(reviewerId, email, name) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ reviewerId, email, name, ts: Date.now() }));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text || '');
  return div.innerHTML;
}

function starsHTML(n) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="gr-star ${i < n ? 'gr-star-filled' : ''}">${i < n ? '★' : '☆'}</span>`
  ).join('');
}

export async function loadGuideReviews(guiaId) {
  const track = document.getElementById('gr-track');
  const empty = document.getElementById('gr-empty');

  if (!track) return [];

  track.innerHTML = '<div class="gr-loading">Cargando reseñas...</div>';
  if (empty) empty.style.display = 'none';

  const reviews = await fetchReviews(guiaId);
  renderCarousel(track, reviews, guiaId);
  return reviews;
}

export async function fetchReviews(guiaId) {
  if (!supabaseReady) {
    const raw = localStorage.getItem('learnmore.reviews');
    const all = raw ? JSON.parse(raw) : [];
    return all.filter(r => String(r.guia_id) === String(guiaId)).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('id, comment, stars, email, guia_id, user_id, created_at, updated_at')
    .eq('guia_id', guiaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error cargando reseñas:', error);
    return [];
  }
  return data || [];
}

export async function submitGuideReview(guiaId, { name, email, comment, stars }) {
  const user = await getCurrentUser();
  const userId = user?.id || null;
  const reviewerId = userId || getReviewerId() || `anon-${Date.now()}`;

  if (userId) {
    setReviewerId(userId, email, name);
  } else {
    setReviewerId(reviewerId, email, name);
  }

  const payload = {
    guia_id: guiaId,
    name,
    email,
    comment,
    stars: Number(stars) || 5,
    user_id: userId,
    created_at: new Date().toISOString()
  };

  if (!supabaseReady) {
    const raw = localStorage.getItem('learnmore.reviews');
    const all = raw ? JSON.parse(raw) : [];
    const newReview = { id: Date.now().toString(), ...payload };
    all.push(newReview);
    localStorage.setItem('learnmore.reviews', JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('learnmore:reviews-updated'));
    return newReview;
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGuideReview(reviewId, updates) {
  if (!supabaseReady) {
    const raw = localStorage.getItem('learnmore.reviews');
    const all = raw ? JSON.parse(raw) : [];
    const idx = all.findIndex(r => String(r.id) === String(reviewId));
    if (idx === -1) throw new Error('Reseña no encontrada');
    all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('learnmore.reviews', JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('learnmore:reviews-updated'));
    return all[idx];
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteGuideReview(reviewId) {
  if (!supabaseReady) {
    const raw = localStorage.getItem('learnmore.reviews');
    const all = raw ? JSON.parse(raw) : [];
    const filtered = all.filter(r => String(r.id) !== String(reviewId));
    localStorage.setItem('learnmore.reviews', JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('learnmore:reviews-updated'));
    return;
  }

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;
}

export function initGuideReviewForm(guiaId) {
  const form = document.getElementById('gr-form');
  const starsContainer = document.getElementById('gr-stars');
  const submitBtn = document.getElementById('gr-submit');
  const cancelBtn = document.getElementById('gr-cancel');
  const formCard = document.getElementById('gr-form-card');
  const listBtn = document.getElementById('gr-list-btn');
  const nameInput = document.getElementById('gr-name');
  const emailInput = document.getElementById('gr-email');
  const commentInput = document.getElementById('gr-comment');

  if (!form) return;

  let selectedStars = 0;
  let editingId = null;

  async function hydrateUserFields() {
    const user = await getCurrentUser();
    if (user?.email) {
      if (emailInput) emailInput.value = user.email;
      if (nameInput && !nameInput.value) {
        const pending = getReviewerId();
        const stored = pending ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') : {};
        if (stored.name) nameInput.value = stored.name;
        else if (user.user_metadata?.full_name) nameInput.value = user.user_metadata.full_name;
        else if (user.email) nameInput.value = user.email.split('@')[0];
      }
    }
  }

  hydrateUserFields();

  if (starsContainer) {
    const btns = starsContainer.querySelectorAll('.gr-star-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedStars = parseInt(btn.dataset.val, 10);
        updateStarButtons(btns);
      });
      btn.addEventListener('mouseenter', () => {
        highlightStarButtons(btns, parseInt(btn.dataset.val, 10));
      });
    });
    starsContainer.addEventListener('mouseleave', () => updateStarButtons(btns));
  }

  if (listBtn && formCard) {
    listBtn.addEventListener('click', () => {
      const track = document.getElementById('gr-track');
      if (track) track.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (cancelBtn && formCard) {
    cancelBtn.addEventListener('click', () => {
      formCard.style.display = 'none';
      editingId = null;
      resetForm();
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
      const name = nameInput?.value.trim();
      const email = emailInput?.value.trim();
      const comment = commentInput?.value.trim();

      if (!name || !email || !comment || !selectedStars) {
        alert('Por favor completa todos los campos y selecciona una calificación.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = editingId ? 'Guardando...' : 'Publicando...';

      try {
        if (editingId) {
          await updateGuideReview(editingId, { name, email, comment, stars: selectedStars });
          editingId = null;
        } else {
          await submitGuideReview(guiaId, { name, email, comment, stars: selectedStars });
        }

        resetForm();
        await loadGuideReviews(guiaId);
        const track = document.getElementById('gr-track');
        if (track) track.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId ? 'Guardar cambios' : 'Publicar reseña';
      }
    });
  }

  async function loadForEdit(reviewId) {
    const reviews = await fetchReviews(guiaId);
    const review = reviews.find(r => String(r.id) === String(reviewId));
    if (!review) return;

    editingId = reviewId;
    if (nameInput) nameInput.value = review.name || '';
    if (emailInput) emailInput.value = review.email || '';
    if (commentInput) commentInput.value = review.comment || '';
    selectedStars = review.stars || 0;

    const btns = starsContainer?.querySelectorAll('.gr-star-btn');
    if (btns) updateStarButtons(btns);

    if (submitBtn) {
      submitBtn.textContent = 'Guardar cambios';
    }
    if (formCard) {
      formCard.style.display = 'block';
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window._grEdit = loadForEdit;

  async function handleDelete(reviewId) {
    const confirmed = confirm('¿Deseas eliminar esta reseña?');
    if (!confirmed) return;

    try {
      await deleteGuideReview(reviewId);
      await loadGuideReviews(guiaId);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  }

  window._grDelete = handleDelete;

  function updateStarButtons(btns) {
    btns.forEach(b => {
      const on = parseInt(b.dataset.val, 10) <= selectedStars;
      b.textContent = on ? '★' : '☆';
      b.classList.toggle('gr-star-active', on);
    });
  }

  function highlightStarButtons(btns, n) {
    btns.forEach(b => {
      const on = parseInt(b.dataset.val, 10) <= n;
      b.textContent = on ? '★' : '☆';
      b.classList.toggle('gr-star-active', on);
    });
  }

  function resetForm() {
    if (nameInput) nameInput.value = '';
    if (commentInput) commentInput.value = '';
    selectedStars = 0;
    const btns = starsContainer?.querySelectorAll('.gr-star-btn');
    if (btns) updateStarButtons(btns);
    if (submitBtn) submitBtn.textContent = 'Publicar reseña';
  }
}

export function initGuideCarousel() {
  const track = document.getElementById('gr-track');
  const prev = document.getElementById('gr-prev');
  const next = document.getElementById('gr-next');

  if (!track || !prev || !next) return;

  prev.addEventListener('click', () => {
    track.scrollBy({ left: -CAROUSEL_SCROLL, behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    track.scrollBy({ left: CAROUSEL_SCROLL, behavior: 'smooth' });
  });
}

function renderCarousel(track, reviews, guiaId) {
  if (!reviews.length) {
    track.innerHTML = '<p class="gr-empty">Aún no hay reseñas para esta guía. ¡Sé el primero!</p>';
    return;
  }

  const canModify = () => {
    const reviewerId = getReviewerId();
    return reviews.some(r => {
      if (!reviewerId) return false;
      if (r.user_id && String(r.user_id) === String(reviewerId)) return true;
      return false;
    });
  };

  track.innerHTML = reviews.map(r => {
    const stars = starsHTML(r.stars);
    const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    const modifiable = canModify();

    return `
      <div class="gr-card" data-review-id="${r.id}">
        <div class="gr-card-header">
          <div class="gr-avatar">
            <span class="gr-avatar-initials">${escapeHtml((r.name || '?').charAt(0).toUpperCase())}</span>
          </div>
          <div class="gr-meta">
            <strong>${escapeHtml(r.name || 'Anónimo')}</strong>
            <small>${dateStr}</small>
          </div>
          <div class="gr-stars">${stars}</div>
        </div>
        <p class="gr-comment"><em>${escapeHtml(r.comment)}</em></p>
        ${modifiable ? `
        <div class="gr-actions">
          <button class="gr-btn gr-btn-edit" data-gr-edit="${r.id}" type="button">Editar</button>
          <button class="gr-btn gr-btn-delete" data-gr-delete="${r.id}" type="button">Borrar</button>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');

  track.querySelectorAll('[data-gr-edit]').forEach(btn => {
    btn.addEventListener('click', () => window._grEdit?.(btn.dataset.grEdit));
  });

  track.querySelectorAll('[data-gr-delete]').forEach(btn => {
    btn.addEventListener('click', () => window._grDelete?.(btn.dataset.grDelete));
  });
}
