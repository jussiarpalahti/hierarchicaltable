
# Hierarchical Statistical Table for PC Axis/JSON Stat data

Render a hierarchical, statistical table from PC Axis/JSON Stat style format into HTML table with semantically correct structure.

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

## Todo

 - [X] Preview table from statserver JSON (my own simple Django app that provides REST API to PC Axis file format)
 - [ ] Preview table from JSON Stat (standard for PX Web services)
 - [ ] Table header selector
 - [ ] Tests for full table rendering
