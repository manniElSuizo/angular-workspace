import { OrderNumberPipe } from './order-number.pipe';

describe('OrderNumberPipe', () => {

  let pipe : OrderNumberPipe;
  let orderNumber: string;
  let orderAuthority: number;

  beforeEach(()=> {
    pipe = new OrderNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('empty call returns empty string', () => {
    orderAuthority = null;
    orderNumber = null;
    expect(pipe.transform(orderNumber)).toEqual(null);
  });

  it('shoud return format string wiht orderAuthority', () => {
    orderNumber = "80202307073975139";
    expect(pipe.transform(orderNumber)).toBe('80 20230707 397 5139');
  });

  it('shoud return format string wiht orderAuthority when authority is separate', () => {
    const auth = 80
    orderNumber = "202307073975139";
    expect(pipe.transform(orderNumber, auth)).toBe('80 20230707 397 5139');
  });

  it('shoud return format string wiht orderAuthority when authority is separate and order number is a number', () => {
    const auth = 80
    const oNumber = 202307073975139;
    expect(pipe.transform(oNumber, auth)).toBe('80 20230707 397 5139');
  });

  it('shoud return format string wihtout orderAuthority', () => {
    orderAuthority = null;
    orderNumber = "202307073975139";
    expect(pipe.transform(orderNumber)).toBe('20230707 397 5139');
  });



});
