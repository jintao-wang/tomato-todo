import globalState from './globalState';

/**
 * @typedef {Object} GlobalStateType
 *
 * @property {string} isLogin
 * @property {object} deviceInfo
 * @property {[TomatoTaskType]} tomatoTaskList
 * @property {string} activeTomatoUUID
 * @property {boolean} ongoing
 * @property {boolean} leftMenuDisplay
 */

/** @type {GlobalStateType} */
const initState = {
  isLogin: false,
  deviceInfo: {
    size: 'checking',
    type: 'checking', // 'checking' 'desktop' 'tablet' 'mobile'
    isTouchDevice: 'checking', // false, true
    px: 'checking',
  },
  tomatoTaskList: [],
  activeTomatoUUID: null,
  ongoing: false,
  leftMenuDisplay: true,
};

const useStore = globalState(initState);

export default useStore;
