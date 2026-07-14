// Isolated carousel navigation - does not interfere with existing main.js logic
document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.carousel-wrapper');
  
  carousels.forEach(wrapper => {
    const track = wrapper.querySelector('[data-carousel-track], .guides-grid');
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const isVertical = track.hasAttribute('data-carousel-track') && track.id === 'reviewsList';
    const delta = isVertical ? 300 : 300;
    const axis = isVertical ? 'top' : 'left';
    
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ [axis]: -delta, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ [axis]: delta, behavior: 'smooth' });
    });
  });
});