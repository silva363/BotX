export interface DistributionBotErrorLog {
  id?: number,
  distribution_bot: number,
  transaction: number,
  retries: number,
  status: number
}