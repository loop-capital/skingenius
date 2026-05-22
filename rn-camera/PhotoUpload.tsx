import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

// Mock expo-image-picker types and implementation
// In production, replace with: import * as ImagePicker from 'expo-image-picker'

interface ImagePickerAsset {
  uri: string;
  width: number;
  height: number;
  type?: 'image' | 'video';
  fileName?: string | null;
  fileSize?: number;
  base64?: string | null;
  exif?: any;
}

interface ImagePickerResult {
  canceled: boolean;
  assets?: ImagePickerAsset[];
}

interface ImagePickerOptions {
  mediaTypes?: string;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
}

// Mock ImagePicker API
const MockImagePicker = {
  requestMediaLibraryPermissionsAsync: async () => ({
    granted: false,
    canAskAgain: true,
  }),
  launchImageLibraryAsync: async (
    options?: ImagePickerOptions
  ): Promise<ImagePickerResult> => {
    // Mock implementation - returns a mock image
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          canceled: false,
          assets: [
            {
              uri: 'mock-gallery://sample-photo.jpg',
              width: 1080,
              height: 1080,
              type: 'image',
              fileName: 'sample-photo.jpg',
              fileSize: 1024000,
            },
          ],
        });
      }, 500);
    });
  },
};

// Hook for gallery permissions
const useGalleryPermissions = () => {
  const [permission, setPermission] = useState<{
    granted: boolean;
    canAskAgain: boolean;
  }>({ granted: false, canAskAgain: true });

  const requestPermission = useCallback(async () => {
    const result = await MockImagePicker.requestMediaLibraryPermissionsAsync();
    setPermission(result);
    return result;
  }, []);

  return [permission, requestPermission] as const;
};

interface PhotoUploadProps {
  onPhotoSelected: (photo: ImagePickerAsset) => void;
  onCancel: () => void;
  onUseCamera: () => void;
  maxFileSizeMB?: number;
  allowedAspectRatio?: [number, number];
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoSelected,
  onCancel,
  onUseCamera,
  maxFileSizeMB = 10,
  allowedAspectRatio = [1, 1],
}) => {
  const [permission, requestPermission] = useGalleryPermissions();
  const [selectedPhoto, setSelectedPhoto] = useState<ImagePickerAsset | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropAspect, setCropAspect] = useState<[number, number]>(allowedAspectRatio);

  const validatePhoto = useCallback(
    (asset: ImagePickerAsset): string | null => {
      // Check file size
      if (asset.fileSize && asset.fileSize > maxFileSizeMB * 1024 * 1024) {
        return `File size exceeds ${maxFileSizeMB}MB limit`;
      }

      // Check dimensions (minimum 500x500)
      if (asset.width < 500 || asset.height < 500) {
        return 'Image must be at least 500x500 pixels';
      }

      // Check aspect ratio (if square required)
      if (allowedAspectRatio[0] === 1 && allowedAspectRatio[1] === 1) {
        const ratio = asset.width / asset.height;
        if (ratio < 0.9 || ratio > 1.1) {
          return 'Please select a square image or crop to square';
        }
      }

      return null;
    },
    [maxFileSizeMB, allowedAspectRatio]
  );

  const pickImage = useCallback(
    async (useCrop: boolean = true) => {
      try {
        setIsProcessing(true);

        const options: ImagePickerOptions = {
          mediaTypes: 'Images',
          allowsEditing: useCrop,
          aspect: cropAspect,
          quality: 0.9,
          allowsMultipleSelection: false,
        };

        const result = await MockImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets || result.assets.length === 0) {
          setIsProcessing(false);
          return;
        }

        const asset = result.assets[0];
        const validationError = validatePhoto(asset);

        if (validationError) {
          Alert.alert('Invalid Photo', validationError, [
            { text: 'OK', onPress: () => setIsProcessing(false) },
            {
              text: 'Pick Another',
              onPress: () => {
                setIsProcessing(false);
                pickImage(useCrop);
              },
            },
          ]);
          return;
        }

        setSelectedPhoto(asset);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to load image. Please try again.');
        setIsProcessing(false);
      }
    },
    [cropAspect, validatePhoto]
  );

  const handleConfirm = useCallback(() => {
    if (selectedPhoto) {
      onPhotoSelected(selectedPhoto);
    }
  }, [selectedPhoto, onPhotoSelected]);

  const handleRetake = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Permission request screen
  if (!permission.granted && !selectedPhoto) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🖼️</Text>
        </View>
        <Text style={styles.permissionTitle}>Gallery Access</Text>
        <Text style={styles.permissionText}>
          Allow access to your photo library to select skin photos for analysis.
          Your photos are processed securely and never shared without permission.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={async () => {
            const result = await requestPermission();
            if (result.granted) {
              pickImage(true);
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Allow Gallery Access</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onUseCamera}>
          <Text style={styles.secondaryButtonText}>Use Camera Instead</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onCancel}>
          <Text style={styles.skipButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Photo preview screen
  if (selectedPhoto) {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedPhoto.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        {/* Photo metadata */}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}>
            {selectedPhoto.width} × {selectedPhoto.height} px
          </Text>
          {selectedPhoto.fileSize && (
            <Text style={styles.metadataText}>
              {(selectedPhoto.fileSize / 1024 / 1024).toFixed(2)} MB
            </Text>
          )}
        </View>

        {/* Aspect ratio indicator */}
        <View style={styles.aspectIndicator}>
          <Text style={styles.aspectText}>
            Aspect:{' '}
            {cropAspect[0] === 1 && cropAspect[1] === 1
              ? 'Square (1:1)'
              : `${cropAspect[0]}:${cropAspect[1]}`}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.retakeButton]}
            onPress={handleRetake}
          >
            <Text style={styles.actionButtonIcon}>🔄</Text>
            <Text style={styles.retakeButtonText}>Pick Another</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Text style={styles.actionButtonIcon}>✓</Text>
            <Text style={styles.confirmButtonText}>Use This Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Photo selection options
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Photo</Text>
      <Text style={styles.subtitle}>
        Select a clear, well-lit photo of your face for analysis
      </Text>

      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {/* Upload with cropping (recommended) */}
        <TouchableOpacity
          style={styles.uploadOption}
          onPress={() => pickImage(true)}
          disabled={isProcessing}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>✂️</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Crop to Square</Text>
            <Text style={styles.optionDescription}>
              Recommended — we'll help you crop the perfect square photo
            </Text>
          </View>
          {isProcessing && <ActivityIndicator style={styles.optionLoader} />}
        </TouchableOpacity>

        {/* Upload without cropping */}
        <TouchableOpacity
          style={styles.uploadOption}
          onPress={() => pickImage(false)}
          disabled={isProcessing}
        >
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📐</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Original Photo</Text>
            <Text style={styles.optionDescription}>
              Use photo as-is (must already be square)
            </Text>
          </View>
        </TouchableOpacity>

        {/* Camera option */}
        <TouchableOpacity style={styles.uploadOption} onPress={onUseCamera}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📷</Text>
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Take New Photo</Text>
            <Text style={styles.optionDescription}>
              Use camera with guided positioning
            </Text>
          </View>
        </TouchableOpacity>

        {/* Requirements info */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Photo Requirements:</Text>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementBullet}>•</Text>
            <Text style={styles.requirementText}>
              Minimum 500×500 pixels
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementBullet}>•</Text>
            <Text style={styles.requirementText}>
              Maximum {maxFileSizeMB}MB file size
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementBullet}>•</Text>
            <Text style={styles.requirementText}>
              Square aspect ratio (1:1) for best results
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Text style={styles.requirementBullet}>•</Text>
            <Text style={styles.requirementText}>
              Clear, well-lit frontal face photo
            </Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  optionsContainer: {
    paddingBottom: 20,
  },
  uploadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#999',
  },
  optionLoader: {
    marginLeft: 8,
  },
  requirementsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  requirementBullet: {
    color: '#4CAF50',
    fontSize: 14,
    marginRight: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1a1a1a',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 250,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    minWidth: 250,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    borderRadius: 16,
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  metadataText: {
    color: '#999',
    fontSize: 12,
  },
  aspectIndicator: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  aspectText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
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
});

export default PhotoUpload;
