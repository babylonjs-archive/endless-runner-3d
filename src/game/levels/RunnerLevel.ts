import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js";
import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { Control } from "@babylonjs/gui/2D/controls/control.js";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight.js";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { PointLight } from "@babylonjs/core/Lights/pointLight.js";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator.js";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { UI } from "../../base/UI.js";
import { Player } from "../Player.js";
import { Monster } from "../Monster.js";
import { Level } from "../../base/Level.js";
import { TilesGenerator } from "./generators/TilesGenerator.js";
import { options } from "../../options.js";

function isMobile() {
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

export class RunnerLevel extends Level {
    player!: Player;
    tiles!: TilesGenerator;
    menu!: UI;
    pointsTextControl!: TextBlock;
    currentRecordTextControl!: TextBlock;
    hasMadeRecordTextControl!: TextBlock;
    shadowGenerator!: ShadowGenerator;
    monster!: Monster;

    onReturnToHomeClickedObservable = new Observable<void>();
    onReplayClickedObservable = new Observable<void>();
    onPlayerDiedObservable = new Observable<void>();
    private _paused = false;

    setProperties() {}

    setupAssets() {
        this.assets.addMusic("music", "assets/musics/Guitar-Mayhem.mp3");
        this.assets.addSound("playerDieSound", "assets/sounds/game-die.mp3", {
            volume: 0.4,
        });
        this.assets.addSound("gotCoinSound", "assets/sounds/coin-c-09.wav");
        this.assets.addSound("damageSound", "assets/sounds/damage.wav");
        this.assets.addSound("approachSound", "assets/sounds/monster.wav");
        this.assets.addSound(
            "attackSound",
            "assets/sounds/monster_attack.mp3",
        );
    }

    buildScene() {
        this.scene.clearColor = Color4.FromHexString(options.backgroundColor);

        this.createMenus();

        // Sets the active camera
        const camera = this.createArcCamera();
        this.scene.activeCamera = camera;

        // Uncomment it to allow free camera rotation
        // camera.attachControl(GAME.canvas, true);

        // Add lights to the scene
        const light1 = new HemisphericLight(
            "light1",
            new Vector3(0, 10, 0),
            this.scene,
        );
        const light2 = new PointLight(
            "light2",
            new Vector3(0, 100, -100),
            this.scene,
        );
        light1.intensity = 0.9;
        light2.intensity = 0.2;

        this.createPlayer();
        this.createMonster();

        this.tiles = new TilesGenerator(this);
        this.tiles.generate();
    }

    createMenus() {
        this.menu = new UI("runnerMenuUI");

        this.pointsTextControl = this.menu.addText("Points: 0", {
            top: "-150px",
            color: options.pointsTextColor,
            outlineColor: options.pointsTextOutlineColor,
            outlineWidth: 2,
            fontSize: "40px",
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        });

        this.currentRecordTextControl = this.menu.addText("Current Record: 0", {
            top: "-100px",
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        });

        this.hasMadeRecordTextControl = this.menu.addText(
            "You got a new Points Record!",
            {
                top: "-60px",
                color: options.recordTextColor,
                fontSize: "20px",
                verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
            },
        );

        this.menu.addButton("replayButton", "Replay Game", {
            onClick: () => {
                this.replay();
            },
        });

        this.menu.addButton("backButton", "Return to Home", {
            top: "70px",
            onClick: () => {
                this.onReturnToHomeClickedObservable.notifyObservers();
            },
        });

        this.menu.hide();

        this.createTutorialText();
    }

    createTutorialText() {
        const text = isMobile()
            ? "Swipe the screen to control de cube"
            : "Use Arrow Keys or WASD to control the cube";

        // Small tutorial text
        const tutorialText = this.menu.addText(text, {
            verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
        });

        setTimeout(() => {
            this.menu.remove(tutorialText);
        }, 5000);
    }

    createArcCamera() {
        const camera = new ArcRotateCamera(
            "arcCamera",
            0,
            0,
            0,
            Vector3.Zero(),
            this.scene,
        );

        // Not sure where this came from.
        // camera.ctype = 1;
        camera.setPosition(new Vector3(0, 1, -3));
        camera.radius = 2;

        return camera;
    }

    createPlayer() {
        // Creates the player and sets it as camera target
        this.player = new Player(this);
        (this.scene.activeCamera as ArcRotateCamera).lockedTarget =
            this.player.getMesh();

        const playerLight = new DirectionalLight(
            "playerLight",
            new Vector3(1, -2, 1),
            this.scene,
        );
        playerLight.intensity = 0.3;
        playerLight.parent = this.player.mesh;

        // scene.shadowsEnabled

        this.shadowGenerator = new ShadowGenerator(32, playerLight);
        this.shadowGenerator.useBlurExponentialShadowMap = true;

        this.shadowGenerator.getShadowMap()?.renderList?.push(this.player.mesh);

        // Actions when player dies
        this.player.onDie = () => {
            this.onPlayerDiedObservable.notifyObservers();
            this.player.calculatePoints();
            this.showMenu();
        };
    }

    showMenu() {
        this.pointsTextControl.text = `Points: ${this.player.getPoints()}`;
        this.currentRecordTextControl.text = `Current Record: ${this.player.getLastRecord()}`;
        this.menu.show();

        if (this.player.hasMadePointsRecord()) {
            this.hasMadeRecordTextControl.isVisible = true;
        } else {
            this.hasMadeRecordTextControl.isVisible = false;
        }
    }

    createMonster() {
        this.monster = new Monster(this);
        // Add monster shadow
        this.shadowGenerator
            .getShadowMap()
            ?.renderList?.push(this.monster.mesh);
    }

    beforeRender() {
        if (!this._paused) {
            this.player.move();
            this.monster.move();
        }
    }

    pause() {
        this._paused = true;
    }

    replay() {
        /**
         * We need to dispose the current colliders and tiles on scene to prevent trash objects.
         */
        this.tiles.reset();
        this.disposeColliders();

        this.player.reset();
        this.monster.approachToPlayer();

        this.tiles.generate();

        this.menu.hide();
        this.onReplayClickedObservable.notifyObservers();
    }
}
