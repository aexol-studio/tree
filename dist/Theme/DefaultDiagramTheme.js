"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Colors_1 = require("./Colors");
exports.DefaultDiagramTheme = {
    snappingGridSize: 20,
    node: {
        width: 180,
        height: 100,
        nameSize: 24,
        typeSize: 20,
        spacing: {
            x: 100,
            y: 100
        }
    },
    description: {
        width: 300,
        height: 120,
        triangleHeight: 20,
        triangleWidth: 20
    },
    port: {
        width: 40
    },
    link: {
        cornerRadius: 5,
        defaultCenterPoint: 0.5,
        strokeWidth: 4
    },
    menu: {
        width: 400,
        maxHeight: 700,
        category: {
            height: 50,
            textSize: 25
        },
        spacing: {
            x: 20,
            y: 100
        },
    },
    colors: {
        background: Colors_1.Colors.grey[6],
        node: {
            background: Colors_1.Colors.grey[5],
            selected: Colors_1.Colors.main[3],
            name: Colors_1.Colors.grey[0],
            type: Colors_1.Colors.green[0],
            types: {
                string: Colors_1.Colors.green[0],
                type: Colors_1.Colors.main[0]
            }
        },
        description: {
            background: Colors_1.Colors.grey[7],
            text: Colors_1.Colors.grey[1]
        },
        port: {
            background: Colors_1.Colors.grey[4],
            backgroundActive: Colors_1.Colors.grey[3],
            button: Colors_1.Colors.grey[0]
        },
        link: {
            main: Colors_1.Colors.grey[3],
            active: Colors_1.Colors.green[0]
        },
        menu: {
            background: Colors_1.Colors.grey[3],
            text: Colors_1.Colors.grey[6],
            hover: Colors_1.Colors.grey[1]
        }
    }
};
