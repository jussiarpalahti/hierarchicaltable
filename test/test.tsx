import * as React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import * as _ from 'lodash';
import * as util from 'util';

// import {ManualTable} from '../src/ManualTable';
import {get_matrix_mask, get_table, Selections, Table} from "../src/lib/table";
import {extable} from './extable'
import {small_dataset} from './fixtures';

// describe('<Table />', () => {
//     it('renders a div o stuffing...', () => {
//         const wrapper = shallow(<Table />);
//         expect(wrapper.text()).to.equal('Test');
//     });
// });
//
// describe('<ManualTable />', () => {
//     it('renders a table of yore', () => {
//         const wrapper = shallow(<ManualTable />);
//         expect(wrapper.find('thead').children()).to.have.length(3);
//     });
// });

describe('Getting mask', () => {
    it('gets a mask for selections..', () => {

        let stub = [
            [1,2,3],
            [4,5],
            [6,7]
        ];

        let heading = [
            ['a', 'b', 'c', 'd'],
            ['x', 'y', 'z']
        ];

        let stubs = ['I', 'II', 'III'];
        let headings = ['A', 'B'];

        let selection:Selections = {
            heading: {
                'A': [0, 1],
                'B': [0],
            },
            stub: {
                'I': [0],
                'II': [0],
                'III': [0, 1]
            }
        };

        let test_dataset = _.cloneDeep(extable);
        test_dataset.stub = stubs;
        test_dataset.heading = headings;

        let table = get_table(heading, stub, test_dataset);

        let mask = get_matrix_mask(selection, table);

        expect(mask.heading.length).to.equal(6);

        expect(mask.stub.length).to.equal(4);

    });
});

const dir = (o) => util.inspect(o, {depth: null});

describe('Creating table', () => {

    it('!makes a table', () => {
       let new_table = new Table(small_dataset);
   });

    it('check hoppers', () => {
        let new_table = new Table(small_dataset);
        let result = _.range(new_table.view.stub.size).map(() => {
            return new_table.view.stub.hop.map(hopper => hopper());
        });
        expect(result[0][0].name).to.equal('a1');
        expect(result[0][1].name).to.equal('b1');
        expect(result[1][0]).to.equal(null);
        expect(result[1][2].name).to.equal('c2');

    });

    it('check selection', () => {
        let new_table = new Table(small_dataset);
        let first_headings_header = new_table.headings[0][0];
        let third_stubs_header = new_table.stubs[0][2];

        first_headings_header.deselect();
        third_stubs_header.select();
        new_table.update_view();

        expect(new_table.view.heading.headers[0][0].name).to.equal('x2');
        expect(new_table.view.heading.headers[1][0].name).to.equal('y1');
        expect(new_table.view.stub.headers[0][0].name).to.equal('a1');
        expect(new_table.view.stub.headers[0][2].name).to.equal('a3');
    });

    it('check table layout', () => {

    });

});
