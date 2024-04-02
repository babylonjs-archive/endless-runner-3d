import { ActionManager } from "@babylonjs/core/Actions/actionManager.js";
import { Color3 } from "@babylonjs/core/Maths/math.color.js";
import { Engine } from "@babylonjs/core/Engines/engine.js";
import { ExecuteCodeAction } from "@babylonjs/core/Actions/directActions.js";
import { InterpolateValueAction } from "@babylonjs/core/Actions/interpolateValueAction.js";
import { Material } from "@babylonjs/core/Materials/material.js";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js";
import { Nullable } from "@babylonjs/core/types.js";
import { Observable } from "@babylonjs/core/Misc/observable.js";
import { Scene } from "@babylonjs/core/scene.js";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js";
import { Tags } from "@babylonjs/core/Misc/tags.js";

import { AssetsDatabase } from "./AssetsDatabase.js";
import { Log } from "./Log.js";

export abstract class Level {
    onStopRenderLoopObservable = new Observable<void>();
    onStartRenderLoopObservable = new Observable<void>();

    scene!: Scene;
    protected materials: Record<string, Material> = {};
    assets!: AssetsDatabase;

    abstract setProperties(): void;
    abstract buildScene(): void;
    abstract beforeRender(): void;
    abstract setupAssets(): void;

    constructor(
        protected engine: Engine,
        protected log: Log,
    ) {}

    start() {
        this.onStopRenderLoopObservable.notifyObservers();

        if (this.setProperties) {
            this.setProperties();
        } else {
            this.log.debugWarning(
                "The setProperties method is recommended to initialize the Level properties",
            );
        }

        this.createScene();
    }

    createScene() {
        // Create the scene space
        this.scene = new Scene(this.engine);

        // Add assets management and execute beforeRender after finish
        this.assets = new AssetsDatabase(this.scene, () => {
            this.log.debug("Level Assets loaded");

            if (this.buildScene) {
                this.buildScene();
            } else {
                this.log.debugWarning(
                    "You can add the buildScene method to your level to define your scene",
                );
            }

            // If has the beforeRender method
            if (this.beforeRender) {
                this.scene.registerBeforeRender(this.beforeRender.bind(this));
            } else {
                this.log.debugWarning(
                    "You can define animations and other game logics that happends inside the main loop on the beforeRender method",
                );
            }

            this.onStartRenderLoopObservable.notifyObservers();
        });

        this.setupAssets();

        // Load the assets
        this.assets.load();

        return this.scene;
    }

    exit() {
        this.scene.dispose();
    }

    /**
     * Adds a collider to the level scene. It will fire the options.onCollide callback
     * when the collider intersects options.collisionMesh. It can be used to fire actions when
     * player enters an area for example.
     * @param {*} name
     * @param {*} options
     */
    addCollider(name: string, options: any) {
        const collider = MeshBuilder.CreateBox(
            name,
            {
                width: options.width || 1,
                height: options.height || 1,
                depth: options.depth || 1,
            },
            this.scene,
        );

        // Add a tag to identify the object as collider and to simplify group operations (like dispose)
        Tags.AddTagsTo(collider, "collider boxCollider");

        collider.position.x = options.positionX || 0;
        collider.position.y = options.positionY || 0;
        collider.position.z = options.positionZ || 0;

        collider.isVisible = options.visible ? options.visible : false;

        if (collider.isVisible) {
            let colliderMaterial = new StandardMaterial(name + "Material");
            colliderMaterial.diffuseColor = new Color3(0.5, 0.5, 0);
            colliderMaterial.alpha = 0.5;

            collider.material = colliderMaterial;
        }

        options.timeToDispose = options.timeToDispose
            ? options.timeToDispose
            : 0;

        collider.actionManager = new ActionManager(this.scene);
        collider.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: options.collisionMesh,
                },
                () => {
                    // Runs onCollide callback if exists
                    if (options.onCollide) {
                        options.onCollide();
                    }

                    // If true, will dispose the collider after timeToDispose
                    if (options.disposeAfterCollision) {
                        setTimeout(() => {
                            collider.dispose();
                        }, options.timeToDispose);
                    }
                },
            ),
        );

        return collider;
    }

    disposeColliders() {
        const colliders = this.scene.getMeshesByTags("collider");

        for (let index = 0; index < colliders.length; index++) {
            colliders[index].dispose();
        }
    }

    addMaterial(material: Material) {
        this.materials[material.name] = material;
    }

    getMaterial(materialName: string) {
        return this.materials[materialName];
    }

    removeMaterial(materialName: string) {
        let material = null;
        if ((material = this.materials[materialName])) {
            material.dispose();
            delete this.materials[materialName];
        }
    }

    /**
     * Interpolate a value inside the Level Scene using the BABYLON Action Manager
     * @param {*} target The target object
     * @param {*} property The property in the object to interpolate
     * @param {*} toValue The final value of interpolation
     * @param {*} duration The interpolation duration in milliseconds
     * @param {*} afterExecutionCallback Callback executed after ther interpolation ends
     */
    interpolate(
        target: any,
        property: string,
        toValue: any,
        duration?: number | undefined,
        afterExecutionCallback: Nullable<() => void> = null,
    ) {
        if (!this.scene.actionManager) {
            this.scene.actionManager = new ActionManager(this.scene);
        }

        const interpolateAction = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            target,
            property,
            toValue,
            duration,
        );

        interpolateAction.onInterpolationDoneObservable.add(() => {
            this.log.debug("Interpolation done");
            if (afterExecutionCallback) {
                afterExecutionCallback();
            }
        });

        this.scene.actionManager.registerAction(interpolateAction);
        interpolateAction.execute();
    }
}
