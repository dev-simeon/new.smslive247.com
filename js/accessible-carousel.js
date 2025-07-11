/**
 * Accessible Carousel Component
 * Replaces problematic auto-playing carousels with user-controlled, accessible alternatives
 */

class AccessibleCarousel {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoPlay: false, // Disabled by default for accessibility
      pauseOnHover: true,
      pauseOnFocus: true,
      showDots: true,
      showArrows: true,
      announceSlides: true,
      ...options
    };

    this.currentSlide = 0;
    this.slides = [];
    this.isPlaying = false;
    this.playInterval = null;

    this.init();
  }

  init() {
    this.setupStructure();
    this.setupControls();
    this.setupKeyboardNavigation();
    this.setupAccessibility();
    this.setupProgressiveEnhancement();
  }

  setupStructure() {
    // Find slides
    this.slides = Array.from(this.container.querySelectorAll('.carousel-slide'));
    
    if (this.slides.length === 0) return;

    // Add ARIA attributes
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', 'Image carousel');
    this.container.setAttribute('aria-roledescription', 'carousel');

    // Setup slides container
    const slidesContainer = this.container.querySelector('.carousel-slides') || this.container;
    slidesContainer.setAttribute('aria-live', 'polite');

    // Setup individual slides
    this.slides.forEach((slide, index) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `Slide ${index + 1} of ${this.slides.length}`);
      slide.setAttribute('tabindex', index === 0 ? '0' : '-1');
      
      if (index !== 0) {
        slide.classList.add('hidden');
      }
    });
  }

  setupControls() {
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls flex items-center justify-between mt-4';
    controlsContainer.setAttribute('aria-label', 'Carousel controls');

    // Play/Pause button (only if autoplay is enabled)
    if (this.options.autoPlay) {
      const playPauseBtn = document.createElement('button');
      playPauseBtn.className = 'carousel-play-pause px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500';
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> <span>Play</span>';
      playPauseBtn.setAttribute('aria-label', 'Play carousel');
      
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      controlsContainer.appendChild(playPauseBtn);
    }

    // Navigation arrows
    if (this.options.showArrows) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'carousel-prev px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2';
      prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i> <span class="sr-only">Previous slide</span>';
      prevBtn.setAttribute('aria-label', 'Go to previous slide');
      prevBtn.addEventListener('click', () => this.previousSlide());

      const nextBtn = document.createElement('button');
      nextBtn.className = 'carousel-next px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500';
      nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i> <span class="sr-only">Next slide</span>';
      nextBtn.setAttribute('aria-label', 'Go to next slide');
      nextBtn.addEventListener('click', () => this.nextSlide());

      const arrowContainer = document.createElement('div');
      arrowContainer.className = 'carousel-arrows flex';
      arrowContainer.appendChild(prevBtn);
      arrowContainer.appendChild(nextBtn);
      controlsContainer.appendChild(arrowContainer);
    }

    // Dot indicators
    if (this.options.showDots && this.slides.length > 1) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'carousel-dots flex space-x-2 ml-4';
      dotsContainer.setAttribute('role', 'tablist');
      dotsContainer.setAttribute('aria-label', 'Slide navigation');

      this.slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot w-3 h-3 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          index === 0 ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-300'
        }`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => this.goToSlide(index));
        
        dotsContainer.appendChild(dot);
      });

      controlsContainer.appendChild(dotsContainer);
    }

    this.container.appendChild(controlsContainer);
  }

  setupKeyboardNavigation() {
    this.container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousSlide();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextSlide();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSlide(this.slides.length - 1);
          break;
        case ' ':
        case 'Enter':
          if (e.target.classList.contains('carousel-dot')) {
            e.preventDefault();
            e.target.click();
          }
          break;
      }
    });
  }

  setupAccessibility() {
    // Pause on hover and focus
    if (this.options.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pause());
      this.container.addEventListener('mouseleave', () => {
        if (this.options.autoPlay) this.play();
      });
    }

    if (this.options.pauseOnFocus) {
      this.container.addEventListener('focusin', () => this.pause());
      this.container.addEventListener('focusout', () => {
        if (this.options.autoPlay) this.play();
      });
    }

    // Respect reduced motion preference
    if (window.a11y && window.a11y.shouldReduceMotion()) {
      this.options.autoPlay = false;
    }
  }

  setupProgressiveEnhancement() {
    // Show all slides if JavaScript fails
    this.container.classList.add('js-enabled');
    
    // Add CSS for progressive enhancement
    const style = document.createElement('style');
    style.textContent = `
      .carousel-container:not(.js-enabled) .carousel-slide {
        display: block !important;
        margin-bottom: 1rem;
      }
      .carousel-container:not(.js-enabled) .carousel-controls {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  goToSlide(index) {
    if (index < 0 || index >= this.slides.length || index === this.currentSlide) return;

    const previousSlide = this.currentSlide;
    this.currentSlide = index;

    // Hide previous slide
    this.slides[previousSlide].classList.add('hidden');
    this.slides[previousSlide].setAttribute('tabindex', '-1');

    // Show current slide
    this.slides[this.currentSlide].classList.remove('hidden');
    this.slides[this.currentSlide].setAttribute('tabindex', '0');

    // Update dots
    const dots = this.container.querySelectorAll('.carousel-dot');
    if (dots.length > 0) {
      dots[previousSlide].classList.remove('bg-blue-600', 'border-blue-600');
      dots[previousSlide].classList.add('bg-gray-300', 'border-gray-300');
      dots[previousSlide].setAttribute('aria-selected', 'false');

      dots[this.currentSlide].classList.remove('bg-gray-300', 'border-gray-300');
      dots[this.currentSlide].classList.add('bg-blue-600', 'border-blue-600');
      dots[this.currentSlide].setAttribute('aria-selected', 'true');
    }

    // Announce slide change
    if (this.options.announceSlides && window.a11y) {
      window.a11y.announce(`Slide ${this.currentSlide + 1} of ${this.slides.length}`);
    }
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  play() {
    if (!this.options.autoPlay || this.isPlaying) return;
    
    this.isPlaying = true;
    this.playInterval = setInterval(() => this.nextSlide(), 5000);
    
    const playPauseBtn = this.container.querySelector('.carousel-play-pause');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> <span>Pause</span>';
      playPauseBtn.setAttribute('aria-label', 'Pause carousel');
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
    
    const playPauseBtn = this.container.querySelector('.carousel-play-pause');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> <span>Play</span>';
      playPauseBtn.setAttribute('aria-label', 'Play carousel');
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}

// Auto-initialize carousels
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accessible-carousel').forEach(carousel => {
    new AccessibleCarousel(carousel);
  });
});