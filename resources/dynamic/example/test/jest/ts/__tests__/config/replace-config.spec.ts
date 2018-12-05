import { conf } from '../../src/config/replace-config';

describe('replace configuration test suite', () => {
  test('title is required', () => {
    expect(conf.title).toBe('Packer CLI');
  });

  test('config type should be replace', () => {
    expect(conf.configType).toBe('REPLACE');
  });
});
