const Core = require('@alicloud/pop-core');

function getClient() {
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const regionId = process.env.ALIYUN_SMS_REGION || 'cn-hangzhou';

  if (!accessKeyId || !accessKeySecret) {
    throw new Error('Aliyun SMS env not configured: ALIYUN_ACCESS_KEY_ID/SECRET required');
  }

  return new Core({
    accessKeyId,
    accessKeySecret,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25',
    regionId
  });
}

/**
 * 发送短信验证码
 * @param {string} phone 11位手机号
 * @param {string} code 6位数字验证码
 * @param {object} options { signName, templateCode, templateParam }
 */
async function sendSms(phone, code, options = {}) {
  const client = getClient();
  const SignName = options.signName || process.env.ALIYUN_SMS_SIGN_NAME;
  const TemplateCode = options.templateCode || process.env.ALIYUN_SMS_TEMPLATE_CODE;
  const TemplateParam = JSON.stringify(options.templateParam || { code });

  if (!SignName || !TemplateCode) {
    throw new Error('Aliyun SMS SignName or TemplateCode not configured');
  }

  const params = {
    RegionId: process.env.ALIYUN_SMS_REGION || 'cn-hangzhou',
    PhoneNumbers: phone,
    SignName,
    TemplateCode,
    TemplateParam
  };

  const requestOption = { method: 'POST' };
  const res = await client.request('SendSms', params, requestOption);

  if (res && res.Code !== 'OK') {
    const msg = res.Message || 'Aliyun SMS send failed';
    const code = res.Code || 'SMS_ERROR';
    const err = new Error(msg);
    err.code = code;
    throw err;
  }

  return res;
}

module.exports = { sendSms };