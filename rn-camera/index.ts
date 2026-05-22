// SKINgenius Camera Components
// Photo capture and upload functionality for skin analysis

export { default as CameraCapture } from './CameraCapture';
export { default as PhotoCalibration } from './PhotoCalibration';
export { PhotoUpload } from './PhotoUpload';
export { PhotoReview } from './PhotoReview';
export {
  CameraPermissionRequest,
  requestCameraPermission,
  requestGalleryPermission,
  openAppSettings,
} from './CameraPermissionRequest';

// Re-export types
export type {
  CameraCaptureProps,
  CaptureResult,
  SkinToneMatch,
  LightingAssessment,
  FaceDetectionResult,
  TonePreprocessingConfig,
} from './CameraCapture';
export type { PermissionType, PermissionStatus } from './CameraPermissionRequest';
