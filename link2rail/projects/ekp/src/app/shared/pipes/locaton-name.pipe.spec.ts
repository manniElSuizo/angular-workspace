import { LocationNamePipe } from './location-name.pipe';

describe('FormatLocationPipe', () => {
  it('create an instance', () => {
    const pipe = new LocationNamePipe();
    expect(pipe).toBeTruthy();
  });
});
