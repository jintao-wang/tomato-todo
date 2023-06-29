import styled from 'styled-components';
import React, { useState, useMemo, useEffect } from 'react';
import useSWR from 'swr';
import { StorageManager } from '@/storage_manager/StorageManager';
import TomatoIcon from '@/icons/TomatoIcon';
import { TomatoTask } from '@/model/TomatoTask';
import { TOMATO_TIME } from '@/config';
import GlobalClose from '@/basic_components/global_close';
import InputContainer from '@/basic_components/input_container';
import { TASK_STATUS } from '@/enum/TaskStatus';
import useStore from '@/store';
import { BREAK_POINTS } from '@/enum/BreakPoints';

const storageManager = new StorageManager();
export function LeftMenu() {
  const [tomatoTaskList, updateTomatoTaskList] = useStore.tomatoTaskList();
  const [activeTomatoUUID, updateActiveTomatoTaskUUID] = useStore.activeTomatoUUID();
  const [ongoing, updateOngoing] = useStore.ongoing();
  const [isAdd, setIsAdd] = useState(false);
  const [, updateLeftMenuDisplay] = useStore.leftMenuDisplay();
  const [deviceInfo] = useStore.deviceInfo();

  const {
    data: allTaskList,
    error: getRemoteDataError,
  } = useSWR('getTaskList', storageManager.getTaskList.bind(storageManager));

  useEffect(() => {
    if (allTaskList?.length) {
      updateActiveTomatoTaskUUID((draftRef) => {
        if (!draftRef.current) {
          draftRef.current = allTaskList[0].uuid;
        }
      });
      updateTomatoTaskList((draftRef) => {
        draftRef.current.length = 0;
        allTaskList.forEach((task) => {
          draftRef.current.push(new TomatoTask(task));
        });
      });
    }
  }, [allTaskList]);

  useEffect(() => {
    const handleStorageChangeListener = (taskList) => {
      updateTomatoTaskList((draft) => {
        draft.length = 0;
        taskList.forEach((task) => {
          draft.push(new TomatoTask(task));
        });
      });
    };
    storageManager.addStorageChangeListener(handleStorageChangeListener);

    return () => {
      storageManager.removeStorageChangeListener(handleStorageChangeListener);
    };
  }, []);

  useEffect(() => {
    tomatoTaskList.forEach((task) => {
      storageManager.getTask(task.uuid).then((dbTask) => {
        if (!dbTask) {
          storageManager.addTask(task.storeIndexDBData);
        } else if (new Date(dbTask.updatedAt).getTime() < new Date(task.updatedAt).getTime()) {
            storageManager.putTask(task.storeIndexDBData);
          }
      });
    });
  }, [tomatoTaskList]);

  useEffect(() => {
    const { setIntervalInWorker, clearIntervalInWorker } = window.workerApi;
    let timer;
    if (ongoing) {
      setIntervalInWorker(() => {
        updateTomatoTaskList((draftRef) => {
          const index = draftRef.current.findIndex((todo) => todo.uuid === activeTomatoUUID);
          let task = draftRef.current[index];
          if (task.currentTomatoTime < TOMATO_TIME * 60 * 1000) {
            task = task.addCurrentTomatoTime(1);
          } else {
            notification('已完成一个番茄todo');
            task = task.finishCurTomato();
            updateOngoing((draftRef) => {
              draftRef.current = false;
            });
          }
          draftRef.current[index] = task;
        });
      }, 1000).then((_timer) => { timer = _timer; });
    }
    return () => {
      clearIntervalInWorker(timer);
    };
  }, [ongoing, activeTomatoUUID]);

  const notification = (info) => {
    if (!('Notification' in window)) {
      // 检查浏览器是否支持Notifications API

      alert('此浏览器不支持桌面通知');
    } else if (Notification.permission === 'granted') {
      // 检查用户是否已经给予通知权限

      // 如果已经授权，我们可以发送一个通知
      new Notification(info);
    } else if (Notification.permission !== 'denied') {
      // 否则，我们需要请求用户的权限

      Notification.requestPermission().then((permission) => {
        // 如果用户接受了权限请求，那么我们就可以发送一个通知
        if (permission === 'granted') {
          new Notification(info);
        }
      });
    }
  };

  const createNewTodo = (todoName) => {
    const tomatoTask = new TomatoTask({
      title: todoName,
    });

    updateTomatoTaskList((draftRef) => {
      draftRef.current.push(tomatoTask);
    });
  };

  const handleStatusChange = (tomatoTaskUUID) => {
    if (deviceInfo.px < BREAK_POINTS.sm) {
      updateLeftMenuDisplay((draftRef) => {
        draftRef.current = false;
      });
    }
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

  const handleDelete = (tomatoTaskUUID) => {
    if (activeTomatoUUID === tomatoTaskUUID) {
      updateActiveTomatoTaskUUID((draftRef) => {
        draftRef.current = tomatoTaskUUID;
      });
    }
    updateTomatoTaskList((draftRef) => {
      const index = draftRef.current.findIndex((todo) => todo.uuid === tomatoTaskUUID);
      const oldState = draftRef.current[index];
      draftRef.current[index] = oldState.updateTaskStatus(TASK_STATUS.DELETE);
    });
    updateOngoing((draftRef) => {
      draftRef.current = false;
    });
  };

  const todayTomatoRender = (num) => {
    if (num <= 0) return null;
    const items = [];

    for (let i = 0; i < num; i += 1) {
      items.push(<TomatoItemSC key={i}><TomatoIcon /></TomatoItemSC>);
    }

    return <TomatoContainerSC>{items}</TomatoContainerSC>;
  };

    return (
      <ContainerSC>
        <ContentSC>
          <AddSC onClick={() => setIsAdd(true)}>New todo</AddSC>
          <TodoContainerSC>
            {
                tomatoTaskList
                    .filter((tomatoTask) => tomatoTask.status !== TASK_STATUS.DELETE)
                    .map((tomatoTask) => (
                      <TodoItemSC key={tomatoTask.uuid}>
                        <TodoTaskInfoSC>
                          <TodoTaskTitleSC>
                            {tomatoTask.title}
                          </TodoTaskTitleSC>
                          {
                            tomatoTask.completedTomatoes.length > 0 && (
                            <TotalTomatoSC>
                              <TomatoIcon />
                                {`*${tomatoTask.completedTomatoes.length}`}
                            </TotalTomatoSC>
                            )
                        }
                          {todayTomatoRender(tomatoTask.todayTomatoes.length)}
                        </TodoTaskInfoSC>
                        <TodoToolSC>
                          <div
                            className="delete"
                            onClick={() => handleDelete(tomatoTask.uuid)}
                          >
                            删除
                          </div>
                          <div onClick={() => handleStatusChange(tomatoTask.uuid)}>{tomatoTask.operate}</div>
                        </TodoToolSC>
                      </TodoItemSC>
                    ))
                }
          </TodoContainerSC>
        </ContentSC>
        {
          isAdd && (
            <GlobalClose
              openListener={isAdd}
              onClose={() => setIsAdd(false)}
            >
              <InputContainer
                onEnter={(value) => {
                  createNewTodo(value);
                  setIsAdd(false);
                }}
              >
                <InputSC />
              </InputContainer>
            </GlobalClose>
          )
        }
      </ContainerSC>
    );
}

const ContainerSC = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
  -webkit-touch-callout: none;
  background: rgb(59, 63, 67);
`;

const ContentSC = styled('div')`
  width: ${(props) => (props.theme.deviceInfo.px > BREAK_POINTS.sm ? '320px' : '100vw')};
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 40px;
`;

const AddSC = styled('div')`
  border: 1px solid rgb(186, 186, 186);
  border-radius: 4px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  margin-left: 20px;
  margin-right: 20px;
`;

const TodoContainerSC = styled('div')`
  margin-top: 30px;
  padding-left: 20px;
  padding-right: 20px;
  flex: 1;
  overflow-y: scroll;
  overflow-y: overlay;
  ::-webkit-scrollbar {
    width: 6px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
  }

  ::-webkit-scrollbar-thumb {
    background: rgb(73, 73, 74);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-corner {
  }
`;

const TodoItemSC = styled('div')`
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  background: rgb(66, 70, 73);
  border-radius: 10px;
  margin-bottom: 20px;
  box-sizing: border-box;
  padding: 20px;
`;

const TodoTaskInfoSC = styled('div')`
  position: relative;
  flex: 1;
  display: flex;
  box-sizing: border-box;
  padding-right: 30px;
`;

const TodoTaskTitleSC = styled('div')`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
`;

const TotalTomatoSC = styled('div')`
  margin-left: 10px;
  display: flex;
  align-items: center;
  font-size: 12px;
  .icon {
    width: 16px;
    height: 16px;
  }
`;

const TomatoContainerSC = styled('div')`
  position: absolute;
  top: 100%;
  display: flex;
  margin-left: -5px;
`;

const TomatoItemSC = styled('div')`
  .icon {
    width: 16px;
    height: 16px;
  }
`;

const TodoToolSC = styled('div')`
  display: flex;
  align-items: center;

  .delete {
    margin-right: 16px;
  }
`;

const InputSC = styled('input')`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  height: 40px;
  width: 200px;
  margin: auto;
`;
