

export interface Log {
  id?: number,
  transaction: number,
  private_key: string,
  token_symbol: string,
  amount: string,
  type: string,
  refund_address: string,
  refund: boolean
}