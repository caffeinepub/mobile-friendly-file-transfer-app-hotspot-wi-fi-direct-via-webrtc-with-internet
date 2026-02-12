import { useState, useCallback } from 'react';
import { getPermissionCopy, getGenericPermissionCopy, PermissionCopySet } from '../utils/permissionCopy';

export type PermissionFlowState = 'idle' | 'checking' | 'needs-rationale' | 'requesting' | 'granted' | 'denied';

interface PermissionState {
  flowState: PermissionFlowState;
  copy: PermissionCopySet;
  canOpenSettings: boolean;
  previouslyDenied: boolean;
}

interface UseAndroidFilePickerPermissionsReturn {
  permissionState: PermissionState;
  needsPermission: boolean;
  checkPermission: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  openSettings: () => Promise<void>;
  reset: () => void;
}

// Check if running on Capacitor Android
const isCapacitorAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const capacitor = (window as any).Capacitor;
  if (!capacitor) return false;
  return capacitor.getPlatform && capacitor.getPlatform() === 'android';
};

// Get Android API level
const getAndroidApiLevel = async (): Promise<number> => {
  try {
    const capacitor = (window as any).Capacitor;
    if (!capacitor || !capacitor.Plugins || !capacitor.Plugins.Device) {
      return 0;
    }
    const info = await capacitor.Plugins.Device.getInfo();
    return parseInt(info.androidSDKVersion || '0', 10);
  } catch {
    return 0;
  }
};

// Check if we can open app settings
const canOpenAppSettings = (): boolean => {
  try {
    const capacitor = (window as any).Capacitor;
    return !!(capacitor?.Plugins?.App?.openUrl);
  } catch {
    return false;
  }
};

export function useAndroidFilePickerPermissions(): UseAndroidFilePickerPermissionsReturn {
  const [permissionState, setPermissionState] = useState<PermissionState>({
    flowState: 'idle',
    copy: getGenericPermissionCopy(),
    canOpenSettings: false,
    previouslyDenied: false,
  });

  // Determine if we're on Android and need runtime permissions
  const needsPermission = isCapacitorAndroid();

  const reset = useCallback(() => {
    setPermissionState({
      flowState: 'idle',
      copy: getGenericPermissionCopy(),
      canOpenSettings: false,
      previouslyDenied: false,
    });
  }, []);

  const checkPermission = useCallback(async (): Promise<void> => {
    // Non-Android: no permission needed
    if (!isCapacitorAndroid()) {
      setPermissionState(prev => ({
        ...prev,
        flowState: 'granted',
      }));
      return;
    }

    setPermissionState(prev => ({
      ...prev,
      flowState: 'checking',
    }));

    try {
      const capacitor = (window as any).Capacitor;
      const Permissions = capacitor?.Plugins?.Permissions;
      
      if (!Permissions) {
        // Permissions plugin not available, assume granted (system picker will handle)
        setPermissionState(prev => ({
          ...prev,
          flowState: 'granted',
        }));
        return;
      }

      // Get Android version and appropriate copy
      const apiLevel = await getAndroidApiLevel();
      const copy = apiLevel > 0 ? getPermissionCopy(apiLevel) : getGenericPermissionCopy();
      const canSettings = canOpenAppSettings();

      // Determine which permission to check based on Android version
      let permissionName: string;
      if (apiLevel >= 33) {
        permissionName = 'photos'; // Android 13+ media permissions
      } else {
        permissionName = 'storage'; // Android 12 and below
      }

      // Check current permission status
      const checkResult = await Permissions.query({ name: permissionName });
      
      if (checkResult.state === 'granted') {
        setPermissionState({
          flowState: 'granted',
          copy,
          canOpenSettings: canSettings,
          previouslyDenied: false,
        });
      } else if (checkResult.state === 'denied') {
        // Previously denied, show rationale or denied state
        setPermissionState({
          flowState: 'needs-rationale',
          copy,
          canOpenSettings: canSettings,
          previouslyDenied: true,
        });
      } else {
        // Prompt state - show rationale first
        setPermissionState({
          flowState: 'needs-rationale',
          copy,
          canOpenSettings: canSettings,
          previouslyDenied: false,
        });
      }
    } catch (error) {
      console.error('Permission check failed:', error);
      const copy = getGenericPermissionCopy();
      setPermissionState({
        flowState: 'denied',
        copy,
        canOpenSettings: canOpenAppSettings(),
        previouslyDenied: false,
      });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isCapacitorAndroid()) {
      return true;
    }

    setPermissionState(prev => ({
      ...prev,
      flowState: 'requesting',
    }));

    try {
      const capacitor = (window as any).Capacitor;
      const Permissions = capacitor?.Plugins?.Permissions;
      
      if (!Permissions) {
        setPermissionState(prev => ({
          ...prev,
          flowState: 'granted',
        }));
        return true;
      }

      const apiLevel = await getAndroidApiLevel();
      const copy = apiLevel > 0 ? getPermissionCopy(apiLevel) : getGenericPermissionCopy();
      const canSettings = canOpenAppSettings();

      let permissionName: string;
      if (apiLevel >= 33) {
        permissionName = 'photos';
      } else {
        permissionName = 'storage';
      }

      // Request permission
      const requestResult = await Permissions.request({ name: permissionName });
      
      if (requestResult.state === 'granted') {
        setPermissionState({
          flowState: 'granted',
          copy,
          canOpenSettings: canSettings,
          previouslyDenied: false,
        });
        return true;
      } else {
        // Permission denied
        setPermissionState({
          flowState: 'denied',
          copy,
          canOpenSettings: canSettings,
          previouslyDenied: true,
        });
        return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      const copy = getGenericPermissionCopy();
      setPermissionState({
        flowState: 'denied',
        copy,
        canOpenSettings: canOpenAppSettings(),
        previouslyDenied: false,
      });
      return false;
    }
  }, []);

  const openSettings = useCallback(async (): Promise<void> => {
    try {
      const capacitor = (window as any).Capacitor;
      const App = capacitor?.Plugins?.App;
      
      if (App && App.openUrl) {
        // Try to open app settings
        await App.openUrl({ url: 'app-settings:' });
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
      // Silently fail - user will see manual instructions
    }
  }, []);

  return {
    permissionState,
    needsPermission,
    checkPermission,
    requestPermission,
    openSettings,
    reset,
  };
}
