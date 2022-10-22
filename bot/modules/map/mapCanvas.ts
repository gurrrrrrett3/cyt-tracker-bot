import {
    createCanvas,
    loadImage,
} from 'canvas';
import Logger from '../../utils/logger';
import MapConnection from './mapConnection';

export default class MapCanvas {

    public static async drawMapThumbnail(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3) {
        const canvas = createCanvas(1536, 1536);
        const ctx = canvas.getContext("2d");

        const tileSizes = [4096, 2048, 1024, 512];
        const tileSize = tileSizes[zoom];

        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);

        // get all tiles in a 3x3 grid
        const tiles = [

            // top row
            await loadImage(MapConnection.getTileURL(world, tileX - 1, tileY - 1, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX, tileY - 1, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX + 1, tileY - 1, zoom)),

            // middle row

            await loadImage(MapConnection.getTileURL(world, tileX - 1, tileY, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX, tileY, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX + 1, tileY, zoom)),

            // bottom row

            await loadImage(MapConnection.getTileURL(world, tileX - 1, tileY + 1, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX, tileY + 1, zoom)),
            await loadImage(MapConnection.getTileURL(world, tileX + 1, tileY + 1, zoom)),
            
        ];

        // draw tiles to canvas
        ctx.drawImage(tiles[0], 0, 0);
        ctx.drawImage(tiles[1], 512, 0);
        ctx.drawImage(tiles[2], 1024, 0)

        ctx.drawImage(tiles[3], 0, 512);
        ctx.drawImage(tiles[4], 512, 512);
        ctx.drawImage(tiles[5], 1024, 512);

        ctx.drawImage(tiles[6], 0, 1024);
        ctx.drawImage(tiles[7], 512, 1024);
        ctx.drawImage(tiles[8], 1024, 1024);

        // x offset of the player on the grid
        const xOffset = x - (tileX * tileSize) + 512;
        const yOffset = y - (tileY * tileSize) + 512;

        // crop to 512x512 centered on the player
        const cropX = xOffset - 256;
        const cropY = yOffset - 256;

        Logger.log("Canvas", cropX, cropY);

        const cropped = canvas.getContext("2d").getImageData(cropX, cropY, 512, 512)
        const croppedCanvas = createCanvas(512, 512);
        const cctx = croppedCanvas.getContext("2d");

        cctx.putImageData(cropped, 0, 0);

        return croppedCanvas.toBuffer("image/png");
    }

    public static async drawPlayerMapThumbnail(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3, yaw: number) {
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");
    
    const dataURI = await MapCanvas.drawMapThumbnail(world, x, y, zoom);
    const mapImage = await loadImage(dataURI);

    ctx.drawImage(mapImage, 0, 0);

    const yawRadians = yaw * (Math.PI / 180);

    // draw a triangle at the player's position and rotation
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + (Math.cos(yawRadians) * 20), 256 + (Math.sin(yawRadians) * 20));
    ctx.lineTo(256 + (Math.cos(yawRadians + (Math.PI / 2)) * 20), 256 + (Math.sin(yawRadians + (Math.PI / 2)) * 20));
    ctx.closePath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#FFF";
    ctx.fill();

    return `data:image/png;base64,${canvas.toBuffer("image/png").toString("base64")}`;
    }

}