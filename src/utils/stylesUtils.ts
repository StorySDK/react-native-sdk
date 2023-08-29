import type {
  WidgetPositionType,
  BackgroundType,
  WidgetPositionLimitsType,
} from '../types';
import { Dimensions, PixelRatio } from 'react-native';

export const stylesUtils = {
  hexToRgba(hex: string, alpha?: number) {
    const r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

    if (alpha) return `rgba(${r}, ${g}, ${b}, ${alpha})`;

    return `rgb(${r}, ${g}, ${b})`;
  },

  renderBackground(background: BackgroundType, opacity?: number): string {
    switch (background.type) {
      case 'color':
        return opacity
          ? stylesUtils.hexToRgba(background.value, opacity / 100)
          : background.value;
      case 'gradient':
        return `linear-gradient(180deg, ${stylesUtils.hexToRgba(
          background.value[0],
          (opacity || 100) / 100
        )} 0%, ${stylesUtils.hexToRgba(
          background.value[1],
          (opacity || 100) / 100
        )} 100%)`;
      case 'image':
        return `center / cover url("${background.value}")`;
      default:
        return 'transparent';
    }
  },

  renderBorder(
    strokeThickness: number,
    strokeColor: string,
    strokeOpacity: number
  ): string {
    return `${strokeThickness}px solid ${stylesUtils.hexToRgba(
      strokeColor,
      strokeOpacity / 100
    )}`;
  },

  renderPosition(position: WidgetPositionType) {
    return {
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
      transform: `rotate(${position.rotate}deg)`,
    };
  },

  calculateScale(size: number) {
    return size * (1080 / PixelRatio.get() / Dimensions.get('window').width);
  },

  calculateElementSize(
    position: WidgetPositionType,
    positionLimits: WidgetPositionLimitsType,
    elementSize: number
  ) {
    return stylesUtils.calculateScale(
      positionLimits.minWidth
        ? Math.round((elementSize * +position.width) / positionLimits?.minWidth)
        : elementSize
    );
  },

  calculateElementSizeByHeight(
    position: WidgetPositionType,
    positionLimits: WidgetPositionLimitsType,
    elementSize: number
  ) {
    return stylesUtils.calculateScale(
      positionLimits.minHeight
        ? Math.round(
            (elementSize * position.height) / positionLimits?.minHeight
          )
        : elementSize
    );
  },

  getThemeColor(color: string) {
    switch (color) {
      case 'purple':
        return '#ae13ab';
      case 'blue':
        return '#00b2ff';
      case 'darkBlue':
        return '#366efe';
      case 'white':
        return '#ffffff';
      case 'green':
        return '#44d937';
      case 'orange':
        return '#ffa93d';
      case 'orangeRed':
        return '#ff4c25';
      case 'yellow':
        return '#f3cc00';
      case 'black':
        return '#05051d';
      case 'red':
        return '#d62727';
      case 'grey':
        return '#dddbde';
      default:
        return '#ffffff';
    }
  },
  getThemeContrastColor(color: string) {
    switch (color) {
      case 'purple':
        return '#ffffff';
      case 'blue':
        return '#ffffff';
      case 'darkBlue':
        return '#ffffff';
      case 'white':
        return '#05051d';
      case 'green':
        return '#ffffff';
      case 'orange':
        return '#05051d';
      case 'orangeRed':
        return '#ffffff';
      case 'yellow':
        return '#05051d';
      case 'black':
        return '#ffffff';
      case 'red':
        return '#ffffff';
      case 'grey':
        return '#05051d';
      default:
        return '#05051d';
    }
  },
  getThemeOpacityColor(color: string) {
    switch (color) {
      case 'purple':
        return '#ffffff26';
      case 'blue':
        return '#ffffff26';
      case 'darkBlue':
        return '#ffffff26';
      case 'white':
        return '#ebebeb';
      case 'green':
        return '#ffffff26';
      case 'orange':
        return '#ffffff26';
      case 'orangeRed':
        return '#ffffff26';
      case 'yellow':
        return '#ffffff26';
      case 'black':
        return '#ffffff26';
      case 'red':
        return '#ffffff26';
      case 'grey':
        return '#ffffff26';
      default:
        return '#ffffff26';
    }
  },
  blendColors(colorA: any, colorB: any, amount: number) {
    const [rA, gA, bA] = colorA.map((c: any) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.map((c: any) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }
};
