// Main Application Entry Point for Pumping Lemma Simulation

// Application state
const AppState = {
  initialized: false,
  currentView: 'main',
  settings: {
    autoUpdate: true,
    showHints: true,
    animationSpeed: 'normal'
  }
};

// Initialize application
function initializeApp() {
  if (AppState.initialized) return;
  
  console.log('Initializing Pumping Lemma Simulation...');
  
  // Set up global error handling
  setupErrorHandling();
  
  // Initialize UI components
  initializeUI();
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts();
  
  // Mark as initialized
  AppState.initialized = true;
  
  console.log('Pumping Lemma Simulation initialized successfully');
}

// Set up error handling
function setupErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Application Error:', event.error);
    showErrorMessage('An unexpected error occurred. Please refresh and try again.');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    showErrorMessage('A processing error occurred. Please try again.');
  });
}

// Initialize UI components
function initializeUI() {
  // Add loading states to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.disabled) {
        addLoadingState(button);
        // Remove loading state after a short delay
        setTimeout(() => removeLoadingState(button), 500);
      }
    });
  });
  
  // Add tooltips to constraint indicators
  addConstraintTooltips();
  
  // Initialize help system
  initializeHelpSystem();
  
  // Set up responsive behavior
  setupResponsiveBehavior();
}

// Add loading state to buttons
function addLoadingState(button) {
  if (button.classList.contains('loading')) return;
  
  button.classList.add('loading');
  button.disabled = true;
  
  const originalText = button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = 'Processing...';
}

// Remove loading state from buttons
function removeLoadingState(button) {
  button.classList.remove('loading');
  button.disabled = false;
  
  if (button.dataset.originalText) {
    button.textContent = button.dataset.originalText;
    delete button.dataset.originalText;
  }
}

// Add tooltips to constraint indicators
function addConstraintTooltips() {
  const tooltipElements = [
    { selector: '.decomposition-formula', tooltip: 'Mathematical formulation of the pumping lemma' },
    { selector: '.slider', tooltip: 'Drag to adjust segment lengths' },
    { selector: '.string-segment', tooltip: 'Click to highlight this segment' }
  ];
  
  tooltipElements.forEach(({ selector, tooltip }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.setAttribute('data-tooltip', tooltip);
      el.classList.add('tooltip');
    });
  });
}

// Initialize help system
function initializeHelpSystem() {
  // Add help button to panels
  const panelHeaders = document.querySelectorAll('.panel-header');
  panelHeaders.forEach(header => {
    const helpBtn = document.createElement('button');
    helpBtn.className = 'help-btn';
    helpBtn.innerHTML = '?';
    helpBtn.style.cssText = `
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.2);
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      color: white;
      cursor: pointer;
      font-size: 12px;
    `;
    
    header.style.position = 'relative';
    header.appendChild(helpBtn);
    
    helpBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showContextualHelp(header.textContent.trim());
    });
  });
}

// Show contextual help
function showContextualHelp(section) {
  const helpContent = {
    'Language Configuration': `
      <h4>Language Configuration Help</h4>
      <p>Choose between Regular and Context-Free languages to test different pumping lemmas.</p>
      <ul>
        <li><strong>Regular Languages:</strong> Use xyz decomposition with constraints |xy| ≤ p, |y| ≥ 1</li>
        <li><strong>Context-Free Languages:</strong> Use uvwxy decomposition with constraints |vwx| ≤ p, |vx| ≥ 1</li>
      </ul>
    `,
    'Test String Configuration': `
      <h4>Test String Help</h4>
      <p>Enter a string to test against the pumping lemma conditions.</p>
      <ul>
        <li>Use the slider to control string length</li>
        <li>Click "Generate Sample" for language-appropriate strings</li>
        <li>Longer strings are more likely to reveal pumping lemma violations</li>
      </ul>
    `,
    'String Decomposition': `
      <h4>String Decomposition Help</h4>
      <p>Decompose your string according to the pumping lemma format:</p>
      <ul>
        <li><strong>Regular (xyz):</strong> x is prefix, y is pumpable part, z is suffix</li>
        <li><strong>Context-Free (uvwxy):</strong> v and x are pumpable parts that must be pumped together</li>
      </ul>
    `,
    'Pumping Control': `
      <h4>Pumping Control Help</h4>
      <p>Control how many times to "pump" the repeatable segments:</p>
      <ul>
        <li><strong>i = 0:</strong> Delete the pumpable parts</li>
        <li><strong>i = 1:</strong> Keep original string</li>
        <li><strong>i > 1:</strong> Repeat pumpable parts i times</li>
      </ul>
    `,
    'Results & Analysis': `
      <h4>Results & Analysis Help</h4>
      <p>View the results of pumping and analyze violations:</p>
      <ul>
        <li><strong>Green (Accepted):</strong> String is in the language</li>
        <li><strong>Red (Rejected):</strong> String violates language rules</li>
        <li>If any pumped string is rejected, you've found a pumping lemma violation!</li>
      </ul>
    `
  };
  
  const content = helpContent[section] || '<p>Help information not available for this section.</p>';
  
  swal({
    title: section,
    content: {
      element: 'div',
      attributes: {
        innerHTML: content
      }
    },
    buttons: {
      confirm: {
        text: 'Got it!',
        className: 'btn btn-primary'
      }
    }
  });
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Generate pumped string
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('pumpString').click();
    }
    
    // Ctrl/Cmd + T: Test membership
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      document.getElementById('testMembership').click();
    }
    
    // Ctrl/Cmd + A: Show all pumped strings
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      document.getElementById('showAllPumped').click();
    }
    
    // Escape: Clear results
    if (e.key === 'Escape') {
      clearResults();
    }
    
    // F1: Show help
    if (e.key === 'F1') {
      e.preventDefault();
      showGeneralHelp();
    }
  });
}

// Set up responsive behavior
function setupResponsiveBehavior() {
  // Handle mobile/tablet layout changes
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  function handleResponsiveChange(e) {
    const isMobile = e.matches;
    
    // Adjust slider sensitivity for mobile
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
      if (isMobile) {
        slider.style.height = '6px';
      } else {
        slider.style.height = '4px';
      }
    });
    
    // Adjust button layout for mobile
    const buttonGroups = document.querySelectorAll('.pump-actions');
    buttonGroups.forEach(group => {
      if (isMobile) {
        group.style.flexDirection = 'column';
      } else {
        group.style.flexDirection = 'row';
      }
    });
  }
  
  mediaQuery.addListener(handleResponsiveChange);
  handleResponsiveChange(mediaQuery);
}

// Clear all results
function clearResults() {
  document.getElementById('pumpedStringDisplay').innerHTML = '<span class="no-result">No pumped string generated yet</span>';
  document.getElementById('membershipResult').innerHTML = '';
  document.getElementById('allResultsSection').style.display = 'none';
  document.getElementById('violationFeedback').style.display = 'none';
  document.getElementById('lemmaAnalysis').innerHTML = '<p>Configure string decomposition and test pumping to see analysis</p>';
}

// Show general help
function showGeneralHelp() {
  const helpContent = `
    <div style="text-align: left;">
      <h4>Pumping Lemma Simulation Help</h4>
      <p>This tool helps you understand and explore the pumping lemma for regular and context-free languages.</p>
      
      <h5>How to Use:</h5>
      <ol>
        <li>Select a language type (Regular or Context-Free)</li>
        <li>Choose a predefined language or describe your own</li>
        <li>Enter a test string (or generate one)</li>
        <li>Adjust the string decomposition using sliders</li>
        <li>Set the pumping count and test membership</li>
        <li>Analyze the results for pumping lemma violations</li>
      </ol>
      
      <h5>Keyboard Shortcuts:</h5>
      <ul>
        <li><kbd>Ctrl+Enter</kbd>: Generate pumped string</li>
        <li><kbd>Ctrl+T</kbd>: Test membership</li>
        <li><kbd>Ctrl+A</kbd>: Show all pumped strings</li>
        <li><kbd>Esc</kbd>: Clear results</li>
        <li><kbd>F1</kbd>: Show this help</li>
      </ul>
    </div>
  `;
  
  swal({
    title: 'Help',
    content: {
      element: 'div',
      attributes: {
        innerHTML: helpContent
      }
    },
    buttons: {
      confirm: {
        text: 'Close',
        className: 'btn btn-primary'
      }
    }
  });
}

// Show error message
function showErrorMessage(message) {
  swal({
    title: 'Error',
    text: message,
    icon: 'error',
    buttons: {
      confirm: {
        text: 'OK',
        className: 'btn btn-primary'
      }
    }
  });
}

// Show success message
function showSuccessMessage(message) {
  swal({
    title: 'Success',
    text: message,
    icon: 'success',
    timer: 2000,
    buttons: false
  });
}

// Performance monitoring
const PerformanceMonitor = {
  startTime: Date.now(),
  
  logAction(action) {
    const timestamp = Date.now();
    const elapsed = timestamp - this.startTime;
    console.log(`[${elapsed}ms] ${action}`);
  },
  
  measureFunction(fn, name) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${(end - start).toFixed(2)} milliseconds`);
    return result;
  }
};

// Export utilities for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeApp,
    showErrorMessage,
    showSuccessMessage,
    clearResults,
    PerformanceMonitor
  };
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page hidden - pausing animations');
  } else {
    console.log('Page visible - resuming animations');
  }
});

// Performance optimization: Lazy load non-critical features
window.addEventListener('load', () => {
  // Add any heavy computations or non-essential features here
  setTimeout(() => {
    console.log('Lazy loading complete');
  }, 1000);
});
