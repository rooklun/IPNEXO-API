// 生成16位纯数字UID：10位秒级时间戳 + 6位随机数
function generateNumericUid() {
  const sec = Math.floor(Date.now() / 1000).toString(); // 10 位
  const rand = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0'); // 6 位
  return sec + rand; // 16 位纯数字
}

module.exports = { generateNumericUid };