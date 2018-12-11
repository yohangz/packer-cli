import { conf } from '../../src/config/replace-config';

describe('replace configuration test suite', () => {
  it('title is required', () => {
    expect(conf.title).toBe('Packer CLI');
  });

  it('config type should be replace', () => {
    expect(conf.configType).toBe('REPLACE');
  });
});
