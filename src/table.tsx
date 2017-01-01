import * as React from "react";
import {Table} from './lib/table';

interface Props {
    [name: string]: string
}

interface TableProps {
    table: Table;
    selector?: Function
}

function get_dimensions(table:Table): {height:number, width:number} {
    /*
     Available data determines table size
     */
    let width = table.matrix[0].length < table.view.heading.size ? table.matrix[0].length : table.view.heading.size;
    let height = table.matrix.length < table.view.stub.size ? table.matrix.length : table.view.stub.size;

    return {height, width};
}

class TableHead extends React.Component<TableProps, {}> {
    render () {
        let {table} = this.props;

        let {height, width} = get_dimensions(table);

        let resp = table.view.heading.hop.map(
            (hopper, index) => {
                let row = [];
                for (let i=0; i < width; i++) {
                    let header = hopper();
                    if (header) {
                        row.push(
                            <th key={"head" + index + i} data-id={["heading", i]} colSpan={table.view.heading.hops[index]}>{header.name}</th>)
                    }
                }
                if (index == 0) {
                    return <tr key={index}>
                        <th
                            className="centered"
                            colSpan={table.view.stub.headers.length}
                            rowSpan={table.view.heading.headers.length}>

                        </th>
                        {row}
                    </tr>
                } else {
                    return <tr key={index}>{row}</tr>;
                }
            });
        return <thead>{resp}</thead>;
    }
}

function get_row_headers (stub, row_idx){
    let resp = [];
    stub.hop.map((hopper, index) => {
        let header = hopper();
        if (header) {
            resp.push(
                <th data-id={["stub", row_idx]} key={"header" + index} rowSpan={stub.hops[index]}>{header.name}</th>
            );
        }
    });
    return resp;
}


class TableBody extends React.Component<TableProps, {}> {
    render () {
        let {table} = this.props;
        let resp = [];

        let {height, width} = get_dimensions(table);

        for (let row=0; row < height; row++) {
            let data = [];
            for (let col=0; col < width; col++) {
                data.push(
                    <td key={"heading" + row + col}>{table.matrix[row][col]}</td>
                );
            }
            resp.push(<tr key={row}>
                {get_row_headers(table.view.stub, row)}
                {data}
            </tr>);
        }
        return <tbody>
        {resp}
        </tbody>
    }
}


export class MainTable extends React.Component<{table: Table}, {}> {

    clicker(e) {
        // TODO: check the table data selection logic
        // this.props.selector(select_data(e, this.props.matrix));
    }

    render() {
        let {table} = this.props;
        return <div id="datatable">
            <table className="pure-table pure-table-bordered" onClick={this.clicker.bind(this)}>
                <TableHead table={table} />
                <TableBody table={table} />
            </table>
        </div>
    }
}
