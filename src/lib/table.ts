
import * as _ from 'lodash';

// Header is for one row or column identifier
export class Header {
    name: string;
    code: string;
    selected: boolean;

    constructor (name, code=null, selected=false) {
        this.name = name;
        this.code = code;
        this.selected = selected;
    }

    select () {
        this.selected = true;
    }

    deselect () {
        this.selected = false;
    }

}

// Heading is a list of all header identifiers for a particular column or row axis
export type Heading = Header[]

// Headers is a list of lists containing headings for all the column and row heading levels
export type Headers = Heading[];

export interface TableAxis {
    size: number;
    hops: number[];
    loop: number[];
    hop?: Function[],
    headers?: Headers
}

export interface Selections {
    stub: {[key:string]: number[]},
    heading: {[key:string]: number[]}
}

export type Cell = string|number;
export type Matrix = Cell[][];

export interface Dataset {
    stub: string[],
    heading: string[],
    levels: {[key:string]: Array<string>},
    name: string,
    title: string,
    url: string,
    matrix: Matrix
}

export interface ITable {
    dataset?:Dataset,
    stub: TableAxis;
    heading: TableAxis;
    size: number;
}

function create_header_hopper(headers: Header[], hop: number, limit: number): Function {
    /*

     Creates a function that returns either header or null
     based on hop size and limit, starting from zero index position.

     If limit is reached, returns null.

     */

    let index = 0;
    let pos = 0;
    let headers_size = headers.length;

    return function header_hopper(reset:boolean): Header {

        if (reset) {
            index = 0;
            pos = 0;
            return;
        }

        let header;

        if (pos >= limit) {
            // cell position advanced beyond limit
            return null;
        }

        if (index >= headers_size) {
            // headers exhausted, start over
            index = 0;
        }

        if (pos % hop === 0) {
            // time to show a header
            header = headers[index];
            index += 1;
        }

        // advance to next cell position
        pos += 1;

        return header ? header : null;
    }
}

function get_axis_shape (headers: Headers): TableAxis {
    /*

     Calculate table shape from list of header lists:
     hop: header size in cells
     loop: how many times to loop all headers
     size: full axis size in cells

     */
    let res:number[] = [];

    // Bottom level starts first in size accumulation
    headers.reverse();
    let ret = headers.reduce(
        function reducer (prev:number, next, index, all) {
            let acc;

            if (!prev) {
                // Bottom level is a special case: every header corresponds to 1 cell
                res.push(1);
                return 1;
            } else {
                // Levels other than bottom have cell size accumulated from previous levels' sizes
                acc = all[index - 1].length * prev;
                res.push(acc);
                return acc;
            }
        },
        null);

    // Full size is accumulated size below last level times its own size
    let last = headers[headers.length - 1];
    let size:number = ret * last.length;
    headers.reverse();
    return {
        size: size,
        // repeat loop for level's headers is inverse of its hop size
        loop: res.slice(),
        hops: res.reverse()
    };
}


export function get_table (heading: any, stub: any, dataset?:Dataset): ITable {
    /*
    Generates a ITable object from headers
     */
    let headings = get_axis_shape(heading);
    headings.headers = heading;
    headings.hop = heading.map(
        (headers, index) => create_header_hopper(
                headers,
                headings.hops[index],
                headings.size));

    let stubs = get_axis_shape(stub);
    stubs.headers = stub;
    stubs.hop = stub.map(
        (headers, index) => create_header_hopper(
            headers,
            stubs.hops[index],
            stubs.size));

    if (dataset) {
        return {
            dataset: dataset,
            stub: stubs,
            heading: headings,
            size: stubs.size * headings.size
        };
    } else {
        return {
            stub: stubs,
            heading: headings,
            size: stubs.size * headings.size
        };
    }
}


export function get_preview_table(table: Table, size?: number): ITable {
    /*

     */

    if (!size) size = 10;

    // TODO: make hop creator a function factory factory
    table.view.heading.hop.forEach((hopper) => hopper(true));
    table.view.stub.hop.forEach((hopper) => hopper(true));

    for (let index=0; index < size; index++) {
        table.view.heading.hop.forEach((hopper, pos) => {
            let header = hopper();
            if (header) {
                header.select();
            }
        });
    }


    for (let index=0; index < size; index++) {
        table.view.stub.hop.map((hopper, pos) => {
            let header = hopper();
            if (header) {
                header.select();
            }
        });
    }
    return get_table(table.selected_heading(), table.selected_stub(), table.base);
}

export function transform_table(dset:Dataset, selection?): {heading: Headers, stub: Headers} {
    /*

     PX Style table has all headings in one object and list of heading keys
     separate for column and row headers.

     This function creates a list of lists containing headers
     for heading and stub separately.

     */
    let levels = selection ? selection : dset.levels;
    let heading = [];
    for (let headings of dset.heading) {
        heading.push(levels[headings]);
    }
    let stub = [];
    for (let headings of dset.stub) {
        stub.push(levels[headings]);
    }

    return {heading, stub};
}

export function get_matrix_mask(selections:Selections, table:ITable):{heading: number[], stub: number[]} {
    let stub_mask = [];
    let heading_mask = [];

    table.dataset.heading.map((heading, index) => {
        let hop = table.heading.hops[index];
        for (let pos of selections.heading[heading]) {
            let start = hop * pos;
            heading_mask.push(_.range(start, start + hop));
        }
    });

    table.dataset.stub.map((stub, index) => {
        let hop = table.stub.hops[index];
        for (let pos of selections.stub[stub]) {
            let start = hop * pos;
            stub_mask.push(_.range(start, start + hop));
        }

    });

    return {heading: _.uniq(_.flatten(heading_mask)), stub: _.uniq(_.flatten(stub_mask))};
}

export class Table {
    base: Dataset;
    headings: Headers;
    stubs: Headers;
    matrix: Matrix;
    view: ITable;

    constructor (base: Dataset, preview=true) {
        this.base = base;
        this.matrix = base.matrix;
        let levels = base.levels;
        let heading = [];
        for (let headings of base.heading) {
            heading.push(levels[headings].map(header => new Header(header)));
        }
        this.headings = heading;

        let stub = [];
        for (let headings of base.stub) {
            stub.push(levels[headings].map(header => new Header(header)));
        }
        this.stubs = stub;

        this.view = get_table(this.headings, this.stubs);

        if (preview) this.view = get_preview_table(this);

    }

    selected_stub () {
        // selected headers on stub axis
        return this.stubs.map((heading) => {
            return heading.filter((header) => header.selected);
        });
    }

    selected_heading () {
        // selected headers on heading axis
        return this.headings.map((heading) => {
            return heading.filter((header) => header.selected);
        });
    }

    update_view () {
        // call this when selection status of one or more headers has changed
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    select_header (header:Header) {
        // does header select with immediate update, otherwise use header.select directly
        header.select();
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    deselect_header (header:Header) {
        // does header select with immediate update, otherwise use header.select directly
        header.deselect();
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    matrix_mask () {
    // return list of list of row and column positions in matrix for selected cells
    }

    set_matrix (matrix:Matrix) {
        // set matrix to given data, meant to be called with matrix data corresponding to selection mask
        this.matrix = matrix;
    }

}
