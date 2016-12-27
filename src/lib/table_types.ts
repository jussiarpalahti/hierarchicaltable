
/*

Data model:
    Table
        -> Axis
            -> Headings:Map
                -> Heading: [Header]

Process is as follows:
    from PX data to Table structure:
        heading: [one, two, three]
        levels: {one: [a,b,c], two:[d,e,f], three: ...}
        transforms to:
        Axis.headings = {one: [Header(a), Header(b), Header(c)], two: ...}
        Using ES6 ordered map to keep heading order intact

    Table calculations with the new structure:
        Axis ->
            size, hops, loop, hop <- get_table(headings.values, stub.values)
        Table ->
            get filtered headers <-
                for each heading in headings <-
                    for each header in heading <-
                        return header if show is true
            get_matrix_mask <-
                for each header calculate its place in its heading with its hop
                then make a list of values from union of all values (using a set)
                loop all header lists for *filtered* headers and use its index and heading's hop
                repeat for both axes
            request matrix data or return the query args for external request

    Table should be ready at this stage for rendering

 */

import {get_table} from './table';

class Header {
    name:string;
    code:string;
    show:boolean;

    constructor(name, code?, show?) {
        this.name = name;
        this.code = code || "";
        this.show = show || false;
    }
}


class Heading {
    name:string;
    hop:number;

    constructor(name:string) {
        this.name = name;
    }
}

// TODO: What's the type for empty map?
type THeadingMap = Map<Heading, [Header]> | Map<{},{}>;


class Axis {
    headings:THeadingMap;
    size:number;
    hops:number[];
    loop:number[];
    hop:Function[];

    constructor(headings:THeadingMap) {
        this.headings = headings;
    }

    set_shape(size, hops, loop, hop) {
        this.size = size;
        this.hops = hops;
        this.loop = loop;
        this.hop = hop;
    }

}

class Table {
    name: string;
    matrix:[string[]];
    title:string;
    url:string;
    heading:Axis;
    stub:Axis;
    size:number;

    constructor(name, matrix, url, title?, heading?, stub?) {
        this.name = name;
        this.matrix = matrix;
        this.title = title || "";
        this.url = url;
    }

    add_heading(heading:Heading, headers:Header[]) {
        this.heading.headings.set(heading, headers);
    }

    add_stub(heading:Heading, headers:Header[]) {
        this.stub.headings.set(heading, headers);
    }

    filter_headings(heading):Header[][] {
        /**
         * Creates table axis' headings with only visible headers
         */

        let resp = [];
        heading.headings.forEach(
            (headers, name) => resp.push(headers.filter(header => header.show))
        );
        return resp;
    }

    show_heading() {
        return this.filter_headings(this.heading)
    };

    show_stub() {
        return this.filter_headings(this.stub)
    };

    calculate_table () {
        let {heading, stub, size} = get_table(this.heading.headings.values(), this.stub.headings.values());
        this.size = size;
        this.heading.set_shape(heading.size, heading.hops, heading.loop, heading.hop);
        this.stub.set_shape(stub.size, stub.hops, stub.loop, stub.hop);
    }

    calculate_matrix_mask() {

        let heading_mask = [];

    }
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

function create_table(data:Dataset):Table {
    /*
     from PX data to Table structure:
     heading: [one, two, three]
     levels: {one: [a,b,c], two:[d,e,f], three: ...}
     transforms to:
     Axis.headings = {one: [Header(a), Header(b), Header(c)], two: ...}
     Using ES6 ordered map to keep heading order intact

     Axis ->
        size, hops, loop, hop <- get_table(headings.values, stub.values)
     */


    let table = new Table(data.name, data.matrix, data.url, data.title);

    for (let heading of data.heading) {
        table.add_heading(new Heading(heading), data.levels[heading].map(header => new Header(header)));
    }

    for (let heading of data.stub) {
        table.add_stub(new Heading(heading), data.levels[heading].map(header => new Header(header)));
    }

    table.calculate_table();

    return table;
}
