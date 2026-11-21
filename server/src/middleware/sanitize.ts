import { Request, Response, NextFunction } from 'express';

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Recursively strips MongoDB operator keys (`$...`), dotted keys (`a.b`),
 * and prototype-pollution keys from untrusted request payloads.
 */
export const sanitizeObject = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }
  if (value && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key) || key.startsWith('$') || key.includes('.')) {
        continue;
      }
      clean[key] = sanitizeObject(val);
    }
    return clean;
  }
  return value;
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as Request['query'];
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as Request['params'];
  }
  next();
};
