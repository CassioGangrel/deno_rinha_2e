import { NotFoundError } from "./errors.ts";

export function check_customer_id_rinha_range(params: number) {
  if (!params || params < 1 || params > 5) {
    throw new NotFoundError("Id cliente fora do range da rinha");
  }
}
