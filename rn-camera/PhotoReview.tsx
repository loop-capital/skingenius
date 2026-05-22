import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface PhotoReviewProps {
  photoUri: string;
  onRetake: () => void;
  onConfirm: () => void;
  onSubmitForAnalysis: () => void;
  isAnalyzing?: boolean;
  analysisError?: string | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photoUri,
  onRetake,
  onConfirm,
  onSubmitForAnalysis,
  isAnalyzing = false,
  analysisError = null,
}) => {
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastScale = useRef(1);
  const lastPan = useRef({ x: 0, y: 0 });

  // Calculate image display dimensions while maintaining aspect ratio
  const calculateImageLayout = useCallback(
    (width: number, height: number) => {
      const maxWidth = SCREEN_WIDTH - 32;
      const maxHeight = SCREEN_HEIGHT * 0.6;
      const aspectRatio = width / height;

      let displayWidth = maxWidth;
      let displayHeight = maxWidth / aspectRatio;

      if (displayHeight > maxHeight) {
        displayHeight = maxHeight;
        displayWidth = maxHeight * aspectRatio;
      }

      return { width: displayWidth, height: displayHeight };
    },
    []
  );

  // Handle image load to get dimensions
  const handleImageLoad = useCallback(
    (event: any) => {
      const { width, height } = event.nativeEvent.source;
      setImageDimensions(calculateImageLayout(width, height));
    },
    [calculateImageLayout]
  );

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => zoomScale > 1,
      onMoveShouldSetPanResponder: () => zoomScale > 1,
      onPanResponderGrant: () => {
        lastPan.current = { x: panPosition.x, y: panPosition.y };
      },
      onPanResponderMove: (
        event: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        if (zoomScale > 1) {
          const newX = lastPan.current.x + gestureState.dx;
          const newY = lastPan.current.y + gestureState.dy;

          // Limit pan to prevent dragging image too far
          const maxPanX = (imageDimensions.width * (zoomScale - 1)) / 2;
          const maxPanY = (imageDimensions.height * (zoomScale - 1)) / 2;

          const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newX));
          const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newY));

          panAnim.setValue({ x: clampedX, y: clampedY });
        }
      },
      onPanResponderRelease: () => {
        panAnim.flattenOffset();
        setPanPosition({
          x: (panAnim.x as any).__getValue(),
          y: (panAnim.y as any).__getValue(),
        });
      },
    })
  ).current;

  // Zoom in
  const zoomIn = useCallback(() => {
    const newScale = Math.min(zoomScale * 1.5, 4);
    lastScale.current = newScale;
    Animated.timing(scaleAnim, {
      toValue: newScale,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setZoomScale(newScale));
  }, [zoomScale, scaleAnim]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newScale = Math.max(zoomScale / 1.5, 1);
    lastScale.current = newScale;

    if (newScale === 1) {
      // Reset pan when fully zoomed out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(panAnim, {
          toValue: { x: 0, y: 0 },
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setZoomScale(1);
        setPanPosition({ x: 0, y: 0 });
      });
    } else {
      Animated.timing(scaleAnim, {
        toValue: newScale,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setZoomScale(newScale));
    }
  }, [zoomScale, scaleAnim, panAnim]);

  // Toggle controls visibility
  const toggleControls = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  // Show analysis error alert
  const showErrorAlert = useCallback(() => {
    if (analysisError) {
      Alert.alert('Analysis Error', analysisError, [{ text: 'OK' }]);
    }
  }, [analysisError]);

  const transformStyle = {
    transform: [
      { scale: scaleAnim },
      { translateX: panAnim.x },
      { translateY: panAnim.y },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {showControls && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onRetake} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Photo</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      {/* Image container with zoom/pan */}
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleControls}
          style={styles.imageTouchable}
        >
          <Animated.View
            style={[styles.imageContainer, transformStyle]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri: photoUri }}
              style={[
                styles.image,
                imageDimensions.width > 0 && {
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                },
              ]}
              resizeMode="contain"
              onLoad={handleImageLoad}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Zoom indicator */}
        {zoomScale > 1 && (
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>{zoomScale.toFixed(1)}x</Text>
          </View>
        )}
      </View>

      {/* Zoom controls */}
      {showControls && (
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={[styles.zoomButton, zoomScale <= 1 && styles.zoomButtonDisabled]}
            onPress={zoomOut}
            disabled={zoomScale <= 1}
          >
            <Text style={styles.zoomButtonText}>−</Text>
          </TouchableOpacity>

          <View style={styles.zoomLevelContainer}>
            <Text style={styles.zoomLevelText}>
              {Math.round(zoomScale * 100)}%
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.zoomButton, zoomScale >= 4 && styles.zoomButtonDisabled]}
            onPress={zoomIn}
            disabled={zoomScale >= 4}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo info */}
      {showControls && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Tap image to {showControls ? 'hide' : 'show'} controls
          </Text>
          <Text style={styles.infoSubtext}>
            Pinch and drag to zoom and pan when zoomed in
          </Text>
        </View>
      )}

      {/* Action buttons */}
      {showControls && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={onRetake}
            disabled={isAnalyzing}
          >
            <Text style={styles.actionButtonIcon}>📷</Text>
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={onConfirm}
            disabled={isAnalyzing}
          >
            <Text style={styles.actionButtonIcon}>✓</Text>
            <Text style={styles.confirmButtonText}>Looks Good</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit for analysis button */}
      {showControls && (
        <TouchableOpacity
          style={[
            styles.submitButton,
            isAnalyzing && styles.submitButtonDisabled,
          ]}
          onPress={onSubmitForAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              🔬 Submit for Skin Analysis
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* Analysis error */}
      {analysisError && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={showErrorAlert}
        >
          <Text style={styles.errorBannerText}>
            ⚠️ Analysis failed. Tap to retry.
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH - 32,
    borderRadius: 16,
  },
  zoomIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  zoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  zoomButtonDisabled: {
    opacity: 0.5,
  },
  zoomButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  zoomLevelContainer: {
    minWidth: 60,
    alignItems: 'center',
  },
  zoomLevelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    color: '#999',
    fontSize: 13,
  },
  infoSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  retakeButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBanner: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PhotoReview;
