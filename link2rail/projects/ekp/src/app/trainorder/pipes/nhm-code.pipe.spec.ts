import { NhmCodePipe } from '../../trainorder/pipes/nhm-code.pipe';

describe('NhmCodePipe', () => {
  it('create an instance', () => {
    const pipe = new NhmCodePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return maximum three elements joined with \',\' if parameter \'full\' is not passed', () => {
    const pipe = new NhmCodePipe();
    expect(pipe.transform([])).toBe('');
    let testArray:any = ['123'];
    expect(pipe.transform(testArray)).toBe('12300000');
    expect(pipe.transform(testArray, 'full')).toBe('12300000');
    testArray = ['123450'];
    expect(pipe.transform(testArray)).toBe('12345000');
    expect(pipe.transform(testArray, 'full')).toBe('12345000');

    testArray = [];
    expect(pipe.transform(testArray)).toBe('');
    expect(pipe.transform(testArray, 'full')).toBe('');

    testArray = null;
    expect(pipe.transform(testArray)).toBe('');
    expect(pipe.transform(testArray, 'full')).toBe('');

    testArray = ['123', '321'];
    expect(pipe.transform(testArray)).toBe('12300000, 32100000');
    expect(pipe.transform(testArray, 'full')).toBe('12300000, 32100000');

    testArray = ['123', '456', '321'];
    expect(pipe.transform(testArray)).toBe('12300000, 32100000, 45600000');
    expect(pipe.transform(testArray, 'full')).toBe('12300000, 32100000, 45600000');
    
    testArray = ['123', '321', '456', '654'];
    expect(pipe.transform(testArray)).toBe('12300000, 32100000, 45600000, ...');
    expect(pipe.transform(testArray, 'full')).toBe('12300000, 32100000, 45600000, 65400000');
    
    testArray = ['456', '123', '654', '321', '789'];
    expect(pipe.transform(testArray)).toBe('12300000, 32100000, 45600000, ...');
    expect(pipe.transform(testArray, 'full')).toBe('12300000, 32100000, 45600000, 65400000, 78900000');
  })
});
