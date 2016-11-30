
/*

Data model:
    Table
        -> Axis
            -> Map Heading: [Header]

 */

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

// TODO: What's the type for empty map?
type THeading = Map<string, [Header]> | Map<{},{}>;

class Axis {
    headings:THeading;
    size:number;
    hops:number[];
    loop:number[];
    hop:Function[];

    constructor(headings:THeading) {
        this.headings = headings;
    }
}

class Table {
    name: string;
    matrix:[string[]];
    title:string;
    url:string;
    heading:Axis;
    stub:Axis;

    constructor(name, matrix, url, title?, heading?, stub?) {
        this.name = name;
        this.matrix = matrix;
        this.title = title || "";
        this.url = url;
        this.heading = heading ? heading : new Axis(new Map());
        this.stub = stub ? stub : new Axis(new Map());
    }

    add_heading(name:string, headers:[Header]) {
        this.heading.headings.set(name, headers);
    }

    add_stub(name:string, headers:[Header]) {
        this.stub.headings.set(name, headers);
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

    size() {
        return this.heading.size * this.stub.size;
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

function create_tables(data:[Dataset]) {

    let hed = [];
    // for (let heading of headings) {
    //     data.push(new Header(heading.name, heading.code, false))
    // }
}
