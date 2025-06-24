import { trainSummaryBase } from '../mockup/TrainItemMock';
import { Authorization } from '../models/authorization';
import { TrainCancelablePipe } from './train-cancelable.pipe';

describe('TrainCancelablePipe', () => {
  const pipe = new TrainCancelablePipe();

  it('create an instance', () => {
    const myPipe = new TrainCancelablePipe();
    expect(myPipe).toBeTruthy();
  });

  it('should return true if special train and Authorization.CANCEL_SPECIAL_TRAIN available', () => {
    mockTrainSummary.productType = 'SPECIAL_TRAIN';
    mockTrainSummary.cancelable = true;
    mockTrainSummary.authorization = [Authorization.CANCEL_SPECIAL_TRAIN];

    expect(pipe.transform(mockTrainSummary)).toBe(true);
  });

  it('should return false if special train and Authorization.CANCEL_SPECIAL_TRAIN not available', () => {
    mockTrainSummary.productType = 'SPECIAL_TRAIN';
    mockTrainSummary.cancelable = true;
    mockTrainSummary.authorization = [Authorization.CANCEL_TRAIN];

    expect(pipe.transform(mockTrainSummary)).toBe(false);
  });

  it('should return false if cancelable is false', () => {
    mockTrainSummary.productType = 'SPECIAL_TRAIN';
    mockTrainSummary.cancelable = false;
    mockTrainSummary.authorization = [Authorization.CANCEL_SPECIAL_TRAIN];

    expect(pipe.transform(mockTrainSummary)).toBe(false);
  });

  it('should return false if no Authorization is available', () => {
    mockTrainSummary.productType = 'SPECIAL_TRAIN';
    mockTrainSummary.cancelable = false;
    mockTrainSummary.authorization = [];

    expect(pipe.transform(mockTrainSummary)).toBe(false);
    
    mockTrainSummary.authorization = null;
    expect(pipe.transform(mockTrainSummary)).toBe(false);
  });

  it('should return true if regular train and Authorization.CANCEL_TRAIN available', () => {
    mockTrainSummary.productType = 'REGULAR_TRAIN';
    mockTrainSummary.cancelable = true;
    mockTrainSummary.authorization = [Authorization.CANCEL_TRAIN];

    expect(pipe.transform(mockTrainSummary)).toBe(true);
  });

  it('should return true if regular train and Authorization.CANCEL_TRAIN not available', () => {
    mockTrainSummary.productType = 'REGULAR_TRAIN';
    mockTrainSummary.cancelable = true;
    mockTrainSummary.authorization = [Authorization.CANCEL_SPECIAL_TRAIN];

    expect(pipe.transform(mockTrainSummary)).toBe(false);
  });
});

export const mockTrainSummary = trainSummaryBase;
