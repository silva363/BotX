

export interface Transaction {
  id: number,
  hash: string,
  bot_address?: number,
  trade_bot?: number,
  distribution_bot_wallet?: number,
  seed_bot?: number,
  volume_bot?: number,
  bot_execution?: number,
  message: string,
  result: string,
  start_matic: string,
  end_matic: string,
  symbol_selected_token: string,
  start_selected_token: string,
  end_selected_token: string,
  new_wallet_address?: string,
  new_wallet_private_key?: string,
  from_address: string,
  to_address: string,
  type: string,
  airdrop_status: number,
  need_airdrop: number,
  status: number
}