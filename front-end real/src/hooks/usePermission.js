// 权限判断 Hook
//
// 只封装当前项目已有的权限判断逻辑，不改变现有 role 判断规则：
//   - role 来源：localStorage.getItem(STORAGE_KEYS.ROLE)，默认 DEFAULT_ROLE
//   - 可见性规则：菜单不写 roles = 所有角色可见；写了 roles = 当前角色在数组里才可见
//
// 不引入 Redux / Zustand / AuthContext 等状态管理方案
// 不关心具体菜单内容，只是通用的"当前角色能否访问某资源"

import { useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_ROLE } from '../constants/storageKeys';

export default function usePermission() {
  // 与原 Sidebar 中逻辑一致：从 localStorage 读当前登录用户的角色
  const currentRole = localStorage.getItem(STORAGE_KEYS.ROLE) || DEFAULT_ROLE;

  // 判断当前用户是否在允许的角色列表中
  // roles 为 undefined / null / 空数组时表示不限制（所有角色可见）
  const hasRole = useCallback((roles) => {
    if (!roles || roles.length === 0) return true;
    return roles.includes(currentRole);
  }, [currentRole]);

  return { currentRole, hasRole };
}
