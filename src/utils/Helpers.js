export const toMessageString = (input) => {
  if (input == null) return '';
  // If it's an error-like object
  if (typeof input === 'object') {
    if (typeof input.message === 'string') return input.message;
    try {
      const json = JSON.stringify(input);
      // Try to pull message field if present in JSON string
      const parsed = JSON.parse(json);
      if (parsed && typeof parsed.message === 'string') return parsed.message;
      return json;
    } catch (_) {
      return String(input);
    }
  }
  // If it's a string, try to parse JSON, else return string itself
  if (typeof input === 'string') {
    const trimmed = input.replace(/^.*?:\s*/, '').trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed.message === 'string') return parsed.message;
      } catch (_) {
        // fall through
      }
    }
    return trimmed;
  }
  return String(input);
};


