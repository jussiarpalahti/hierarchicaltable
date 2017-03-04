
import * as _ from 'lodash';

// Header is for one row or column identifier
export class Header {
    name: string;
    code: string;
    selected: boolean;

    constructor (header) {
        let {name, code, selected} = header;
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

export class Heading {
    name:string;
    headers?: Header[];
    index?:number;
    hop?:number;

    constructor (name) {
        this.name = name;
    }
}

// Headers is a list of lists containing headings for all the column and row heading levels
export type Headers = Header[];
export type HeadingList = Headers[];

export interface TableAxis {
    size: number;
    hops: number[];
    loop: number[];
    hop?: Function[],
    headers?: HeadingList
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

function get_axis_shape (headings: HeadingList): TableAxis {
    /*

     Calculate table shape from list of header lists:
     hop: header size in cells
     loop: how many times to loop all headers
     size: full axis size in cells

     */
    let res:number[] = [];

    // Bottom level starts first in size accumulation
    headings.reverse();
    let ret = headings.reduce(
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
    let last = headings[headings.length - 1];
    let size:number = ret * last.length;
    headings.reverse();
    return {
        size: size,
        // repeat loop for level's headers is inverse of its hop size
        loop: res.slice(),
        hops: res.reverse()
    };
}


export function get_table (heading: HeadingList, stub: HeadingList, dataset?:Dataset): ITable {
    /*
    Generates a ITable object from headers
     */
    let heading_map = get_axis_shape(heading);
    heading_map.headers = heading;
    heading_map.hop = heading.map(
        (heading, index) => create_header_hopper(
                heading,
                heading_map.hops[index],
                heading_map.size));

    let stub_map = get_axis_shape(stub);
    stub_map.headers = stub;
    stub_map.hop = stub.map(
        (heading, index) => create_header_hopper(
            heading,
            stub_map.hops[index],
            stub_map.size));

    if (dataset) {
        return {
            dataset: dataset,
            stub: stub_map,
            heading: heading_map,
            size: stub_map.size * heading_map.size
        };
    } else {
        return {
            stub: stub_map,
            heading: heading_map,
            size: stub_map.size * heading_map.size
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
    headings: Heading[];
    stubs: Heading[];
    matrix: Matrix;
    view: ITable;

    constructor (base: Dataset, preview=true) {
        this.base = base;
        this.matrix = base.matrix;
        let levels = base.levels;
        let headings = [];
        for (let heading_name of base.heading) {
            let heading = new Heading(heading_name);
            heading.headers = levels[heading_name].map(header => new Header(header));
            headings.push(heading);
        }
        this.headings = headings;

        let stubs = [];
        for (let heading_name of base.stub) {
            let heading = new Heading(heading_name);
            heading.headers = levels[heading_name].map(header => new Header(header));
            stubs.push(heading);
        }
        this.stubs = stubs;

        this.view = get_table(
            this.stubs.map((heading) => heading.headers),
            this.headings.map((heading) => heading.headers));

        if (preview) this.view = get_preview_table(this);

    }
    // TODO: Refactor for Heading objects, not list of Headings
    selected_stub ():Headers[] {
        // selected headers on stub axis
        return this.stubs.map((heading) => {
            return heading.headers.filter((header) => header.selected);
        });
    }

    selected_heading ():Headers[] {
        // selected headers on heading axis
        return this.headings.map((heading) => {
            return heading.headers.filter((header) => header.selected);
        });
    }

    update_view ():void {
        // call this when selection status of one or more headers has changed
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    select_header (header:Header):void {
        // does header select with immediate update, otherwise use header.select directly
        header.select();
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    deselect_header (header:Header):void {
        // does header select with immediate update, otherwise use header.select directly
        header.deselect();
        this.view = get_table(this.selected_heading(), this.selected_stub(), this.base);
    }

    matrix_mask ():[number[], number[]] {
    //    TODO: Implement me!
    // return list of list of row and column positions in matrix for selected cells
        const stub_map = {};
        this.stubs.map((heading) => {
            // stub_map[heading] = heading.map((header, index) => header.selected ? index : null);
        });
        return [[1, 2], [2]];
    }

    set_matrix (matrix:Matrix) {
        // set matrix to given data, meant to be called with matrix data corresponding to selection mask
        this.matrix = matrix;
    }

}
