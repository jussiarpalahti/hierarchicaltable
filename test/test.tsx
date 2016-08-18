/// <reference path="../typings/index.d.ts" />

import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import {Table} from '../src/table';

describe('<Table />', () => {
    it('renders a div o stuffing...', () => {
        const wrapper = shallow(<Table />);
        expect(wrapper.text()).to.equal('Test');
    });
});
