// Pumping Lemma Data - Language Definitions and Test Cases

const LANGUAGE_DEFINITIONS = {
  'a*b*': {
    type: 'regular',
    name: 'a*b*',
    description: 'Zero or more a\'s followed by zero or more b\'s',
    recognizer: (str) => /^a*b*$/.test(str),
    pumpingLength: 2,
    sampleStrings: ['', 'a', 'b', 'ab', 'aabb', 'aaaabbbb'],
    counterExamples: ['ba', 'aba', 'abab']
  },
  
  '(ab)*': {
    type: 'regular',
    name: '(ab)*',
    description: 'Zero or more repetitions of "ab"',
    recognizer: (str) => /^(ab)*$/.test(str),
    pumpingLength: 3,
    sampleStrings: ['', 'ab', 'abab', 'ababab'],
    counterExamples: ['a', 'b', 'aab', 'abb', 'ba']
  },
  
  'a^nb^n': {
    type: 'context-free',
    name: 'a^n b^n',
    description: 'Equal number of a\'s followed by equal number of b\'s',
    recognizer: (str) => {
      if (str === '') return true;
      const match = str.match(/^(a+)(b+)$/);
      if (!match) return false;
      return match[1].length === match[2].length;
    },
    pumpingLength: 3,
    sampleStrings: ['', 'ab', 'aabb', 'aaabbb', 'aaaabbbb'],
    counterExamples: ['a', 'b', 'aab', 'abb', 'abab']
  },
  
  'palindromes': {
    type: 'context-free',
    name: 'Palindromes',
    description: 'Strings that read the same forwards and backwards',
    recognizer: (str) => str === str.split('').reverse().join(''),
    pumpingLength: 4,
    sampleStrings: ['', 'a', 'aa', 'aba', 'abba', 'abcba'],
    counterExamples: ['ab', 'abc', 'abcd']
  },
  
  'a^nb^nc^n': {
    type: 'non-cfl',
    name: 'a^n b^n c^n',
    description: 'Equal number of a\'s, b\'s, and c\'s (NOT context-free)',
    recognizer: (str) => {
      if (str === '') return true;
      const match = str.match(/^(a+)(b+)(c+)$/);
      if (!match) return false;
      return match[1].length === match[2].length && match[2].length === match[3].length;
    },
    pumpingLength: 4,
    sampleStrings: ['', 'abc', 'aabbcc', 'aaabbbccc'],
    counterExamples: ['ab', 'aab', 'abb', 'abcc', 'aabbc']
  }
};

// Default pumping lengths for different language types
const DEFAULT_PUMPING_LENGTHS = {
  regular: 3,
  'context-free': 4
};

// Helper patterns for common language types
const COMMON_PATTERNS = {
  regular: [
    { pattern: /^a*$/, description: 'Zero or more a\'s' },
    { pattern: /^(a|b)*$/, description: 'Any combination of a\'s and b\'s' },
    { pattern: /^a*b*$/, description: 'a\'s followed by b\'s' },
    { pattern: /^(ab)*$/, description: 'Alternating ab pattern' }
  ],
  
  contextFree: [
    { pattern: 'balanced_parens', description: 'Balanced parentheses' },
    { pattern: 'equal_ab', description: 'Equal a\'s and b\'s' },
    { pattern: 'palindromes', description: 'Palindromic strings' },
    { pattern: 'wcw_reverse', description: 'w c w^R pattern' }
  ]
};

// Test cases for validation
const TEST_CASES = {
  regular: {
    'a*b*': {
      validDecompositions: [
        { string: 'aaabbb', x: 'a', y: 'a', z: 'abbb', valid: true },
        { string: 'aaabbb', x: '', y: 'aa', z: 'abbb', valid: true },
        { string: 'aaabbb', x: 'aa', y: 'a', z: 'bbb', valid: true }
      ],
      invalidDecompositions: [
        { string: 'aaabbb', x: 'aaa', y: 'b', z: 'bb', valid: false, reason: '|xy| > p constraint violated' }
      ]
    }
  },
  
  contextFree: {
    'a^nb^n': {
      validDecompositions: [
        { string: 'aaabbb', u: 'a', v: 'a', w: 'a', x: 'b', y: 'bb', valid: true },
        { string: 'aaabbb', u: '', v: 'aa', w: 'a', x: 'bb', y: 'b', valid: true }
      ],
      invalidDecompositions: [
        { string: 'aaabbb', u: 'aa', v: 'a', w: '', x: 'b', y: 'bb', valid: false, reason: '|vx| = 0 constraint violated' }
      ]
    }
  }
};

// Error messages for constraint violations
const CONSTRAINT_MESSAGES = {
  regular: {
    xy_length: '|xy| must be ≤ pumping length p',
    y_empty: '|y| must be ≥ 1 (y cannot be empty)',
    decomposition_length: 'x + y + z must equal original string length'
  },
  
  contextFree: {
    vwx_length: '|vwx| must be ≤ pumping length p',
    vx_empty: '|vx| must be ≥ 1 (v and x cannot both be empty)',
    decomposition_length: 'u + v + w + x + y must equal original string length'
  }
};

// Example strings for different lengths
const EXAMPLE_STRINGS = {
  regular: {
    'a*b*': {
      3: 'abb',
      4: 'aabb',
      5: 'aaabb',
      6: 'aaabbb',
      8: 'aaaabbbb',
      10: 'aaaaabbbbb'
    },
    '(ab)*': {
      4: 'abab',
      6: 'ababab',
      8: 'abababab',
      10: 'ababababab'
    }
  },
  
  contextFree: {
    'a^nb^n': {
      4: 'aabb',
      6: 'aaabbb',
      8: 'aaaabbbb',
      10: 'aaaaabbbbb'
    },
    'palindromes': {
      3: 'aba',
      4: 'abba',
      5: 'abcba',
      6: 'abccba',
      7: 'abcdcba'
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LANGUAGE_DEFINITIONS,
    DEFAULT_PUMPING_LENGTHS,
    COMMON_PATTERNS,
    TEST_CASES,
    CONSTRAINT_MESSAGES,
    EXAMPLE_STRINGS
  };
}
