import { useEffect, useState } from 'react';
import {produce} from 'immer';

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

  return (registerKey) => {
    const [, setState] = useState();

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
    alert('this state is not register');
    return [];
  };
};

export default globalState;
