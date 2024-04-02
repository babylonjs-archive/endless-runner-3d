import { Color3 } from "@babylonjs/core";
import { Mesh } from "@babylonjs/core";
import { MeshBuilder } from "@babylonjs/core";
import { Scene } from "@babylonjs/core";
import { Sound } from "@babylonjs/core";
import { StandardMaterial } from "@babylonjs/core";

import { options } from "../options.js";
import type { RunnerLevel } from "./levels/RunnerLevel.js";
import type { Player } from "./Player.js";

export class Monster {
    level: RunnerLevel;
    currentPlayerTravelledDistance: number;
    distanceBeetweenPlayer: number;
    mesh: Mesh;
    scene: Scene;
    monsterMaterial: StandardMaterial;
    approachSound: Sound;
    attackSound: Sound;
    player: Player;
    statuses: Record<string, boolean> = {};

    constructor(level: RunnerLevel) {
        /**
         * Who to chase
         */
        this.level = level;
        this.player = level.player;
        this.currentPlayerTravelledDistance = 0;
        this.distanceBeetweenPlayer = 0.9;

        this.statuses = {
            CLOSE_TO_PLAYER: true,
        };

        this.scene = level.scene;

        this.mesh = MeshBuilder.CreateSphere(
            "monsterSphere",
            { diameter: 0.25, segments: 2 },
            this.scene,
        );
        this.mesh.position.x = 0;
        this.mesh.position.y = 0.2;
        this.mesh.position.z =
            this.player.mesh.position.z - this.distanceBeetweenPlayer;

        this.monsterMaterial = new StandardMaterial(
            "monsterMaterial",
            this.scene,
        );
        this.monsterMaterial.diffuseColor = Color3.FromHexString(
            options.monsterColor,
        );
        this.monsterMaterial.specularColor = new Color3(0, 0, 0);

        this.mesh.material = this.monsterMaterial;

        this.approachSound = this.level.assets.getSound("approachSound");
        this.attackSound = this.level.assets.getSound("attackSound");
    }

    approachToPlayer() {
        this.statuses.CLOSE_TO_PLAYER = true;
        this.currentPlayerTravelledDistance =
            this.player.totalTravelledDistance;

        this.level.interpolate(this, "distanceBeetweenPlayer", 0.9, 500);

        this.approachSound.play();
    }

    moveAwayFromPlayer() {
        this.statuses.CLOSE_TO_PLAYER = false;
        this.level.interpolate(this, "distanceBeetweenPlayer", 1.5, 1500);
    }

    attackPlayer() {
        this.attackSound.play();
        this.level.interpolate(this, "distanceBeetweenPlayer", 0.1, 300);

        // Player dies after 300ms
        setTimeout(() => this.player.die(), 300);
    }

    move() {
        this.mesh.position.x = this.player.mesh.position.x;

        // Adding some altitude variation on monster altitude using Math.sin
        this.mesh.position.y =
            Math.sin(this.mesh.position.z) / 100 +
            0.2 +
            (this.player.mesh.position.y - this.player.defaultAltitude);

        this.mesh.position.z =
            this.player.mesh.position.z - this.distanceBeetweenPlayer;

        // If is chasing the player from more than 100 'meters', move away
        if (
            this.player.totalTravelledDistance -
                this.currentPlayerTravelledDistance >
                100 &&
            this.statuses.CLOSE_TO_PLAYER
        ) {
            this.moveAwayFromPlayer();
        }
    }

    isCloseToPlayer() {
        return this.statuses.CLOSE_TO_PLAYER;
    }
}
