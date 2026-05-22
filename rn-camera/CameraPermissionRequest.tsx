import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';

export type PermissionType = 'camera' | 'gallery' | 'both';
export type PermissionStatus = 'undetermined' | 'granted' | 'denied' | 'blocked';

interface CameraPermissionRequestProps {
  permissionType?: PermissionType;
  permissionStatus?: PermissionStatus;
  onRequestPermission: () => void;
  onSkip: () => void;
  onUseAlternative: () => void;
}

// Mock permission request for camera
export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  // In production, this would call the native permission API
  // e.g., const { status } = await Camera.requestCameraPermissionsAsync();
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: randomly grant or deny for testing
      const random = Math.random();
      if (random > 0.7) {
        resolve('denied');
      } else if (random > 0.4) {
        resolve('granted');
      } else {
        resolve('blocked');
      }
    }, 500);
  });
};

// Mock permission request for gallery
export const requestGalleryPermission = async (): Promise<PermissionStatus> => {
  // In production, this would call ImagePicker.requestMediaLibraryPermissionsAsync()
  return new Promise((resolve) => {
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.7) {
        resolve('denied');
      } else if (random > 0.4) {
        resolve('granted');
      } else {
        resolve('blocked');
      }
    }, 500);
  });
};

// Open app settings
export const openAppSettings = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Linking.openURL('app-settings:');
  } else {
    await Linking.openSettings();
  }
};

export const CameraPermissionRequest: React.FC<CameraPermissionRequestProps> = ({
  permissionType = 'both',
  permissionStatus = 'undetermined',
  onRequestPermission,
  onSkip,
  onUseAlternative,
}) => {
  const handleOpenSettings = useCallback(async () => {
    try {
      await openAppSettings();
    } catch (error) {
      console.error('Failed to open settings:', error);
    }
  }, []);

  const getPermissionTitle = useCallback(() => {
    switch (permissionType) {
      case 'camera':
        return 'Camera Access';
      case 'gallery':
        return 'Gallery Access';
      case 'both':
        return 'Camera & Gallery Access';
      default:
        return 'Permission Needed';
    }
  }, [permissionType]);

  const getPermissionDescription = useCallback(() => {
    switch (permissionType) {
      case 'camera':
        return (
          <Text style={styles.descriptionText}>
            We need access to your camera to take photos for skin analysis.{'\n\n'}
            <Text style={styles.highlightText}>
              Your photos are processed locally on your device
            </Text>{' '}
            and are only uploaded when you explicitly submit them for analysis.
          </Text>
        );
      case 'gallery':
        return (
          <Text style={styles.descriptionText}>
            We need access to your photo library to select images for skin
            analysis.{'\n\n'}
            <Text style={styles.highlightText}>
              We only access photos you select
            </Text>{' '}
            and never browse your entire gallery.
          </Text>
        );
      case 'both':
        return (
          <Text style={styles.descriptionText}>
            We need camera and gallery access to help you capture and analyze
            your skin.{'\n\n'}
            <Text style={styles.highlightText}>
              Your privacy is our priority:
            </Text>
            {'\n'}• Photos are processed securely{'\n'}• Data is never sold
            or shared{'\n'}• You control when to upload{'\n'}• Compliant with
            HIPAA guidelines
          </Text>
        );
    }
  }, [permissionType]);

  const getIcon = useCallback(() => {
    switch (permissionType) {
      case 'camera':
        return '📷';
      case 'gallery':
        return '🖼️';
      case 'both':
        return '🔐';
    }
  }, [permissionType]);

  const getStatusMessage = useCallback(() => {
    switch (permissionStatus) {
      case 'denied':
        return {
          title: 'Permission Denied',
          message:
            'You declined the permission request. You can grant it now or use an alternative method.',
          actionText: 'Try Again',
        };
      case 'blocked':
        return {
          title: 'Permission Blocked',
          message:
            'Permission has been blocked in system settings. Please enable it in Settings to continue.',
          actionText: 'Open Settings',
        };
      default:
        return {
          title: getPermissionTitle(),
          message: '',
          actionText: 'Grant Access',
        };
    }
  }, [permissionStatus, getPermissionTitle]);

  const statusInfo = getStatusMessage();

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{statusInfo.title}</Text>

        {/* Status-specific message */}
        {statusInfo.message && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{statusInfo.message}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionContainer}>
          {getPermissionDescription()}
        </View>

        {/* How we use your data */}
        <View style={styles.usageContainer}>
          <Text style={styles.usageTitle}>How we use your photos:</Text>

          <View style={styles.usageItem}>
            <Text style={styles.usageIcon}>🔬</Text>
            <View style={styles.usageTextContainer}>
              <Text style={styles.usageItemTitle}>Skin Analysis</Text>
              <Text style={styles.usageItemDescription}>
                AI analyzes skin texture, tone, and concerns
              </Text>
            </View>
          </View>

          <View style={styles.usageItem}>
            <Text style={styles.usageIcon}>📊</Text>
            <View style={styles.usageTextContainer}>
              <Text style={styles.usageItemTitle}>Progress Tracking</Text>
              <Text style={styles.usageItemDescription}>
                Compare photos over time to see improvements
              </Text>
            </View>
          </View>

          <View style={styles.usageItem}>
            <Text style={styles.usageIcon}>💡</Text>
            <View style={styles.usageTextContainer}>
              <Text style={styles.usageItemTitle}>Personalized Advice</Text>
              <Text style={styles.usageItemDescription}>
                Get tailored skincare recommendations
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyContainer}>
          <Text style={styles.privacyIcon}>🛡️</Text>
          <Text style={styles.privacyText}>
            Your photos are encrypted and stored securely. We never share your
            images with third parties.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          {permissionStatus === 'blocked' ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenSettings}
            >
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRequestPermission}
            >
              <Text style={styles.primaryButtonText}>
                {statusInfo.actionText}
              </Text>
            </TouchableOpacity>
          )}

          {/* Alternative method button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onUseAlternative}
          >
            <Text style={styles.secondaryButtonText}>
              {permissionType === 'camera'
                ? 'Upload from Gallery Instead'
                : permissionType === 'gallery'
                ? 'Take Photo with Camera'
                : 'Use Manual Entry'}
            </Text>
          </TouchableOpacity>

          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
            <Text style={styles.skipButtonText}>
              Skip for Now → Continue Without Photo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#333',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  statusBannerText: {
    color: '#FFA726',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    textAlign: 'center',
  },
  highlightText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  usageContainer: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  usageIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  usageTextContainer: {
    flex: 1,
  },
  usageItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  usageItemDescription: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#81C784',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#444',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999',
    fontSize: 14,
  },
});

export default CameraPermissionRequest;
