/**
 * Accessibility Utilities
 * Core functions for managing focus, announcements, and keyboard navigation
 */

class AccessibilityManager {
  constructor() {
    this.announcer = this.createLiveRegion();
    this.focusHistory = [];
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Listen for reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });
  }

  // Create live region for screen reader announcements
  createLiveRegion() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(announcer);
    return announcer;
  }

  // Announce messages to screen readers
  announce(message, priority = 'polite') {
    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = '';
    }, 1000);
  }

  // Enhanced focus management
  manageFocus(element, options = {}) {
    if (!element) return;
    
    const { 
      preventScroll = false, 
      savePrevious = true,
      restoreOnEscape = true 
    } = options;

    if (savePrevious) {
      this.focusHistory.push(document.activeElement);
    }

    element.focus({ preventScroll });

    if (restoreOnEscape) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          this.restoreFocus();
          element.removeEventListener('keydown', handleEscape);
        }
      };
      element.addEventListener('keydown', handleEscape);
    }
  }

  restoreFocus() {
    const previousElement = this.focusHistory.pop();
    if (previousElement && previousElement.focus) {
      previousElement.focus();
    }
  }

  // Trap focus within a container
  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }

  // Check if animations should be reduced
  shouldReduceMotion() {
    return this.reducedMotion;
  }
}

// Global accessibility manager instance
window.a11y = new AccessibilityManager();