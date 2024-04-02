import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { UI } from "../../base/UI.js";
import { Level } from "../../base/Level.js";
import { options } from "../../options.js";

export class HomeMenuLevel extends Level {
    onPlayClickedObservable = new Observable<void>();
    onCreditsClickedObservable = new Observable<void>();

    camera!: FreeCamera;

    setProperties() {}

    beforeRender() {}

    setupAssets() {
        this.assets.addMusic("music", "/assets/musics/Guitar-Mayhem.mp3");
    }

    buildScene() {
        this.camera = new FreeCamera(
            "camera1",
            new Vector3(0, 5, -10),
            this.scene,
        );

        // Make this scene transparent to see the document background
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        const menu = new UI("homeMenuUI");

        menu.addButton("playButton", "Play Game", {
            background: options.backgroundColor,
            color: "white",
            onClick: () => {
                this.onPlayClickedObservable.notifyObservers();
            },
        });

        menu.addButton("creditsButton", "Credits", {
            top: "70px",
            background: options.backgroundColor,
            color: "white",
            onClick: () => {
                this.onCreditsClickedObservable.notifyObservers();
            },
        });
    }
}
