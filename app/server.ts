import { check_customer_id_rinha_range } from "./check_customer_id_rinha_range.ts";
import { create_new_transaction } from "./create_new_transaction.ts";
import { check_connection } from "./database.ts";
import { persist_new_transaction, get_balance } from "./database.ts";

export function createServer(port?: number, signal?: AbortSignal) {
  return Deno.serve(
    {
      port,
      signal,
      hostname: "0.0.0.0",
    },
    async (request) => {
      const handlers = [postNewTransaction, getBalanceStatement, healthcheck];
      let response: Response | null = null;
      for (const handler of handlers) {
        try {
          response = await handler(request);
          if (response != null) {
            break;
          }
        } catch (e) {
          if ("status_code" in e) {
            return new Response("", { status: e.status_code });
          }
          return new Response("", { status: 500 });
        }
      }
      if (response == null) {
        response = new Response("Path invalido", { status: 404 });
      }
      return response;
    }
  );
}

const headers = { "Content-Type": "application/json" };

async function postNewTransaction(request: Request): Promise<Response | null> {
  const pattern = new URLPattern({ pathname: "/clientes/:id/transacoes" });
  if (!pattern.test(request.url)) {
    return null;
  }
  const customer_id = getCustomerIdParam(pattern, request);

  const body = await request.json();
  const newTransaction = create_new_transaction(
    {
      customer_id,
      description: body.descricao,
      type: body.tipo,
      value: body.valor,
    },
    () => crypto.randomUUID()
  );
  const balance = await persist_new_transaction(newTransaction);
  return new Response(JSON.stringify({
    saldo: balance.value,
    limite: balance.credit,
  }), {
    status: 200,
    headers,
  });
}

async function getBalanceStatement(request: Request) {
  const pattern = new URLPattern({ pathname: "/clientes/:id/extrato" });
  if (!pattern.test(request.url)) {
    return null;
  }
  const customer_id = getCustomerIdParam(pattern, request);
  check_customer_id_rinha_range(customer_id);
  const result = await get_balance(customer_id);
  const responseBody = {
    saldo: {
      total: result.balance.value,
      data_extrato: new Date(),
      limite: result.balance.credit,
    },
    ultimas_transacoes: [] as {
      valor: number;
      tipo: string;
      descricao: string;
      realizada_em: Date;
    }[],
  };
  for (const data of result.lastTransactions) {
    responseBody.ultimas_transacoes.push({
      valor: data.value,
      tipo: data.type,
      descricao: data.description,
      realizada_em: data.created_at,
    });
  }
  return new Response(JSON.stringify(responseBody), { status: 200, headers });
}

async function healthcheck(request: Request) {
  const pattern = new URLPattern({ pathname: "/healthcheck" });
  if (!pattern.test(request.url)) {
    return null;
  }
  const dbOk = await check_connection();
  if (dbOk) {
    return new Response(JSON.stringify({ status: "up" }), {
      status: 200,
      headers,
    });
  }
  return new Response(JSON.stringify({ status: "up" }), {
    status: 400,
    headers,
  });
}

function getCustomerIdParam(pattern: URLPattern, request: Request) {
  return Number.parseInt(pattern.exec(request.url)?.pathname.groups.id ?? "");
}
