

export interface SeedBot {
  id?: number,
  uuid: string,
  user_id: number,
  name: string,
  helper_private_key: string,
  account_private_key: string,
  account_friendly_name: string,
  destiny_address: string,
  destiny_friendly_name: string,
  token_name: string,
  token_symbol: string,
  token_address: string,
  amount: number,
  cycles: number,
  cycle_delay: number,
  cycle_ghosts: number,
  airdrop_time: number,
  actual_cycle?: number,
  active: boolean,
  is_hidden?: boolean
}