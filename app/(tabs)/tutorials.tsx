import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollViewComponent,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const tutorials = () => {
  const images = [
    "https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg",
    "https://t3.ftcdn.net/jpg/06/15/49/68/360_F_615496890_W34yB8VDE6n5pehb5QCt1ek5oEvRo9qA.jpg",
    "https://gratisography.com/wp-content/uploads/2024/10/gratisography-cool-cat-800x525.jpg",
  ];

  const videos = [
    {
      video:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnail:
        "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
      title: "Big Buck Bunny",
      artist: "Blender Foundation",
      artwork: "https://example.com/path-to-big-buck-bunny-artwork.jpg",
    },
    {
      video:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnail:
        "https://img.freepik.com/free-photo/magenta-nature-fantasy-landscape_23-2150693745.jpg",
      title: "Elephant's Dream",
      artist: "Orange Open Movie Project",
      artwork: "https://example.com/path-to-elephants-dream-artwork.jpg",
    },
    {
      video:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
      thumbnail:
        "https://img.freepik.com/free-photo/abstract-autumn-beauty-multi-colored-leaf-vein-pattern-generated-by-ai_188544-9871.jpg",
      title: "Sintel",
      artist: "Blender Institute",
      artwork: "https://example.com/path-to-sintel-artwork.jpg",
    },
  ];

  return (
    <ScrollView
      style={{
        backgroundColor: "white",
      }}
    >
      <SafeAreaProvider>
        <SafeAreaView style={{paddingHorizontal:moderateScale(20), paddingVertical:verticalScale(20)}}>
          <Text className="text-3xl mb-5 text-primary uppercase font-semibold tracking-wider">
            tutorials
          </Text>
          <View
            className="flex gap-5"
          >

            <Text className="text-xl font-semibold">No Tutorials Are Present Yet !</Text>
            {/* <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable>
              <View className="flex flex-row justify-between items-center gap-5 border border-slate-300 py-5 px-2 rounded-lg">
                <Text className="font-bold">1</Text>
                <Image
                  style={{
                    width: moderateScale(80),
                    height: moderateScale(50),
                  }}
                  className="overflow-hidden rounded-lg"
                  src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
                />
                <View className="flex-1">
                  <Text className="truncate text-wrap">
                    How To Become A Rich Throught Trading
                  </Text>
                </View>
              </View>
            </Pressable> */}
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </ScrollView>
  );
};

export default tutorials;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    // position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    width: 350,
    height: 200,
    borderRadius: 12,
  },
  thumbnail: {
    width: 350,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
  },
});
