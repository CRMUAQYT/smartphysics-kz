import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { fail } from '../utils/response';

type Source = 'body' | 'query' | 'params';

/** Validates and coerces a request part against a Zod schema. */
export function validate(schema: AnyZodObject, source: Source = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Store parsed/coerced values back
      req[source] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(
          res,
          422,
          'Деректерді тексеру сәтсіз аяқталды',
          error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        );
      }
      return next(error);
    }
  };
}
