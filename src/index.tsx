
import * as React from 'react';

import {HierarchicalTable} from './table';
import {get_table, get_preview_table, transform_table} from "./lib/table";


export interface Dataset {
    stub: [string],
    heading: [string],
    levels: [string],
    name: string,
    title: string,
    url: string,
    matrix: [string]
}


export class Table extends React.Component<{data: Dataset}, {}> {
    render() {
        let {heading, stub, matrix} = transform_table(this.props.data);
        let table = get_table(heading, stub);
        // let prev_table = get_preview_table(table);

        return (<div>
            <HierarchicalTable table={table} matrix={matrix} />
        </div>);
    }
}
