import { Engine } from "@babylonjs/core";
import { Nullable } from "@babylonjs/core";

import { Level } from "./base/Level.js";
import { Log } from "./base/Log.js";
import { RunnerLevel } from "./game/levels/RunnerLevel.js";
import { CreditsLevel } from "./game/levels/CreditsLevel.js";
import { HomeMenuLevel } from "./game/levels/HomeMenuLevel.js";
import { keys } from "./common.js";

import "hammerjs";

export class Game {
    canvas: HTMLCanvasElement;
    engine: Engine;
    currentLevel: Nullable<Level>;
    currentLevelName: string;
    levels: Record<string, Level>;

    paused = false;
    log = new Log();

    constructor(id: string) {
        this.canvas = document.getElementById(id) as HTMLCanvasElement;

        this.engine = new Engine(this.canvas, true);

        this.currentLevel = null;
        this.currentLevelName = "HomeMenuLevel";

        const homeLevel = new HomeMenuLevel(this.engine, this.log);
        homeLevel.onStopRenderLoopObservable.add(() => {
            this.resume();
            this.stopRenderLoop();
        });
        homeLevel.onStartRenderLoopObservable.add(() => {
            this.startRenderLoop();
        });
        homeLevel.onPlayClickedObservable.add(() => {
            this.goToLevel("RunnerLevel");
        });
        homeLevel.onCreditsClickedObservable.add(() => {
            this.goToLevel("CreditsLevel");
        });

        const creditsLevel = new CreditsLevel(this.engine, this.log);
        creditsLevel.onStopRenderLoopObservable.add(() => {
            this.resume();
            this.stopRenderLoop();
        });
        creditsLevel.onStartRenderLoopObservable.add(() => {
            this.startRenderLoop();
        });
        creditsLevel.onReturnToHomeObservable.add(() => {
            this.goToLevel("HomeMenuLevel");
        });

        const runnerLevel = new RunnerLevel(this.engine, this.log);
        runnerLevel.onStopRenderLoopObservable.add(() => {
            this.resume();
            this.stopRenderLoop();
        });
        runnerLevel.onStartRenderLoopObservable.add(() => {
            this.startRenderLoop();
        });
        runnerLevel.onReturnToHomeClickedObservable.add(() => {
            this.goToLevel("HomeMenuLevel");
        });
        runnerLevel.onPlayerDiedObservable.add(() => {
            this.pause();
        });
        runnerLevel.onReplayClickedObservable.add(() => {
            this.resume();
        });

        this.levels = {
            HomeMenuLevel: homeLevel,
            CreditsLevel: creditsLevel,
            RunnerLevel: runnerLevel,
        };
    }

    start() {
        this.listenKeys();
        this.listenTouchEvents();
        this.listenOtherEvents();
        this.startLevel();
    }

    pause() {
        this.paused = true;
        if (this.levels["RunnerLevel"]) {
            (this.levels["RunnerLevel"] as RunnerLevel).pause();
        }
    }

    isPaused() {
        return this.paused;
    }

    resume() {
        this.paused = false;
    }

    setKey(key: string, pressed: boolean) {
        keys[key] = pressed;
    }

    listenKeys() {
        document.addEventListener("keydown", this._keyDown.bind(this));
        document.addEventListener("keyup", this._keyUp.bind(this));

        keys.up = false;
        keys.down = false;
        keys.left = false;
        keys.right = false;
    }

    _keyDown(ev: KeyboardEvent) {
        if (ev.key === "ArrowUp" || ev.key === "w") {
            keys.up = true;
        } else if (ev.key === "ArrowDown" || ev.key === "s") {
            keys.down = true;
        } else if (ev.key === "ArrowLeft" || ev.key === "a") {
            keys.left = true;
        } else if (ev.key === "ArrowRight" || ev.key === "d") {
            keys.right = true;
        }
    }

    _keyUp(ev: KeyboardEvent) {
        if (ev.key === "ArrowUp" || ev.key === "w") {
            keys.up = false;
        } else if (ev.key === "ArrowDown" || ev.key === "s") {
            keys.down = false;
        } else if (ev.key === "ArrowLeft" || ev.key === "a") {
            keys.left = false;
        } else if (ev.key === "ArrowRight" || ev.key === "d") {
            keys.right = false;
        }
    }

    listenTouchEvents() {
        const hammertime = new Hammer(document.body);
        hammertime.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

        hammertime.on("swipeup", () => {
            keys.up = true;

            // Resets the key after some milleseconds
            setTimeout(() => {
                keys.up = false;
            }, 150);
        });

        hammertime.on("swipedown", () => {
            keys.down = true;

            setTimeout(() => {
                keys.down = false;
            }, 100);
        });

        hammertime.on("swipeleft", () => {
            keys.left = true;

            setTimeout(() => {
                keys.left = false;
            }, 150);
        });

        hammertime.on("swiperight", () => {
            keys.right = true;

            setTimeout(() => {
                keys.right = false;
            }, 150);
        });
    }

    listenOtherEvents() {
        window.addEventListener("blur", () => {
            this.pause();
        });

        window.addEventListener("focus", () => {
            this.resume();
        });
    }

    goToLevel(levelName: string) {
        if (!this.levels[levelName]) {
            this.log.debugError(`A level with name ${levelName} doesn't exist`);
            return;
        }

        if (this.currentLevel) {
            this.currentLevel.exit();
        }

        this.currentLevelName = levelName;
        this.startLevel();
    }

    startLevel() {
        this.currentLevel = this.levels[this.currentLevelName];
        this.currentLevel.start();
    }

    render() {
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
        this.startRenderLoop();
    }

    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.currentLevel?.scene?.render();
        });
    }

    stopRenderLoop() {
        this.engine.stopRenderLoop();
    }

    isMobile() {
        if (
            navigator.userAgent.match(/Android/i) ||
            navigator.userAgent.match(/webOS/i) ||
            navigator.userAgent.match(/iPhone/i) ||
            navigator.userAgent.match(/iPad/i) ||
            navigator.userAgent.match(/iPod/i) ||
            navigator.userAgent.match(/BlackBerry/i) ||
            navigator.userAgent.match(/Windows Phone/i)
        ) {
            return true;
        }

        return false;
    }
}
