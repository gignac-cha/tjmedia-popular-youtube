import { jsonResponse } from './json.ts';

type ErrorBody = {
  error: {
    message: string;
    status: number;
  };
};

export function errorResponse(
  message: string,
  status: number,
  origin?: string,
): Response {
  const body: ErrorBody = {
    error: {
      message,
      status,
    },
  };

  return jsonResponse(body, status, origin);
}
