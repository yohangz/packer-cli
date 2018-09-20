import { Rectangle } from './index';

describe('A suite is just a function', function () {
  it('and so is a spec', function () {
    const square = new Rectangle(10, 10);
    expect(square.area).toBe(100);
  });
});
