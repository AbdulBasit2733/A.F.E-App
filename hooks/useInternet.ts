import { ToastAndroid, Platform } from 'react-native';
import * as Network from 'expo-network';
import { useEffect } from 'react';

export function useInternetToast() {
  useEffect(() => {
    const checkConnection = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        if (Platform.OS === 'android') {
          ToastAndroid.show("No Internet Connection", ToastAndroid.SHORT);
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, []);
}
