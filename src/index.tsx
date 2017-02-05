
import * as React from 'react';

import {MainTable} from './table';
import {Dataset, Table, get_table, get_preview_table, transform_table} from "./lib/table";

export {Dataset, Table, Header, ITable, get_preview_table, get_table, transform_table} from './lib/table'

export class HierarchicalTable extends React.Component<{table: Table}, {}> {
    render() {
        return (<div>
            <MainTable table={this.props.table} />
        </div>);
    }
}
