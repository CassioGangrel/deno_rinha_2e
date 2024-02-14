export type Transaction = {
  transaction_id: string;
  customer_id: number;
  description: string;
  type: string;
  value: number;
  created_at: Date;
};

export type Balance = {
  credit: number,
  value: number,
}
