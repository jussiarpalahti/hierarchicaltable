
# Hierarchical Statistical Table for PC Axis based data

Render a hierarchical, statistical table from PC Axis based format into HTML table with semantically correct structure.

Supports statserver's simple JSON format for hierarchical data:

    Dataset {
        stub: [string],
        heading: [string],
        levels: {string: [string]},
        name: string,
        title: string,
        url: string,
        matrix: [[string]]
    }

Stub and heading have heading names for rows and columns. Levels contains an object that has headings as keys and values are headers.

Matrix contains a list of list where outer list has the rows and each row has the columns where each cell contain statistical data.

Row and column header hierarchy describes each data cell's properties, meaning what the data is about. Higher levels of hierarchy point to several adjacent cells (on horizontal or vertical axis).

## TODO

 - [X] Render full table
 - [X] Render preview table
 - [ ] Selector for subset of table (produce a new table for selected subset of headings)
 - [ ] Pivot (change order of table headings)
 - [ ] Tests for full table rendering

