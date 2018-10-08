import { conf } from './replace-config';

describe('replace configuration test suite', () => {
  it('title is required', function () {
      expect(conf.title).toBe('Packer CLI');
  });

  it('config type should be replace', () => {
    expect(conf.configType).toBe('REPLACE');
  });
});
