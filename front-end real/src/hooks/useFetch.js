// 通用请求状态管理 Hook
//
// 只负责样板化的 data / loading / error 三态管理：
//   - data       请求成功的数据
//   - loading    是否正在请求
//   - error      失败时的错误信息（字符串）
//   - refetch()  手动重新触发请求（用最新的 fetcher 闭包）
//   - setData()  直接改 data，用于删除某行后局部更新等场景
//
// useFetch 不关心业务：
//   - 不知道 users/audit-logs/dashboard 是什么
//   - 不替页面决定如何展示 error（默认提取 err.response.data.message || err.message）
//   - 不替页面决定如何处理返回数据（通过 transform 自定义）
//
// 参数：
//   fetcher        返回 axios response 的异步函数
//   options.initialData    data 的初始值（默认 null）
//   options.transform      把 response 转成 data 的函数（默认 res => res.data）
//   options.immediate     挂载时是否自动请求（默认 true）
//   options.onError       可选错误回调，接收 err
//
// 设计要点：
//   - fetcher / transform / onError 用 ref 持有，每次渲染更新到最新闭包
//   - run() 用 useCallback([]) 稳定引用，避免作为依赖项时引起无限 useEffect
//   - useEffect 只在挂载时跑一次，参数化请求由页面手动调 refetch

import { useState, useEffect, useRef, useCallback } from 'react';

export default function useFetch(fetcher, options = {}) {
  const {
    initialData = null,
    transform = (res) => res.data,
    immediate = true,
    onError,
  } = options;

  const [data, setData] = useState(initialData);
  // immediate=true 时挂载即请求，所以初始 loading 也为 true，避免首屏闪烁
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // 用 ref 持有最新闭包：fetcher 每次渲染都会变，但 ref 不会触发 useEffect 重跑
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const transformRef = useRef(transform);
  transformRef.current = transform;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current();
      const next = transformRef.current(res);
      setData(next);
      return res;
    } catch (err) {
      console.error('[useFetch] 请求失败', err);
      // 提取错误信息的标准顺序：后端业务 message → 原生 message → 兜底文案
      const msg = err?.response?.data?.message || err?.message || '请求失败';
      setError(msg);
      if (onErrorRef.current) onErrorRef.current(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      // run() 内部 catch 了，但 refetch 时仍会 throw，挂载场景吞掉即可
      run().catch(() => {});
    }
    // 只在挂载时跑一次；后续刷新由 refetch 手动触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: run, setData };
}
