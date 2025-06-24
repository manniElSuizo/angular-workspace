import { TranslateService } from '@ngx-translate/core';
import { TranslateWagonStatusPipe } from './translate-wagon-status.pipe';

describe('TranslateWagonStatusPipe', () => {
  let translate: TranslateService;
  let pipe: TranslateWagonStatusPipe;

  beforeEach(() => {
    translate = jasmine.createSpyObj('TranslateService', ['instant']);
    pipe = new TranslateWagonStatusPipe(translate);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
});