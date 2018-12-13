import { expect } from 'chai/chai';
import { conf } from '../../src/config/base-config';

describe('replace configuration test suite', () => {
  it('title is required', () => {
    expect(conf.title).to.equal('Packer CLI');
  });

  it('config type should be replace', () => {
    expect(conf.configType).to.equal('BASE');
  });
});
