import {immerable, produce} from "immer";
import {TOMATO_STATUS} from "@/enum/TomatoStatus";
import {default as getUUID} from "@/common/uuid";

export class TomatoDetail {
  [immerable] = true
  /**
   * Create a new TomatoDetail.
   * @param {TomatoDetailType} TomatoDetail
   */
  constructor({
                uuid= getUUID(),
                startAt= new Date(),
                endAt = null,
                status= TOMATO_STATUS.ONGOING,
                pausedTimes= [],
                currentTomatoSecond = 0,
                currentTomatoDate  = null,
              }) {
    this.$uuid = uuid;
    this.$startAt = startAt;
    this.$endAt = endAt;
    this.$status = status;
    this.$pausedTimes = pausedTimes;
    this.$currentTomatoSecond = currentTomatoSecond;
    this.$currentTomatoDate = currentTomatoDate;

    this.$initDataFix();
  }

  $initDataFix() {
    if(this.$status === TOMATO_STATUS.ONGOING) {
      // 怀疑程序崩溃
      if(this.tomatoTimeDraft - this.tomatoTime > 1000) {
        this.$status = TOMATO_STATUS.PAUSED;
        this.$pausedTimes.push({
          startAt:  this.$currentTomatoDate,
          endAt: null,
        });
      }
    }
  }

  addCurrentTomatoTime(second) {
    return produce(this, draft => {
      draft.$currentTomatoSecond += second;
      draft.$currentTomatoDate = new Date();
    })
  }

  updateToNextStatus() {
    if(this.$status === TOMATO_STATUS.ONGOING) {
      return this.pause();
    }else if (this.$status === TOMATO_STATUS.PAUSED) {
      return this.continue();
    }
  }

  pause() {
    return produce(this, draft => {
      draft.$status = TOMATO_STATUS.PAUSED;
      draft.$pausedTimes.push({
        startAt:  new Date(),
        endAt: null,
      });
    })
  }

  continue() {
    return produce(this, draft => {
      draft.$status = TOMATO_STATUS.ONGOING;
      const pausedIndex = this.$pausedTimes.length - 1;
      draft.$pausedTimes[pausedIndex].endAt = new Date();
    })
  }

  complete() {
    return produce(this, draft => {
      draft.$endAt = new Date();
      draft.$status = TOMATO_STATUS.COMPLETED;
    })
  }

  $getPausedTotalTime() {
    let totalTime = 0;
    this.$pausedTimes.forEach((pausedTimes) => {
      if(pausedTimes.endAt) {
        totalTime += pausedTimes.endAt.getTime() - pausedTimes.startAt.getTime();
      }else {
        totalTime += new Date().getTime() - pausedTimes.startAt.getTime();
      }
    })
    return totalTime;
  }

  get status() {
    return this.$status;
  }

  get endAt() {
    return this.$endAt;
  }

  get tomatoTimeDraft() {
    const start = this.$startAt.getTime();
    const current = new Date().getTime();
    if(this.$status === TOMATO_STATUS.ONGOING) {
      return current - start - this.$getPausedTotalTime();
    }else if(this.$status === TOMATO_STATUS.PAUSED) {
      return current - start - this.$getPausedTotalTime();
    }else if(this.$status === TOMATO_STATUS.COMPLETED) {
      const end = this.$endAt.getTime();
      return end - start;
    }
  }

  get tomatoTime() {
    return this.$currentTomatoSecond * 1000;
  }

  get storeIndexDBData() {
    return {
      uuid: this.$uuid,
      status: this.$status,
      startAt: this.$startAt,
      endAt: this.$endAt,
      pausedTimes: this.$pausedTimes,
      currentTomatoSecond: this.$currentTomatoSecond,
      currentTomatoDate: this.$currentTomatoDate,
    }
  }
}
