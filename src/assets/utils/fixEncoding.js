/**
 * Fixes double UTF-8 encoding issues in text
 * 
 * The backend sometimes returns text that has been double-encoded:
 * - Text is encoded as UTF-8 bytes
 * - Then those bytes are interpreted as Latin-1 and encoded again as UTF-8
 * 
 * Example: "São" becomes "SÃ£o", "Ãži" becomes "Ãži"
 * 
 * This function reverses the double encoding by:
 * 1. Converting the text to Latin-1 bytes (reversing the second encoding)
 * 2. Interpreting those bytes as UTF-8 (the original encoding)
 * 
 * @param {string} text - The potentially double-encoded text
 * @returns {string} - The correctly decoded text
 */
export const fixDoubleEncoding = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }

  try {
    // Check if the text contains suspicious character sequences that indicate double encoding
    // Common patterns: Ã, Â, Ë, â€, etc.
    const hasEncodingIssue = /Ã|Â[^a-zA-Z0-9\s]|Ë|â€/.test(text);
    
    if (!hasEncodingIssue) {
      return text; // No encoding issue detected, return as-is
    }

    // Step 1: Convert string to Latin-1 bytes (reverse the second encoding)
    const latin1Bytes = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      // Latin-1 is 0-255, characters beyond that are definitely not double-encoded
      if (charCode > 255) {
        return text; // Contains actual Unicode characters, not double-encoded
      }
      latin1Bytes.push(charCode);
    }

    // Step 2: Interpret as UTF-8 (the original encoding)
    const uint8Array = new Uint8Array(latin1Bytes);
    const decoder = new TextDecoder('utf-8');
    const decodedText = decoder.decode(uint8Array);

    // Verify the decoded text doesn't have the encoding markers anymore
    const stillHasIssue = /Ã|Â[^a-zA-Z0-9\s]|Ë|â€/.test(decodedText);
    
    return stillHasIssue ? text : decodedText;
  } catch (error) {
    console.warn('Failed to fix encoding for text:', text, error);
    return text; // If decoding fails, return original text
  }
};

/**
 * Fixes encoding for an object's string properties recursively
 * @param {any} obj - The object to fix
 * @returns {any} - The object with fixed encoding
 */
export const fixObjectEncoding = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => fixObjectEncoding(item));
  }

  const fixed = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      fixed[key] = fixDoubleEncoding(value);
    } else if (typeof value === 'object') {
      fixed[key] = fixObjectEncoding(value);
    } else {
      fixed[key] = value;
    }
  }

  return fixed;
};
