import { default as getUUID } from '@/common/uuid';
import { TASK_STATUS } from '@/enum/TaskStatus';
import { TOMATO_OPERATE } from '@/enum/TaskOperate';
import { immerable, produce } from 'immer';
import { TomatoDetail } from '@/model/TomatoDetail';
import { TOMATO_TIME } from '@/config';
import { TOMATO_STATUS } from '@/enum/TomatoStatus';
import dayjs from 'dayjs';

/**
 * Class representing a single task in a Tomato (Pomodoro) todo list.
 */
export class TomatoTask {
  [immerable] = true;

  /**
   * Create a new task.
   * @param {Object} TomatoTask
   * @param {string} TomatoTask.title - The title of the task. 
   * @param {string} [TomatoTask.uuid] - The unique ID of the task.
   * @param {string} [TomatoTask.description] - The description of the task.
   * @param {number} [TomatoTask.targetTomatoNum] - The description of the task.
   * @param {TASK_STATUS} [TomatoTask.status] - The status of the task.
   * @param {string} [TomatoTask.createdAt] - The date when the task was created.
   * @param {string} [TomatoTask.updatedAt] - The date when the task was last updated.
   * @param {[TomatoDetailType]} [TomatoTask.tomatoDetails] - tomatoDetails
   */
  constructor({
                title,
                description = '',
                targetTomatoNum = 0,
                uuid = getUUID(),
                status = TASK_STATUS.TODO,
                createdAt = new Date().toISOString(),
                updatedAt = new Date().toISOString(),
                tomatoDetails = [],
  }) {
    this.$uuid = uuid;
    this.$title = title;
    this.$description = description;
    this.$targetTomatoNum = targetTomatoNum;
    this.$status = status;
    this.$createdAt = createdAt;
    this.$updatedAt = updatedAt;
    this.$tomatoDetails = tomatoDetails.map((tomatoDetail) => new TomatoDetail(tomatoDetail));
  }

  /**
   * Update the status of the task.
   * @param {TASK_STATUS} status - The new status of the task.
   */
  updateTomatoToNextStatus() {
    return produce(this, (draft) => {
      if (
        !draft.$tomatoDetails.length
        || draft.$tomatoDetails.at(-1).status === TOMATO_STATUS.COMPLETED
        || draft.$tomatoDetails.at(-1).status === TOMATO_STATUS.DISCARDED
      ) {
        draft.$tomatoDetails.push(new TomatoDetail({}));
      } else {
        TomatoTask.updateCurrentTomato(draft, (currentTomato) => currentTomato.updateToNextStatus());
      }
      draft.$updatedAt = new Date().toISOString();
    });
  }

  /**
   * Create a new TomatoDetail.
   * @param {TASK_STATUS} status
   */
  updateTaskStatus(status) {
    return produce(this, (draft) => {
      draft.$status = status;
      draft.$updatedAt = new Date().toISOString();
    });
  }

  stopTomato() {
    return produce(this, (draft) => {
      TomatoTask.updateCurrentTomato(draft, (tomato) => tomato.pause());
    });
  }

  addCurrentTomatoTime(second) {
    return produce(this, (draft) => {
      TomatoTask.updateCurrentTomato(draft, (tomatoDetail) => tomatoDetail.addCurrentTomatoTime(second));
      draft.$updatedAt = new Date().toISOString();
    });
  }

  finishCurTomato() {
    return produce(this, (draft) => {
      TomatoTask.updateCurrentTomato(draft, (tomato) => {
        if (draft.tomatoTime < TOMATO_TIME / 5 * 60 * 1000) {
          return tomato.discarded();
        }
          return tomato.complete();
      });
      draft.$updatedAt = new Date().toISOString();
    });
  }

  discardedCurTomato() {
    return produce(this, (draft) => {
      TomatoTask.updateCurrentTomato(draft, (tomato) => tomato.discarded());
      draft.$updatedAt = new Date().toISOString();
    });
  }

  static updateCurrentTomato(draftTask, fn) {
    const currentTomatoDetailIndex = draftTask.$tomatoDetails.length - 1;
    const currentTomatoOldState = draftTask.$tomatoDetails[currentTomatoDetailIndex];
    draftTask.$tomatoDetails[currentTomatoDetailIndex] = fn(currentTomatoOldState);
  }

  get uuid() {
    return this.$uuid;
  }

  get title() {
    return this.$title;
  }

  get status() {
    return this.$status;
  }

  get onGoing() {
    return this.$tomatoDetails.at(-1)?.status === TOMATO_STATUS.ONGOING;
  }

  get updatedAt() {
    return this.$updatedAt;
  }

  get currentTomatoTime() {
    const activeTomato = this.$tomatoDetails.at(-1);
    if (!activeTomato) return 0;
    if (activeTomato.status === TOMATO_STATUS.ONGOING || activeTomato.status === TOMATO_STATUS.PAUSED) {
      return activeTomato.tomatoTime;
    } if (activeTomato.status === TOMATO_STATUS.DISCARDED || activeTomato.status === TOMATO_STATUS.COMPLETED) {
      return 0;
    }
  }

  get completedTomatoes() {
    return this.$tomatoDetails.filter((detail) => detail.status === TOMATO_STATUS.COMPLETED);
  }

  get todayTomatoes() {
    const todayDate = dayjs();
    const today = todayDate.get('date');
    const toMonth = todayDate.get('month');

    return this.$tomatoDetails.filter((detail) => {
      if (detail.status !== TOMATO_STATUS.COMPLETED) return false;
      const finishDate = dayjs(detail.endAt);
      const finishDay = finishDate.get('date');
      const finishMonth = finishDate.get('month');

      return (today === finishDay) && (toMonth === finishMonth);
    });
  }

  get displayTime() {
    const time = TOMATO_TIME * 60 * 1000 - this.currentTomatoTime;
    const seconds = Math.round(time / 1000);
    const minute = Math.floor(seconds / 60) < 10 ? `0${Math.floor(seconds / 60)}` : Math.floor(seconds / 60);
    const second = seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
    return `${minute}:${second}`;
  }

  get operate() {
    if (!this.$tomatoDetails.length) return TOMATO_OPERATE.START;
    const currentTomato = this.$tomatoDetails.at(-1);
    if (currentTomato.status === TOMATO_STATUS.ONGOING) return TOMATO_OPERATE.PAUSE;
    if (currentTomato.status === TOMATO_STATUS.PAUSED) return TOMATO_OPERATE.CONTINUE;
    if (currentTomato.status === TOMATO_STATUS.COMPLETED) return TOMATO_OPERATE.START;
    if (currentTomato.status === TOMATO_STATUS.DISCARDED) return TOMATO_OPERATE.START;
    return null;
  }

  get storeIndexDBData() {
    return {
      uuid: this.$uuid,
      title: this.$title,
      description: this.$description,
      targetTomatoNum: this.$targetTomatoNum,
      status: this.$status,
      createdAt: this.$createdAt,
      updatedAt: this.$updatedAt,
      tomatoDetails: this.$tomatoDetails.map((detail) => detail.storeIndexDBData),
    };
  }
}
