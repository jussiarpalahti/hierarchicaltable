
import * as _ from 'lodash';

// Header is for one row or column identifier
export type Header = string | number;

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

export interface Dataset {
    stub: string[],
    heading: string[],
    levels: {[key:string]: Array<string>},
    name: string,
    title: string,
    url: string,
    matrix: [string[]]
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

    var index = 0;
    var pos = 0;
    var headers_size = headers.length;

    return function header_hopper(reset:boolean): Header {

        if (reset) {
            index = 0;
            pos = 0;
            return;
        }

        var header;

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
    var size:number = ret * last.length;
    headers.reverse();
    return {
        size: size,
        // repeat loop for level's headers is inverse of its hop size
        loop: res.slice(),
        hops: res.reverse()
    };
}


export function get_table (heading: Headers, stub: Headers, dataset?:Dataset): ITable {
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


export function get_preview_table(table: ITable, size?: number): ITable {
    /*

     */

    if (!size) size = 10;

    // TODO: make hop creator a function factory factory
    table.heading.hop.forEach((hopper) => hopper(true));
    table.stub.hop.forEach((hopper) => hopper(true));

    let heading = Array.apply(null, Array(table.heading.headers.length)).map((_, i) => []);
    for (let index=0; index < size; index++) {
        table.heading.hop.forEach((hopper, pos) => {
            let header = hopper();
            if (header && heading[pos].indexOf(header) === -1) {
                heading[pos].push(header);
            }
        });
    }

    let stub = Array.apply(null, Array(table.stub.headers.length)).map((_, i) => []);
    for (let index=0; index < size; index++) {
        table.stub.hop.map((hopper, pos) => {
            let header = hopper();
            if (header && stub[pos].indexOf(header) === -1) {
                stub[pos].push(header);
            }
        });
    }
    return get_table(heading, stub, table.dataset);
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
