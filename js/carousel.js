// Isolated carousel navigation - does not interfere with existing main.js logic
document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.carousel-wrapper');
  
  carousels.forEach(wrapper => {
    const grid = wrapper.querySelector('.guides-grid');
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    
    if (!grid || !prevBtn || !nextBtn) return;
    
    prevBtn.addEventListener('click', () => {
      grid.scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      grid.scrollBy({ left: 300, behavior: 'smooth' });
    });
  });
});
/* created by JAT */
