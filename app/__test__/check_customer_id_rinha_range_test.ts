import { check_customer_id_rinha_range } from "../check_customer_id_rinha_range.ts";
import { expect } from "./deps.ts";

Deno.test("Create new Transaction", async (t) => {
  await t.step("Não deve id menor que 1 ou maior que 5", () => {
    expect(() => check_customer_id_rinha_range(0)).toThrow(
      "Id cliente fora do range da rinha"
    );
    expect(() => check_customer_id_rinha_range(6)).toThrow(
      "Id cliente fora do range da rinha"
    );
  });
});
