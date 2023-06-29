import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import useStore from '@/store';
import { AuthManager } from '@/storage_manager/AuthManager';

const authManager = new AuthManager();

// 读取fileList folderList
export default function SimpleLogin() {
  const [isLogin, updateIsLogin] = useStore.isLogin();

  useEffect(() => {
    authManager.onAuthChange((isAuth) => {
      updateIsLogin((draftRef) => {
        draftRef.current = isAuth;
      });
    }, []);
  }, []);

  return (
    <ContainerSC>
      {
        !isLogin && (
          <LoginSC
            onClick={() => authManager.signIn()}
          >
            <div className="icon">
              <img
                alt=""
                src="/dropbox-1.svg"
              />
            </div>
            <div className="label">Sign in with Dropbox</div>
          </LoginSC>
        )
      }
    </ContainerSC>
  );
}

const ContainerSC = styled('div')`
`;

const LoginSC = styled('div')`
  height: 32px;
  padding: 0 20px;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
  font-weight: 00;
  color: #bababa;
  background: rgb(51, 52, 54);
  box-shadow: 0 2px 2px 0 rgb(0 0 0 / 1%), 0 3px 1px -2px rgb(0 0 0 / 6%), 0 1px 5px 0 rgb(0 0 0 / 3%);
  user-select: none;


  .icon {
    height: 100%;
    margin-right: 5px;
    display: flex;
    align-items: center;

    img {
      margin-top: auto;
      margin-bottom: auto;
      height: 50%;
    }
  }

  .label {
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
  }
`;

const LoginInfoSC = styled('div')`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #BA9726;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
  letter-spacing: 1px;
  cursor: pointer;
`;
