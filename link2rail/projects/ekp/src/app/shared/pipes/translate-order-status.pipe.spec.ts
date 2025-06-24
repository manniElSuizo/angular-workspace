import { TranslateService } from '@ngx-translate/core';
import { TranslateOrderStatusPipe } from './translate-order-status.pipe';

describe('TranslateOrderStatusPipe', () => {
  let translate: TranslateService;
  let pipe: TranslateOrderStatusPipe;

  beforeEach(() => {
    translate = jasmine.createSpyObj('TranslateService', ['instant']);
    pipe = new TranslateOrderStatusPipe(translate);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

});