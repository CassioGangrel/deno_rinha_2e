import { create_new_transaction } from "../create_new_transaction.ts";
import { expect } from "./deps.ts";

Deno.test("Create new Transaction", async (t) => {
  await t.step("Não deve permitir descrição maior que 10", () => {
    expect(() =>
      create_new_transaction(
        {
          customer_id: 1,
          description: "descricao maior que 10 caracteres",
          type: "c",
          value: 1000,
        },
        () => ""
      )
    ).toThrow("Descricao deve ter entre 1 e 10 caracteres");
  });

  await t.step("Não deve permitir descrição menor que 1", () => {
    expect(() =>
      create_new_transaction(
        {
          customer_id: 1,
          description: "",
          type: "c",
          value: 1000,
        },
        () => ""
      )
    ).toThrow("Descricao deve ter entre 1 e 10 caracteres");
  });

  await t.step("Não deve permitir tipo invalido", () => {
    expect(() =>
      create_new_transaction(
        {
          customer_id: 1,
          description: "descricao",
          type: "x",
          value: 1000,
        },
        () => ""
      )
    ).toThrow("Tipo de transacao invalido");
  });

  await t.step("Valor deve ser um numero inteiro positivo", () => {
    expect(() =>
      create_new_transaction(
        {
          customer_id: 1,
          description: "descricao",
          type: "d",
          value: 1.1,
        },
        () => ""
      )
    ).toThrow("Valor deve ser um numero inteiro positivo");
  });

  await t.step("Deve criar corretamente uma nova transacao", () => {
    const uuid = crypto.randomUUID();
    expect(
      create_new_transaction(
        {
          customer_id: 1,
          description: "descricao",
          type: "d",
          value: 1,
        },
        () => uuid
      )
    ).toEqual({
      transaction_id: uuid,
      customer_id: 1,
      description: "descricao",
      type: "d",
      value: 1,
      created_at: new Date(),
    });
  });
});
