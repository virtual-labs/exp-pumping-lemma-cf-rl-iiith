// Interactive Controller for Pumping Lemma Simulation

class PumpingLemmaController {
  constructor() {
    this.currentLanguage = 'a*b*';
    this.currentLanguageType = 'regular';
    this.currentString = 'aaabbb';
    this.currentDecomposition = {
      regular: { x: 'a', y: 'a', z: 'abbb' },
      contextFree: { u: 'a', v: 'a', w: 'a', x: 'b', y: 'bb' }
    };
    this.pumpingResults = [];
    
    this.initializeEventListeners();
    this.updateInterface();
  }

  initializeEventListeners() {
    // Language type selection
    document.getElementById('languageType').addEventListener('change', (e) => {
      this.currentLanguageType = e.target.value;
      this.updateLanguageOptions();
      this.updateDecompositionDisplay();
    });

    // Predefined language selection
    document.getElementById('predefinedLanguage').addEventListener('change', (e) => {
      this.currentLanguage = e.target.value;
      if (e.target.value !== 'custom') {
        this.generateSampleStringForLanguage();
      }
      this.updateInterface();
    });

    // Test string input
    const testStringInput = document.getElementById('testString');
    testStringInput.addEventListener('input', debounce((e) => {
      this.currentString = e.target.value;
      this.updateDecompositionConstraints();
      this.updateDecompositionDisplay();
    }, 300));

    // String length slider
    document.getElementById('stringLength').addEventListener('input', (e) => {
      const length = parseInt(e.target.value);
      document.getElementById('stringLengthValue').textContent = length;
      this.generateStringOfLength(length);
    });

    // Generate string button
    const generateButton = document.getElementById('generateString');
    if (generateButton) {
      generateButton.addEventListener('click', () => {
        this.generateSampleStringForLanguage();
      });
    }

    // Regular decomposition sliders
    this.setupSliderListeners('regular');
    
    // Context-free decomposition sliders
    this.setupSliderListeners('contextFree');

    // Pumping controls
    const pumpCountSlider = document.getElementById('pumpCount');
    if (pumpCountSlider) {
      pumpCountSlider.addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        const valueDisplay = document.getElementById('pumpCountValue');
        if (valueDisplay) {
          valueDisplay.textContent = count;
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
  }

  setupSliderListeners(type) {
    if (type === 'regular') {
      ['xLength', 'yLength'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.addEventListener('input', (e) => {
            this.updateRegularDecomposition();
          });
        }
      });
    } else if (type === 'contextFree') {
      ['uLength', 'vLength', 'wLength', 'xLengthCF'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.addEventListener('input', (e) => {
            this.updateCFDecomposition();
          });
        }
      });
    }
  }

  updateLanguageOptions() {
    const predefinedSelect = document.getElementById('predefinedLanguage');
    const customInput = document.getElementById('customLanguageInput');
    
    // Clear options
    predefinedSelect.innerHTML = '<option value="custom">Custom Language</option>';
    
    // Add relevant options based on type
    Object.entries(LANGUAGE_DEFINITIONS).forEach(([key, lang]) => {
      if (this.currentLanguageType === 'regular' && lang.type === 'regular') {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `Regular: ${lang.name}`;
        predefinedSelect.appendChild(option);
      } else if (this.currentLanguageType === 'context-free' && lang.type === 'context-free') {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `Context-Free: ${lang.name}`;
        predefinedSelect.appendChild(option);
      }
    });

    // Show/hide custom input
    customInput.style.display = predefinedSelect.value === 'custom' ? 'block' : 'none';
  }

  generateSampleStringForLanguage() {
    const length = parseInt(document.getElementById('stringLength').value);
    const sampleString = generateSampleString(this.currentLanguage, length);
    
    document.getElementById('testString').value = sampleString;
    this.currentString = sampleString;
    this.updateDecompositionConstraints();
    this.updateDecompositionDisplay();
  }

  generateStringOfLength(length) {
    if (this.currentLanguage && this.currentLanguage !== 'custom') {
      const sampleString = generateSampleString(this.currentLanguage, length);
      document.getElementById('testString').value = sampleString;
      this.currentString = sampleString;
      this.updateDecompositionConstraints();
      this.updateDecompositionDisplay();
    }
  }

  updateDecompositionConstraints() {
    const stringLength = this.currentString.length;
    
    if (this.currentLanguageType === 'regular') {
      // Update max values for sliders
      const xSlider = document.getElementById('xLength');
      const ySlider = document.getElementById('yLength');
      
      if (xSlider && ySlider) {
        xSlider.max = Math.max(0, stringLength - 1);
        ySlider.max = stringLength;
        
        // Ensure current values are within bounds
        if (parseInt(xSlider.value) >= stringLength) {
          xSlider.value = Math.max(0, stringLength - 1);
        }
        if (parseInt(ySlider.value) > stringLength) {
          ySlider.value = Math.min(1, stringLength);
        }
      }
    } else if (this.currentLanguageType === 'context-free') {
      // Update max values for CF sliders
      ['uLength', 'vLength', 'wLength', 'xLengthCF'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
          slider.max = stringLength;
          if (parseInt(slider.value) > stringLength) {
            slider.value = Math.min(1, stringLength);
          }
        }
      });
    }
  }

  updateRegularDecomposition() {
    const xLength = parseInt(document.getElementById('xLength').value);
    const yLength = parseInt(document.getElementById('yLength').value);
    
    document.getElementById('xLengthValue').textContent = xLength;
    document.getElementById('yLengthValue').textContent = yLength;
    
    const stringLength = this.currentString.length;
    const zLength = Math.max(0, stringLength - xLength - yLength);
    
    // Ensure decomposition doesn't exceed string length
    const actualYLength = Math.min(yLength, stringLength - xLength);
    const actualZLength = stringLength - xLength - actualYLength;
    
    this.currentDecomposition.regular = {
      x: this.currentString.substring(0, xLength),
      y: this.currentString.substring(xLength, xLength + actualYLength),
      z: this.currentString.substring(xLength + actualYLength)
    };
    
    this.updateDecompositionDisplay();
  }

  updateCFDecomposition() {
    const uLength = parseInt(document.getElementById('uLength').value);
    const vLength = parseInt(document.getElementById('vLength').value);
    const wLength = parseInt(document.getElementById('wLength').value);
    const xLength = parseInt(document.getElementById('xLengthCF').value);
    
    document.getElementById('uLengthValue').textContent = uLength;
    document.getElementById('vLengthValue').textContent = vLength;
    document.getElementById('wLengthValue').textContent = wLength;
    document.getElementById('xLengthValueCF').textContent = xLength;
    
    const stringLength = this.currentString.length;
    const yLengthCalculated = Math.max(0, stringLength - uLength - vLength - wLength - xLength);
    
    // Adjust lengths to fit string
    const totalUsed = uLength + vLength + wLength + xLength;
    if (totalUsed > stringLength) {
      // Proportionally reduce lengths
      const scale = stringLength / totalUsed;
      const adjustedU = Math.floor(uLength * scale);
      const adjustedV = Math.floor(vLength * scale);
      const adjustedW = Math.floor(wLength * scale);
      const adjustedX = Math.floor(xLength * scale);
      const adjustedY = stringLength - adjustedU - adjustedV - adjustedW - adjustedX;
      
      this.currentDecomposition.contextFree = {
        u: this.currentString.substring(0, adjustedU),
        v: this.currentString.substring(adjustedU, adjustedU + adjustedV),
        w: this.currentString.substring(adjustedU + adjustedV, adjustedU + adjustedV + adjustedW),
        x: this.currentString.substring(adjustedU + adjustedV + adjustedW, adjustedU + adjustedV + adjustedW + adjustedX),
        y: this.currentString.substring(adjustedU + adjustedV + adjustedW + adjustedX)
      };
    } else {
      this.currentDecomposition.contextFree = {
        u: this.currentString.substring(0, uLength),
        v: this.currentString.substring(uLength, uLength + vLength),
        w: this.currentString.substring(uLength + vLength, uLength + vLength + wLength),
        x: this.currentString.substring(uLength + vLength + wLength, uLength + vLength + wLength + xLength),
        y: this.currentString.substring(uLength + vLength + wLength + xLength)
      };
    }
    
    this.updateDecompositionDisplay();
  }

  updateDecompositionDisplay() {
    const regularSection = document.getElementById('regularDecomposition');
    const cfSection = document.getElementById('cfDecomposition');
    
    if (this.currentLanguageType === 'regular') {
      regularSection.style.display = 'block';
      cfSection.style.display = 'none';
      this.displayRegularDecomposition();
    } else {
      regularSection.style.display = 'none';
      cfSection.style.display = 'block';
      this.displayCFDecomposition();
    }
  }

  displayRegularDecomposition() {
    const decomp = this.currentDecomposition.regular;
    const display = document.getElementById('regularStringDisplay');
    
    const html = formatStringWithSegments(
      [decomp.x, decomp.y, decomp.z],
      ['x', 'y', 'z']
    );
    
    display.innerHTML = html || '<span class="no-result">Enter a string to see decomposition</span>';
    
    // Update constraint status
    this.updateConstraintStatus('regular');
  }

  displayCFDecomposition() {
    const decomp = this.currentDecomposition.contextFree;
    const display = document.getElementById('cfStringDisplay');
    
    const html = formatStringWithSegments(
      [decomp.u, decomp.v, decomp.w, decomp.x, decomp.y],
      ['u', 'v', 'w', 'x', 'y']
    );
    
    display.innerHTML = html || '<span class="no-result">Enter a string to see decomposition</span>';
    
    // Update constraint status
    this.updateConstraintStatus('contextFree');
  }

  updateConstraintStatus(type) {
    const language = LANGUAGE_DEFINITIONS[this.currentLanguage];
    if (!language) return;
    
    const pumpingLength = language.pumpingLength;
    const decomposition = this.currentDecomposition[type === 'regular' ? 'regular' : 'contextFree'];
    
    const status = getConstraintStatus(this.currentLanguage, decomposition, pumpingLength);
    
    // Visual feedback could be added here
    // For now, we'll update it when generating results
  }

  generatePumpedString() {
    const pumpCount = parseInt(document.getElementById('pumpCount').value);
    let pumpedString = '';
    
    if (this.currentLanguageType === 'regular') {
      const { x, y, z } = this.currentDecomposition.regular;
      pumpedString = pumpRegularString(x, y, z, pumpCount);
    } else {
      const { u, v, w, x, y } = this.currentDecomposition.contextFree;
      pumpedString = pumpCFString(u, v, w, x, y, pumpCount);
    }
    
    // Display the pumped string
    const display = document.getElementById('pumpedStringDisplay');
    display.innerHTML = `<span class="result-string">"${pumpedString}"</span>`;
    
    // Store for membership testing
    this.currentPumpedString = pumpedString;
    
    // Clear previous membership result
    document.getElementById('membershipResult').innerHTML = '';
  }

  testCurrentMembership() {
    if (!this.currentPumpedString) {
      swal('Error', 'Please generate a pumped string first', 'error');
      return;
    }
    
    const result = testStringMembership(this.currentPumpedString, this.currentLanguage);
    const membershipDiv = document.getElementById('membershipResult');
    
    if (result.error) {
      membershipDiv.innerHTML = `<div class="membership-result membership-rejected">Error: ${result.error}</div>`;
    } else {
      const statusClass = result.accepted ? 'membership-accepted' : 'membership-rejected';
      const statusText = result.accepted ? 'ACCEPTED' : 'REJECTED';
      membershipDiv.innerHTML = `<div class="membership-result ${statusClass}">${statusText}</div>`;
    }
    
    // Update analysis
    this.updateAnalysis([{
      string: this.currentPumpedString,
      accepted: result.accepted,
      pumpCount: parseInt(document.getElementById('pumpCount').value)
    }]);
  }

  showAllPumpedStrings() {
    const results = [];
    
    // Test for i = 0, 1, 2
    for (let i = 0; i <= 2; i++) {
      let pumpedString = '';
      
      if (this.currentLanguageType === 'regular') {
        const { x, y, z } = this.currentDecomposition.regular;
        pumpedString = pumpRegularString(x, y, z, i);
      } else {
        const { u, v, w, x, y } = this.currentDecomposition.contextFree;
        pumpedString = pumpCFString(u, v, w, x, y, i);
      }
      
      const membershipResult = testStringMembership(pumpedString, this.currentLanguage);
      results.push({
        string: pumpedString,
        accepted: membershipResult.accepted,
        pumpCount: i,
        error: membershipResult.error
      });
    }
    
    this.displayAllResults(results);
    this.updateAnalysis(results);
  }

  displayAllResults(results) {
    const allResultsSection = document.getElementById('allResultsSection');
    const allResultsDisplay = document.getElementById('allResultsDisplay');
    
    allResultsSection.style.display = 'block';
    
    const html = results.map(result => {
      const statusClass = result.accepted ? 'status-accepted' : 'status-rejected';
      const statusText = result.accepted ? 'ACCEPTED' : 'REJECTED';
      
      return `
        <div class="result-item">
          <div class="result-info">
            <div class="result-string">"${result.string}"</div>
            <div class="result-pump-info">i = ${result.pumpCount}</div>
          </div>
          <div class="result-status ${statusClass}">${statusText}</div>
        </div>
      `;
    }).join('');
    
    allResultsDisplay.innerHTML = html;
  }

  updateAnalysis(results) {
    const analysisDiv = document.getElementById('lemmaAnalysis');
    const violationDiv = document.getElementById('violationFeedback');
    
    const analysis = analyzePumpingResults(results, this.currentLanguage, 
      this.currentDecomposition[this.currentLanguageType === 'regular' ? 'regular' : 'contextFree']);
    
    analysisDiv.innerHTML = `
      <h5>${analysis.conclusion}</h5>
      <p>${analysis.explanation}</p>
    `;
    
    if (analysis.violation) {
      violationDiv.style.display = 'block';
      document.getElementById('violationDetails').innerHTML = analysis.violationDetails;
    } else {
      violationDiv.style.display = 'none';
    }
  }

  updateInterface() {
    this.updateLanguageOptions();
    this.updateDecompositionConstraints();
    this.updateDecompositionDisplay();
    
    // Update language type selector
    document.getElementById('languageType').value = this.currentLanguageType;
    
    // Update predefined language selector
    if (this.currentLanguage !== 'custom') {
      document.getElementById('predefinedLanguage').value = this.currentLanguage;
    }
    
    // Update string input
    document.getElementById('testString').value = this.currentString;
  }
}

// Initialize controller when DOM is loaded
let pumpingController = null;

document.addEventListener('DOMContentLoaded', () => {
  pumpingController = new PumpingLemmaController();
});
