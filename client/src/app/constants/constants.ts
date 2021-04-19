import { RGBA } from '@app/interfaces-enums/rgba';

// Canvas constants

export const MIN_SIZE = 250;

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

export enum MouseDirection {
    UpperLeft = 0,
    UpperRight = 1,
    LowerLeft = 2,
    LowerRight = 3,
}

export enum TypeOfJunctions {
    Regular = 0,
    Circle = 1,
}

export enum ImageFormat {
    Png = 0,
    Jpg = 1,
}

export enum FiltersList {
    None = 0,
    Blur = 1,
    Brightness = 2,
    Contrast = 3,
    Invert = 4,
    Grayscale = 5,
}

export const DEFAULT_LINE_THICKNESS = 1;
export const MIN_ERASER_THICKNESS = 5;

export const DEFAULT_ERASER_COLOR = '#FFF';
export const DEFAULT_JUNCTION_RADIUS = 2;

export const mouseEventLClick = {
    x: 25,
    y: 25,
    button: 0,
} as MouseEvent;

export const mouseEventRClick = {
    x: 25,
    y: 25,
    button: 2,
} as MouseEvent;

export const COLOR_WINDOW_WIDTH = '500px';

export const WIDTH = 20;
export const HEIGHT = 200;
export const ONE_SIX = 0.17;
export const ONE_THREE = 0.33;
export const ONE_TWO = 0.5;
export const TWO_THREE = 0.67;
export const FIVE_SIX = 0.83;

export const COLOR_POSITION = ['first', 'second'];

export const COLOR_HISTORY = 10;
export const COLOR_ORDER = 2;
export const MAX_DEC_RANGE = 255;
export const OPACITY_POS_ALPHA = 3;
export const HEX_BASE = 16;
export const HEX_VALIDATOR = RegExp('^[a-fA-F0-9 ]+');

export const PRIMARYCOLORINITIAL: RGBA = {
    Dec: { Red: 255, Green: 0, Blue: 0, Alpha: 1 },
    Hex: { Red: 'ff', Green: '0', Blue: '0' },
    inString: 'rgba(255, 0, 0, 1)',
};
export const SECONDARYCOLORINITIAL: RGBA = {
    Dec: { Red: 0, Green: 255, Blue: 0, Alpha: 1 },
    Hex: { Red: '0', Green: 'ff', Blue: '0' },
    inString: 'rgba(0, 255, 0, 1)',
};

// constants for selection
export const CONTROLPOINTSIZE = 10;

// in the following we find testing constants
export const FIRST_CASE = 75;
export const SECOND_AND_THIRD_CASE = 25;
export const LAST_CASE = 255;
export const CASES_ARRAY = [FIRST_CASE, SECOND_AND_THIRD_CASE, SECOND_AND_THIRD_CASE, LAST_CASE];

export const FIRSTCOLORTEST: RGBA = {
    Dec: { Red: 255, Green: 255, Blue: 255, Alpha: 1 },
    Hex: { Red: 'ff', Green: 'ff', Blue: 'ff' },
    inString: 'rgba(255, 255, 255, 1)',
};
export const SECONDCOLORTEST: RGBA = {
    Dec: { Red: 255, Green: 255, Blue: 255, Alpha: 1 },
    Hex: { Red: 'ff', Green: 'ff', Blue: 'ff' },
    inString: 'rgba(255, 255, 255, 1)',
};
export const COLOR_WIN_WIDTH = '500px';

export const WORKING_AREA_WIDTH = '85vw';
export const WORKING_AREA_LENGHT = '100vh';



// Text
export enum Font {
    Arial = 0,
    TimesNewRoman = 1,
    ComicSansMs = 2,
    CourierNew = 3,
    Impact = 4,
}

export enum Emphasis {
    Italic = 0,
    Bold = 1,
    ItalicBold = 2,
    Normal = 3,
}

export enum TextAlign {
    Left = 0,
    Center = 1,
    Right = 2,
}

export enum CanvasType {
    previewCtx = 0,
    baseCtx = 1,
}

export const DEFAULT_TEXT_SIZE = '20';
export const DEFAULT_FONT = 'Arial';
export const DEFAULT_EMPHASIS = 'normal';
export const DEFAULT_TEXT_ALIGN = 'left';
export const ACCEPTED_CHAR = RegExp(/^[\S ]$/);