export class NotFoundError extends Error { status_code = 404;}
export class BadRequestError extends Error { status_code = 400; }
export class UnprocessableEntityError extends Error { status_code = 422; }
export class InternalServerError extends Error { status_code = 500; }