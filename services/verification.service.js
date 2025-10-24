let redis = null;

function getRedis() {
  if (redis !== null) return redis;
  try {
    if (process.env.REDIS_URL) {
      const IORedis = require('ioredis');
      redis = new IORedis(process.env.REDIS_URL);
    } else {
      redis = undefined;
    }
  } catch {
    redis = undefined;
  }
  return redis;
}

function codeKey(phone, purpose = 'register') {
  return `sms:code:${purpose}:${phone}`;
}

function rateKey(phone, purpose = 'register') {
  return `sms:rate:${purpose}:${phone}`;
}

// 存储验证码（默认5分钟过期）
async function setPhoneCode(phone, code, ttlSeconds = 300, purpose = 'register') {
  const client = getRedis();
  if (!client) return true; // 无Redis则直接返回true，开发兜底
  await client.set(codeKey(phone, purpose), code, 'EX', ttlSeconds);
  return true;
}

async function getPhoneCode(phone, purpose = 'register') {
  const client = getRedis();
  if (!client) return null;
  return client.get(codeKey(phone, purpose));
}

async function deletePhoneCode(phone, purpose = 'register') {
  const client = getRedis();
  if (!client) return true;
  await client.del(codeKey(phone, purpose));
  return true;
}

// 简单限频：60秒内同一手机号+用途只能发一次，且每日最多10次
async function canSendSms(phone, purpose = 'register') {
  const client = getRedis();
  if (!client) return true;

  const kBurst = rateKey(phone, purpose);         // 60s 限制
  const kDaily = `${kBurst}:daily`;               // 当日次数
  const ttlBurst = await client.ttl(kBurst);

  if (ttlBurst > 0) return false; // 还在冷却期

  const daily = await client.get(kDaily);
  if (daily && Number(daily) >= 10) return false;

  // 设置冷却60s
  await client.set(kBurst, '1', 'EX', 60);

  // 递增日计数，并设置到当天23:59:59过期
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const secondsLeft = Math.max(1, Math.floor((end - now) / 1000));

  await client.multi()
    .incr(kDaily)
    .expire(kDaily, secondsLeft)
    .exec();

  return true;
}

async function verifyPhoneCode(phone, code, purpose = 'register') {
  if (!phone || !code) return false;

  const client = getRedis();
  const key = codeKey(phone, purpose);

  if (client) {
    const stored = await client.get(key);
    if (!stored) return false;
    const ok = stored === code;
    if (ok) {
      await client.del(key); // 使用一次即作废
    }
    return ok;
  }

  // 开发兜底（生产务必配置 Redis 与真实校验）
  if (process.env.NODE_ENV !== 'production') {
    return code === '000000' || code === '666666';
  }

  return false;
}

module.exports = {
  getRedis,
  setPhoneCode,
  getPhoneCode,
  deletePhoneCode,
  canSendSms,
  verifyPhoneCode
};