import {default as getUUID} from "@/common/uuid";
import {TOMATO_STATUS} from "@/enum/TomatoStatus";
import {TOMATO_OPERATE} from "@/enum/TomatoOperate";
import {immerable, produce} from "immer";

const TOMATO_TIME = 25;
/**
 * Class representing a single task in a Tomato (Pomodoro) todo list.
 */
export class TomatoTask {
  [immerable] = true
  /**
   * Create a new task.
   * @param {Object} TomatoTask
   * @param {string} TomatoTask.title - The title of the task.
   * @param {string} [TomatoTask.uuid] - The unique ID of the task.
   * @param {string} [TomatoTask.description] - The description of the task.
   * @param {number} [TomatoTask.tomatoNum]
   * @param {number} [TomatoTask.completedTomatoes] - The completed number of Pomodoros for this task.
   * @param {number} [TomatoTask.currentTomatoTime]
   * @param {TOMATO_STATUS} [TomatoTask.status] - The status of the task.
   * @param {Date} [TomatoTask.createdAt] - The date when the task was created.
   * @param {Date} [TomatoTask.updatedAt] - The date when the task was last updated.
   */
  constructor({
                title,
                description= '',
                tomatoNum= 0,
                completedTomatoes= 0,
                currentTomatoTime= 0,
                uuid= getUUID(),
                status= TOMATO_STATUS.PENDING,
                createdAt= new Date(),
                updatedAt= new Date(),
  }) {
    this.$uuid = uuid;
    this.$title = title;
    this.$description = description;
    this.$tomatoNum = tomatoNum;
    this.$completedTomatoes = completedTomatoes;
    this.$currentTomatoTime = currentTomatoTime;
    this.$status = status;
    this.$createdAt = createdAt;
    this.$updatedAt = updatedAt;
  }

  /**
   * Update the status of the task.
   * @param {TOMATO_STATUS} status - The new status of the task.
   */
  updateToNextStatus() {
    return produce(this, draft => {
      if (draft.$status === TOMATO_STATUS.PENDING) {
        draft.$status = TOMATO_STATUS.ONGOING;
      } else if (draft.$status === TOMATO_STATUS.ONGOING) {
        draft.$status = TOMATO_STATUS.PAUSED;
      } else if (draft.$status === TOMATO_STATUS.PAUSED) {
        draft.$status = TOMATO_STATUS.ONGOING;
      }
      draft.$updatedAt = new Date();
    })
  }

  updateStatus(status) {
    return produce(this, draft => {
      draft.$status = status;
      draft.$updatedAt = new Date();
    })
  }

  addCurrentTomatoTime(second) {
    return produce(this, draft => {
      draft.$currentTomatoTime += second
      draft.$updatedAt = new Date();
    })
  }

  finishATomato() {
    return produce(this, draft => {
      draft.$status = TOMATO_STATUS.COMPLETED;
      draft.$completedTomatoes += 1;
      draft.$currentTomatoTime = 0;
      draft.$updatedAt = new Date();
    })
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
    return this.$status === TOMATO_STATUS.ONGOING;
  }

  get updatedAt() {
    return this.$updatedAt;
  }

  get currentTomatoTime() {
    return this.$currentTomatoTime;
  }

  get displayTime() {
    const seconds = TOMATO_TIME * 60 - this.$currentTomatoTime;
    const minute = Math.floor(seconds / 60) < 10 ? `0${Math.floor(seconds / 60)}` : Math.floor(seconds / 60);
    const second = seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
    return `${minute}:${second}`
  }

  get operate() {
    if(this.$status === TOMATO_STATUS.PENDING) return TOMATO_OPERATE.START;
    if(this.$status === TOMATO_STATUS.ONGOING) return TOMATO_OPERATE.PAUSE;
    if(this.$status === TOMATO_STATUS.PAUSED) return TOMATO_OPERATE.CONTINUE;
    if(this.$status === TOMATO_STATUS.COMPLETED) return TOMATO_OPERATE.START;
    return null
  }

  get storeIndexDBData() {
    return {
      uuid: this.$uuid,
      title: this.$title,
      description: this.$description,
      tomatoNum: this.$tomatoNum,
      completedTomatoes: this.$completedTomatoes,
      currentTomatoTime: this.$currentTomatoTime,
      status: this.$status,
      createdAt: this.$createdAt,
      updatedAt: this.$updatedAt,
    }
  }
}
