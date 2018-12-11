import chai from 'chai';
import chaiEnzyme from 'chai-enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

chai.use(chaiEnzyme());

// Re-export all enzyme exports
export * from 'enzyme';
