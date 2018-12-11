import React from 'react';

import { shallow } from '../../helpers/enzyme';

import Home from '../../src/components/home';

describe('<Home/> component test suite', () => {
  test('should contain github forkme logo', () => {
    const wrapper = shallow(<Home/>);
    expect(wrapper.find('.fork-me-logo')).toExist();
  });
});
