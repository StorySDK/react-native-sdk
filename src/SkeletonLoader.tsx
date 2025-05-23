import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SkeletonItemProps {
  width: number;
  height: number;
  style?: any;
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ width, height, style }) => {
  const shimmerAnimation = React.useRef(new Animated.Value(-1)).current;

  React.useEffect(() => {
    const startShimmerAnimation = () => {
      shimmerAnimation.setValue(-1);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(startShimmerAnimation, 100);
      });
    };

    startShimmerAnimation();
  }, [shimmerAnimation]);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width * 1.5, width * 1.5],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerContainer,
          {
            width: width * 2,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={[styles.shimmerGradient, { width: width * 0.8 }]}>
          <View style={[styles.shimmerStart, { width: '20%' }]} />
          <View style={[styles.shimmerMiddle1, { width: '15%' }]} />
          <View style={[styles.shimmerMiddle2, { width: '30%' }]} />
          <View style={[styles.shimmerMiddle3, { width: '15%' }]} />
          <View style={[styles.shimmerEnd, { width: '20%' }]} />
        </View>
      </Animated.View>
    </View>
  );
};

interface SkeletonLoaderProps {
  groupImageWidth?: number;
  groupImageHeight?: number;
  backgroundColor?: string;
  itemsCount?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  groupImageWidth = 64,
  groupImageHeight = 64,
  backgroundColor,
  itemsCount = 4,
}) => {
  const renderSkeletonItems = () => {
    const items = [];
    for (let i = 0; i < itemsCount; i++) {
      items.push(
        <View key={i} style={[styles.loaderItem, i === itemsCount - 1 && styles.lastItem]}>
          <SkeletonItem height={groupImageHeight} width={groupImageWidth} />
          <SkeletonItem
            height={16}
            width={groupImageWidth}
            style={styles.titleSkeleton}
          />
        </View>
      );
    }
    return items;
  };

  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.carousel}>
        {renderSkeletonItems()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carousel: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 100,
    alignSelf: 'center',
  },
  loaderItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  lastItem: {
    marginRight: 0,
  },
  skeleton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shimmerStart: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  shimmerMiddle1: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shimmerMiddle2: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  shimmerMiddle3: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shimmerEnd: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  titleSkeleton: {
    marginTop: 8,
  },
}); 