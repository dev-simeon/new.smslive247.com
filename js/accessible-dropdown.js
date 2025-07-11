/**
 * Accessible Dropdown Component
 * Replaces complex dropdowns with keyboard-navigable, screen-reader friendly alternatives
 */

class AccessibleDropdown {
  constructor(trigger, options = {}) {
    this.trigger = trigger;
    this.options = {
      closeOnClickOutside: true,
      closeOnEscape: true,
      announceStateChanges: true,
      ...options
    };

    this.menu = null;
    this.menuItems = [];
    this.isOpen = false;
    this.currentIndex = -1;

    this.init();
  }

  init() {
    this.setupStructure();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  setupStructure() {
    // Find or create menu
    const menuId = this.trigger.getAttribute('aria-controls') || 
                   this.trigger.getAttribute('data-dropdown-target');
    
    if (menuId) {
      this.menu = document.getElementById(menuId);
    } else {
      this.menu = this.trigger.nextElementSibling;
    }

    if (!this.menu) return;

    // Setup menu items
    this.menuItems = Array.from(this.menu.querySelectorAll('[role="menuitem"], a, button'));
    
    // Add IDs if missing
    if (!this.menu.id) {
      this.menu.id = `dropdown-menu-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Setup ARIA attributes
    this.trigger.setAttribute('aria-haspopup', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.trigger.setAttribute('aria-controls', this.menu.id);

    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-labelledby', this.trigger.id || '');
    this.menu.classList.add('hidden');

    // Setup menu items
    this.menuItems.forEach((item, index) => {
      if (!item.getAttribute('role')) {
        item.setAttribute('role', 'menuitem');
      }
      item.setAttribute('tabindex', '-1');
    });
  }

  setupEventListeners() {
    // Trigger events
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggle();
    });

    this.trigger.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.open();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.open();
          this.focusFirstItem();
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.open();
          this.focusLastItem();
          break;
      }
    });

    // Menu events
    if (this.menu) {
      this.menu.addEventListener('keydown', (e) => this.handleMenuKeydown(e));
      
      this.menuItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          this.selectItem(index);
        });
      });
    }

    // Close on outside click
    if (this.options.closeOnClickOutside) {
      document.addEventListener('click', (e) => {
        if (!this.trigger.contains(e.target) && !this.menu.contains(e.target)) {
          this.close();
        }
      });
    }

    // Close on escape
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          this.trigger.focus();
        }
      });
    }
  }

  setupAccessibility() {
    // Add screen reader instructions
    const instructions = document.createElement('div');
    instructions.className = 'sr-only';
    instructions.textContent = 'Use arrow keys to navigate menu items, Enter to select, Escape to close';
    this.menu.appendChild(instructions);
  }

  handleMenuKeydown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusNextItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusPreviousItem();
        break;
      case 'Home':
        e.preventDefault();
        this.focusFirstItem();
        break;
      case 'End':
        e.preventDefault();
        this.focusLastItem();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.selectCurrentItem();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        this.trigger.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.menu.classList.remove('hidden');
    this.trigger.setAttribute('aria-expanded', 'true');

    // Announce state change
    if (this.options.announceStateChanges && window.a11y) {
      window.a11y.announce('Menu opened');
    }

    // Focus first item
    this.focusFirstItem();
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.menu.classList.add('hidden');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.currentIndex = -1;

    // Announce state change
    if (this.options.announceStateChanges && window.a11y) {
      window.a11y.announce('Menu closed');
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  focusItem(index) {
    if (index < 0 || index >= this.menuItems.length) return;

    // Remove focus from current item
    if (this.currentIndex >= 0) {
      this.menuItems[this.currentIndex].setAttribute('tabindex', '-1');
    }

    // Focus new item
    this.currentIndex = index;
    this.menuItems[this.currentIndex].setAttribute('tabindex', '0');
    this.menuItems[this.currentIndex].focus();
  }

  focusFirstItem() {
    this.focusItem(0);
  }

  focusLastItem() {
    this.focusItem(this.menuItems.length - 1);
  }

  focusNextItem() {
    const nextIndex = (this.currentIndex + 1) % this.menuItems.length;
    this.focusItem(nextIndex);
  }

  focusPreviousItem() {
    const prevIndex = (this.currentIndex - 1 + this.menuItems.length) % this.menuItems.length;
    this.focusItem(prevIndex);
  }

  selectItem(index) {
    if (index >= 0 && index < this.menuItems.length) {
      const item = this.menuItems[index];
      
      // Trigger click if it's a link or button
      if (item.tagName === 'A' || item.tagName === 'BUTTON') {
        item.click();
      }
      
      // Announce selection
      if (this.options.announceStateChanges && window.a11y) {
        window.a11y.announce(`Selected ${item.textContent.trim()}`);
      }
    }
    
    this.close();
    this.trigger.focus();
  }

  selectCurrentItem() {
    if (this.currentIndex >= 0) {
      this.selectItem(this.currentIndex);
    }
  }
}

// Auto-initialize dropdowns
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
    new AccessibleDropdown(trigger);
  });
});