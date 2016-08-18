/// <reference path="../typings/index.d.ts" />

import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import {Table} from '../src/table';
import {ManualTable} from '../src/ManualTable';

describe('<Table />', () => {
    it('renders a div o stuffing...', () => {
        const wrapper = shallow(<Table />);
        expect(wrapper.text()).to.equal('Test');
    });
});

describe('<ManualTable />', () => {
    it('renders a table of yore', () => {
        const wrapper = shallow(<ManualTable />);
        expect(wrapper.find('thead').children()).to.have.length(3);
    });
});
