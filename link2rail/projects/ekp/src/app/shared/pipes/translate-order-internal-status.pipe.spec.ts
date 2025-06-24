import { TranslateService } from '@ngx-translate/core';
import { TranslateOrderInternalStatusPipe } from './translate-order-internal-status.pipe';

describe('TranslateOrderInternalStatusPipe', () => {
  let translate: TranslateService;
  let pipe: TranslateOrderInternalStatusPipe;

  beforeEach(() => {
    translate = jasmine.createSpyObj('TranslateService', ['instant']);
    pipe = new TranslateOrderInternalStatusPipe(translate);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

});