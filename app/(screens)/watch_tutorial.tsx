// app/(screens)/watch_tutorial.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams, Link } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import YoutubePlayer from "react-native-youtube-iframe";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return url?.includes("youtube.com") || url?.includes("youtu.be");
};

const WatchTutorial = () => {
  const router = useRouter();
  const { id, videoUrl, thumbnailUrl, title, description } =
    useLocalSearchParams<{
      id: string;
      videoUrl: string;
      thumbnailUrl: string;
      title?: string;
      description?: string;
    }>();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [showControls, setShowControls] = useState(true);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  const isYouTube = isYouTubeUrl(videoUrl);
  const youtubeVideoId = isYouTube ? getYouTubeVideoId(videoUrl) : null;

  // Initialize video player (only for non-YouTube videos)
  const player = !isYouTube
    ? useVideoPlayer(videoUrl, (player) => {
        player.loop = false;
        player.muted = false;
        player.volume = 1.0;
      })
    : null;

  // Use events from expo-video (only for non-YouTube)
  const { isPlaying } =
    !isYouTube && player
      ? useEvent(player, "playingChange", {
          isPlaying: player.playing,
        })
      : { isPlaying: false };

  const { status } =
    !isYouTube && player
      ? useEvent(player, "statusChange", {
          status: player.status,
        })
      : { status: "idle" };

  const { currentTime } =
    !isYouTube && player
      ? useEvent(player, "timeUpdate", {
          currentTime: player.currentTime,
          currentLiveTimestamp: 0,
          currentOffsetFromLive: 0,
          bufferedPosition: 0,
        })
      : { currentTime: 0 };

  const { volume } =
    !isYouTube && player
      ? useEvent(player, "volumeChange", {
          volume: player.volume,
        })
      : { volume: 1 };

  const duration = player?.duration || 0;
  const isMuted = player?.muted || false;

  // Handle orientation changes
  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener(
      (evt) => {
        const orientationType = evt.orientationInfo.orientation;
        if (
          orientationType === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientationType === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
        ) {
          setOrientation("landscape");
        } else {
          setOrientation("portrait");
        }
      }
    );

    // Unlock orientation to allow both modes
    ScreenOrientation.unlockAsync();

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
      if (player) player.pause();
    };
  }, []);

  // Auto-hide controls (only for expo-video)
  useEffect(() => {
    if (!isYouTube && showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying, isYouTube]);

  // Handlers for expo-video
  const handlePlayPause = useCallback(() => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const handleVideoPress = useCallback(() => {
    setShowControls((prev) => !prev);
  }, []);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (player) player.seekBy(seconds);
    },
    [player]
  );

  const handleReplay = useCallback(() => {
    if (player) player.replay();
  }, [player]);

  const handleMuteToggle = useCallback(() => {
    if (player) player.muted = !player.muted;
  }, [player]);

  const handleVolumeChange = useCallback(
    (delta: number) => {
      if (player) {
        const newVolume = Math.max(0, Math.min(1, player.volume + delta));
        player.volume = newVolume;
      }
    },
    [player]
  );

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const videoEnded =
    currentTime >= duration - 0.5 && duration > 0 && !isPlaying;

  // YouTube Player Callbacks
  const onYouTubeStateChange = useCallback((state: string) => {
    setIsYouTubePlaying(state === "playing");
  }, []);

  const onYouTubeReady = useCallback(() => {
    setYoutubeReady(true);
  }, []);

  // Calculate video dimensions based on orientation
  const videoHeight = isLandscape ? height : width * (9 / 16);
  const videoWidth = width;

  // Render YouTube Player
  if (isYouTube && youtubeVideoId) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar hidden={isLandscape} barStyle="light-content" />

        {/* YouTube Player Container */}
        <View
          className="bg-black items-center justify-center"
          style={{
            height: isLandscape ? height : videoHeight,
            width: videoWidth,
          }}
        >
          <YoutubePlayer
            height={isLandscape ? height : videoHeight}
            width={videoWidth}
            videoId={youtubeVideoId}
            play={false}
            onChangeState={onYouTubeStateChange}
            onReady={onYouTubeReady}
            webViewProps={{
              injectedJavaScript: `
                var element = document.getElementsByClassName('container')[0];
                element.style.position = 'unset';
                element.style.paddingBottom = 'unset';
                true;
              `,
            }}
          />

          {/* Close Button Overlay */}
          <View
            className={`absolute ${isLandscape ? "top-4 left-4" : "top-12 left-4"} z-50`}
          >
            <Link href={"/(tabs)/tutorials"} asChild>
              <Pressable className="w-12 h-12 bg-black/60 rounded-full items-center justify-center">
                <Ionicons name="close" size={28} color="white" />
              </Pressable>
            </Link>
          </View>

          {!youtubeReady && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator size="large" color="#6566fc" />
              <Text className="text-white mt-3">Loading YouTube video...</Text>
            </View>
          )}
        </View>

        {/* Video Info - Only show in portrait */}
        {!isLandscape && title && (
          <View className="flex-1 bg-gray-950 p-6">
            <Text
              className="text-white font-bold text-2xl mb-3"
              numberOfLines={3}
            >
              {title}
            </Text>
            {description && (
              <Text
                className="text-gray-400 text-base leading-6"
                numberOfLines={8}
              >
                {description}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  // Render Regular Video Player (expo-video)
  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden={isLandscape} barStyle="light-content" />

      {/* Video Container */}
      <View
        style={{
          height: isLandscape ? height : videoHeight,
          width: videoWidth,
        }}
      >
        <Pressable onPress={handleVideoPress} className="flex-1">
          <VideoView
            player={player!}
            style={{ width: "100%", height: "100%" }}
            allowsFullscreen={false}
            allowsPictureInPicture={true}
            nativeControls={false}
            contentFit="contain"
          />

          {/* Loading Indicator */}
          {status === "loading" && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white mt-3 text-base">
                Loading video...
              </Text>
            </View>
          )}

          {/* Error State */}
          {status === "error" && (
            <View className="absolute inset-0 items-center justify-center bg-black/80">
              <Ionicons name="alert-circle" size={64} color="#ef4444" />
              <Text className="text-white text-xl font-bold mt-4 mb-2">
                Playback Error
              </Text>
              <Text className="text-gray-400 text-center px-8">
                Unable to play this video. Please try again.
              </Text>
              <Pressable
                onPress={() => router.back()}
                className="mt-6 bg-[#6566fc] px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Go Back</Text>
              </Pressable>
            </View>
          )}

          {/* Video Ended Overlay */}
          {videoEnded && (
            <Animated.View
              entering={FadeIn}
              className="absolute inset-0 bg-black/80 items-center justify-center"
            >
              <View className="items-center">
                <View className="w-20 h-20 bg-[#6566fc] rounded-full items-center justify-center mb-4">
                  <Ionicons name="checkmark" size={48} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2">
                  Video Complete!
                </Text>
                <Text className="text-gray-400 mb-6">
                  Great job finishing this tutorial
                </Text>
                <Pressable
                  onPress={handleReplay}
                  className="bg-[#6566fc] px-8 py-3 rounded-full flex-row items-center gap-2"
                >
                  <Ionicons name="reload" size={20} color="white" />
                  <Text className="text-white font-bold text-base">
                    Watch Again
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* Controls Overlay */}
          {showControls && !videoEnded && status !== "error" && (
            <Animated.View
              entering={FadeIn}
              exiting={FadeOut}
              className="absolute inset-0"
            >
              {/* Top Bar */}
              <LinearGradient
                colors={["rgba(0,0,0,0.8)", "transparent"]}
                className={`absolute top-0 left-0 right-0 ${isLandscape ? "pt-3 px-4 pb-8" : "pt-12 px-6 pb-12"} z-10`}
              >
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() => {
                      player?.pause();
                      router.back();
                    }}
                    className={`${isLandscape ? "w-10 h-10" : "w-12 h-12"} bg-white/20 rounded-full items-center justify-center`}
                  >
                    <Ionicons
                      name="close"
                      size={isLandscape ? 24 : 28}
                      color="white"
                    />
                  </Pressable>

                  <View className="flex-1 mx-3">
                    <Text
                      className={`text-white font-bold ${isLandscape ? "text-base" : "text-lg"}`}
                      numberOfLines={1}
                    >
                      {title || "Tutorial"}
                    </Text>
                  </View>

                  {/* Volume Control */}
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => handleVolumeChange(-0.2)}
                      className={`${isLandscape ? "w-8 h-8" : "w-10 h-10"} bg-white/20 rounded-full items-center justify-center`}
                    >
                      <Ionicons
                        name="remove"
                        size={isLandscape ? 16 : 20}
                        color="white"
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => handleVolumeChange(0.2)}
                      className={`${isLandscape ? "w-8 h-8" : "w-10 h-10"} bg-white/20 rounded-full items-center justify-center`}
                    >
                      <Ionicons
                        name="add"
                        size={isLandscape ? 16 : 20}
                        color="white"
                      />
                    </Pressable>
                  </View>
                </View>
              </LinearGradient>

              {/* Center Controls */}
              <View
                className={`flex-1 items-center justify-center flex-row ${isLandscape ? "gap-8" : "gap-12"}`}
              >
                <Pressable
                  onPress={() => handleSkip(-10)}
                  className={`${isLandscape ? "w-14 h-14" : "w-16 h-16"} bg-white/20 rounded-full items-center justify-center`}
                >
                  <Ionicons
                    name="play-back"
                    size={isLandscape ? 28 : 32}
                    color="white"
                  />
                  <Text
                    className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-bold mt-1`}
                  >
                    10s
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handlePlayPause}
                  className={`${isLandscape ? "w-20 h-20" : "w-24 h-24"} bg-[#6566fc] rounded-full items-center justify-center`}
                  style={{
                    shadowColor: "#6566fc",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={isLandscape ? 40 : 48}
                    color="white"
                    style={{ marginLeft: isPlaying ? 0 : 4 }}
                  />
                </Pressable>

                <Pressable
                  onPress={() => handleSkip(10)}
                  className={`${isLandscape ? "w-14 h-14" : "w-16 h-16"} bg-white/20 rounded-full items-center justify-center`}
                >
                  <Ionicons
                    name="play-forward"
                    size={isLandscape ? 28 : 32}
                    color="white"
                  />
                  <Text
                    className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-bold mt-1`}
                  >
                    10s
                  </Text>
                </Pressable>
              </View>

              {/* Bottom Controls */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                className={`absolute bottom-0 left-0 right-0 ${isLandscape ? "pt-8 px-4 pb-3" : "pt-12 px-6 pb-6"}`}
              >
                <View className={isLandscape ? "mb-2" : "mb-4"}>
                  <View className="flex-row items-center gap-3">
                    <Text
                      className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-semibold min-w-[40px]`}
                    >
                      {formatTime(currentTime)}
                    </Text>
                    <View className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-[#6566fc]"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </View>
                    <Text
                      className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-semibold min-w-[40px] text-right`}
                    >
                      {formatTime(duration)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={handleMuteToggle}
                      className={`${isLandscape ? "w-8 h-8" : "w-10 h-10"} bg-white/20 rounded-full items-center justify-center`}
                    >
                      <Ionicons
                        name={
                          isMuted
                            ? "volume-mute-outline"
                            : "volume-high-outline"
                        }
                        size={isLandscape ? 16 : 20}
                        color="white"
                      />
                    </Pressable>
                    <View
                      className={`${isLandscape ? "px-2 py-1" : "px-3 py-1.5"} bg-white/20 rounded-full`}
                    >
                      <Text
                        className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-semibold`}
                      >
                        {Math.round(volume * 100)}%
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View
                      className={`${isLandscape ? "px-2 py-1" : "px-3 py-1.5"} bg-white/20 rounded-full`}
                    >
                      <Text
                        className={`text-white ${isLandscape ? "text-[10px]" : "text-xs"} font-semibold`}
                      >
                        {player?.playbackRate || 1}x
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          )}
        </Pressable>
      </View>

      {/* Video Info - Only show in portrait mode */}
      {!isLandscape && title && (
        <View className="flex-1 bg-gray-950 p-6">
          <Text
            className="text-white font-bold text-2xl mb-3"
            numberOfLines={3}
          >
            {title}
          </Text>
          {description && (
            <Text
              className="text-gray-400 text-base leading-6"
              numberOfLines={8}
            >
              {description}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default WatchTutorial;
