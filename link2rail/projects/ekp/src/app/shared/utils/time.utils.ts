import moment from 'moment';
export class TimeUtilities {
  public static currentDateIsAfterDateAndDiffIsGreaterThan(differenceInMinutes: number, date: Date): boolean {
    const mCurrent = moment(new Date());
    const mDate = moment(date);

    if (mCurrent.isAfter(date)) {
      const maxDate = mDate.add(5, 'days').endOf('day');;
      if (mCurrent.isBefore(maxDate)) {
        return true;
      }
      return false;
    }

    if (mCurrent.isBefore(date)) {
      const duration = moment.duration(mDate.diff(mCurrent));
      if (duration.asMinutes() < differenceInMinutes) {
        return true;
      }
    }
    return false;
  }
}
