

export interface VolumeBot {
  id?: number,
  uuid: string,
  user_id: number,
  name: string,
  account_private_key_buy: string,
  account_private_key_sell: string,
  private_key_buy_friendly_name: string,
  private_key_sell_friendly_name: string,
  token_name: string,
  token_symbol: string,
  token_address: string,
  min_amount: number,
  max_amount: number,
  min_delay: number,
  max_delay: number,
  sell_swap_times: number,
  slippage_tolerance: number,
  delay_to_start?: number,
  airdrop_time: number,
  active_airdrop: boolean,
  need_wait: boolean,
  is_hidden?: boolean,
  active: boolean
}