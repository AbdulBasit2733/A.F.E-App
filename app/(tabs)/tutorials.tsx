import { useGetAllTutorialsFnQuery } from "@/redux/features/tutorial-api/tutorial-api";
import type { TUTORIALS_PROPS } from "@/redux/features/tutorial-api/types";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2;

const TutorialsScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "title">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showSortModal, setShowSortModal] = useState(false);
  const mountedRef = useRef(false);

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = search.trim().replace(/\s+/g, " ");
      setDebouncedSearch(normalized);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: tutorialsResponse,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useGetAllTutorialsFnQuery({
    page,
    limit,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  });

  const tutorials = useMemo(() => tutorialsResponse?.data || [], [tutorialsResponse]);
  const pagination = useMemo(() => tutorialsResponse?.pagination, [tutorialsResponse]);

  useEffect(() => {
    if (!mountedRef.current && (tutorialsResponse || error)) {
      mountedRef.current = true;
    }
  }, [tutorialsResponse, error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      setPage(1);
      await refetch();
    } catch (err) {
      console.error("Refresh failed:", err);
    }
    setRefreshing(false);
  }, [refetch]);

  const loadMore = useCallback(() => {
    if (!mountedRef.current) return;
    if (pagination?.hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [pagination?.hasNextPage, isFetching]);

  const handleSort = useCallback((field: "createdAt" | "title", order: "asc" | "desc") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
    setShowSortModal(false);
  }, []);

  const clearSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }, []);

  const handleCardPress = useCallback(
    (item: TUTORIALS_PROPS) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: "/(screens)/watch_tutorial" as any,
        params: {
          id: item._id,
          videoUrl: item.videoUrl,
          thumbnailUrl: item.thumbnailUrl,
          description: item.description,
          title: item.title,
        },
      });
    },
    [router]
  );

  // ✅ Memoize stable header BEFORE conditional returns
  const HeaderComponent = useMemo(
    () => (
      <View className="mb-5 px-4">
        {/* Search Bar */}
        <View
          className="bg-white rounded-2xl mb-4 flex-row items-center px-5 py-3"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tutorials..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-gray-800 text-base"
            blurOnSubmit={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable
              onPress={clearSearch}
              className="ml-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </Pressable>
          )}
        </View>

        {/* Sort & Results Count */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 text-sm font-medium">
            {pagination?.total || 0} tutorial{pagination?.total !== 1 ? "s" : ""}
          </Text>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSortModal(true);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.8 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            })}
            className="bg-white rounded-xl px-4 py-2 flex-row items-center gap-2"
          >
            <MaterialCommunityIcons name="sort-variant" size={16} color="#6566fc" />
            <Text className="text-gray-700 font-semibold text-sm">Sort</Text>
            <Ionicons
              name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
              size={12}
              color="#6566fc"
            />
          </Pressable>
        </View>

        {/* Active Search Badge */}
        {search && (
          <View className="bg-[#6566fc]/10 rounded-xl p-3 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Feather name="filter" size={14} color="#6566fc" />
              <Text className="text-[#6566fc] font-medium text-sm" numberOfLines={1}>
                "{search}"
              </Text>
            </View>
            <Pressable onPress={clearSearch} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text className="text-[#6566fc] font-semibold text-sm">Clear</Text>
            </Pressable>
          </View>
        )}
      </View>
    ),
    [search, clearSearch, pagination?.total, sortOrder]
  );

  const renderTutorialCard = useCallback(
    ({ item }: { item: TUTORIALS_PROPS }) => (
      <Pressable
        onPress={() => handleCardPress(item)}
        style={({ pressed }) => ({
          width: cardWidth,
          marginBottom: 16,
          backgroundColor: "white",
          borderRadius: 16,
          overflow: "hidden",
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.85 : 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        })}
      >
        {/* Thumbnail */}
        <View className="relative" style={{ height: cardWidth * 0.75 }}>
          <Image
            source={{ uri: item.thumbnailUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            className="absolute bottom-0 left-0 right-0 h-16"
          />

          {/* Play Button */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg">
              <Ionicons name="play" size={24} color="#6566fc" style={{ marginLeft: 2 }} />
            </View>
          </View>

          {/* Badge */}
          <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-semibold">Video</Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-3">
          <Text className="text-sm font-bold text-gray-900 mb-1 leading-5" numberOfLines={2}>
            {item.title}
          </Text>

          <Text className="text-gray-500 text-xs leading-4 mb-2" numberOfLines={2}>
            {item.description}
          </Text>

          {/* Watch Button */}
          <View className="flex-row items-center justify-center bg-[#6566fc]/10 px-3 py-2 rounded-lg mt-1">
            <MaterialCommunityIcons name="play-circle" size={14} color="#6566fc" />
            <Text className="text-[#6566fc] font-semibold text-xs ml-1">Watch Now</Text>
          </View>
        </View>
      </Pressable>
    ),
    [handleCardPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetching || page === 1) return null;
    return (
      <View className="py-6 w-full">
        <ActivityIndicator size="small" color="#6566fc" />
        <Text className="text-gray-500 text-center mt-2 text-sm">Loading more...</Text>
      </View>
    );
  }, [isFetching, page]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <View className="w-32 h-32 bg-[#6566fc]/10 rounded-full items-center justify-center mb-6">
          <MaterialCommunityIcons name="video-off-outline" size={64} color="#6566fc" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
          No Tutorials Found
        </Text>
        <Text className="text-gray-500 text-center text-base leading-6 mb-6">
          {search ? "Try adjusting your search" : "Pull down to refresh"}
        </Text>
        {search && (
          <Pressable
            onPress={clearSearch}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.8 : 1,
            })}
            className="bg-[#6566fc] px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Clear Search</Text>
          </Pressable>
        )}
      </View>
    );
  }, [isLoading, search, clearSearch]);

  // ✅ ALL HOOKS ABOVE - Conditional returns AFTER all hooks
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-xl font-bold text-gray-800 mt-4 mb-2 text-center">
            Oops! Something went wrong
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            We couldn't load the tutorials. Please try again.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              refetch();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.8 : 1,
            })}
            className="bg-[#6566fc] px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && page === 1) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6566fc" />
        <Text className="text-gray-500 mt-4">Loading tutorials...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View className="bg-white px-6 py-5 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Tutorials</Text>
            <Text className="text-gray-500 text-base mt-1">Learn at your own pace</Text>
          </View>
          <View className="w-14 h-14 bg-[#6566fc]/10 rounded-2xl items-center justify-center">
            <MaterialCommunityIcons name="book-open-variant" size={28} color="#6566fc" />
          </View>
        </View>
      </View>

      <FlatList
        data={tutorials}
        keyExtractor={(item) => item._id}
        renderItem={renderTutorialCard}
        ListHeaderComponent={HeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6566fc"]}
            tintColor="#6566fc"
            progressBackgroundColor="#ffffff"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
      />

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setShowSortModal(false)}>
          <View className="flex-1 justify-end">
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View className="bg-white rounded-t-3xl p-6 pb-8">
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-2xl font-bold text-gray-900">Sort By</Text>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowSortModal(false);
                    }}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                    className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </Pressable>
                </View>

                <View className="gap-3">
                  <SortOption
                    label="Newest First"
                    icon="time-outline"
                    field="createdAt"
                    order="desc"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onPress={handleSort}
                  />
                  <SortOption
                    label="Oldest First"
                    icon="time-outline"
                    field="createdAt"
                    order="asc"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onPress={handleSort}
                  />
                  <SortOption
                    label="Title (A-Z)"
                    icon="text-outline"
                    field="title"
                    order="asc"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onPress={handleSort}
                  />
                  <SortOption
                    label="Title (Z-A)"
                    icon="text-outline"
                    field="title"
                    order="desc"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onPress={handleSort}
                  />
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

// Sort Option Component
interface SortOptionProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  field: "createdAt" | "title";
  order: "asc" | "desc";
  currentSortBy: "createdAt" | "title";
  currentSortOrder: "asc" | "desc";
  onPress: (field: "createdAt" | "title", order: "asc" | "desc") => void;
}

const SortOption: React.FC<SortOptionProps> = React.memo(
  ({ label, icon, field, order, currentSortBy, currentSortOrder, onPress }) => {
    const isActive = currentSortBy === field && currentSortOrder === order;

    const handlePress = useCallback(() => {
      onPress(field, order);
    }, [field, order, onPress]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.98 : 1 }],
          opacity: pressed ? 0.9 : 1,
        })}
        className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${isActive ? "bg-[#6566fc] border-[#6566fc]" : "bg-white border-gray-200"
          }`}
      >
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? "bg-white/20" : "bg-gray-100"
              }`}
          >
            <Ionicons name={icon} size={20} color={isActive ? "#ffffff" : "#6b7280"} />
          </View>
          <Text
            className={`font-semibold text-base ${isActive ? "text-white" : "text-gray-700"}`}
          >
            {label}
          </Text>
        </View>
        {isActive && (
          <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
            <Ionicons name="checkmark" size={18} color="#6566fc" />
          </View>
        )}
      </Pressable>
    );
  }
);
SortOption.displayName = "SortOption";

export default TutorialsScreen;
