"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBettweenTime = exports.divideAmount = exports.perAmount = exports.distributeTotalAmount = exports.calcStartTime = exports.isTimeDifferenceGreaterThanMinutes = exports.setPage = exports.comparePassword = exports.hashPassword = exports.calcPercent = exports.removePercent = exports.timerCountdown = exports.decryptSignature = exports.encryptSignature = exports.decrypt = exports.encrypt = exports.hideCharacters = exports.removeVolumeBotFromList = exports.removeFromList = exports.isHolderTargetPercentage = exports.returnValidJson = exports.countDecimals = exports.getRange = exports.betweenFloat = exports.getTokenRange = void 0;
const tradeBotRepository_1 = require("../repositories/tradeBotRepository");
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const crypto_2 = require("crypto");
const settings_1 = require("../utils/settings");
const ethers_1 = require("ethers");
const volumeBotRepository_1 = require("../repositories/volumeBotRepository");
const botExecutionRepository_1 = require("../repositories/botExecutionRepository");
const transactionRepository_1 = require("../repositories/transactionRepository");
const tradeBotService_1 = require("../services/tradeBotService");
const scryptAsync = (0, util_1.promisify)(crypto_2.scrypt);
function getTokenRange(min, max, decimalPlaces = 18, retry = 0) {
    try {
        const range = Math.random() * (max - min) + min;
        const roundedRange = Number(range.toFixed(decimalPlaces));
        const finalValue = ethers_1.ethers.parseUnits(roundedRange.toString(), decimalPlaces);
        if (retry > 10) {
            throw 'getTokenRange error: more than 10 retries';
        }
        if (typeof finalValue !== 'bigint' || finalValue < 0) {
            console.log('getTokenRange retry');
            getTokenRange(min, max, decimalPlaces, retry + 1);
        }
        return finalValue;
    }
    catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        else {
            throw error;
        }
    }
}
exports.getTokenRange = getTokenRange;
function betweenFloat(begin, end, retry = 0) {
    try {
        let max = end;
        let min = begin;
        let randNumber = Math.random() * (max - min) + min;
        const finalValue = ethers_1.ethers.parseEther(randNumber.toString());
        if (retry > 10) {
            throw 'getTokenRange error: more than 10 retries';
        }
        if (typeof finalValue !== 'bigint' || finalValue < 0) {
            console.log('betweenFloat retry');
            betweenFloat(begin, end, retry + 1);
        }
        return finalValue;
    }
    catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        else {
            throw error;
        }
    }
}
exports.betweenFloat = betweenFloat;
async function getRange(min, max) {
    try {
        const range = Math.floor(Math.random() * (max - min + 1)) + min;
        return range;
    }
    catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        else {
            throw error;
        }
    }
}
exports.getRange = getRange;
async function countDecimals(x) {
    if (Math.floor(x) === x) {
        return 0;
    }
    return x.toString().split('.')[1].length || 0;
}
exports.countDecimals = countDecimals;
function returnValidJson(isJson) {
    try {
        JSON.parse(isJson);
        return isJson;
    }
    catch (e) {
        return JSON.stringify(isJson);
    }
}
exports.returnValidJson = returnValidJson;
function isHolderTargetPercentage(actualBalance, percentage, initialBalance) {
    const equivalentValue = (percentage / 100) * initialBalance;
    return actualBalance < equivalentValue;
}
exports.isHolderTargetPercentage = isHolderTargetPercentage;
async function removeFromList(list, uuid) {
    const tradeBotRepository = new tradeBotRepository_1.TradeBotRepository();
    await tradeBotRepository.changeActive(uuid, 0);
    const index = list.findIndex((listData) => listData.uuid === uuid);
    if (index !== -1) {
        list.splice(index, 1);
    }
    new tradeBotService_1.TradeBotService().removeFromQueueList(uuid);
}
exports.removeFromList = removeFromList;
async function removeVolumeBotFromList(list, uuid) {
    const volumeBotRepository = new volumeBotRepository_1.VolumeBotRepository();
    await volumeBotRepository.changeActive(uuid, 0);
    const index = list.findIndex((listData) => listData.uuid === uuid);
    if (index !== -1) {
        list.splice(index, 1);
    }
}
exports.removeVolumeBotFromList = removeVolumeBotFromList;
function hideCharacters(str, quant) {
    if (str.length < quant) {
        return str;
    }
    const first = str.substring(0, quant);
    const last = str.substring(str.length - quant);
    let middle = str.length - quant;
    if (middle > 10) {
        middle = 10;
    }
    const middleStars = '*'.repeat(middle);
    return first + middleStars + last;
}
exports.hideCharacters = hideCharacters;
function encrypt(data) {
    try {
        const secretKey = Buffer.from(settings_1.settings.ENCRYPT_32BIT_KEY, 'hex');
        const iv = Buffer.from(settings_1.settings.ENCRYPT_16BIT_IV_KEY, 'hex');
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', secretKey, iv);
        let encryptedData = cipher.update(data, 'utf-8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }
    catch (error) {
        console.log('encrypt error');
        return data;
    }
}
exports.encrypt = encrypt;
function decrypt(data) {
    try {
        if (data.length > 64) {
            const secretKey = Buffer.from(settings_1.settings.ENCRYPT_32BIT_KEY, 'hex');
            const iv = Buffer.from(settings_1.settings.ENCRYPT_16BIT_IV_KEY, 'hex');
            const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', secretKey, iv);
            let decryptedData = decipher.update(data, 'hex', 'utf-8');
            decryptedData += decipher.final('utf-8');
            return decryptedData;
        }
        return data;
    }
    catch (error) {
        console.log('decrypt error', error);
        return data;
    }
}
exports.decrypt = decrypt;
function encryptSignature(message) {
    try {
        const cipher = crypto_1.default.createCipheriv('aes-128-ecb', Buffer.from(`${settings_1.settings.SECRET_KEY}`, 'utf8'), null);
        let encrypted = cipher.update(JSON.stringify(message), 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }
    catch (error) {
        console.log('encryptSignature error');
        return message;
    }
}
exports.encryptSignature = encryptSignature;
function decryptSignature(data) {
    try {
        const source = Buffer.from(data, 'base64');
        const decipher = crypto_1.default.createDecipheriv('aes-128-ecb', settings_1.settings.SECRET_KEY, null);
        const decrypted = Buffer.concat([
            decipher.update(source),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
    catch (error) {
        console.log('decryptSignature error', error);
        return data;
    }
}
exports.decryptSignature = decryptSignature;
async function timerCountdown(time, message, isMinutes) {
    switch (isMinutes) {
        case true:
            if (time % 10 != 0 || time > 1) {
                console.log(`${message} in ${time} minutes...`);
            }
            countMinutes(time, message);
            break;
        default:
            if (time > 0 && time < 60) {
                if (time != 10 && time > 1) {
                    console.log(`${message} in ${time} seconds...`);
                }
                countSeconds(time, message);
            }
            else {
                const minutes = Math.floor(time / 60);
                if (minutes % 10 != 0 && minutes > 1) {
                    console.log(`${message} in ${minutes} minutes...`);
                }
                countMinutes(minutes, message);
            }
            break;
    }
}
exports.timerCountdown = timerCountdown;
function removePercent(amount, percentToReduce) {
    if (percentToReduce === 0) {
        return amount;
    }
    const reducePercent = 100 - percentToReduce;
    const newAmount = amount * BigInt(reducePercent) / BigInt(100);
    return newAmount;
}
exports.removePercent = removePercent;
function calcPercent(amount, percentToCalc, decimals) {
    if (typeof amount !== 'number' || typeof percentToCalc !== 'number') {
        throw new Error('O valor e a porcentagem devem ser números.');
    }
    const finalValue = (amount * percentToCalc) / 100;
    return finalValue.toFixed(decimals);
}
exports.calcPercent = calcPercent;
async function hashPassword(password) {
    const salt = (0, crypto_2.randomBytes)(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64));
    return `${buf.toString("hex")}.${salt}`;
}
exports.hashPassword = hashPassword;
async function comparePassword(storedPassword, suppliedPassword) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64));
    return (0, crypto_2.timingSafeEqual)(hashedPasswordBuf, suppliedPasswordBuf);
}
exports.comparePassword = comparePassword;
function setPage(page) {
    const finalPage = (page - 1) * settings_1.settings.PAGE_SIZE;
    return finalPage;
}
exports.setPage = setPage;
function isTimeDifferenceGreaterThanMinutes(dateString) {
    const specifiedDate = new Date(dateString);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate.getTime() - specifiedDate.getTime();
    return differenceInMilliseconds;
}
exports.isTimeDifferenceGreaterThanMinutes = isTimeDifferenceGreaterThanMinutes;
async function calcStartTime(type, botName, botId, executionType, txBotId, transactionType, startDelay, minDelay, maxDelay, isNewExecution) {
    let isMinutes = true;
    let delay = startDelay * 60000;
    let secondsDelay = 0;
    if (!isNewExecution) {
        const botExecutionRepository = new botExecutionRepository_1.BotExecutionRepository();
        const havePendingExecution = await botExecutionRepository.havePendingExecution(botId, executionType);
        if (havePendingExecution) {
            const transactionRepository = new transactionRepository_1.TransactionRepository();
            const lastTimeExecution = await transactionRepository.lastTransactionByExecutionId(havePendingExecution, txBotId, transactionType);
            if (lastTimeExecution) {
                const delayRange = await getRange(minDelay, maxDelay);
                const timeDifferenceDelay = delayRange - (isTimeDifferenceGreaterThanMinutes(lastTimeExecution) / 1000);
                delay = 0;
                if (timeDifferenceDelay > 0) {
                    secondsDelay = Number(timeDifferenceDelay.toFixed(0));
                    delay = secondsDelay * 1000;
                    isMinutes = false;
                }
            }
        }
    }
    let returnMessage = `[${type}] ${botName} running`;
    if (delay > 0) {
        const message = `[${type}] ${botName} will start`;
        if (isMinutes) {
            returnMessage = `${message} in ${startDelay} minutes`;
            countMinutes(startDelay, message);
        }
        else {
            returnMessage = `${message} in ${secondsDelay} seconds`;
            countSeconds(secondsDelay, message);
        }
    }
    return { delay: delay, message: returnMessage };
}
exports.calcStartTime = calcStartTime;
function distributeTotalAmount(totalAmount, distributionTimes, attempt = 0) {
    try {
        if (attempt > 30) {
            throw 'Failed to distribute total amount after 10 attempts';
        }
        const baseAmount = totalAmount / distributionTimes;
        const amounts = [];
        for (let i = 0; i < distributionTimes; i++) {
            const minVariation = 0.05 * baseAmount;
            const maxVariation = 0.20 * baseAmount;
            const variation = Math.random() * (maxVariation - minVariation) + minVariation;
            const amount = Math.random() < 0.5 ? baseAmount - variation : baseAmount + variation;
            amounts.push(amount);
        }
        let sum = amounts.reduce((acc, curr) => acc + curr, 0);
        let adjustmentFactor = totalAmount / sum;
        for (let i = 0; i < amounts.length; i++) {
            amounts[i] *= adjustmentFactor;
        }
        const uniqueAmounts = new Set(amounts);
        if (uniqueAmounts.size !== amounts.length) {
            console.log('Recalculating...');
            return distributeTotalAmount(totalAmount, distributionTimes, attempt + 1);
        }
        let finalSum = 0;
        amounts.forEach(amount => {
            finalSum += amount;
        });
        if (finalSum !== totalAmount) {
            console.log('Recalculating...');
            return distributeTotalAmount(totalAmount, distributionTimes, attempt + 1);
        }
        return amounts;
    }
    catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        else {
            throw error;
        }
    }
}
exports.distributeTotalAmount = distributeTotalAmount;
async function countSeconds(seconds, message) {
    seconds--;
    if (seconds > 0) {
        if (seconds === 10) {
            console.log(`${message} in ${seconds} seconds...`);
        }
        setTimeout(() => {
            countSeconds(seconds, message);
        }, 1000);
    }
}
async function countMinutes(minutes, message) {
    if (minutes > 0) {
        if (minutes % 10 === 0 || minutes === 1) {
            console.log(`${message} in ${minutes} minutes...`);
        }
        setTimeout(() => {
            countMinutes(minutes, message);
        }, 60000);
    }
    minutes--;
}
function perAmount(amount, per) {
    const partes = [];
    let somaPartes = 0n;
    for (let i = 0; i < per - 1; i++) {
        const valorMedio = (amount - somaPartes) / BigInt(per - i);
        const variacao = BigInt(Math.floor(Math.random() * Number(valorMedio / 2n)));
        const parte = valorMedio + variacao;
        partes.push(parte);
        somaPartes += parte;
    }
    partes.push(amount - somaPartes);
    partes.sort(() => Math.random() - 0.5);
    return partes;
}
exports.perAmount = perAmount;
function divideAmount(amount) {
    const percentage = Math.random() * (0.7 - 0.3) + 0.3;
    const firstPart = BigInt(Math.floor(Number(amount) * percentage));
    const secondPart = amount - firstPart;
    return [firstPart, secondPart];
}
exports.divideAmount = divideAmount;
function isBettweenTime(start, end) {
    if (start != '00:00' || end != '00:00') {
        const currentTime = new Date();
        const currentHours = currentTime.getHours();
        const currentMinutes = currentTime.getMinutes();
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);
        let isCurrentTimeWithinRange;
        if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
            isCurrentTimeWithinRange = (currentHours > startHours || (currentHours === startHours && currentMinutes >= startMinutes)) ||
                (currentHours < endHours || (currentHours === endHours && currentMinutes <= endMinutes));
        }
        else {
            isCurrentTimeWithinRange = (currentHours > startHours || (currentHours === startHours && currentMinutes >= startMinutes)) &&
                (currentHours < endHours || (currentHours === endHours && currentMinutes <= endMinutes));
        }
        if (!isCurrentTimeWithinRange) {
            return false;
        }
    }
    return true;
}
exports.isBettweenTime = isBettweenTime;
//# sourceMappingURL=functionsHelper.js.map