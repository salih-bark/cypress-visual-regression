import { PNG } from 'pngjs';
export type DiffOption = 'always' | 'fail' | 'never';
export type TypeOption = 'regression' | 'base';
export type VisualRegressionOptions = {
    /** kind of comparison that we are going to execute */
    type: TypeOption;
    /** new image name **_without_** file termination */
    screenshotName: string;
    /** threshold value from 0 to 1. 0.01 will be 1%  */
    errorThreshold: number;
    /** subdirectory to be added to base directory */
    specName: string;
    /** absolute path and name of the original image **_including file termination_** */
    screenshotAbsolutePath: string;
    /** base directory where to move the image, if omitted default will be **'cypress/snapshots/base'** */
    baseDirectory?: string;
    /** diff directory were we store the diff images, if omitted default will be  **'cypress/snapshots/diff'** */
    diffDirectory?: string;
    /** how we should handle diff images */
    generateDiff?: DiffOption;
    /** if set to true failing test will not be thrown */
    failSilently: boolean;
};
export type UpdateSnapshotOptions = Pick<VisualRegressionOptions, 'screenshotName' | 'specName' | 'screenshotAbsolutePath' | 'baseDirectory'>;
export type CompareSnapshotOptions = Omit<VisualRegressionOptions, 'failSilently' | 'type'>;
export type VisualRegressionResult = {
    error?: string;
    mismatchedPixels?: number;
    percentage?: number;
    baseGenerated?: boolean;
};
/**
 * Update the base snapshot .png by copying the generated snapshot to the base snapshot directory.
 * The target path is constructed from parts at runtime in node to be OS independent.
 * */
export declare const updateSnapshot: (options: UpdateSnapshotOptions) => Promise<VisualRegressionResult>;
/**
 * Cypress plugin to compare image snapshots & generate a diff image.
 * Uses the pixelmatch library internally.
 * */
export declare const compareSnapshots: (options: CompareSnapshotOptions) => Promise<VisualRegressionResult>;
export declare function generateImage(diffPNG: PNG, imagePath: string): Promise<boolean>;
/** Configure the plugin to compare snapshots. */
export declare const configureVisualRegression: (on: Cypress.PluginEvents) => void;
