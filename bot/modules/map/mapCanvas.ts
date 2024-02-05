import {
    createCanvas,
    loadImage,
} from '@napi-rs/canvas';
import Logger from '../../utils/logger';
import MapConnection from './mapConnection';
import Town from './resources/town';
import MapModule from '.';

export default class MapCanvas {

    public static async drawTownThumbnail(town: Town, zoom: 0 | 1 | 2 | 3) {

        const bounds = town.getBounds();
        const img = await this.getMapImage(bounds, town.world, zoom);
        return img.canvas.toBuffer("image/png");
    }


    public static async getMapImage(bounds: {
        minX: number,
        maxX: number,
        minZ: number,
        maxZ: number,
    }, world: string, zoom: 0 | 1 | 2 | 3) {

        const tileSizes = [4096, 2048, 1024, 512];
        const tileSize = tileSizes[zoom];

        const minX = Math.floor(bounds.minX / tileSize);
        const minY = Math.floor(bounds.minZ / tileSize);
        const maxX = Math.floor(bounds.maxX / tileSize);
        const maxY = Math.floor(bounds.maxZ / tileSize);

        const tiles = [];

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                tiles.push(await loadImage(MapConnection.getTileURL(world, x, y, zoom)));
            }
        }

        const totalWidth = (maxX - minX + 1) * 512;
        const totalHeight = (maxY - minY + 1) * 512;

        const canvas = createCanvas(totalWidth, totalHeight);
        const ctx = canvas.getContext("2d");

        let i = 0;
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                ctx.drawImage(tiles[i], (x - minX) * 512, (y - minY) * 512);
                i++;
            }
        }

        // draw bounds
        // ctx.beginPath();
        // ctx.rect((bounds.minX - (minX * tileSize)), (bounds.minZ - (minY * tileSize)), bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
        // ctx.lineWidth = 5;
        // ctx.strokeStyle = 'red';
        // ctx.stroke();

        // crop to bounds
        const croppedCanvas = createCanvas(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
        const croppedCtx = croppedCanvas.getContext("2d");

        croppedCtx.drawImage(canvas, -bounds.minX + (minX * tileSize), -bounds.minZ + (minY * tileSize));

        return {
            x: bounds.minX - (minX * tileSize),
            y: bounds.minZ - (minY * tileSize),
            width: bounds.maxX - bounds.minX,
            height: bounds.maxZ - bounds.minZ,
            canvas,
            crop: croppedCanvas,
        }
    }


    public static async drawPlayerThumbnail(player: Player, zoom: 0 | 1 | 2 | 3, showOtherPlayers: boolean = true) {
        const img = await this.getMapImage({
            minX: player.x - 64,
            maxX: player.x + 64,
            minZ: player.z - 64,
            maxZ: player.z + 64,
        }, player.world, zoom);

        const center = img.crop.width / 2;

        const ctx = img.crop.getContext("2d");

        if (showOtherPlayers) {
            MapModule.getMapModule().mm.currentPlayerData.players.forEach((p) => {

                if (p.name == player.name) return;

                const x = p.x - player.x;
                const z = p.z - player.z;

                if (x < 0 || x > 128 || z < 0 || z > 128) return;

                ctx.beginPath();
                ctx.arc(x, z, 3, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'blue';
                ctx.fill();
            })
        }

        ctx.beginPath();
        ctx.arc(center, center, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();

        return img.crop.toBuffer("image/png");
    }

}