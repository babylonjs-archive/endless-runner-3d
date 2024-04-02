import { Game } from "./Game.js";

window.addEventListener("DOMContentLoaded", () => {
    const game = new Game("renderCanvas");
    game.start();
});
