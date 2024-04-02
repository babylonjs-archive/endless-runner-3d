import { AbstractAssetTask } from "@babylonjs/core";
import { AssetsManager } from "@babylonjs/core";
import { ISoundOptions } from "@babylonjs/core";
import { Scene } from "@babylonjs/core";
import { Sound } from "@babylonjs/core";

export type CallbackFn = (tasks: AbstractAssetTask[]) => void;

export interface SoundOptions extends ISoundOptions {
    onSuccess?: (sound: Sound) => void;
}

export class AssetsDatabase {
    manager: AssetsManager;
    sounds: Record<string, Sound>;

    constructor(
        public scene: Scene,
        finishCallback: (tasks: AbstractAssetTask[]) => void,
    ) {
        this.scene = scene;
        this.sounds = {};
        this.manager = new AssetsManager(this.scene);

        this.manager.onFinish = (tasks) => {
            if (finishCallback) {
                finishCallback(tasks);
            }
        };
    }

    /**
     * Adds a sound to be loaded
     * @param {*} name
     * @param {*} file
     * @param {*} options
     */
    addSound(name: string, file: string, options: Partial<SoundOptions> = {}) {
        let fileTask = this.manager.addBinaryFileTask(
            name + "__SoundTask",
            file,
        );

        fileTask.onSuccess = (task) => {
            this.sounds[name] = new Sound(
                name,
                task.data,
                this.scene,
                null,
                options,
            );
            if (options.onSuccess) {
                options.onSuccess(this.sounds[name]);
            }
        };

        return this.sounds[name];
    }

    /**
     * Adds a music (sound with some predefined parametes that can be overwriten)
     * By default, musics are automatically played in loop
     * @param {*} name
     * @param {*} file
     * @param {*} options
     */
    addMusic(name: string, file: string, options: Partial<SoundOptions> = {}) {
        const newOptions = {
            loop: true,
            volume: 0.5,
            autoplay: true,
            ...options,
        };
        return this.addSound(name, file, newOptions);
    }

    getSound(name: string) {
        return this.sounds[name];
    }

    load() {
        this.manager.load();
    }
}
