const secretPatterns = [
  /GEMINI_API_KEY\s*[=:]\s*[^\s]+/gi,
  /Bearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /(?:api[_-]?key|authorization|token|password)\s*[=:]\s*[^\s,;]+/gi
];
export function redact(value) {
  let text = String(value ?? '');
  for (const pattern of secretPatterns) text = text.replace(pattern, (match) => match.split(/[=:]/)[0] + '=***REDACTED***');
  return text.replace(/([A-Za-z]:\\Users\\[^\r\n]*\\\.env[^\r\n]*)/gi, '[ruta protegida]');
}
