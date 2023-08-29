// legacy :(
// @ts-nocheck
import React from 'react';
import {
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
const { width, height } = Dimensions.get('window');

const PESPECTIVE = Platform.OS === 'ios' ? 2.38 : 1.7;
const TR_POSITION = Platform.OS === 'ios' ? 2 : 1.5;

interface Props {
  currentPage: number;
  onSwipe(page: string): void;

  callBackAfterSwipe?(e: any): void;
  callbackOnSwipe?(e: any): void;
  scrollLockPage?: number;
  initialPage?: number;
  responderCaptureDx?: number;
  expandView?: boolean;
  loop?: boolean;
}

interface State {
  [key: string]: any;
}

class CubeNavigationHorizontal extends React.Component<Props, State> {
  private _animatedValue = new Animated.ValueXY();
  private readonly pages: any;
  private readonly fullWidth: number;

  constructor(props: Props | Readonly<Props>) {
    super(props);
    this.pages = this.props.children.map((child, index) => width * -index);
    this.fullWidth = (this.props.children.length - 1) * width;

    this.state = {
      scrollLockPage: this.pages[this.props.scrollLockPage],
    };
  }

  componentWillMount() {
    this._animatedValue.setValue({
      x: this.pages[this.props.currentPage],
      y: 0,
    });
    this._value = { x: this.pages[this.props.currentPage], y: 0 };

    this._animatedValue.addListener((value) => {
      this._value = value;
    });

    const onDoneSwiping = (gestureState) => {
      let mod = gestureState.dx > 0 ? 100 : -100;

      const currentPage = this._closest(this._value.x + mod);

      this.props.onSwipe(currentPage);

      let goTo = this.pages[currentPage];
      this._animatedValue.flattenOffset({
        x: this._value.x,
        y: this._value.y,
      });
      Animated.spring(this._animatedValue, {
        useNativeDriver: false,
        toValue: { x: goTo, y: 0 },
        friction: 3,
        tension: 0.6,
      }).start();
    };

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      // eslint-disable-next-line no-dupe-keys
      onMoveShouldSetResponderCapture: () =>
        // eslint-disable-next-line no-undef
        Math.abs(gestureState.dx) > this.props.responderCaptureDx,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        Math.abs(gestureState.dx) > this.props.responderCaptureDx,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPanResponderGrant: (e, gestureState) => {
        if (this.props.callbackOnSwipe) {
          this.props.callbackOnSwipe(true);
        }
        this._animatedValue.stopAnimation();
        this._animatedValue.setOffset({ x: this._value.x, y: this._value.y });
      },
      onPanResponderMove: (e, gestureState) => {
        if (this.props.loop) {
          if (gestureState.dx < 0 && this._value.x < -this.fullWidth) {
            this._animatedValue.setOffset({ x: width });
          } else if (gestureState.dx > 0 && this._value.x > 0) {
            this._animatedValue.setOffset({ x: -(this.fullWidth + width) });
          }
        }
        Animated.event([null, { dx: this._animatedValue.x }])(e, gestureState);
      },
      onPanResponderRelease: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
      onPanResponderTerminate: (e, gestureState) => {
        onDoneSwiping(gestureState);
      },
    });
  }

  componentWillReceiveProps(props) {
    this.setState({
      scrollLockPage: props.scrollLockPage
        ? this.pages[props.scrollLockPage]
        : undefined,
    });
  }

  componentDidUpdate() {
    Animated.spring(this._animatedValue, {
      useNativeDriver: false,
      toValue: { x: this.pages[this.props.currentPage], y: 0 },
      friction: 4,
      tension: 0.8,
    }).start();
  }

  scrollTo(page, animated) {
    animated = animated === undefined ? true : animated;

    if (animated) {
      Animated.spring(this._animatedValue, {
        useNativeDriver: false,
        toValue: { x: this.pages[page], y: 0 },
        friction: 4,
        tension: 0.8,
      }).start();
    } else {
      this._animatedValue.setValue({ x: this.pages[page], y: 0 });
    }
    this.setState({
      currentPage: page,
    });
  }

  private getTransformsFor(i: number) {
    let scrollX = this._animatedValue.x;
    let pageX = -width * i;
    let loopVariable = (variable, sign = 1) =>
      variable + Math.sign(sign) * (this.fullWidth + width);
    let padInput = (variables) => {
      if (!this.props.loop) return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(
        ...variables.map((variable) => loopVariable(variable, -1))
      );
      returnedVariables.push(
        ...variables.map((variable) => loopVariable(variable, 1))
      );
      return returnedVariables;
    };
    let padOutput = (variables) => {
      if (!this.props.loop) return variables;
      const returnedVariables = [...variables];
      returnedVariables.unshift(...variables);
      returnedVariables.push(...variables);
      return returnedVariables;
    };

    let translateX = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput([
        (-width - 1) / TR_POSITION,
        0,
        (width + 1) / TR_POSITION,
      ]),
      extrapolate: 'clamp',
    });

    let rotateY = scrollX.interpolate({
      inputRange: padInput([pageX - width, pageX, pageX + width]),
      outputRange: padOutput(['-60deg', '0deg', '60deg']),
      extrapolate: 'clamp',
    });

    let translateXAfterRotate = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 0.1,
        pageX,
        pageX + width - 0.1,
        pageX + width,
      ]),
      outputRange: padOutput([
        -width - 1,
        (-width - 1) / PESPECTIVE,
        0,
        (width + 1) / PESPECTIVE,
        +width + 1,
      ]),
      extrapolate: 'clamp',
    });

    let opacity = scrollX.interpolate({
      inputRange: padInput([
        pageX - width,
        pageX - width + 10,
        pageX,
        pageX + width - 250,
        pageX + width,
      ]),
      outputRange: padOutput([0, 0.6, 1, 0.6, 0]),
      extrapolate: 'clamp',
    });

    return {
      transform: [
        { perspective: width },
        { translateX },
        { rotateY: rotateY },
        { translateX: translateXAfterRotate },
      ],
      opacity: opacity,
    };
  }

  _renderChild = (child, i) => {
    let expandStyle = this.props.expandView
      ? { paddingTop: 100, paddingBottom: 100, height: height + 200 }
      : { width, height };
    let style = [child.props.style, expandStyle];
    let props = {
      i,
      style,
    };
    let element = React.cloneElement(child, props);

    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'transparent' },
          this.getTransformsFor(i),
        ]}
        key={`child- ${i}`}
        pointerEvents={this.props.currentPage === i ? 'auto' : 'none'}
      >
        {element}
      </Animated.View>
    );
  };

  _closest = (num) => {
    let array = this.pages;
    let i = 0;
    let minDiff = 1000;
    let ans;
    for (i in array) {
      let m = Math.abs(num - array[i]);
      if (m < minDiff) {
        minDiff = m;
        ans = i;
      }
    }
    return ans;
  };

  render() {
    let expandStyle = this.props.expandView
      ? { top: -100, left: 0, width, height: height + 200 }
      : { width, height };

    return (
      <Animated.View
        style={[{ position: 'absolute' }]}
        ref={(view) => {
          this._scrollView = view;
        }}
        {...this._panResponder.panHandlers}
      >
        <Animated.View
          style={[
            { backgroundColor: 'transparent', position: 'absolute', width, height },
            expandStyle,
          ]}
        >
          {this.props.children.map(this._renderChild)}
        </Animated.View>
      </Animated.View>
    );
  }
}

CubeNavigationHorizontal.defaultProps = {
  responderCaptureDx: 60,
  expandView: false,
  loop: false,
};

export default CubeNavigationHorizontal;
