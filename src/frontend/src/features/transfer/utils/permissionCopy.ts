/**
 * Centralized permission-related copy strings and helpers for Android file picker permissions.
 * Provides version-appropriate messaging and fallback instructions.
 */

export interface PermissionCopySet {
  rationaleTitle: string;
  rationaleBody: string;
  deniedTitle: string;
  deniedBody: string;
  settingsInstructions: string;
}

/**
 * Get permission copy based on Android API level and permission type
 */
export function getPermissionCopy(apiLevel: number): PermissionCopySet {
  if (apiLevel >= 33) {
    // Android 13+ uses scoped media permissions
    return {
      rationaleTitle: 'Media Access Needed',
      rationaleBody: 'AirShare needs access to your photos and videos to let you select files to send. Your privacy is protected—we only access files you explicitly choose.',
      deniedTitle: 'Media Access Required',
      deniedBody: 'To select files, AirShare needs permission to access your media. This permission is required to browse and select files from your device.',
      settingsInstructions: 'Open Settings → Apps → AirShare → Permissions → Photos and videos → Allow',
    };
  } else {
    // Android 12 and below uses READ_EXTERNAL_STORAGE
    return {
      rationaleTitle: 'Storage Access Needed',
      rationaleBody: 'AirShare needs storage access to let you select files to send. Your privacy is protected—we only access files you explicitly choose.',
      deniedTitle: 'Storage Access Required',
      deniedBody: 'To select files, AirShare needs permission to access your storage. This permission is required to browse and select files from your device.',
      settingsInstructions: 'Open Settings → Apps → AirShare → Permissions → Storage → Allow',
    };
  }
}

/**
 * Generic fallback copy when API level cannot be determined
 */
export function getGenericPermissionCopy(): PermissionCopySet {
  return {
    rationaleTitle: 'File Access Needed',
    rationaleBody: 'AirShare needs permission to access files on your device so you can select what to send. Your privacy is protected—we only access files you explicitly choose.',
    deniedTitle: 'File Access Required',
    deniedBody: 'To select files, AirShare needs permission to access your device storage. This permission is required to browse and select files.',
    settingsInstructions: 'Open Settings → Apps → AirShare → Permissions → Enable file access',
  };
}
