import { SuitableForRunningPipe } from './suitable-for-running.pipe';
import { TranslateService } from '@ngx-translate/core';

describe('SuitableForRunningPipe', () => {
  let translate: TranslateService;
  let pipe: SuitableForRunningPipe;

  beforeEach(() => {
    translate = jasmine.createSpyObj('TranslateService', ['instant']);
    pipe = new SuitableForRunningPipe(translate);
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

});