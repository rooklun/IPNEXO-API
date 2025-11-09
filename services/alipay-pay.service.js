const AlipaySdk = require('alipay-sdk').default;
const { AppError } = require('../middleware/error.middleware');

function getSdk() {
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_APP_PRIVATE_KEY; // PKCS1/PKCS8
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
  if (!appId || !privateKey || !alipayPublicKey) {
    throw new AppError('未配置支付宝密钥', 500);
  }
  return new AlipaySdk({
    appId,
    privateKey,
    alipayPublicKey,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    signType: process.env.ALIPAY_SIGN_TYPE || 'RSA2'
  });
}

async function createWapPay({ outTradeNo, subject, totalAmount, returnUrl, quitUrl }) {
  const sdk = getSdk();
  const params = {
    subject,
    out_trade_no: outTradeNo,
    total_amount: String(totalAmount),
    product_code: 'QUICK_WAP_WAY',
    quit_url: quitUrl || returnUrl,
  };
  // 返回的是跳转用的表单HTML
  const result = await sdk.exec('alipay.trade.wap.pay', {
    notifyUrl: process.env.ALIPAY_NOTIFY_URL,
    returnUrl,
    bizContent: params,
  }, { method: 'GET' });
  return { payUrl: result };
}

async function createPagePay({ outTradeNo, subject, totalAmount, returnUrl }) {
  const sdk = getSdk();
  const params = {
    subject,
    out_trade_no: outTradeNo,
    total_amount: String(totalAmount),
    product_code: 'FAST_INSTANT_TRADE_PAY',
  };
  const result = await sdk.exec('alipay.trade.page.pay', {
    notifyUrl: process.env.ALIPAY_NOTIFY_URL,
    returnUrl,
    bizContent: params,
  }, { method: 'GET' });
  return { payUrl: result };
}

async function createQrPrecreate({ outTradeNo, subject, totalAmount }) {
  const sdk = getSdk();
  const res = await sdk.exec('alipay.trade.precreate', {
    notifyUrl: process.env.ALIPAY_NOTIFY_URL,
    bizContent: {
      subject,
      out_trade_no: outTradeNo,
      total_amount: String(totalAmount),
    },
  });
  if (!res || !res.alipay_trade_precreate_response || res.alipay_trade_precreate_response.code !== '10000') {
    throw new AppError(res?.alipay_trade_precreate_response?.sub_msg || '支付宝下单失败', 500);
  }
  return { qrCode: res.alipay_trade_precreate_response.qr_code };
}

async function verifyNotify(body) {
  const sdk = getSdk();
  const ok = sdk.checkNotifySign(body);
  if (!ok) throw new AppError('支付宝回调验签失败', 400);
  // 解析关键字段
  const outTradeNo = body.out_trade_no;
  const tradeNo = body.trade_no;
  const tradeStatus = body.trade_status; // TRADE_SUCCESS, TRADE_FINISHED
  const totalAmount = body.total_amount;
  return { outTradeNo, tradeNo, tradeStatus, totalAmount };
}

module.exports = {
  createWapPay,
  createPagePay,
  createQrPrecreate,
  verifyNotify,
};
