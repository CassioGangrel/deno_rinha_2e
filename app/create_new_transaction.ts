import { check_customer_id_rinha_range } from "./check_customer_id_rinha_range.ts";
import { UnprocessableEntityError } from "./errors.ts";
import { Transaction } from "./types.ts";

export type CreateNewTransactionInput = {
  customer_id: number;
  value: number;
  type: string;
  description: string;
};

function check(params: CreateNewTransactionInput) {
  check_customer_id_rinha_range(params.customer_id);
  if (!["c", "d"].includes(params.type)) {
    throw new UnprocessableEntityError("Tipo de transacao invalido");
  }
  if (
    !params.description ||
    params.description.length < 1 ||
    params.description.length > 10
  ) {
    throw new UnprocessableEntityError("Descricao deve ter entre 1 e 10 caracteres");
  }
  if (
    !params.value ||
    params.value < 0 ||
    !Number.isSafeInteger(params.value)
  ) {
    throw new UnprocessableEntityError("Valor deve ser um numero inteiro positivo");
  }
}

export function create_new_transaction(
  params: CreateNewTransactionInput,
  uuidGenerator: () => string
): Transaction {
  check(params);
  const { customer_id, description, type, value } = params;
  return {
    transaction_id: uuidGenerator(),
    customer_id,
    description,
    type,
    value,
    created_at: new Date(),
  };
}
