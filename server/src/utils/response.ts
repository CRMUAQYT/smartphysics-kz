import { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T) {
  return res.status(201).json({ success: true, data });
}

export interface ApiErrorShape {
  path?: string;
  message: string;
}

export function fail(res: Response, status: number, message: string, errors: ApiErrorShape[] = []) {
  return res.status(status).json({ success: false, message, errors });
}

/** Domain error thrown by services; caught by the error middleware. */
export class AppError extends Error {
  status: number;
  errors: ApiErrorShape[];
  constructor(status: number, message: string, errors: ApiErrorShape[] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
