
import * as React from 'react';

import {HierarchicalTable} from './table';
import {Dataset, ITable, get_table, get_preview_table, transform_table} from "./lib/table";

export {Dataset, ITable, get_preview_table, get_table, transform_table} from './lib/table'
import {observable, computed, action, toJS, runInAction, transaction, asMap, ObservableMap} from 'mobx';

export class Table extends React.Component<{data: ITable}, {}> {
    render() {
        return (<div>
            <HierarchicalTable table={this.props.data} matrix={this.props.data.dataset.matrix} />
        </div>);
    }
}
