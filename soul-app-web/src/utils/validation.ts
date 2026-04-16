const BAD_WORDS = [
  'admin',
  '官方',
  'soul',
  'system',
  '管理员',
  '操',
  '艹',
  'guanfang',
  'guanliyuan',
  'caonima',
  'nima',
  'shabi',
  'sb'
];

export const validateNickname = (nickname: string): string | null => {
  if (!nickname) return null;

  if (nickname.length < 2 || nickname.length > 12) {
    return '昵称长度需在 2-12 个字符之间';
  }

  const regex = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;
  if (!regex.test(nickname)) {
    return '昵称只能包含中英文和数字';
  }

  const lowerNickname = nickname.toLowerCase();
  if (BAD_WORDS.some((word) => lowerNickname.includes(word.toLowerCase()))) {
    return '昵称包含不合适的内容';
  }

  return null;
};
