import { Customer } from '@src/app/trainorder/models/ApiCustomers.model';
import { CustomerSgvNamePipe } from './customer-sgv-name.pipe';

describe('CustomerSgvNamePipe', () => {
  it('create an instance', () => {
    const pipe = new CustomerSgvNamePipe();
    expect(pipe).toBeTruthy();
  });

  it('returns String in given format', () => {
    const customer: Customer = {
      name: 'customer name',
      sgvNumber: '321 456'
    };

    expect(new CustomerSgvNamePipe().transform(customer)).toBe('(' + customer.sgvNumber + ') ' + customer.name);
  })

  it('returns an array with sgv and name', () => {
    const inStr = '(sgv of customer) name of customer';

    const expected = {name: 'name of customer', sgvNumber: 'sgv of customer'};

    expect(new CustomerSgvNamePipe().transform(inStr)).toEqual(expected);
  });
});
