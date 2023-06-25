import globalState from './globalState';

const useStore = globalState({
  isLogin: false,
  deviceInfo: {
    // 'xs': 416px,
    //   'sm': 600px,
    //   'md': 768px,
    //   'lg': 1024px,
    //   'xl': 1280px,
    //   'xxl': 1520px,
    size: 'checking',
    type: 'checking', // 'checking' 'desktop' 'tablet' 'mobile'
    isTouchDevice: 'checking', // false, true
    px: 'checking',
  },
});

export default useStore;
