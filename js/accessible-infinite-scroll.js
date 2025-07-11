/**
 * Accessible Infinite Scroll Alternative
 * Replaces problematic infinite scroll with user-controlled pagination
 */

class AccessiblePagination {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      itemsPerPage: 10,
      loadMoreText: 'Load more items',
      loadingText: 'Loading more items...',
      noMoreText: 'No more items to load',
      announceNewItems: true,
      showPageNumbers: false,
      ...options
    };

    this.currentPage = 1;
    this.totalItems = 0;
    this.isLoading = false;
    this.hasMore = true;

    this.init();
  }

  init() {
    this.setupStructure();
    this.setupControls();
    this.setupAccessibility();
  }

  setupStructure() {
    // Create items container if it doesn't exist
    this.itemsContainer = this.container.querySelector('.pagination-items') || this.container;
    
    // Add ARIA attributes
    this.itemsContainer.setAttribute('role', 'region');
    this.itemsContainer.setAttribute('aria-label', 'Content list');
    this.itemsContainer.setAttribute('aria-live', 'polite');
    this.itemsContainer.setAttribute('aria-busy', 'false');

    // Count existing items
    this.totalItems = this.itemsContainer.children.length;
  }

  setupControls() {
    // Create controls container
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'pagination-controls mt-6 text-center';
    this.controlsContainer.setAttribute('role', 'navigation');
    this.controlsContainer.setAttribute('aria-label', 'Pagination controls');

    // Load more button
    this.loadMoreBtn = document.createElement('button');
    this.loadMoreBtn.className = 'load-more-btn px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    this.loadMoreBtn.textContent = this.options.loadMoreText;
    this.loadMoreBtn.setAttribute('aria-describedby', 'load-more-status');
    this.loadMoreBtn.addEventListener('click', () => this.loadMore());

    // Status message
    this.statusMessage = document.createElement('div');
    this.statusMessage.id = 'load-more-status';
    this.statusMessage.className = 'mt-2 text-sm text-gray-600';
    this.statusMessage.setAttribute('aria-live', 'polite');
    this.statusMessage.setAttribute('aria-atomic', 'true');

    // Page info (optional)
    if (this.options.showPageNumbers) {
      this.pageInfo = document.createElement('div');
      this.pageInfo.className = 'page-info mt-2 text-sm text-gray-500';
      this.pageInfo.setAttribute('aria-label', 'Page information');
      this.updatePageInfo();
      this.controlsContainer.appendChild(this.pageInfo);
    }

    this.controlsContainer.appendChild(this.loadMoreBtn);
    this.controlsContainer.appendChild(this.statusMessage);
    this.container.appendChild(this.controlsContainer);

    // Skip to content link
    this.createSkipLink();
  }

  setupAccessibility() {
    // Add keyboard navigation for items
    this.itemsContainer.addEventListener('keydown', (e) => {
      if (e.key === 'PageDown' && e.ctrlKey) {
        e.preventDefault();
        this.loadMore();
      }
    });

    // Respect reduced motion preference
    if (window.a11y && window.a11y.shouldReduceMotion()) {
      // Disable any smooth scrolling animations
      this.container.style.scrollBehavior = 'auto';
    }
  }

  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#pagination-end';
    skipLink.className = 'skip-to-end sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50';
    skipLink.textContent = 'Skip to end of list';
    
    this.container.insertBefore(skipLink, this.container.firstChild);

    // Create end anchor
    const endAnchor = document.createElement('div');
    endAnchor.id = 'pagination-end';
    endAnchor.setAttribute('tabindex', '-1');
    this.container.appendChild(endAnchor);
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;

    this.setLoading(true);

    try {
      // Simulate API call - replace with actual data fetching
      const newItems = await this.fetchMoreItems();
      
      if (newItems && newItems.length > 0) {
        this.addItems(newItems);
        this.currentPage++;
        
        // Announce new items
        if (this.options.announceNewItems && window.a11y) {
          window.a11y.announce(`Loaded ${newItems.length} more items. Total items: ${this.totalItems}`);
        }
      } else {
        this.hasMore = false;
        this.loadMoreBtn.disabled = true;
        this.loadMoreBtn.textContent = this.options.noMoreText;
        this.statusMessage.textContent = 'All items have been loaded.';
      }
    } catch (error) {
      console.error('Error loading more items:', error);
      this.statusMessage.textContent = 'Error loading items. Please try again.';
      
      if (window.a11y) {
        window.a11y.announce('Error loading more items', 'assertive');
      }
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(loading) {
    this.isLoading = loading;
    this.itemsContainer.setAttribute('aria-busy', loading.toString());
    
    if (loading) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.textContent = this.options.loadingText;
      this.statusMessage.textContent = 'Loading new items...';
    } else {
      this.loadMoreBtn.disabled = false;
      this.loadMoreBtn.textContent = this.hasMore ? this.options.loadMoreText : this.options.noMoreText;
      this.statusMessage.textContent = '';
    }
  }

  addItems(items) {
    const fragment = document.createDocumentFragment();
    
    items.forEach((itemData, index) => {
      const item = this.createItemElement(itemData, this.totalItems + index + 1);
      fragment.appendChild(item);
    });

    this.itemsContainer.appendChild(fragment);
    this.totalItems += items.length;
    
    if (this.options.showPageNumbers) {
      this.updatePageInfo();
    }

    // Focus the first new item for screen reader users
    const firstNewItem = this.itemsContainer.children[this.totalItems - items.length];
    if (firstNewItem) {
      firstNewItem.setAttribute('tabindex', '-1');
      firstNewItem.focus({ preventScroll: true });
      
      // Remove tabindex after focus
      setTimeout(() => {
        firstNewItem.removeAttribute('tabindex');
      }, 100);
    }
  }

  createItemElement(itemData, index) {
    // Override this method to create your specific item elements
    const item = document.createElement('div');
    item.className = 'pagination-item p-4 border-b border-gray-200';
    item.setAttribute('role', 'article');
    item.setAttribute('aria-label', `Item ${index}`);
    
    // Example content - customize based on your data structure
    item.innerHTML = `
      <h3 class="text-lg font-semibold">${itemData.title || `Item ${index}`}</h3>
      <p class="text-gray-600 mt-2">${itemData.description || `Description for item ${index}`}</p>
    `;
    
    return item;
  }

  updatePageInfo() {
    if (this.pageInfo) {
      this.pageInfo.textContent = `Page ${this.currentPage} • ${this.totalItems} items loaded`;
    }
  }

  // Override this method to implement actual data fetching
  async fetchMoreItems() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate data - replace with actual API call
    const items = [];
    const itemsToLoad = Math.min(this.options.itemsPerPage, 50 - this.totalItems); // Simulate finite data
    
    for (let i = 0; i < itemsToLoad; i++) {
      items.push({
        title: `Item ${this.totalItems + i + 1}`,
        description: `This is the description for item ${this.totalItems + i + 1}`
      });
    }
    
    return items;
  }
}

// Auto-initialize pagination
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.accessible-pagination').forEach(container => {
    new AccessiblePagination(container);
  });
});