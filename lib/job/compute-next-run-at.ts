import { Job } from '.';
import * as parser from 'cron-parser';
import humanInterval from 'human-interval';
import createDebugger from 'debug';
import moment from 'moment-timezone';
// @ts-expect-error
import date from 'date.js';

const debug = createDebugger('agenda:job');

/**
 * Internal method used to compute next time a job should run and sets the proper values
 * @name Job#computeNextRunAt
 * @function
 */
export const computeNextRunAt = function(this: Job) {
  const interval = this.attrs.repeatInterval;
  const timezone = this.attrs.repeatTimezone;
  const { repeatAt } = this.attrs;
  const previousNextRunAt = this.attrs.nextRunAt || new Date();
  this.attrs.nextRunAt = undefined;

  const dateForTimezone = (date: any): moment.Moment => {
    date = moment(date);
    if (timezone !== null) {
      date.tz(timezone);
    }

    return date;
  };

  /**
   * Internal method that computes the interval
   */
  const computeFromInterval = () => {
    debug('[%s:%s] computing next run via interval [%s]', this.attrs.name, this.attrs._id, interval);
    const dateNow = new Date();
    let lastRun: Date = this.attrs.lastRunAt || dateNow;
    let { startDate, endDate, skipDays } = this.attrs;
    lastRun = dateForTimezone(lastRun).toDate();
    const cronOptions: any = { currentDate: lastRun };
    if (timezone) {
      cronOptions.tz = timezone;
    }
    let isError=false

    try {
      let cronTime = parser.parseExpression(interval, cronOptions);
      let nextDate: Date | null = cronTime.next().toDate();
      if (nextDate.getTime() === lastRun.getTime() || nextDate.getTime() <= previousNextRunAt.getTime()) {
        // Handle cronTime giving back the same date for the next run time
        cronOptions.currentDate = new Date(lastRun.getTime() + 1000);
        cronTime = parser.parseExpression(interval, cronOptions);
        nextDate = cronTime.next().toDate();
      }

      // If start date is present, check if the nextDate should be larger or equal to startDate. If not set startDate as nextDate
      if (startDate !== null) {
        startDate = moment.tz(startDate, timezone).toDate();
        if (startDate > nextDate) {
          cronOptions.currentDate = startDate;
          cronTime = parser.parseExpression(interval, cronOptions);
          nextDate = cronTime.next().toDate();
        }
      }

      // If job has run in the past and skipDays is not null, add skipDays to nextDate
      if ((dateNow > lastRun) && skipDays !== null) {
        try {
          nextDate = new Date(nextDate.getTime() + (humanInterval(skipDays) ?? 0));
        } catch {}
      }
      this.attrs.nextRunAt = nextDate;
      debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
    // Either `xo` linter or Node.js 8 stumble on this line if it isn't just ignored
    } catch {
      isError=true
      debug('[%s:%s] failed nextRunAt based on interval [%s]', this.attrs.name, this.attrs._id, interval);
      // Nope, humanInterval then!
      try {
        if (!this.attrs.lastRunAt && humanInterval(interval)) {
          this.attrs.nextRunAt = lastRun;
          debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
        } else {
          this.attrs.nextRunAt = new Date(lastRun.getTime() + (humanInterval(interval) ?? 0));
          debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
        }
      // Either `xo` linter or Node.js 8 stumble on this line if it isn't just ignored
      } catch {}
    } finally {

      // If endDate is less than the nextDate, set nextDate to null to stop the job from running further




      if (Number.isNaN(this.attrs.nextRunAt.getTime())) {
        this.attrs.nextRunAt = undefined;
        debug('[%s:%s] failed to calculate nextRunAt due to invalid repeat interval', this.attrs.name, this.attrs._id);
        this.fail('failed to calculate nextRunAt due to invalid repeat interval');
      }
      if(isError){
      if(this.attrs.nextRunAt !== undefined){
        if (endDate !== null) {
          const dateNow = new Date();
          const nextDate =this.attrs.nextRunAt;
          const endDateDate: Date = moment.tz(endDate, timezone).toDate();
          if (nextDate > endDateDate) {
            this.attrs.nextRunAt = undefined;
          }
        }
        }
      }
    }
  };

  /**
   * Internal method to compute next run time from the repeat string
   */
  const computeFromRepeatAt = () => {
    const lastRun = this.attrs.lastRunAt || new Date();
    const nextDate: Date = date(repeatAt);

    // If you do not specify offset date for below test it will fail for ms
    const offset = Date.now();
    if (offset === date(repeatAt, offset).getTime()) {
      this.attrs.nextRunAt = undefined;
      debug('[%s:%s] failed to calculate repeatAt due to invalid format', this.attrs.name, this.attrs._id);
      this.fail('failed to calculate repeatAt time due to invalid format');
    } else if (nextDate.getTime() === lastRun.getTime()) {
      this.attrs.nextRunAt = date('tomorrow at ', repeatAt);
      debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
    } else {
      this.attrs.nextRunAt = date(repeatAt);
      debug('[%s:%s] nextRunAt set to [%s]', this.attrs.name, this.attrs._id, this.attrs.nextRunAt.toISOString());
    }
  };

  if (interval) {
    computeFromInterval();
  } else if (repeatAt) {
    computeFromRepeatAt();
  }

  return this;
};
