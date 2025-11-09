const crypto = require('crypto');
const axios = require('axios');
const { AppError } = require('../middleware/error.middleware');

// 简化版：仅实现 Native 下单与回调解密（未做平台证书签名校验，生产需补齐）

function getConfig() {
  const cfg = {
    mchId: process.env.WX_MCH_ID,
    appId: process.env.WX_APP_ID,
    apiKeyV3: process.env.WX_API_KEY_V3,
  };
  if (!cfg.mchId || !cfg.appId || !cfg.apiKeyV3) {
    throw new AppError('未配置微信支付密钥', 500);
  }
  return cfg;
}

async function createNative({ outTradeNo, description, totalAmount, notifyUrl }) {
  const cfg = getConfig();
  const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native';
  const payload = {
    appid: cfg.appId,
    mchid: cfg.mchId,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl || process.env.WX_NOTIFY_URL,
    amount: { total: Math.round(Number(totalAmount) * 100), currency: 'CNY' },
  };
  // 这里为了简化没有做 HTTP 签名，推荐使用 wechatpay-node-v3 SDK
  const resp = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (!resp.data || !resp.data.code_url) {
    throw new AppError('微信下单失败', 500);
  }
  return { codeUrl: resp.data.code_url };
}

function decryptNotify(resource, apiKeyV3) {
  const { ciphertext, nonce, associated_data } = resource;
  const aad = Buffer.from(associated_data || '');
  const iv = Buffer.from(nonce, 'utf8');
  const key = Buffer.from(apiKeyV3, 'utf8');
  const data = Buffer.from(ciphertext, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(data.slice(data.length - 16));
  if (aad.length) decipher.setAAD(aad);
  const decoded = Buffer.concat([
    decipher.update(data.slice(0, -16)),
    decipher.final()
  ]);
  return JSON.parse(decoded.toString('utf8'));
}

async function parseNotify(body) {
  const cfg = getConfig();
  if (!body || body.event_type !== 'TRANSACTION.SUCCESS') {
    throw new AppError('微信回调非成功事件', 400);
  }
  const obj = decryptNotify(body.resource, cfg.apiKeyV3);
  // obj 示例字段：out_trade_no, transaction_id, success_time, payer, amount
  return {
    outTradeNo: obj.out_trade_no,
    transactionId: obj.transaction_id,
    successTime: obj.success_time,
    total: obj.amount?.total,
    raw: obj,
  };
}

module.exports = {
  createNative,
  parseNotify,
};
