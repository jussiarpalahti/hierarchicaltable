

class Header {
    name:string;
    code:string;
    show:boolean;

    constructor(name, code, show) {
        this.name = name;
        this.code = code;
        this.show = show;
    }
}

type Heading = Map<string, [Header]>;

class Table {
    name: string;
    matrix:[string[]];
    title:string;
    url:string;
    heading:Heading;
    stub:Heading;

    constructor(name, matrix, title, url, heading?, stub?) {
        this.name = name;
        this.matrix = matrix;
        this.heading = heading ? heading : new Map();
        this.stub = stub ? stub : new Map();
    }

    add_heading(name:string, headers:[Header]) {
        this.heading.set(name, headers);
    }

    add_stub(name:string, headers:[Header]) {
        this.stub.set(name, headers);
    }

    filter_headings(headings) {
        let resp = [];
        headings.forEach(
            (headers, name) => resp.push(
                    {
                        name: name,
                        headers: headers.filter(header => header.show)
                    }));
        return resp;
    }

    show_heading() {
        return this.filter_headings(this.heading)
    };

    show_stub() {
        return this.filter_headings(this.stub)
    };
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
