interface StatisticData {
  accepted_tokens: number;
  airdrop_fails: number;
  airdrop_success: number;
  airdrops: number;
  bot_actives: number;
  bot_inactives: number;
  bots: number;
  matic_fails: number;
  matic_pending: number;
  matic_success: number;
  selected_token_fails: number;
  selected_token_pending: number;
  selected_token_success: number;
  symbol: string;
  transactions: number;
}

interface TradeBotData {
  id: number;
  uuid: string;
  name: string;
  target_price: number;
  min_amount: number;
  max_amount: number;
  min_delay: number;
  max_delay: number;
  target_balance: number;
  holder_percent: number;
  slippage_tolerance: number;
  delay_to_start: number;
  strategy: string;
  active: number;
  is_hidden: number;
  created_at: string;
  updated_at: string;
  helper_private_key: string;
  account_private_key: string;
  destiny_address: string;
  token_name: string;
  token_symbol: string;
  token_address: string;
  airdrop_time: number;
  friendly_name: string;
  destiny_friendly_name: string;
  spent_balance: number;
  executions: number;
  transactions: number;
  cycles: number;
  cycle_ghosts: number;
  cycle_delay: number;
  actual_cycle: number;
  work_start: string;
  work_end: string;
  mode: string;
  max_queue: number;
  actual_queue: string;
}

interface ListBotData {
  id: number;
  uuid: string;
  bot_address: number;
  name: string;
  target_price: number;
  min_amount: number;
  max_amount: number;
  min_delay: number;
  max_delay: number;
  target_balance: number;
  holder_percent: number;
  slippage_tolerance: number;
  delay_to_start: number;
  type: string;
  active: number;
  is_hidden: number;
  created_at: string;
  updated_at: string;
  account_private_key: string;
  destiny_address: string;
  token_name: string;
  token_symbol: string;
  token_address: string;
  airdrop_time: number;
  friendly_name: string;
  destiny_friendly_name: string;
  spent_balance: number;
  executions: number;
  transactions: number;
}

interface BotData {
  name: string;
  account_private_key: string;
  destiny_address: string;
  target_price: number;
  min_amount: number;
  max_amount: number;
  min_delay: number;
  max_delay: number;
  target_balance: number;
  holder_percent: number;
  airdrop_time: number;
  token_symbol: string;
  slippage_tolerance: number;
  delay_to_start: number;
  type: string;
  friendly_name?: string;
  destiny_friendly_name: string;
}

interface DistributionBotData {
  uuid: string;
  id?: number;
  uuid?: string;
  name: string;
  account_private_key: string;
  account_friendly_name: string;
  password: string;
  new_password?: string;
  new_password_confirm?: string;
  delay: number;
  token_symbol: string;
  wallets: DistributionWallets[];
  active: number;
  executions: number;
  transactions: number;
}

interface SeedBotData {
  id: number;
  uuid: string;
  name: string;
  helper_private_key: string,
  account_private_key: string;
  account_friendly_name?: string;
  destiny_address: string;
  destiny_friendly_name: string;
  amount: number;
  token_symbol: string;
  executions: number;
  transactions: number;
  cycles: number;
  cycle_ghosts: number;
  cycle_delay: number;
  actual_cycle: number;
  airdrop_time: number;
  active: number;
}

interface Token {
  id: number;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  pool_name: string;
  pool_symbol: string;
  pool_address: string;
  pool_decimals: number;
  active: number;
  created_at: string;
  updated_at: string;
};

interface DistributionWallets {
  name: string;
  wallet_address: string;
  percent: number;
};

interface Transaction {
  airdrop_status: number;
  bot_address: number;
  created_at: string;
  distribution_bot_wallet: any;
  end_matic: number;
  end_selected_token: number;
  from_address: string;
  hash: string;
  id: number;
  message: string;
  new_wallet_address: string;
  new_wallet_private_key: string;
  result: any[];
  start_matic: number;
  start_selected_token: number;
  status: number;
  symbol_selected_token: string;
  to_address: string;
  type: string;
  updated_at: string;
}

interface ApiResponseTransactions {
  details: {
    airdrop_fails: string;
    airdrop_success: string;
    matic_fails: number;
    matic_pending: number;
    matic_success: number;
    quantity: number;
    selected_token_fails: number;
    selected_token_pending: number;
    selected_token_success: number;
    total_matic: number;
    total_selected_token: number;
    transaction_fails: string;
    transaction_success: string;
  };
  transactions: Transaction[];
}

interface ListVolumeBotData {
  id: number;
  uuid: string;
  name: string;
  min_amount: number;
  max_amount: number;
  min_delay: number;
  max_delay: number;
  account_private_key_buy: string;
  private_key_buy_friendly_name: string;
  account_private_key_sell: string;
  private_key_sell_friendly_name: string;
  slippage_tolerance: number;
  delay_to_start: number;
  token_name: string;
  token_symbol: string;
  token_address: string;
  is_hidden: number;
  active: number;
  executions: number,
  transactions: number;
  created_at: string;
  updated_at: string;
}

interface VolumeBotData {
  id: number;
  uuid: string;
  name: string;
  min_amount: number;
  max_amount: number;
  min_delay: number;
  max_delay: number;
  sell_swap_times: number;
  airdrop_time: number;
  account_private_key_buy: string;
  private_key_buy_friendly_name: string;
  account_private_key_sell: string;
  private_key_sell_friendly_name: string;
  slippage_tolerance: number;
  delay_to_start: number;
  token_name: string;
  token_symbol: string;
  token_address: string;
  active: number;
}