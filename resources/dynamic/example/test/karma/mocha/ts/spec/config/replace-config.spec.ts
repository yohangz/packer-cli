import chai from 'chai/chai';
import { conf } from '../../src/config/replace-config';

describe('replace configuration test suite', () => {
  it('title is required', () => {
    chai.expect(conf.title).to.equal('Packer CLI');
  });

  it('config type should be replace', () => {
    chai.expect(conf.configType).to.equal('REPLACE');
  });
});
