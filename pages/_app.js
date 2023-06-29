import React, { useEffect, useState } from 'react';
import useStore from '@/store';
import { ThemeProvider } from 'styled-components';
import useDeviceInfo from '@/basic_hooks/useDeviceInfo';
import GlobalStyles from '@/styles/global';

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
  const [deviceInfo] = useStore.deviceInfo();
  const [theme, setTheme] = useState({ deviceInfo });

  useDeviceInfo();
  useEffect(() => {
    setTheme((_theme) => ({
      ..._theme,
      deviceInfo,
    }));
  }, [deviceInfo]);
  return (
    <ThemeProvider theme={theme}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
      <GlobalStyles />
    </ThemeProvider>
  );
}

export default MyApp;
