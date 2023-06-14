import React, { useEffect, useRef } from 'react';

const GlobalClose = ({
                       openListener,
                       onClose,
                       stopPropagation,
                       children,
                     }) => {
  const aimRef = useRef(null);

  useEffect(() => {
    const closeFunc = (e) => {
      if (aimRef.current && aimRef.current.contains(e.target)) return;
      onClose(e);
      if (stopPropagation) {
        e.stopPropagation();
        e.cancelBubble = true;
      }
    };

    if (openListener) {
      document.body.addEventListener('click', closeFunc, true);
      document.body.addEventListener('touchmove', closeFunc, true);
    } else {
      document.body.removeEventListener('click', closeFunc, true);
      document.body.removeEventListener('touchmove', closeFunc, true);
    }

    return () => {
      document.body.removeEventListener('click', closeFunc, true);
      document.body.removeEventListener('touchmove', closeFunc, true);
    };
  }, [openListener]);

  if (typeof children.type === 'string') {
    return (
      React.cloneElement(
        children,
        {
          ref: aimRef,
        },
      )
    );
  }
  return (
    <div ref={aimRef}>
      {children}
    </div>
  );
};

export default GlobalClose;
