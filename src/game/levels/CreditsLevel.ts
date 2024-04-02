import { Color4 } from "@babylonjs/core/Maths/math.color.js";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";

import { UI } from "../../base/UI.js";
import { Level } from "../../base/Level.js";
import { options } from "../../options.js";

export class CreditsLevel extends Level {
    onReturnToHomeObservable = new Observable<void>();
    camera!: FreeCamera;

    setProperties() {}

    beforeRender() {}

    setupAssets() {
        this.assets.addMusic("music", "assets/musics/Guitar-Mayhem.mp3");
    }

    buildScene() {
        this.camera = new FreeCamera(
            "camera1",
            new Vector3(0, 5, -10),
            this.scene,
        );

        // Make this scene transparent to see the background
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        this.makeUI();
    }

    makeUI() {
        const ui = new UI("creditsUI");

        ui.addText(
            "Design and Code by Tiago Silva Pereira Rodrigues\nkingofcode.com.br\n\n\n",
            {
                top: "30px",
                fontSize: "20px",
                // horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_TOP,
            },
        );

        ui.addText(
            "Music by Eric Matyas\nwww.soundimage.org\n\nPlease check the game license documentation before\nchanging the credits",
            {
                top: "140px",
                fontSize: "20px",
                // horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_TOP,
            },
        );

        ui.addButton("backButton", "Return to Home", {
            top: "220px",
            background: options.backgroundColor,
            color: "white",
            onClick: () => {
                this.onReturnToHomeObservable.notifyObservers();
            },
        });
    }
}
