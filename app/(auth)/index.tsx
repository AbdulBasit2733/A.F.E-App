import imagePath from "@/constants/imagePath";
import { useAppSelector } from "@/hooks/use-redux";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Auth = () => {
  const { isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push("/(tabs)"); 
      } else {
        router.push("/(auth)/login"); 
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <SafeAreaView
    className="w-full flex-1 items-center justify-between bg-white"
    style={{ paddingVertical: verticalScale(60) }}
  >
    <View />

    <View className="items-center" style={{ gap: verticalScale(12) }}>
      <Image
        style={styles.logo}
        source={imagePath.logo}
        resizeMode="contain"
      />
      <Text
        className="text-primary font-extrabold tracking-widest text-center"
        style={{ fontSize: moderateScale(36) }}
      >
        A.F.E
      </Text>
      <Text
        className="text-neutral-800 font-semibold text-center tracking-wider"
        style={{ fontSize: moderateScale(22) }}
      >
        Academy of Financial Engineering
      </Text>
      <Text
        className="text-secondary text-center font-medium tracking-wide"
        style={{ fontSize: moderateScale(14) }}
      >
        The Only Way To Financial Freedom
      </Text>
    </View>

    <View
      className="items-center justify-end"
      style={{ height: verticalScale(90) }}
    >
      {isLoading ? (
        <>
          <ActivityIndicator
            size={moderateScale(45)}
            color="#0ea5e9" // Tailwind's sky-500
          />
          <Text
            className="text-primary font-semibold mt-4"
            style={{ fontSize: moderateScale(16) }}
          >
            Loading...
          </Text>
        </>
      ) : (
        <>
          <Text
            className="text-gray-400"
            style={{ fontSize: moderateScale(12) }}
          >
            From
          </Text>
          <Text
            className="font-bold text-gray-700 mt-1"
            style={{ fontSize: moderateScale(15) }}
          >
            Abdul Basit Khan
          </Text>
        </>
      )}
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: moderateScale(140),
    height: moderateScale(140),
    borderRadius: moderateScale(12),
  },
});

export default Auth;
