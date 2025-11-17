// Interactive Controller for Pumping Lemma Simulation

// Create LANGUAGE_DATA structure from LANGUAGE_DEFINITIONS
const LANGUAGE_DATA = {
  regular: {},
  'context-free': {}
};

// Populate LANGUAGE_DATA from LANGUAGE_DEFINITIONS
Object.values(LANGUAGE_DEFINITIONS).forEach(lang => {
  if (lang.type === 'regular') {
    LANGUAGE_DATA.regular[lang.name] = {
      description: lang.description,
      recognizer: lang.recognizer,
      examples: lang.sampleStrings,
      generator: (length) => {
        // Simple generator based on language type
        if (lang.name === 'a*b*') {
          const aCount = Math.floor(length / 2);
          const bCount = length - aCount;
          return 'a'.repeat(aCount) + 'b'.repeat(bCount);
        } else if (lang.name === '(ab)*') {
          const pairs = Math.floor(length / 2);
          return 'ab'.repeat(pairs) + (length % 2 ? 'a' : '');
        }
        return lang.sampleStrings[0] || '';
      }
    };
  } else if (lang.type === 'context-free') {
    LANGUAGE_DATA['context-free'][lang.name] = {
      description: lang.description,
      recognizer: lang.recognizer,
      examples: lang.sampleStrings,
      generator: (length) => {
        // Simple generator based on language type
        if (lang.name === 'a^n b^n') {
          const n = Math.floor(length / 2);
          return 'a'.repeat(n) + 'b'.repeat(n);
        } else if (lang.name === 'Palindromes') {
          const half = Math.floor(length / 2);
          const firstHalf = 'a'.repeat(half);
          const middle = length % 2 ? 'b' : '';
          return firstHalf + middle + firstHalf.split('').reverse().join('');
        }
        return lang.sampleStrings[0] || '';
      }
    };
  }
});

class PumpingLemmaController {
  constructor() {
    this.currentLanguage = null;
    this.currentLanguageType = 'regular';
    this.currentString = '';
    this.currentDecomposition = {
      regular: { x: '', y: '', z: '' },
      contextFree: { u: '', v: '', w: '', x: '', y: '' }
    };
    this.pumpingResults = [];
    this.pumpCount = 1;
    
    // Initialize with a slight delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeEventListeners();
      this.updateInterface();
    }, 100);
  }

  initializeEventListeners() {
    // Language type buttons
    const regularBtn = document.getElementById('regularBtn');
    const cfBtn = document.getElementById('contextFreeBtn');
    
    console.log('Regular button found:', !!regularBtn);
    console.log('CF button found:', !!cfBtn);
    
    if (regularBtn) {
      regularBtn.addEventListener('click', () => {
        console.log('Regular button clicked');
        this.handleLanguageTypeChange('regular');
      });
    }
    
    if (cfBtn) {
      cfBtn.addEventListener('click', () => {
        console.log('Context-Free button clicked');
        this.handleLanguageTypeChange('context-free');
      });
    }

    // Test string input
    const testStringInput = document.getElementById('testString');
    if (testStringInput) {
      testStringInput.addEventListener('input', debounce((e) => {
        this.currentString = e.target.value;
        this.updateDecompositionConstraints();
        // Update decomposition calculations based on current language type
        if (this.currentLanguageType === 'regular') {
          this.updateRegularDecomposition();
        } else {
          this.updateCFDecomposition();
        }
        this.updateDecompositionDisplay();
        // Reset analysis and test results when string changes
        this.clearAnalysis();
        this.clearTestResults();
      }, 300));
    }

    // String length slider
    const stringLengthSlider = document.getElementById('stringLength');
    if (stringLengthSlider) {
      stringLengthSlider.addEventListener('input', (e) => {
        const length = parseInt(e.target.value);
        const valueDisplay = document.getElementById('stringLengthValue');
        if (valueDisplay) {
          valueDisplay.textContent = length;
        }
        this.generateStringOfLength(length);
      });
    }

    // Generate string button
    const generateButton = document.getElementById('generateString');
    if (generateButton) {
      generateButton.addEventListener('click', () => {
        this.generateSampleStringForLanguage();
      });
    }

    // Decomposition sliders
    this.setupSliderListeners('regular');
    this.setupSliderListeners('contextFree');

    // Pump count slider
    const pumpCountSlider = document.getElementById('pumpCount');
    if (pumpCountSlider) {
      pumpCountSlider.addEventListener('input', (e) => {
        this.pumpCount = parseInt(e.target.value);
        const valueDisplay = document.getElementById('pumpCountValue');
        if (valueDisplay) {
          valueDisplay.textContent = this.pumpCount;
        }
      });
    }

    // Action buttons
    const pumpButton = document.getElementById('pumpString');
    if (pumpButton) {
      pumpButton.addEventListener('click', () => {
        this.generatePumpedString();
      });
    }

    const testButton = document.getElementById('testMembership');
    if (testButton) {
      testButton.addEventListener('click', () => {
        this.testCurrentMembership();
      });
    }

    const showAllButton = document.getElementById('showAllPumped');
    if (showAllButton) {
      showAllButton.addEventListener('click', () => {
        this.showAllPumpedStrings();
      });
    }

    const analyzeButton = document.getElementById('analyzeLemma');
    if (analyzeButton) {
      analyzeButton.addEventListener('click', () => {
        this.performLemmaAnalysis();
      });
    }

    const resetButton = document.getElementById('resetAll');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetAll();
      });
    }

    // Initialize scroll to results pill
    this.initializeScrollPill();

    // Initialize predefined language buttons
    this.setupPredefinedLanguageButtons();
  }

  handleLanguageTypeChange(type) {
    console.log('Switching to language type:', type);
    this.currentLanguageType = type;
    
    // Update button states with visual feedback
    const regularBtn = document.getElementById('regularBtn');
    const cfBtn = document.getElementById('contextFreeBtn');
    
    console.log('Updating button states - Regular:', !!regularBtn, 'CF:', !!cfBtn);
    
    if (regularBtn) {
      regularBtn.classList.toggle('active', type === 'regular');
    }
    if (cfBtn) {
      cfBtn.classList.toggle('active', type === 'context-free');
    }
    
    // Reset current language selection
    this.currentLanguage = null;
    this.currentString = '';
    
    // Clear input field
    const testStringInput = document.getElementById('testString');
    if (testStringInput) {
      testStringInput.value = '';
    }
    
    // Update predefined language buttons for new type
    this.setupPredefinedLanguageButtons();
    
    // Update all UI components
    this.updateLanguageDisplay();
    this.updateDecompositionDisplay();
    this.updateStringVisualization();
    this.clearResults();
    
    // Show tab switch notification
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'info',
        title: `Switched to ${type === 'regular' ? 'Regular' : 'Context-Free'} Languages`,
        text: `Now showing ${type === 'regular' ? 'regular' : 'context-free'} language options`,
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  setupPredefinedLanguageButtons() {
    const container = document.querySelector('.predefined-language-buttons');
    if (!container) return;
    
    console.log('Setting up predefined buttons for:', this.currentLanguageType);
    container.innerHTML = '';
    
    const languages = LANGUAGE_DATA[this.currentLanguageType] || {};
    console.log('Available languages:', Object.keys(languages));
    
    if (Object.keys(languages).length === 0) {
      container.innerHTML = '<span class="no-content">No languages available</span>';
      return;
    }
    
    Object.keys(languages).forEach(langKey => {
      const button = document.createElement('button');
      button.className = 'predefined-btn';
      button.textContent = langKey;
      button.addEventListener('click', () => {
        console.log('Selected language:', langKey);
        this.handlePredefinedLanguageChange(langKey);
      });
      container.appendChild(button);
    });
    
    // Add some visual feedback
    const typeDisplay = this.currentLanguageType === 'context-free' ? 'Context-Free' : 'Regular';
    container.setAttribute('data-type', typeDisplay);
  }

  handlePredefinedLanguageChange(langKey) {
    this.currentLanguage = langKey;
    
    // Update button states
    const buttons = document.querySelectorAll('.predefined-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.textContent === langKey);
    });
    
    // Generate a sample string for this language
    this.generateSampleStringForLanguage();
    
    // Update UI
    this.updateLanguageDisplay();
    this.updateDecompositionDisplay();
    this.clearResults();
    
    // Initialize decomposition with some default values if we have a string
    if (this.currentString) {
      setTimeout(() => {
        this.initializeDecomposition();
      }, 200);
    }
  }
  
  initializeDecomposition() {
    const isRegular = this.currentLanguageType === 'regular';
    const stringLen = this.currentString.length;
    
    if (isRegular) {
      // Initialize regular decomposition: x=1, y=1, z=rest
      const xLen = Math.min(1, stringLen);
      const yLen = Math.min(1, Math.max(0, stringLen - xLen));
      
      this.currentDecomposition.regular = {
        x: this.currentString.substring(0, xLen),
        y: this.currentString.substring(xLen, xLen + yLen),
        z: this.currentString.substring(xLen + yLen)
      };
      
      // Update sliders
      const xSlider = document.getElementById('xLength');
      const ySlider = document.getElementById('yLength');
      if (xSlider) xSlider.value = xLen;
      if (ySlider) ySlider.value = yLen;
      
    } else {
      // Initialize context-free decomposition: u=1, v=1, w=middle, x=1, y=rest
      const uLen = Math.min(1, stringLen);
      const vLen = Math.min(1, Math.max(0, stringLen - uLen));
      const xLen = Math.min(1, Math.max(0, stringLen - uLen - vLen - 1));
      const wLen = Math.max(0, stringLen - uLen - vLen - xLen - 1);
      
      this.currentDecomposition.contextFree = {
        u: this.currentString.substring(0, uLen),
        v: this.currentString.substring(uLen, uLen + vLen),
        w: this.currentString.substring(uLen + vLen, uLen + vLen + wLen),
        x: this.currentString.substring(uLen + vLen + wLen, uLen + vLen + wLen + xLen),
        y: this.currentString.substring(uLen + vLen + wLen + xLen)
      };
      
      // Update sliders
      const uSlider = document.getElementById('uLength');
      const vSlider = document.getElementById('vLength');
      const wSlider = document.getElementById('wLength');
      const xSlider = document.getElementById('xLengthCF');
      if (uSlider) uSlider.value = uLen;
      if (vSlider) vSlider.value = vLen;
      if (wSlider) wSlider.value = wLen;
      if (xSlider) xSlider.value = xLen;
    }
    
    this.updateStringVisualization();
  }

  setupSliderListeners(type) {
    if (type === 'regular') {
      ['xLength', 'yLength'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.addEventListener('input', () => {
            this.updateRegularDecomposition();
            // Reset analysis and test results when decomposition changes
            this.clearAnalysis();
            this.clearTestResults();
          });
        }
      });
    } else if (type === 'contextFree') {
      ['uLength', 'vLength', 'wLength', 'xLengthCF'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.addEventListener('input', () => {
            this.updateCFDecomposition();
            // Reset analysis and test results when decomposition changes
            this.clearAnalysis();
            this.clearTestResults();
          });
        }
      });
    }
  }

  updateInterface() {
    // Initialize with regular languages selected
    this.handleLanguageTypeChange('regular');
    this.updateLanguageDisplay();
    this.updateDecompositionDisplay();
    this.updateResults();
  }

  updateLanguageDisplay() {
    const languageInfo = document.querySelector('.language-info');
    if (!languageInfo) return;

    if (this.currentLanguage) {
      const langData = LANGUAGE_DATA[this.currentLanguageType][this.currentLanguage];
      if (langData) {
        const typeColor = this.currentLanguageType === 'regular' ? '#22c55e' : '#8b5cf6';
        const typeDisplay = this.currentLanguageType === 'context-free' ? 'Context-Free' : 'Regular';
        
        languageInfo.innerHTML = `
          <h2 style="color: ${typeColor};">
            <span style="font-size: 0.8rem; opacity: 0.8;">${typeDisplay}</span><br>
            ${this.currentLanguage}
          </h2>
          <p>${langData.description}</p>
        `;
      }
    } else {
      const typeDisplay = this.currentLanguageType === 'context-free' ? 'Context-Free' : 'Regular';
      const typeColor = this.currentLanguageType === 'regular' ? '#22c55e' : '#8b5cf6';
      
      languageInfo.innerHTML = `
        <h2 style="color: ${typeColor};">Select a ${typeDisplay} Language</h2>
        <p>Choose a predefined ${this.currentLanguageType} language to get started</p>
      `;
    }
  }

  updateDecompositionDisplay() {
    const isRegular = this.currentLanguageType === 'regular';
    
    console.log('Updating decomposition display for:', this.currentLanguageType);
    
    // Show/hide appropriate decomposition sections
    const regularDecomp = document.getElementById('regularDecomposition');
    const cfDecomp = document.getElementById('cfDecomposition');
    
    console.log('Regular decomp element:', !!regularDecomp);
    console.log('CF decomp element:', !!cfDecomp);
    
    if (regularDecomp) {
      regularDecomp.style.display = isRegular ? 'block' : 'none';
    }
    if (cfDecomp) {
      cfDecomp.style.display = isRegular ? 'none' : 'block';
    }

    // Update string visualization
    this.updateStringVisualization();
    
    console.log('Updated decomposition display for:', this.currentLanguageType);
  }

  updateStringVisualization() {
    const isRegular = this.currentLanguageType === 'regular';
    const stringDisplayId = isRegular ? 'regularStringDisplay' : 'cfStringDisplay';
    const stringDisplay = document.getElementById(stringDisplayId);
    
    console.log('Updating string visualization, element found:', !!stringDisplay);
    
    if (!stringDisplay || !this.currentString) {
      if (stringDisplay) {
        stringDisplay.innerHTML = '<span class="no-content">Enter a string to visualize</span>';
      }
      return;
    }

    const decomp = this.currentDecomposition[isRegular ? 'regular' : 'contextFree'];
    
    let html = '';
    
    if (isRegular) {
      html = `
        <span class="string-segment segment-x">${decomp.x || ''}</span>
        <span class="string-segment segment-y">${decomp.y || ''}</span>
        <span class="string-segment segment-z">${decomp.z || ''}</span>
      `;
    } else {
      html = `
        <span class="string-segment segment-u">${decomp.u || ''}</span>
        <span class="string-segment segment-v">${decomp.v || ''}</span>
        <span class="string-segment segment-w">${decomp.w || ''}</span>
        <span class="string-segment segment-x">${decomp.x || ''}</span>
        <span class="string-segment segment-y">${decomp.y || ''}</span>
      `;
    }
    
    stringDisplay.innerHTML = html;
  }

  updateRegularDecomposition() {
    if (!this.currentString) return;

    const xLengthSlider = document.getElementById('xLength');
    const yLengthSlider = document.getElementById('yLength');
    
    if (!xLengthSlider || !yLengthSlider) return;

    const xLen = parseInt(xLengthSlider.value);
    const yLen = parseInt(yLengthSlider.value);
    
    // Update slider constraints
    const maxXY = Math.min(this.currentString.length - 1, 10); // Assuming p=10
    xLengthSlider.max = maxXY;
    yLengthSlider.max = Math.min(maxXY - xLen, this.currentString.length - xLen);
    
    // Update decomposition
    this.currentDecomposition.regular = {
      x: this.currentString.substring(0, xLen),
      y: this.currentString.substring(xLen, xLen + yLen),
      z: this.currentString.substring(xLen + yLen)
    };
    
    this.updateStringVisualization();
  }

  updateCFDecomposition() {
    if (!this.currentString) return;

    const uLengthSlider = document.getElementById('uLength');
    const vLengthSlider = document.getElementById('vLength');
    const wLengthSlider = document.getElementById('wLength');
    const xLengthSlider = document.getElementById('xLengthCF');
    
    if (!uLengthSlider || !vLengthSlider || !wLengthSlider || !xLengthSlider) return;

    const uLen = parseInt(uLengthSlider.value);
    const vLen = parseInt(vLengthSlider.value);
    const wLen = parseInt(wLengthSlider.value);
    const xLen = parseInt(xLengthSlider.value);
    
    const totalLen = uLen + vLen + wLen + xLen;
    const yLen = Math.max(0, this.currentString.length - totalLen);
    
    // Update decomposition
    this.currentDecomposition.contextFree = {
      u: this.currentString.substring(0, uLen),
      v: this.currentString.substring(uLen, uLen + vLen),
      w: this.currentString.substring(uLen + vLen, uLen + vLen + wLen),
      x: this.currentString.substring(uLen + vLen + wLen, uLen + vLen + wLen + xLen),
      y: this.currentString.substring(uLen + vLen + wLen + xLen)
    };
    
    this.updateStringVisualization();
  }

  updateDecompositionConstraints() {
    if (!this.currentString) return;

    // Update slider maxiums based on string length
    const stringLen = this.currentString.length;
    
    // Regular language sliders
    const xLengthSlider = document.getElementById('xLength');
    const yLengthSlider = document.getElementById('yLength');
    
    if (xLengthSlider) {
      xLengthSlider.max = Math.min(stringLen, 10);
    }
    if (yLengthSlider) {
      yLengthSlider.max = Math.min(stringLen, 10);
    }
    
    // Context-free language sliders
    ['uLength', 'vLength', 'wLength', 'xLengthCF'].forEach(sliderId => {
      const slider = document.getElementById(sliderId);
      if (slider) {
        slider.max = Math.min(stringLen, 10);
      }
    });
  }

  generateSampleStringForLanguage() {
    if (!this.currentLanguage) {
      this.showError('Please select a language first');
      return;
    }

    const langData = LANGUAGE_DATA[this.currentLanguageType][this.currentLanguage];
    if (!langData) {
      this.showError('Language data not found');
      return;
    }

    // Generate a sample string
    const sampleStrings = langData.examples || [];
    if (sampleStrings.length > 0) {
      // Filter out empty strings for better demonstration
      const nonEmptyStrings = sampleStrings.filter(s => s.length > 0);
      const stringsToUse = nonEmptyStrings.length > 0 ? nonEmptyStrings : sampleStrings;
      this.currentString = stringsToUse[Math.floor(Math.random() * stringsToUse.length)];
      
      const testStringInput = document.getElementById('testString');
      if (testStringInput) {
        testStringInput.value = this.currentString;
      }
      
      this.updateDecompositionConstraints();
      this.updateDecompositionDisplay();
      this.clearResults();
      
      // Show success message
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Sample Generated!',
          text: `Generated: "${this.currentString}"`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } else {
      this.showError('No sample strings available for this language');
    }
  }

  generateStringOfLength(length) {
    if (!this.currentLanguage) return;

    const langData = LANGUAGE_DATA[this.currentLanguageType][this.currentLanguage];
    if (!langData || !langData.generator) return;

    try {
      this.currentString = langData.generator(length);
      
      const testStringInput = document.getElementById('testString');
      if (testStringInput) {
        testStringInput.value = this.currentString;
      }
      
      this.updateDecompositionConstraints();
      // Update decomposition calculations based on current language type
      if (this.currentLanguageType === 'regular') {
        this.updateRegularDecomposition();
      } else {
        this.updateCFDecomposition();
      }
      this.updateDecompositionDisplay();
    } catch (error) {
      console.error('Error generating string:', error);
    }
  }

  generatePumpedString() {
    if (!this.currentString) {
      this.showError('Please enter a test string first');
      return;
    }

    const isRegular = this.currentLanguageType === 'regular';
    const decomp = this.currentDecomposition[isRegular ? 'regular' : 'contextFree'];
    
    let pumpedString = '';
    
    if (isRegular) {
      // For regular: xy^i z
      pumpedString = decomp.x + decomp.y.repeat(this.pumpCount) + decomp.z;
    } else {
      // For context-free: u v^i w x^i y
      pumpedString = decomp.u + decomp.v.repeat(this.pumpCount) + 
                    decomp.w + decomp.x.repeat(this.pumpCount) + decomp.y;
    }
    
    // Display pumped string
    const pumpedDisplay = document.querySelector('.pumped-string-display-main');
    if (pumpedDisplay) {
      pumpedDisplay.textContent = pumpedString;
    }
    
    // Test membership
    this.testStringMembership(pumpedString);
  }

  testCurrentMembership() {
    if (!this.currentString) {
      this.showError('Please enter a test string first');
      return;
    }
    
    this.testStringMembership(this.currentString);
  }

  testStringMembership(testString, showResult = true) {
    if (!this.currentLanguage) {
      if (showResult) this.showError('Please select a language first');
      return false;
    }

    const langData = LANGUAGE_DATA[this.currentLanguageType][this.currentLanguage];
    if (!langData || !langData.recognizer) {
      if (showResult) this.showError('Language recognizer not available');
      return false;
    }

    try {
      const isAccepted = langData.recognizer(testString);
      
      if (showResult) {
        const membershipDisplay = document.querySelector('.membership-result-main');
        if (membershipDisplay) {
          membershipDisplay.className = `membership-result-main ${isAccepted ? 'membership-accepted' : 'membership-rejected'}`;
          membershipDisplay.textContent = isAccepted ? '✓ Accepted' : '✗ Rejected';
        }
      }
      
      return isAccepted;
    } catch (error) {
      console.error('Error testing membership:', error);
      if (showResult) this.showError('Error testing string membership');
      return false;
    }
  }

  showAllPumpedStrings() {
    if (!this.currentString) {
      this.showError('Please enter a test string first');
      return;
    }

    if (!this.currentLanguage) {
      this.showError('Please select a language first');
      return;
    }

    this.pumpingResults = [];
    const isRegular = this.currentLanguageType === 'regular';
    const decomp = this.currentDecomposition[isRegular ? 'regular' : 'contextFree'];
    
    // Test pumping for i = 0, 1, 2, 3, 4
    for (let i = 0; i <= 4; i++) {
      let pumpedString = '';
      
      if (isRegular) {
        pumpedString = decomp.x + decomp.y.repeat(i) + decomp.z;
      } else {
        pumpedString = decomp.u + decomp.v.repeat(i) + 
                      decomp.w + decomp.x.repeat(i) + decomp.y;
      }
      
      const isAccepted = this.testStringMembership(pumpedString, false); // Don't show individual results
      
      this.pumpingResults.push({
        i: i,
        string: pumpedString,
        accepted: isAccepted
      });
    }
    
    // Show all results section
    const allResultsSection = document.getElementById('allResultsSection');
    if (allResultsSection) {
      allResultsSection.style.display = 'block';
    }
    
    this.updateResults();
    
    // Show success message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'info',
        title: 'All Tests Complete!',
        text: `Tested pumping for i = 0, 1, 2, 3, 4`,
        timer: 2000,
        showConfirmButton: false
      });
    }

    // Don't update scroll pill visibility here - only when analysis is performed
  }

  performLemmaAnalysis() {
    if (this.pumpingResults.length === 0) {
      this.showAllPumpedStrings();
      // Wait a moment for results to populate, then analyze
      setTimeout(() => {
        this.analyzeResults();
        this.updateScrollPillVisibility();
      }, 200);
    } else {
      this.analyzeResults();
      // Update pill visibility immediately after analysis
      setTimeout(() => this.updateScrollPillVisibility(), 100);
    }
  }
  
  analyzeResults() {
    // Analyze results for pumping lemma violations
    const violations = this.pumpingResults.filter(result => !result.accepted);
    
    const analysisContent = document.querySelector('.analysis-content');
    const violationSection = document.getElementById('violationFeedback');
    const violationDetails = document.getElementById('violationDetails');
    
    if (analysisContent) {
      if (violations.length > 0) {
        analysisContent.innerHTML = `
          <strong>⚠️ Pumping Lemma Violation Detected!</strong><br><br>
          Found ${violations.length} pumped string(s) that are <strong>not</strong> in the language:<br>
          ${violations.map(v => `• i=${v.i}: "${v.string}"`).join('<br>')}<br><br>
          <em>This suggests the current decomposition violates the pumping lemma.</em>
        `;
        
        if (violationSection) {
          violationSection.style.display = 'block';
        }
        if (violationDetails) {
          violationDetails.innerHTML = `
            The pumping lemma states that for ${this.currentLanguageType} languages, 
            if we can find the right decomposition, ALL pumped strings should be in the language. 
            Since we found violations, either:<br>
            • This decomposition is incorrect, OR<br>
            • The language might not be ${this.currentLanguageType}
          `;
        }
      } else {
        analysisContent.innerHTML = `
          <strong>✅ No Violations Found</strong><br><br>
          All pumped strings are accepted by the language:<br>
          ${this.pumpingResults.map(r => `• i=${r.i}: "${r.string}" ✓`).join('<br>')}<br><br>
          <em>This decomposition satisfies the pumping lemma for this string.</em>
        `;
        
        if (violationSection) {
          violationSection.style.display = 'none';
        }
      }
    }
    
    // Show analysis complete message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: violations.length > 0 ? 'warning' : 'success',
        title: 'Analysis Complete!',
        text: violations.length > 0 ? 
          `Found ${violations.length} violation(s)` : 
          'All tests passed!',
        timer: 2000,
        showConfirmButton: false
      });
    }

    // Update scroll pill visibility after analysis
    setTimeout(() => this.updateScrollPillVisibility(), 100);
  }

  updateResults() {
    const resultsContainer = document.querySelector('.results-list');
    if (!resultsContainer) return;

    if (this.pumpingResults.length === 0) {
      resultsContainer.innerHTML = '<div class="no-content">Click "Test All" to see pumping results</div>';
      return;
    }

    resultsContainer.innerHTML = this.pumpingResults.map(result => `
      <div class="result-item">
        <div class="result-info">
          <div class="result-string">"${result.string}"</div>
          <div class="result-pump-info">Pump count: i = ${result.i}</div>
        </div>
        <div class="result-status ${result.accepted ? 'status-accepted' : 'status-rejected'}">
          ${result.accepted ? '✓ Accept' : '✗ Reject'}
        </div>
      </div>
    `).join('');
  }

  clearResults() {
    this.pumpingResults = [];
    this.updateResults();
    
    const pumpedDisplay = document.querySelector('.pumped-string-display-main');
    if (pumpedDisplay) {
      pumpedDisplay.innerHTML = '<span class="no-content">No pumped string yet</span>';
    }
    
    const membershipDisplay = document.querySelector('.membership-result-main');
    if (membershipDisplay) {
      membershipDisplay.className = 'membership-result-main';
      membershipDisplay.innerHTML = '<span class="no-content">Test a string</span>';
    }
    
    const analysisContent = document.querySelector('.analysis-content');
    if (analysisContent) {
      analysisContent.innerHTML = '<span class="no-content">Run analysis to see results</span>';
    }
  }

  clearAnalysis() {
    // Clear only the analysis section without affecting other results
    const analysisContent = document.querySelector('.analysis-content');
    const violationSection = document.getElementById('violationFeedback');
    
    if (analysisContent) {
      analysisContent.innerHTML = '<span class="no-content">Run analysis to see results</span>';
    }
    if (violationSection) {
      violationSection.style.display = 'none';
    }
    
    // Update scroll pill visibility after clearing analysis
    setTimeout(() => this.updateScrollPillVisibility(), 100);
  }

  clearTestResults() {
    // Clear only the test results without affecting analysis
    this.pumpingResults = [];
    this.updateResults();
    
    const pumpedDisplay = document.querySelector('.pumped-string-display-main');
    if (pumpedDisplay) {
      pumpedDisplay.innerHTML = '<span class="no-content">No pumped string yet</span>';
    }
    
    const membershipDisplay = document.querySelector('.membership-result-main');
    if (membershipDisplay) {
      membershipDisplay.className = 'membership-result-main';
      membershipDisplay.innerHTML = '<span class="no-content">Test a string</span>';
    }
    
    // Hide the all results section
    const allResultsSection = document.getElementById('allResultsSection');
    if (allResultsSection) {
      allResultsSection.style.display = 'none';
    }
  }

  resetAll() {
    // Reset string input
    const testStringInput = document.getElementById('testString');
    if (testStringInput) {
      testStringInput.value = '';
    }

    // Reset string length slider
    const stringLengthSlider = document.getElementById('stringLength');
    const stringLengthValue = document.getElementById('stringLengthValue');
    if (stringLengthSlider && stringLengthValue) {
      stringLengthSlider.value = '6';
      stringLengthValue.textContent = '6';
    }

    // Reset pump count slider
    const pumpCountSlider = document.getElementById('pumpCount');
    const pumpCountValue = document.getElementById('pumpCountValue');
    if (pumpCountSlider && pumpCountValue) {
      pumpCountSlider.value = '1';
      pumpCountValue.textContent = '1';
      this.pumpCount = 1;
    }

    // Reset decomposition sliders based on current language type
    if (this.currentLanguageType === 'regular') {
      // Reset xyz sliders
      const xSlider = document.getElementById('xLength');
      const ySlider = document.getElementById('yLength');
      const xValue = document.getElementById('xLengthValue');
      const yValue = document.getElementById('yLengthValue');
      
      if (xSlider && xValue) {
        xSlider.value = '1';
        xValue.textContent = '1';
      }
      if (ySlider && yValue) {
        ySlider.value = '1';
        yValue.textContent = '1';
      }
    } else {
      // Reset uvwxy sliders
      const uSlider = document.getElementById('uLength');
      const vSlider = document.getElementById('vLength');
      const wSlider = document.getElementById('wLength');
      const xSlider = document.getElementById('xLengthCF');
      const uValue = document.getElementById('uLengthValue');
      const vValue = document.getElementById('vLengthValue');
      const wValue = document.getElementById('wLengthValue');
      const xValue = document.getElementById('xLengthValueCF');
      
      if (uSlider && uValue) {
        uSlider.value = '1';
        uValue.textContent = '1';
      }
      if (vSlider && vValue) {
        vSlider.value = '1';
        vValue.textContent = '1';
      }
      if (wSlider && wValue) {
        wSlider.value = '1';
        wValue.textContent = '1';
      }
      if (xSlider && xValue) {
        xSlider.value = '1';
        xValue.textContent = '1';
      }
    }

    // Clear all displays
    const regularStringDisplay = document.getElementById('regularStringDisplay');
    const cfStringDisplay = document.getElementById('cfStringDisplay');
    const pumpedStringDisplay = document.getElementById('pumpedStringDisplay');
    const membershipResult = document.getElementById('membershipResult');
    
    if (regularStringDisplay) {
      regularStringDisplay.innerHTML = '<span class="no-content">Enter a string to see decomposition</span>';
    }
    if (cfStringDisplay) {
      cfStringDisplay.innerHTML = '<span class="no-content">Enter a string to see decomposition</span>';
    }
    if (pumpedStringDisplay) {
      pumpedStringDisplay.innerHTML = '<span class="no-content">Generate a pumped string to see result</span>';
    }
    if (membershipResult) {
      membershipResult.innerHTML = '';
    }

    // Clear analysis
    const analysisContent = document.querySelector('.analysis-content');
    const violationSection = document.getElementById('violationFeedback');
    
    if (analysisContent) {
      analysisContent.innerHTML = '<p>Configure string decomposition and test pumping to see analysis</p>';
    }
    if (violationSection) {
      violationSection.style.display = 'none';
    }

    // Clear results
    const resultsContainer = document.querySelector('.results-list');
    const allResultsSection = document.getElementById('allResultsSection');
    const individualResultSection = document.getElementById('individualResultSection');
    
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="no-content">Click "Test All" to see pumping results</div>';
    }
    if (allResultsSection) {
      allResultsSection.style.display = 'none';
    }
    if (individualResultSection) {
      individualResultSection.style.display = 'none';
    }

    // Reset internal state
    this.currentString = '';
    this.pumpingResults = [];
    this.decomposition = null;

    // Reset to first language (a*b*)
    const firstLanguageBtn = document.querySelector('.predefined-btn[data-lang="a*b*"]');
    if (firstLanguageBtn) {
      // Remove active class from all buttons
      document.querySelectorAll('.predefined-btn').forEach(btn => btn.classList.remove('active'));
      // Add active class to first button
      firstLanguageBtn.classList.add('active');
      // Select the language
      this.selectLanguage('a*b*');
    }

    // Show success message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'success',
        title: 'Reset Complete!',
        text: 'All values have been reset to defaults',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  initializeScrollPill() {
    const scrollPill = document.getElementById('scrollToResultsPill');
    if (!scrollPill) return;

    // Handle pill click - scroll to analysis section
    scrollPill.addEventListener('click', () => {
      const analysisContainer = document.querySelector('.analysis-container');
      if (analysisContainer) {
        analysisContainer.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });

    // Handle scroll detection
    const handleScroll = () => {
      const analysisContainer = document.querySelector('.analysis-container');
      if (!analysisContainer) return;

      const rect = analysisContainer.getBoundingClientRect();
      // More generous threshold - show pill if analysis is mostly below the fold
      const isVisible = rect.top < (window.innerHeight * 0.7) && rect.bottom > 0;
      
      // Show pill only if analysis is not visible and there's actual analysis content (not default messages)
      const analysisContent = document.querySelector('.analysis-content');
      const hasAnalysisResults = analysisContent && 
                                analysisContent.textContent?.trim() !== 'Configure string decomposition and test pumping to see analysis' &&
                                analysisContent.textContent?.trim() !== 'Run analysis to see results' &&
                                !analysisContent.textContent?.includes('no-content');
      
      console.log('Scroll pill check:', { isVisible, hasAnalysisResults, rectTop: rect.top, windowHeight: window.innerHeight });
      
      if (isVisible || !hasAnalysisResults) {
        scrollPill.classList.remove('visible');
      } else {
        scrollPill.classList.add('visible');
      }
    };

    // Add scroll listener with throttling
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleScroll, 100);
    });

    // Initial check
    setTimeout(handleScroll, 500);
  }

  updateScrollPillVisibility() {
    // Call this method when analysis content changes
    const scrollPill = document.getElementById('scrollToResultsPill');
    if (!scrollPill) return;

    const analysisContainer = document.querySelector('.analysis-container');
    if (!analysisContainer) return;

    const rect = analysisContainer.getBoundingClientRect();
    // More generous threshold - show pill if analysis is mostly below the fold
    const isVisible = rect.top < (window.innerHeight * 0.7) && rect.bottom > 0;
    
    // Show pill only if analysis is not visible and there's actual analysis content (not default messages)
    const analysisContent = document.querySelector('.analysis-content');
    const hasAnalysisResults = analysisContent && 
                              analysisContent.textContent?.trim() !== 'Configure string decomposition and test pumping to see analysis' &&
                              analysisContent.textContent?.trim() !== 'Run analysis to see results' &&
                              !analysisContent.textContent?.includes('no-content');
    
    console.log('Update scroll pill:', { isVisible, hasAnalysisResults, rectTop: rect.top, windowHeight: window.innerHeight });
    
    if (isVisible || !hasAnalysisResults) {
      scrollPill.classList.remove('visible');
    } else {
      scrollPill.classList.add('visible');
    }
  }

  showError(message) {
    // Use SweetAlert if available, otherwise use alert
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message
      });
    } else {
      alert(message);
    }
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize the controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.pumpingController = new PumpingLemmaController();
});
