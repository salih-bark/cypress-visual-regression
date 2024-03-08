import { PNG } from 'pngjs';
/**
 * Parses an image file and returns a Promise that resolves with a PNG instance.
 *
 * @param {string} imagePath - The path to the image file to parse.
 * @returns {Promise<PNG>} A Promise that resolves with a PNG instance representing the parsed image.
 * @throws {Error} Throws an error if the specified image file does not exist or if there was an error parsing the file.
 */
export declare const parseImage: (imagePath: string) => Promise<PNG>;
/**
 * Adjusts the canvas size of an image.
 *
 * @param {PNG} image - The input image.
 * @param {number} width - The target width of the image.
 * @param {number} height - The target height of the image.
 *
 * @returns {PNG} The new image with adjusted canvas size.
 */
export declare const adjustCanvas: (image: PNG, width: number, height: number) => PNG;
