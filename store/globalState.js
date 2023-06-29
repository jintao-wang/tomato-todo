// @ts-check
import { useEffect, useState } from 'react';
import { produce } from 'immer';

/**
 * 这个函数接受一个任意对象，并返回一个新对象。
 * 在这个新对象中，每个键对应的值都是一个函数。
 *
 * @template T 输入的任意对象类型
 * @param {T} allInitState - 输入的任意对象
 * @returns {{ [P in keyof T]: () => [T[P], (callback: (arg: { current: T[P] }) => void) => void] }} 返回的对象，其键是输入对象的键，值是一个函数
 */
const globalState = (allInitState) => {
  const allUseRef = {};
  const allStateRef = {};
  Object.keys(allInitState).forEach((key) => {
    allUseRef[key] = new Set();
    allStateRef[key] = {
      current: allInitState[key],
    };
  });

  const updateState = (key) => (func) => {
    const oldStateRef = allStateRef[key];
    allStateRef[key] = produce(allStateRef[key], (draftState) => {
      func(draftState);
    });

    if (oldStateRef.current !== allStateRef[key].current) {
      const setStateSet = allUseRef[key];
      allUseRef[key] = new Set();
      for (const setState of setStateSet) {
        setState(allStateRef[key].current);
      }
    }
  };

  // @ts-ignore
  return Object.keys(allInitState).reduce(
    (preValue, registerKey) => {
      preValue[registerKey] = () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [, setState] = useState();

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          allUseRef[registerKey].add(setState); // 订阅
          return () => { // 组件销毁时取消
            allUseRef[registerKey].delete(setState);
          };
        });

        // eslint-disable-next-line no-prototype-builtins
        if (allStateRef.hasOwnProperty(registerKey)) {
          return [allStateRef[registerKey].current, updateState(registerKey)];
        }
        return [];
      };
      return preValue;
    },
    {},
  );
};

export default globalState;
