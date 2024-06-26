export interface Options {
    debugMode: boolean;
    backgroundColor: string;
    playerColor: string;
    monsterColor: string;
    coinColor: string;
    tileLightColor: string;
    tileDarkColor: string;
    hazardColor: string;
    pointsTextColor: string;
    pointsTextOutlineColor: string;
    recordTextColor: string;
    player: {
        defaultSpeed: number;
        gravity: number;
        jumpForce: number;
        jumpMaxAltitude: number;
    };
    level: {
        tileWidth: number;
        smallTileWidth: number;
        hazardWidth: number;
    };
}

export const options: Options = {
    debugMode: false, // Enable to show debug messages on console

    // Object Colors
    backgroundColor: "#636e72",
    playerColor: "#e74c3c",
    monsterColor: "#788ca3",
    coinColor: "#f1c40f",
    tileLightColor: "#f2a682",
    tileDarkColor: "#f28f66",
    hazardColor: "#197f19",

    // Text Colors
    pointsTextColor: "#f39c12",
    pointsTextOutlineColor: "#000000",
    recordTextColor: "#f39c12",

    // Player Options
    player: {
        defaultSpeed: 15,
        gravity: -9,
        jumpForce: 50,
        jumpMaxAltitude: 5,
    },

    level: {
        tileWidth: 1.8,
        smallTileWidth: 0.45,
        hazardWidth: 1.4,
    },
};
