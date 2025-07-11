/**
 * Progressive Enhancement Utilities
 * Ensures components work without JavaScript and enhance when available
 */

class ProgressiveEnhancement {
  constructor() {
    this.init();
  }

  init() {
    // Mark document as JS-enabled
    document.documentElement.classList.add('js-enabled');
    
    // Setup feature detection
    this.detectFeatures();
    
    // Setup fallbacks
    this.setupFallbacks();
    
    // Setup error handling
    this.setupErrorHandling();
  }

  detectFeatures() {
    const features = {
      // CSS features
      cssGrid: CSS.supports('display', 'grid'),
      cssFlexbox: CSS.supports('display', 'flex'),
      cssCustomProperties: CSS.supports('--test', 'value'),
      
      // JavaScript features
      intersectionObserver: 'IntersectionObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      matchMedia: 'matchMedia' in window,
      
      // Accessibility features
      ariaLive: 'ariaLive' in document.createElement('div'),
      
      // Input capabilities
      touch: 'ontouchstart' in window,
      pointer: window.PointerEvent !== undefined,
      
      // Network
      connection: 'connection' in navigator,
      serviceWorker: 'serviceWorker' in navigator
    };

    // Add feature classes to document
    Object.entries(features).forEach(([feature, supported]) => {
      document.documentElement.classList.add(
        supported ? `supports-${feature}` : `no-${feature}`
      );
    });

    // Store features globally
    window.features = features;
  }

  setupFallbacks() {
    // Fallback for CSS Grid
    if (!window.features.cssGrid) {
      this.addFallbackCSS(`
        .grid {
          display: block;
        }
        .grid > * {
          margin-bottom: 1rem;
        }
      `);
    }

    // Fallback for Intersection Observer
    if (!window.features.intersectionObserver) {
      this.loadPolyfill('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver');
    }

    // Fallback for reduced motion when matchMedia is not supported
    if (!window.features.matchMedia) {
      // Assume reduced motion preference
      document.documentElement.classList.add('reduce-motion');
    }
  }

  setupErrorHandling() {
    // Global error handler for component failures
    window.addEventListener('error', (event) => {
      console.warn('Component error:', event.error);
      
      // Try to gracefully degrade
      this.gracefulDegrade(event.target);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Promise rejection:', event.reason);
      
      // Prevent default error handling
      event.preventDefault();
    });
  }

  gracefulDegrade(element) {
    if (!element || !element.classList) return;

    // Remove JavaScript-dependent classes
    const jsClasses = [
      'js-carousel',
      'js-dropdown',
      'js-pagination',
      'js-enhanced'
    ];

    jsClasses.forEach(className => {
      element.classList.remove(className);
    });

    // Add fallback class
    element.classList.add('js-fallback');

    // Show all content that might be hidden
    const hiddenElements = element.querySelectorAll('.js-hidden, [aria-hidden="true"]');
    hiddenElements.forEach(el => {
      el.classList.remove('js-hidden');
      el.removeAttribute('aria-hidden');
    });
  }

  addFallbackCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  loadPolyfill(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
  }

  // Network-aware loading
  loadConditionally(callback, options = {}) {
    const {
      requiresHighBandwidth = false,
      requiresJavaScript = true,
      fallback = null
    } = options;

    // Check if JavaScript is required and available
    if (requiresJavaScript && !window.features) {
      if (fallback) fallback();
      return;
    }

    // Check network conditions
    if (requiresHighBandwidth && window.features.connection) {
      const connection = navigator.connection;
      const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.saveData;

      if (isSlowConnection) {
        if (fallback) fallback();
        return;
      }
    }

    // All conditions met, execute callback
    callback();
  }

  // Responsive image loading
  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (window.features.intersectionObserver) {
      // Use Intersection Observer for lazy loading
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback: load all images immediately
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  }

  // Form enhancement
  enhanceForm(form) {
    if (!form) return;

    // Add client-side validation only if supported
    if ('checkValidity' in form) {
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          this.showValidationErrors(form);
        }
      });
    }

    // Enhance input fields
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      // Add real-time validation feedback
      input.addEventListener('blur', () => {
        this.validateField(input);
      });

      // Clear validation on input
      input.addEventListener('input', () => {
        this.clearValidation(input);
      });
    });
  }

  showValidationErrors(form) {
    const invalidFields = form.querySelectorAll(':invalid');
    
    invalidFields.forEach(field => {
      this.showFieldError(field, field.validationMessage);
    });

    // Focus first invalid field
    if (invalidFields.length > 0) {
      invalidFields[0].focus();
    }
  }

  validateField(field) {
    if (field.checkValidity()) {
      this.clearValidation(field);
    } else {
      this.showFieldError(field, field.validationMessage);
    }
  }

  showFieldError(field, message) {
    this.clearValidation(field);

    const errorId = `${field.id || field.name}-error`;
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'field-error text-red-600 text-sm mt-1';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');

    field.parentNode.appendChild(errorElement);
    field.setAttribute('aria-describedby', errorId);
    field.classList.add('border-red-500');
  }

  clearValidation(field) {
    const errorId = `${field.id || field.name}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    field.removeAttribute('aria-describedby');
    field.classList.remove('border-red-500');
  }
}

// Initialize progressive enhancement
document.addEventListener('DOMContentLoaded', () => {
  window.progressiveEnhancement = new ProgressiveEnhancement();
  
  // Setup responsive images
  window.progressiveEnhancement.setupResponsiveImages();
  
  // Enhance forms
  document.querySelectorAll('form').forEach(form => {
    window.progressiveEnhancement.enhanceForm(form);
  });
});