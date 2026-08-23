// localStorage 的 key 集中管理 + 默认值
//
// 抽取原因：'token' / 'role' / 'username' 三个字符串散落在 7+ 个文件中
// 重复使用，容易拼写错误；改名时需要改多处。集中到此处统一维护。
//
// 用法：
//   import { STORAGE_KEYS, DEFAULT_ROLE } from '../constants/storageKeys';
//   localStorage.getItem(STORAGE_KEYS.TOKEN)
//   localStorage.setItem(STORAGE_KEYS.ROLE, role)

export const STORAGE_KEYS = {
  TOKEN: 'token',
  ROLE: 'role',
  USERNAME: 'username',
};

// 角色默认值：localStorage 中无 role 时回退使用
export const DEFAULT_ROLE = 'user';

// 用户名默认值：localStorage 中无 username 时回退使用
export const DEFAULT_USERNAME = '';
