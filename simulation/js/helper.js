// Helper Functions for Pumping Lemma Simulation

/**
 * Validates string decomposition for regular languages (xyz)
 */
function validateRegularDecomposition(string, x, y, z, pumpingLength) {
  const errors = [];
  
  // Check if decomposition matches original string
  if (x + y + z !== string) {
    errors.push('Decomposition does not match original string');
  }
  
  // Check |xy| ≤ p constraint
  if ((x + y).length > pumpingLength) {
    errors.push(`|xy| = ${(x + y).length} > pumping length ${pumpingLength}`);
  }
  
  // Check |y| ≥ 1 constraint
  if (y.length === 0) {
    errors.push('y cannot be empty (|y| ≥ 1 required)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates string decomposition for context-free languages (uvwxy)
 */
function validateCFDecomposition(string, u, v, w, x, y, pumpingLength) {
  const errors = [];
  
  // Check if decomposition matches original string
  if (u + v + w + x + y !== string) {
    errors.push('Decomposition does not match original string');
  }
  
  // Check |vwx| ≤ p constraint
  if ((v + w + x).length > pumpingLength) {
    errors.push(`|vwx| = ${(v + w + x).length} > pumping length ${pumpingLength}`);
  }
  
  // Check |vx| ≥ 1 constraint
  if (v.length === 0 && x.length === 0) {
    errors.push('v and x cannot both be empty (|vx| ≥ 1 required)');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generates pumped string for regular languages
 */
function pumpRegularString(x, y, z, pumpCount) {
  if (pumpCount === 0) {
    return x + z; // Remove y (pump down)
  }
  return x + y.repeat(pumpCount) + z;
}

/**
 * Generates pumped string for context-free languages
 */
function pumpCFString(u, v, w, x, y, pumpCount) {
  if (pumpCount === 0) {
    return u + w + y; // Remove v and x (pump down)
  }
  return u + v.repeat(pumpCount) + w + x.repeat(pumpCount) + y;
}

/**
 * Tests if a string belongs to a given language
 */
function testStringMembership(string, languageKey) {
  const language = LANGUAGE_DEFINITIONS[languageKey];
  if (!language) {
    return { accepted: false, error: 'Unknown language' };
  }
  
  try {
    const accepted = language.recognizer(string);
    return { accepted: accepted, error: null };
  } catch (error) {
    return { accepted: false, error: error.message };
  }
}

/**
 * Generates sample strings for a given language and length
 */
function generateSampleString(languageKey, length) {
  const examples = EXAMPLE_STRINGS;
  const language = LANGUAGE_DEFINITIONS[languageKey];
  
  if (!language) return '';
  
  // Try to get predefined example for this length
  const langType = language.type === 'context-free' ? 'contextFree' : 'regular';
  if (examples[langType] && examples[langType][languageKey] && examples[langType][languageKey][length]) {
    return examples[langType][languageKey][length];
  }
  
  // Generate based on language type
  switch (languageKey) {
    case 'a*b*':
      const aCount = Math.floor(length / 2);
      const bCount = length - aCount;
      return 'a'.repeat(aCount) + 'b'.repeat(bCount);
      
    case '(ab)*':
      const pairs = Math.floor(length / 2);
      return 'ab'.repeat(pairs) + (length % 2 ? 'a' : '');
      
    case 'a^nb^n':
      const halfLength = Math.floor(length / 2);
      return 'a'.repeat(halfLength) + 'b'.repeat(halfLength);
      
    case 'palindromes':
      const half = Math.floor(length / 2);
      const center = length % 2 ? 'c' : '';
      const leftHalf = 'a'.repeat(half);
      const rightHalf = leftHalf.split('').reverse().join('');
      return leftHalf + center + rightHalf;
      
    case 'a^nb^nc^n':
      const thirdLength = Math.floor(length / 3);
      return 'a'.repeat(thirdLength) + 'b'.repeat(thirdLength) + 'c'.repeat(thirdLength);
      
    default:
      return 'a'.repeat(length);
  }
}

/**
 * Analyzes pumping lemma results and provides feedback
 */
function analyzePumpingResults(results, languageKey, decomposition) {
  const language = LANGUAGE_DEFINITIONS[languageKey];
  const analysis = {
    conclusion: '',
    explanation: '',
    violation: false,
    violationDetails: ''
  };
  
  // Check if all pumped strings are accepted
  const allAccepted = results.every(result => result.accepted);
  const someRejected = results.some(result => !result.accepted);
  
  if (someRejected) {
    analysis.violation = true;
    analysis.conclusion = 'Pumping Lemma Violation Detected!';
    analysis.explanation = `Not all pumped strings are accepted by the language. This suggests that either:
    1. The language is not ${language.type === 'regular' ? 'regular' : 'context-free'}, or
    2. The current decomposition doesn't satisfy the pumping lemma conditions.`;
    
    const rejectedResults = results.filter(result => !result.accepted);
    analysis.violationDetails = `Rejected strings: ${rejectedResults.map(r => `"${r.string}" (i=${r.pumpCount})`).join(', ')}`;
  } else {
    analysis.conclusion = 'No Violation Found';
    analysis.explanation = `All pumped strings are accepted by the language. This decomposition satisfies the pumping lemma conditions for the tested values. However, this doesn't prove the language is ${language.type === 'regular' ? 'regular' : 'context-free'} - you would need to show this holds for ALL possible decompositions.`;
  }
  
  return analysis;
}

/**
 * Formats a string with segment highlighting
 */
function formatStringWithSegments(segments, segmentTypes) {
  const segmentClasses = {
    'x': 'segment-x',
    'y': 'segment-y', 
    'z': 'segment-z',
    'u': 'segment-u',
    'v': 'segment-v',
    'w': 'segment-w'
  };
  
  let html = '';
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const type = segmentTypes[i];
    const className = segmentClasses[type] || '';
    
    if (segment.length > 0) {
      html += `<span class="string-segment ${className}" data-segment="${type}">${segment}</span>`;
    }
  }
  
  return html;
}

/**
 * Calculates optimal decomposition for demonstration
 */
function suggestOptimalDecomposition(string, languageKey) {
  const language = LANGUAGE_DEFINITIONS[languageKey];
  const pumpingLength = language.pumpingLength;
  
  const suggestions = {
    regular: null,
    contextFree: null
  };
  
  if (language.type === 'regular' || language.type === 'non-cfl') {
    // For regular languages, try to put the pumpable part in a repeating section
    if (languageKey === 'a*b*') {
      const aCount = (string.match(/^a*/)[0]).length;
      if (aCount >= 1) {
        suggestions.regular = {
          x: string.substring(0, Math.max(0, aCount - 1)),
          y: aCount > 0 ? 'a' : string.substring(0, 1),
          z: string.substring(Math.max(1, aCount))
        };
      }
    } else if (languageKey === '(ab)*') {
      suggestions.regular = {
        x: '',
        y: 'ab',
        z: string.substring(2)
      };
    }
  }
  
  if (language.type === 'context-free') {
    if (languageKey === 'a^nb^n') {
      const aCount = (string.match(/^a*/)[0]).length;
      const bCount = string.length - aCount;
      
      if (aCount === bCount && aCount >= 1) {
        suggestions.contextFree = {
          u: aCount > 1 ? string.substring(0, aCount - 1) : '',
          v: 'a',
          w: aCount > 1 ? string.substring(aCount - 1, aCount) : '',
          x: 'b',
          y: bCount > 1 ? string.substring(aCount + 1) : ''
        };
      }
    }
  }
  
  return suggestions;
}

/**
 * Validates constraints and returns visual feedback
 */
function getConstraintStatus(languageKey, decomposition, pumpingLength) {
  const language = LANGUAGE_DEFINITIONS[languageKey];
  const status = {
    constraints: [],
    allSatisfied: true
  };
  
  if (language.type === 'regular') {
    const { x, y, z } = decomposition;
    
    // |xy| ≤ p constraint
    const xyLength = (x + y).length;
    const xyConstraint = {
      name: '|xy| ≤ p',
      satisfied: xyLength <= pumpingLength,
      value: `|xy| = ${xyLength}, p = ${pumpingLength}`,
      description: 'The x and y segments together cannot exceed the pumping length'
    };
    status.constraints.push(xyConstraint);
    
    // |y| ≥ 1 constraint
    const yConstraint = {
      name: '|y| ≥ 1',
      satisfied: y.length >= 1,
      value: `|y| = ${y.length}`,
      description: 'The y segment must be non-empty'
    };
    status.constraints.push(yConstraint);
    
    status.allSatisfied = xyConstraint.satisfied && yConstraint.satisfied;
    
  } else if (language.type === 'context-free') {
    const { u, v, w, x, y } = decomposition;
    
    // |vwx| ≤ p constraint
    const vwxLength = (v + w + x).length;
    const vwxConstraint = {
      name: '|vwx| ≤ p',
      satisfied: vwxLength <= pumpingLength,
      value: `|vwx| = ${vwxLength}, p = ${pumpingLength}`,
      description: 'The v, w, and x segments together cannot exceed the pumping length'
    };
    status.constraints.push(vwxConstraint);
    
    // |vx| ≥ 1 constraint
    const vxLength = v.length + x.length;
    const vxConstraint = {
      name: '|vx| ≥ 1',
      satisfied: vxLength >= 1,
      value: `|vx| = ${vxLength}`,
      description: 'At least one of v or x must be non-empty'
    };
    status.constraints.push(vxConstraint);
    
    status.allSatisfied = vwxConstraint.satisfied && vxConstraint.satisfied;
  }
  
  return status;
}

/**
 * Utility function to escape HTML characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function for input handling
 */
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
