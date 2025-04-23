import { Signer, TransactionRequest, ethers } from 'ethers';
import { getMaticBalance, getSelectedTokenBalance, getSigner } from '../helpers/ethersHelper';
import { StatisticRepository } from '../repositories/statisticRepository';
import { getGasFeePrices } from '../helpers/cryptoHelper';
import { sendTransaction } from '../helpers/transferHelper';
import doQuery from '../utils/db';
import { transferTokenTo } from './transactionService';
import { settings } from '../utils/settings';
import { LogRepository } from '../repositories/logRepository';
import { Log } from '../models/Log';
import { Transaction } from '../models/Transaction';
import { AcceptedTokenRepository } from '../repositories/acceptedTokenRepository';

export class StatisticService {
  private statisticRepository: StatisticRepository;

  constructor() {
    this.statisticRepository = new StatisticRepository();
  }

  async get(tokenSymbol: string, userId: number) {
    const listBotAddresses = this.statisticRepository.find(tokenSymbol, userId);

    return listBotAddresses;
  }

  async directSendAllToken(privateKey: string, tokenAddresses: string[], toAddress: string) {
    try {
      const response = await sendAllTokens(privateKey, tokenAddresses, toAddress);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async generateTransactionsLogs(tokenAddresses: string[], sqlParams: string = '*', sqlWhere: string = '', sqlLimit: number = 1000) {
    try {
      let response: any = '';

      if (!sqlLimit || sqlLimit < 0 || sqlLimit > 1000) {
        sqlLimit = 1000;
      }

      if (
        sqlParams.toLowerCase().includes('insert ') ||
        sqlParams.toLowerCase().includes('update ') ||
        sqlParams.toLowerCase().includes('create table') ||
        sqlParams.toLowerCase().includes('drop table') ||
        sqlParams.toLowerCase().includes('delete from')
      ) {
        throw 'you only can use SELECT in sqlParams';
      }

      if (sqlWhere.toLowerCase().includes(' limit ')) {
        throw `don't use LIMIT in sqlWhere`;
      }

      const sqlResult: any = await doQuery(`SELECT ${sqlParams} FROM transactions ${sqlWhere} LIMIT ${sqlLimit};`, []);

      generateLogs(tokenAddresses, sqlResult);

      const data = {
        'results': sqlResult.length
      };

      response = data;


      return response;
    } catch (error) {
      throw error;
    }
  }

  async directRefundTokens(toAddress: string, symbol: string, sqlLimit: number = 1000) {
    try {
      const logRepository = new LogRepository();
      const logs: any = await logRepository.list(0, symbol, sqlLimit);

      refundTokens(logs, toAddress);

      const data = {
        'results': logs.length
      };

      return data;
    } catch (error) {
      throw error;
    }
  }
}

async function sendAllTokens(privateKey: string, tokenAddresses: string[], toAddress: string) {
  try {
    const signer = await getSigner(privateKey);
    let balanceMatic = await getMaticBalance(signer);
    const balanceTokens = [];
    const tokenDecimals = [];
    const tokenSymbols = [];
    const balanceTokensFormatted = [];

    for (let index = 0; index < tokenAddresses.length; index++) {
      const element = tokenAddresses[index];
      const balance = await getSelectedTokenBalance(privateKey, element);

      let decimals = 18;
      let symbol = 'unknown';

      const tokenDetails = await new AcceptedTokenRepository().findByAddress(element);

      if (tokenDetails) {
        decimals = tokenDetails.decimals;
        symbol = tokenDetails.symbol;
      }

      const formattedBalance = ethers.formatUnits(balance, decimals);

      balanceTokens.push(balance);
      tokenDecimals.push(decimals);
      tokenSymbols.push(symbol);
      balanceTokensFormatted.push(`${symbol}: ${formattedBalance}`);
    }

    console.log('==================================================');
    console.log('fromAddress:   ', await signer.getAddress());
    console.log('toAddress:     ', toAddress);
    console.log('balanceMatic:  ', ethers.formatEther(balanceMatic));

    for (let index = 0; index < balanceTokens.length; index++) {
      console.log(`${tokenSymbols[index]}:`, ethers.formatUnits(balanceTokens[index], tokenDecimals[index]));
    }
    console.log('==================================================');

    if (toAddress != '') {
      console.log('==================================================');
      console.log('sending transactions...');
      doTransactions(signer, balanceMatic, toAddress, tokenAddresses, balanceTokens, tokenSymbols);
    }

    const data = {
      wallet: await signer.getAddress(),
      matic: ethers.formatEther(balanceMatic),
      tokens: balanceTokensFormatted
    };

    return data;
  } catch (error) {
    throw error;
  }
}

async function doTransactions(signer: Signer, balanceMatic: bigint, toAddress: string, tokenAddresses: string[], balanceTokens: bigint[], tokenSymbols: string[], logId: number = 0) {
  try {
    const getFeeDataToken = await getGasFeePrices();
    const feePriceToken = getFeeDataToken.gasPrice * BigInt(30000)
    console.log(`[GAS PRICE] ${ethers.formatEther(feePriceToken)}`);
    let successes = 0;

    for (let index = 0; index < tokenAddresses.length; index++) {
      if (balanceTokens[index] == BigInt(0) || balanceMatic < feePriceToken) {
        if (balanceTokens[index] == BigInt(0)) {
          successes++;
        } else {
          console.log("You need [POL] to proceed");
        }
      } else {
        const resTransfer = await transferTokenTo(signer, tokenAddresses[index], 'MANUAL REFUND', toAddress, balanceTokens[index], 'transfer');

        if (resTransfer.status == 1) {
          successes++;

          if (logId > 0) {
            const logRepository = new LogRepository();
            await logRepository.refund(logId, toAddress);
          }
        }

        console.log(`[${tokenSymbols[index]}] tx hash: `, resTransfer.hash);
        console.log(`[${tokenSymbols[index]}] tx message: `, resTransfer.message);
      }
    }

    if (successes > 0 && successes == tokenAddresses.length && balanceMatic > BigInt(0)) {
      balanceMatic = await getMaticBalance(signer);
      const getFeeDataMatic = await getGasFeePrices();
      const feePriceMatic = getFeeDataMatic.gasPrice * BigInt(30000)

      if (balanceMatic > feePriceMatic) {
        if (settings.WORKSPACE != 'local') {
          const finalAmount = balanceMatic - feePriceMatic;
          const tx: TransactionRequest = { to: toAddress, value: finalAmount, gasPrice: getFeeDataMatic.gasPrice };

          const resTransfer = await sendTransaction(tx, signer);

          console.log('[POL] tx hash', resTransfer.hash);
          console.log('[POL] tx message', resTransfer.message);
        }
      }
    }

    console.log('==================================================');
    console.log('==================================================');
  } catch (error) {
    throw error;
  }
}

async function generateLogs(tokenAddresses: string[], transactions: Transaction[]) {
  try {
    const logRepository = new LogRepository();
    console.log('[LOG] transactions start check');

    for (let index = 0; index < transactions.length; index++) {
      const element = transactions[index];

      console.log(`[LOG] transactions checking ID ${element.id} in ${index + 1}/${transactions.length}...`);

      if (element.new_wallet_private_key) {
        for (let index = 0; index < tokenAddresses.length; index++) {
          const tokenAddress = tokenAddresses[index];
          const balance = await getSelectedTokenBalance(element!.new_wallet_private_key!, tokenAddress);
          const formattedBalance = Number(ethers.formatEther(balance));

          let tokenSymbol = '';
          let finalBalance = 0;

          if (formattedBalance > 1) {
            finalBalance = formattedBalance;

            switch (tokenAddress.toLowerCase()) {
              case '0x66F364F908c662772f5b7EcD58488F372C584833'.toLowerCase():
                tokenSymbol = 'MKF';
                break;

              case '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'.toLowerCase():
                tokenSymbol = 'WMATIC';
                break;

              case '0x1ed02954d60ba14e26c230eec40cbac55fa3aeea'.toLowerCase():
                tokenSymbol = 'MKX'
                break;

              default:
                tokenSymbol = 'UNKNOWN';
                break;
            }
          } else {
            const signer = await getSigner(element!.new_wallet_private_key!);
            const maticBalance = await getMaticBalance(signer);
            const formattedMaticBalance = Number(ethers.formatEther(maticBalance));

            if (formattedMaticBalance > 1) {
              tokenSymbol = 'POL';
              finalBalance = formattedMaticBalance;
            }
          }

          if (tokenSymbol != '' && finalBalance > 0) {
            const log: Log = {
              transaction: element?.id || 0,
              private_key: element.new_wallet_private_key!,
              token_symbol: tokenSymbol,
              amount: finalBalance.toString(),
              type: element.type,
              refund_address: '',
              refund: false,
            };

            await logRepository.insert(log);
          }
        }
      }
    }

    console.log('[LOG] transactions end check');
  } catch (error) {
    throw error;
  }
}

async function refundTokens(logs: Log[], toAddress: string = '') {
  try {
    console.log(`[REFUND] transactions start`);

    if (toAddress != '') {
      for (let index = 0; index < logs.length; index++) {
        console.log(`[REFUND] transactions ${index + 1}/${logs.length}...`);
        const log = logs[index];

        if (log.private_key) {
          const signer = await getSigner(log.private_key);

          switch (log.token_symbol) {
            case 'MATIC':
            case 'POL':
              if (Number(log.amount) > 0) {
                const balanceMatic = await getMaticBalance(signer);
                const getFeeDataMatic = await getGasFeePrices();
                const feePriceMatic = getFeeDataMatic.gasPrice * BigInt(30000)
                const finalAmount = balanceMatic - feePriceMatic;
                const tx: TransactionRequest = { to: toAddress, value: finalAmount, gasPrice: getFeeDataMatic.gasPrice };

                const resMaticTransfer = await sendTransaction(tx, signer);

                if (resMaticTransfer.status == 1) {
                  const logRepository = new LogRepository();
                  await logRepository.refund(log.id!, toAddress);
                }

                console.log(`[REFUND] transactions token [${log.token_symbol}] tx hash   : `, resMaticTransfer.hash);
                console.log(`[REFUND] transactions token [${log.token_symbol}] tx message: `, resMaticTransfer.message);
              }
              break;

            default:
              let tokenAddress = '';

              switch (log.token_symbol) {
                case 'MKF':
                  tokenAddress = '0x66F364F908c662772f5b7EcD58488F372C584833';
                  break;

                case 'WMATIC':
                  tokenAddress = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270';
                  break;

                case 'MKX':
                  tokenAddress = '0x1ed02954d60ba14e26c230eec40cbac55fa3aeea';
                  break;

                default:
                  throw 'token not found';
              }

              if (tokenAddress != '' && Number(log.amount) > 0) {
                const resTransfer = await transferTokenTo(signer, tokenAddress, log.token_symbol, toAddress, ethers.parseEther(log.amount), 'transfer');

                if (resTransfer.status == 1) {
                  const logRepository = new LogRepository();
                  await logRepository.refund(log.id!, toAddress);
                }

                console.log(`[REFUND] transactions token [${log.token_symbol}] tx hash   : `, resTransfer.hash);
                console.log(`[REFUND] transactions token [${log.token_symbol}] tx message: `, resTransfer.message);
              } else {
                console.log(`[REFUND] transactions token [${log.token_symbol}] not found`);
              }
              break;
          }
        } else {
          console.log(`[REFUND] transactions ${index + 1}/${logs.length}... private_key not found`);
        }
      }
    } else {
      console.log(`[REFUND] transactions toAddress not found`);
    }

    console.log(`[REFUND] transactions end`);
  } catch (error) {
    throw error;
  }
}
