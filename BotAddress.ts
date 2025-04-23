

export interface BotAddress {
  id: number,
  bot_uuid: string,
  account_private_key: string,
  friendly_name: string,
  destiny_address: string,
  destiny_friendly_name: string,
  token_name: string,
  token_symbol: string,
  token_address: string,
  spent_balance: string,
  airdrop_time: number,
  active: boolean
}