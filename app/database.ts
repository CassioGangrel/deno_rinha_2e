import { Pool, PostgresError, TransactionError } from "postgres";
import { config } from "./config.ts";
import { InternalServerError, UnprocessableEntityError } from "./errors.ts";
import { Transaction, Balance } from "./types.ts";

const { hostname, port, user, password, database, poolSize } = config.postgres;

const pool = new Pool(
  {
    port,
    hostname,
    database,
    user,
    password,
    applicationName: "deno_rinha_2e",
  },
  poolSize
);

export async function check_connection() {
  const connection = await pool.connect();
  const result = await connection.queryObject("select 1;");
  return !!result.rowCount;
}

export async function get_balance(customer_id: number) {
  const connection = await pool.connect();
  try {
    const resultTransactios = connection.queryObject<{
      value: number;
      created_at: Date;
      description: string;
      type: string;
    }>(
      `
      select
        t.value,
        t.created_at,
        t.description,
        t.type
      from
        transactions t
      where
        t.customer_id  = $customer_id
      order by created_at desc
      limit 10;
    `,
      { customer_id }
    );

    const resultBalance = connection.queryObject<{
      value: number;
      credit: number;
    }>(`
      select b.value, b.credit from balance b where b.customer_id = $customer_id;
    `, { customer_id })

    const results = await Promise.all([resultBalance, resultTransactios]);
    return {
      balance: results[0].rows[0],
      lastTransactions: results[1].rows
    }
  } catch (e) {
    throw new InternalServerError(e);
  } finally {
    connection.release();
  }
}

export async function persist_new_transaction(input: Transaction) {
  const connection = await pool.connect();
  try {
    const transaction = connection.createTransaction("new_transaction");
    try {
      await transaction.begin();
      await transaction.queryObject(
        `
        INSERT INTO transactions 
        (transaction_id, customer_id, value, type, description, created_at)
        VALUES
        ($transaction_id, $customer_id, $value, $type, $description, $created_at)
        `,
        {
          transaction_id: input.transaction_id,
          customer_id: input.customer_id,
          value: input.value,
          type: input.type,
          description: input.description,
          created_at: input.created_at,
        }
      );
      const result = await transaction.queryObject<Balance>(
        `
          SELECT b.value, b.credit from balance b 
          where b.customer_id = $customer_id;
        `,
        { customer_id: input.customer_id }
      );
      const balance = result.rows[0];
      if (balance.value < balance.credit * -1) {
        await transaction.rollback();
        throw new UnprocessableEntityError("Saldo insuficiente");
      }
      await transaction.commit();
      return balance;
    } catch (e) {
      if (e instanceof TransactionError) {
        const cause = e.cause;
        if (cause instanceof PostgresError) {
          throw new UnprocessableEntityError(cause.message);
        }
      }
      if (e instanceof UnprocessableEntityError) {
        throw e;
      }
      throw new InternalServerError(e);
    }
  } finally {
    connection.release();
  }
}
