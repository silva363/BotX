import { BotExecution } from "./BotExecution";

export interface Swap {
  id?: number,
  bot_uuid: string,
  user_id: number,
  bot_execution: number,
  private_key: string,
  amount: string,
  token_name: string,
  token_symbol: string,
  token_address: string,
  swap_type: string,
  bot_type: keyof BotExecution,
  mode: string,
  status: number,
}