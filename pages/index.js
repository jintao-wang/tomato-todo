import React, { useState, useMemo } from 'react';

import styled from 'styled-components';
import Script from 'next/script';
import { TOMATO_OPERATE } from '@/enum/TaskOperate';
import TopBar from '@/business_components/top_bar';
import { LeftMenu } from '@/business_components/left_menu';
import useStore from '@/store';
import { BREAK_POINTS } from '@/enum/BreakPoints';
import TouchCommon from '@/basic_components/touch_common/TouchCommon';
import { isIpadOS } from '@/common/isIpadOS';

export default function Home() {
  const [tomatoTaskList, updateTomatoTaskList] = useStore.tomatoTaskList();
  const [activeTomatoUUID, updateActiveTomatoTaskUUID] = useStore.activeTomatoUUID();
  const [, updateOngoing] = useStore.ongoing();
  const [leftMenuDisplay, updateLeftMenuDisplay] = useStore.leftMenuDisplay();

  const activeTomatoTask = useMemo(() => tomatoTaskList.find((task) => task.uuid === activeTomatoUUID), [tomatoTaskList, activeTomatoUUID]);

  const finishCurTomato = () => {
    updateTomatoTaskList((draftRef) => {
      const index = draftRef.current.findIndex((todo) => todo.uuid === activeTomatoUUID);
      const oldState = draftRef.current[index];
      const newState = oldState.finishCurTomato();
      draftRef.current[index] = newState;
      updateOngoing((draftRef) => {
        draftRef.current = newState.onGoing;
      });
    });
  };

  const discardedCurTomato = () => {
    updateTomatoTaskList((draftRef) => {
      const index = draftRef.current.findIndex((todo) => todo.uuid === activeTomatoUUID);
      const oldState = draftRef.current[index];
      const newState = oldState.discardedCurTomato();
      draftRef.current[index] = newState;
      updateOngoing((draftRef) => {
        draftRef.current = newState.onGoing;
      });
    });
  };

  const handleStatusChange = (tomatoTaskUUID) => {
    updateActiveTomatoTaskUUID((draftRef) => {
      draftRef.current = tomatoTaskUUID;
    });
    updateTomatoTaskList((draftRef) => {
      const ongoingItems = draftRef.current.filter((todo) => todo.onGoing && todo.uuid !== tomatoTaskUUID);
      ongoingItems.forEach((ongoingItem) => {
        const newState = ongoingItem.stopTomato();
        const index = draftRef.current.findIndex((todo) => todo.uuid === ongoingItem.uuid);
        draftRef.current[index] = newState;
      });

      const index = draftRef.current.findIndex((todo) => todo.uuid === tomatoTaskUUID);
      const oldState = draftRef.current[index];
      const newState = oldState.updateTomatoToNextStatus();
      draftRef.current[index] = newState;
      updateOngoing((draftRef) => {
        draftRef.current = newState.onGoing;
      });
    });
  };

  return (
    <>
      <Script
        src="index.worker.js"
        strategy="beforeInteractive"
      />
      <ContainerSC visible={leftMenuDisplay}>
        <LeftMenuSC visible={leftMenuDisplay}>
          <LeftMenu />
        </LeftMenuSC>
        <ContentSC>
          <TopBar />
          <TouchCommon
            on_touchEnd={(e) => {
              if (Math.abs(e.x_move) < 100) return;
              if (e.direction === 'right') {
                updateLeftMenuDisplay((draftRef) => {
                  draftRef.current = true;
                });
              } else if (e.direction === 'left' && isIpadOS()) {
                updateLeftMenuDisplay((draftRef) => {
                  draftRef.current = false;
                });
              }
            }}
          >
            <div className="content">
              <TimeDisplaySC>
                {activeTomatoTask && Array.from(activeTomatoTask.displayTime).map((char) => (
                  <NumberSpanSC>{char}</NumberSpanSC>))}
                <div className="title">{activeTomatoTask?.title}</div>
                {
                  activeTomatoTask && (
                    <div className="operate-container">
                      <div
                        className="operate-item"
                        onClick={discardedCurTomato}
                      >
                        {TOMATO_OPERATE.DISCARDED}
                      </div>
                      <div
                        className="operate-item"
                        onClick={() => handleStatusChange(activeTomatoTask.uuid)}
                      >
                        {activeTomatoTask.operate}
                      </div>
                      <div
                        className="operate-item"
                        onClick={finishCurTomato}
                      >
                        {TOMATO_OPERATE.COMPLETED}
                      </div>
                    </div>
                  )
                }
              </TimeDisplaySC>
            </div>
          </TouchCommon>
        </ContentSC>
      </ContainerSC>
    </>
  );
}

const ContainerSC = styled('div', 'visible').attrs((props) => props.theme.deviceInfo.px < BREAK_POINTS.sm && ({
  className: ['sm'],
}))`
  background: rgb(49, 49, 49);
  min-height: 100vh;
  color: rgb(186, 186, 186);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;


  &.sm {
    right: unset;
    width: 200vw;
    transform: ${(props) => !props.visible && 'translateX(-100vw)'};
    transition: transform 0.2s;
  }
`;

const LeftMenuSC = styled('div', 'visible')`
  background: rgb(59, 63, 66);
  height: 100%;

  width: ${(props) => ((props.theme.deviceInfo.px > BREAK_POINTS.sm && props.theme.deviceInfo.px < BREAK_POINTS.xl && !props.visible) ? 0 : 'fit-content')};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.5s, width 0.5s;
  padding-top: constant(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-left: constant(safe-area-inset-left);

  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  box-sizing: border-box;
`;

const ContentSC = styled('div')`
  flex: 1;
  width: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  box-sizing: border-box;

  overflow: hidden;
  position: relative;
  flex-direction: column;
  padding-top: constant(safe-area-inset-top);
  padding-bottom: constant(safe-area-inset-bottom);
  padding-right: constant(safe-area-inset-right);

  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-right: env(safe-area-inset-right);
  
  .content {
    flex: 1;
    display: flex;
    align-items: center;
    text-align: center;
  }
`;

const TimeDisplaySC = styled('div')`
  display: flex;
  position: relative;
  
  .title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 100%;
    width: fit-content;
    margin: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .operate-container {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 100%;
    width: 100%;
    margin: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    
    .operate-item {
      cursor: pointer;
    }
  }

  //@media (max-height: 350px) {
  //  .title {
  //    display: none;
  //  }
  //}
`;

const NumberSpanSC = styled('span')`
  width: 68px;
  font-weight: 600;
  font-size: 96px;

  @media (max-height: 350px) {
    font-size: 48px;
    width: 38px;
  }
`;
