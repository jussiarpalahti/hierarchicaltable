
import * as React from 'react';

import {HierarchicalTable} from './table';
import {get_table, get_preview_table, transform_table} from "./lib/table";

export {ITable, get_preview_table, get_table, transform_table} from './lib/table'

export interface Dataset {
    stub: [string],
    heading: [string],
    levels: {string: [string]},
    name: string,
    title: string,
    url: string,
    matrix: [[string]]
}


export class Table extends React.Component<{data: Dataset, preview: boolean}, {}> {
    render() {
        let {heading, stub} = transform_table(this.props.data);
        let table = get_table(heading, stub);

        var prev_table;
        if (this.props.preview) {
            prev_table = get_preview_table(table);
        } else {
            prev_table = false;
        }

        return (<div>
            <HierarchicalTable table={prev_table ? prev_table : table} matrix={this.props.data.matrix} />
        </div>);
    }
}
