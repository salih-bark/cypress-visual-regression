/// <reference types="cypress" />
import type { DiffOption, TypeOption, VisualRegressionResult } from './plugin';
declare global {
    namespace Cypress {
        interface Chainable {
            compareSnapshot(name: string, options?: PluginCommandOptions): Chainable<VisualRegressionResult>;
        }
    }
}
export type ScreenshotOptions = Partial<Cypress.ScreenshotOptions & PluginSetupOptions>;
export type PluginCommandOptions = number | ScreenshotOptions;
export type PluginSetupOptions = {
    errorThreshold: number;
    failSilently: boolean;
};
export type CypressConfigEnv = {
    visualRegressionType: TypeOption;
    visualRegressionBaseDirectory?: string;
    visualRegressionDiffDirectory?: string;
    visualRegressionGenerateDiff?: DiffOption;
    visualRegressionFailSilently?: boolean;
};
export type TakeScreenshotProps = {
    path: string;
    size: number;
    dimensions: {
        width: number;
        height: number;
    };
    multipart: boolean;
    pixelRatio: number;
    takenAt: string;
    name: string;
    blackout: string[];
    duration: number;
    testAttemptIndex: number;
};
/** Add custom cypress command to compare image snapshots of an element or the window. */
declare function addCompareSnapshotCommand(screenshotOptions?: ScreenshotOptions): void;
export { addCompareSnapshotCommand };
