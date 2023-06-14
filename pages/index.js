import React, {useEffect, useMemo, useRef, useState} from "react";
import styled from "styled-components";
import GlobalClose from "@/basic_components/global_close";
import InputContainer from "@/basic_components/input_container";
import {useImmer} from "use-immer";
import Script from "next/script";
import {TomatoTask} from "@/model/TomatoTask";
import {TOMATO_STATUS} from "@/enum/TomatoStatus";
import {db} from "@/index_db/db";


const TOMATO_TIME = 25;
export default function Home() {
  const [tomatoTaskList, updateTomatoTaskList] = useImmer([]);
  const [isAdd, setIsAdd] = useState(false);
  const [activeTomatoUUID, setActiveTomatoTaskUUID] = useState(null);
  const [ongoing, setOngoing] = useState(false);

  const activeTomatoTask = useMemo(() => tomatoTaskList.find(task => task.uuid === activeTomatoUUID), [tomatoTaskList, activeTomatoUUID])


  useEffect(() => {
    db.taskList.toArray().then(list => {
      updateTomatoTaskList(draft => {
        draft.length = 0;
        list.forEach(task => {
          if (task.status === TOMATO_STATUS.ONGOING) {
            setActiveTomatoTaskUUID(task.uuid);
            task.status = TOMATO_STATUS.PAUSED;
          }
          if (task.status === TOMATO_STATUS.PAUSED) {
            setActiveTomatoTaskUUID(task.uuid);
          }
          draft.push(new TomatoTask(task));
        })
      })

    })
  }, [])

  useEffect(() => {
    tomatoTaskList.forEach(task => {
      db.taskList.get(task.uuid).then(dbTask => {
        if (!dbTask) {
          db.taskList.add(task.storeIndexDBData)
        } else {
          if (dbTask.updatedAt.getTime() < task.updatedAt.getTime()) {
            db.taskList.put(task.storeIndexDBData)
          }
        }
      });
    })
  }, [tomatoTaskList])

  useEffect(() => {
    const {setIntervalInWorker, clearIntervalInWorker} = window.workerApi;
    let timer;
    if (ongoing) {
      setIntervalInWorker(() => {
        updateTomatoTaskList(draft => {
          const index = draft.findIndex(todo => todo.uuid === activeTomatoUUID);
          let todo = draft[index];
          if (todo.currentTomatoTime < TOMATO_TIME * 60) {
            todo = todo.addCurrentTomatoTime(1);
          } else {
            notification('已完成一个番茄todo');
            todo = todo.finishATomato();
            setOngoing(false);
          }
          draft[index] = todo;
        })
      }, 1000).then(_timer => timer = _timer)
    }
    return () => {
      clearIntervalInWorker(timer);
    }
  }, [ongoing, activeTomatoUUID])

  const notification = (info) => {
    // 检查浏览器是否支持Notifications API
    if (!("Notification" in window)) {
      alert("此浏览器不支持桌面通知");
    }

    // 检查用户是否已经给予通知权限
    else if (Notification.permission === "granted") {
      // 如果已经授权，我们可以发送一个通知
      new Notification(info);
    }

    // 否则，我们需要请求用户的权限
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        // 如果用户接受了权限请求，那么我们就可以发送一个通知
        if (permission === "granted") {
          new Notification(info);
        }
      });
    }
  }

  const createNewTodo = (todoName) => {
    const tomatoTask = new TomatoTask({
      title: todoName,
    })

    updateTomatoTaskList(draft => {
      draft.push(tomatoTask)
    })
  }

  const handleStatusChange = (tomatoTaskUUID) => {
    setActiveTomatoTaskUUID(tomatoTaskUUID);
    updateTomatoTaskList(draft => {
      const ongoingItems = draft.filter(todo => todo.status === TOMATO_STATUS.ONGOING && todo.uuid !== tomatoTaskUUID);
      ongoingItems.forEach(ongoingItem => {
        const newState = ongoingItem.updateStatus(TOMATO_STATUS.PAUSED);
        const index = draft.findIndex(todo => todo.uuid === ongoingItem.uuid);
        draft[index] = newState;
      })
      const index = draft.findIndex(todo => todo.uuid === tomatoTaskUUID);
      let todo = draft[index];
      todo = todo.updateToNextStatus();
      draft[index] = todo;
      setOngoing(todo.onGoing);
    })
  }

  const handleDelete = (tomatoTaskUUID) => {
    if (activeTomatoUUID === tomatoTaskUUID) {
      setActiveTomatoTaskUUID(null);
    }
    updateTomatoTaskList(draft => {
      const index = draft.findIndex(todo => todo.uuid === tomatoTaskUUID);
      const oldState = draft[index];
      draft[index] = oldState.updateStatus(TOMATO_STATUS.DELETE);
    })
  }

  return (
    <>
      <Script
        src="index.worker.js"
        strategy="beforeInteractive"
      />
      <ContainerSC>
        <LeftMenuSC>
          <AddSC onClick={() => setIsAdd(true)}>New todo</AddSC>
          <TodoContainerSC>
            {
              tomatoTaskList
                .filter(tomatoTask => tomatoTask.status !== TOMATO_STATUS.DELETE)
                .map(tomatoTask => (
                  <TodoItem key={tomatoTask.uuid}>
                    <TodoTaskInfoSC>
                      {tomatoTask.title}
                    </TodoTaskInfoSC>
                    <TodoToolSC>
                      <div
                        className='delete'
                        onClick={() => handleDelete(tomatoTask.uuid)}
                      >
                        删除
                      </div>
                      <div onClick={() => handleStatusChange(tomatoTask.uuid)}>{tomatoTask.operate}</div>
                    </TodoToolSC>
                  </TodoItem>
                ))
            }
          </TodoContainerSC>
        </LeftMenuSC>
        <ContentSC>
          <TimeDisplaySC>
            {activeTomatoTask && Array.from(activeTomatoTask.displayTime).map(char => (
              <NumberSpanSC>{char}</NumberSpanSC>))}
            <div className="title">{activeTomatoTask?.title}</div>
          </TimeDisplaySC>
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
                  setIsAdd(false)
                }}
              >
                <InputSC/>
              </InputContainer>
            </GlobalClose>
          )
        }
      </ContainerSC>
    </>
  )
}


const ContainerSC = styled('div')`
  background: rgb(49, 49, 49);
  min-height: 100vh;
  color: rgb(186, 186, 186);
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
`;

const LeftMenuSC = styled('div')`
  background: rgb(59, 63, 67);
  width: 40%;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-top: 40px;

  @media (max-width: 680px) {
    display: none;
  }
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

const TodoItem = styled('div')`
  height: 80px;
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

`;

const TodoToolSC = styled('div')`
  display: flex;
  align-items: center;

  .delete {
    margin-right: 16px;
  }
`;

const ContentSC = styled('div')`
  flex: 1;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
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

  @media (max-height: 150px) {
    .title {
      display: none;
    }
  }
`;

const NumberSpanSC = styled('span')`
  width: 68px;
  font-weight: 600;
  font-size: 96px;

  @media (max-height: 150px) {
    font-size: 48px;
    width: 38px;
  }
`;
