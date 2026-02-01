import { useGetAllSessionsFnQuery } from "@/redux/features/session-api/session-api";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Haptics from "expo-haptics";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  Image,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Index = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSessionType, setSelectedSessionType] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const limit = 10;

  const mountedRef = useRef(false);

  const {
    data: sessionsResponse,
    isLoading,
    isFetching,
    refetch: refetchSessions,
    error,
  } = useGetAllSessionsFnQuery(
    {
      page,
      limit,
      sessionType: selectedSessionType || undefined,
      mode: selectedMode || undefined,
      search: debouncedSearch || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = search.trim().replace(/\s+/g, " ");
      setDebouncedSearch(normalized);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!mountedRef.current && (sessionsResponse || error)) {
      mountedRef.current = true;
    }
  }, [sessionsResponse, error]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      setPage(1);
      await refetchSessions();
    } catch (err) {
      console.error("Refresh failed:", err);
    }
    setRefreshing(false);
  }, [refetchSessions]);

  const sessions = useMemo(() => sessionsResponse?.data || [], [sessionsResponse]);
  const pagination = useMemo(() => sessionsResponse?.pagination, [sessionsResponse]);

  const filteredSessions = useMemo(() => {
    if (!debouncedSearch) return sessions;
    const s = debouncedSearch.toLowerCase();
    return sessions.filter(
      (session) =>
        session.title?.toLowerCase().includes(s) ||
        session.description?.toLowerCase().includes(s)
    );
  }, [sessions, debouncedSearch]);

  const loadMore = useCallback(() => {
    if (!mountedRef.current) return;
    if (pagination?.hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [pagination?.hasNextPage, isFetching]);

  const handleSessionPress = useCallback(
    (sessionId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({ pathname: "/form", params: { id: sessionId } });
    },
    [router]
  );

  const clearSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSessionType("");
    setSelectedMode("");
    setPage(1);
  }, []);

  const applyFilters = useCallback((sessionType: string, mode: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSessionType(sessionType);
    setSelectedMode(mode);
    setPage(1);
    setShowFilterModal(false);
  }, []);

  const activeFiltersCount = (selectedSessionType ? 1 : 0) + (selectedMode ? 1 : 0);

  // ✅ ALL HOOKS ABOVE - Move useMemo for SearchHeader here
  const SearchHeaderComponent = useMemo(
    () => (
      <View className="mb-5">
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
            placeholder="Search sessions..."
            placeholderTextColor="#9ca3af"
            className="flex-1 ml-3 text-gray-800 text-base"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
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

        {/* Filters & Count */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-600 text-sm font-medium">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}
          </Text>

          <View className="flex-row items-center gap-2">
            {activeFiltersCount > 0 && (
              <Pressable
                onPress={clearFilters}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="bg-red-50 px-3 py-2 rounded-xl flex-row items-center gap-1"
              >
                <Ionicons name="close-circle" size={16} color="#ef4444" />
                <Text className="text-red-500 font-semibold text-xs">Clear</Text>
              </Pressable>
            )}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFilterModal(true);
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
              <MaterialCommunityIcons name="filter-variant" size={16} color="#6566fc" />
              <Text className="text-gray-700 font-semibold text-sm">Filters</Text>
              {activeFiltersCount > 0 && (
                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">{activeFiltersCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {search && (
          <View className="bg-primary/10 rounded-xl p-3 mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Feather name="search" size={14} color="#6566fc" />
              <Text className="text-primary font-medium text-sm" numberOfLines={1}>
                Searching: "{search}"
              </Text>
            </View>
            <Pressable onPress={clearSearch} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text className="text-primary font-semibold text-sm">Clear</Text>
            </Pressable>
          </View>
        )}

        {(selectedSessionType || selectedMode) && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {selectedSessionType && (
              <View className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Text className="text-primary text-xs font-semibold">{selectedSessionType}</Text>
              </View>
            )}
            {selectedMode && (
              <View className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <Text className="text-primary text-xs font-semibold">{selectedMode}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    ),
    [search, clearSearch, filteredSessions.length, activeFiltersCount, selectedSessionType, selectedMode, clearFilters]
  );

  const renderSessionCard = useCallback(
    ({ item }: { item: any }) => (
      <Pressable
        onPress={() => handleSessionPress(item._id)}
        style={({ pressed }) => ({
          marginBottom: 16,
          backgroundColor: "white",
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#e5e7eb",
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.85 : 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        })}
      >
        <View className="relative">
          <Image source={{ uri: item.thumbnail }} className="w-full h-48" resizeMode="cover" />
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-16 h-16 bg-white/90 rounded-full items-center justify-center shadow-lg">
              <Ionicons name="arrow-forward" size={28} color="#6566fc" style={{ marginLeft: 2 }} />
            </View>
          </View>
          <View className="absolute top-3 right-3 bg-primary/90 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">Available</Text>
          </View>
        </View>

        <View className="p-4">
          <Text className="text-xl font-bold text-gray-800 mb-3 leading-6" numberOfLines={2}>
            {item.title}
          </Text>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full">
              <MaterialCommunityIcons name="calendar-clock" size={16} color="#6566fc" />
              <Text className="text-sm font-semibold text-primary ml-1.5">{item.sessionType}</Text>
            </View>

            <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
              <MaterialCommunityIcons
                name={item.mode === "Online" ? "monitor" : "account-group"}
                size={16}
                color="#6b7280"
              />
              <Text className="text-sm font-medium text-gray-600 ml-1.5">{item.mode}</Text>
            </View>
          </View>

          <View className="mt-4 bg-primary/10 px-4 py-3 rounded-xl flex-row items-center justify-center">
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color="#6566fc" />
            <Text className="text-primary font-bold text-sm ml-2">Register Now</Text>
          </View>
        </View>
      </Pressable>
    ),
    [handleSessionPress]
  );

  const renderFooter = useCallback(() => {
    if (!isFetching || page === 1) return null;
    return (
      <View className="py-6">
        <ActivityIndicator size="small" color="#6566fc" />
        <Text className="text-gray-500 text-center mt-2 text-sm">Loading more sessions...</Text>
      </View>
    );
  }, [isFetching, page]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20 px-6">
        <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-6">
          <MaterialCommunityIcons
            name={search || activeFiltersCount > 0 ? "magnify-close" : "calendar-remove"}
            size={64}
            color="#6566fc"
          />
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
          {search || activeFiltersCount > 0 ? "No Matching Sessions" : "No Sessions Available"}
        </Text>
        <Text className="text-gray-500 text-center text-base leading-6 mb-6">
          {search || activeFiltersCount > 0
            ? "Try adjusting your search or filters"
            : "Pull down to refresh and check for new sessions"}
        </Text>
        {(search || activeFiltersCount > 0) && (
          <Pressable
            onPress={() => {
              clearSearch();
              clearFilters();
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.8 : 1,
            })}
            className="bg-primary px-6 py-3 rounded-full flex-row items-center gap-2"
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text className="text-white font-semibold">Clear All</Text>
          </Pressable>
        )}
      </View>
    );
  }, [isLoading, search, activeFiltersCount, clearSearch, clearFilters]);

  // ✅ NOW conditional rendering AFTER all hooks
  if (error) {
    return (
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 justify-center items-center px-6">
              <MaterialCommunityIcons name="alert-circle" size={64} color="#ef4444" />
              <Text className="text-xl font-bold text-gray-800 mt-4 mb-2 text-center">
                Oops! Something went wrong
              </Text>
              <Text className="text-gray-500 text-center mb-6">
                We couldn't load the sessions. Please try again.
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  refetchSessions();
                }}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                })}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-white font-semibold">Try Again</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (isLoading && page === 1) {
    return (
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#6566fc" />
              <Text className="text-gray-500 mt-4">Loading sessions...</Text>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider className="bg-gray-50">
        <SafeAreaView className="flex-1" style={{ padding: moderateScale(20) }}>
          <View className="mb-6">
            <Text
              style={{ fontFamily: "Poppins-Regular" }}
              className="text-4xl font-extrabold tracking-tighter leading-tight"
            >
              Academy Of Financial Engineering
            </Text>
          </View>

          <View style={{ marginBottom: verticalScale(20) }}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <View className="w-1 h-8 bg-primary rounded-full" />
                <Text className="text-2xl font-bold text-primary">Our Sessions</Text>
              </View>
              {pagination && pagination.total > 0 && (
                <View className="bg-primary/10 px-3 py-1.5 rounded-full">
                  <Text className="text-primary font-bold text-sm">{pagination.total} Total</Text>
                </View>
              )}
            </View>
          </View>

          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item._id}
            renderItem={renderSessionCard}
            ListHeaderComponent={SearchHeaderComponent}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
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
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={10}
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          />

          <Modal
            visible={showFilterModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowFilterModal(false)}
          >
            <Pressable className="flex-1 bg-black/50" onPress={() => setShowFilterModal(false)}>
              <View className="flex-1 justify-end">
                <Pressable onPress={(e) => e.stopPropagation()}>
                  <View className="bg-white rounded-t-3xl p-6 pb-8">
                    <View className="flex-row items-center justify-between mb-6">
                      <Text className="text-2xl font-bold text-gray-900">Filter Sessions</Text>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setShowFilterModal(false);
                        }}
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                        className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                      >
                        <Ionicons name="close" size={24} color="#6b7280" />
                      </Pressable>
                    </View>

                    <View className="mb-6">
                      <Text className="text-base font-bold text-gray-800 mb-3">Session Type</Text>
                      <View className="gap-2">
                        <FilterOption
                          label="All Types"
                          value=""
                          selected={selectedSessionType === ""}
                          onPress={(val: string) => setSelectedSessionType(val)}
                        />
                        <FilterOption
                          label="DDFPL"
                          value="DDFPL"
                          selected={selectedSessionType === "DDFPL"}
                          onPress={(val: string) => setSelectedSessionType(val)}
                        />
                        <FilterOption
                          label="NORMAL"
                          value="NORMAL"
                          selected={selectedSessionType === "NORMAL"}
                          onPress={(val: string) => setSelectedSessionType(val)}
                        />
                      </View>
                    </View>

                    <View className="mb-6">
                      <Text className="text-base font-bold text-gray-800 mb-3">Mode</Text>
                      <View className="gap-2">
                        <FilterOption
                          label="All Modes"
                          value=""
                          selected={selectedMode === ""}
                          onPress={(val: string) => setSelectedMode(val)}
                        />
                        <FilterOption
                          label="Online"
                          value="Online"
                          selected={selectedMode === "Online"}
                          onPress={(val: string) => setSelectedMode(val)}
                        />
                        <FilterOption
                          label="Offline"
                          value="Offline"
                          selected={selectedMode === "Offline"}
                          onPress={(val: string) => setSelectedMode(val)}
                        />
                      </View>
                    </View>

                    <Pressable
                      onPress={() => applyFilters(selectedSessionType, selectedMode)}
                      style={({ pressed }) => ({
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                        opacity: pressed ? 0.9 : 1,
                      })}
                      className="bg-primary py-4 rounded-2xl items-center"
                    >
                      <Text className="text-white font-bold text-base">Apply Filters</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </View>
            </Pressable>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const FilterOption = ({ label, value, selected, onPress }) => (
  <Pressable
    onPress={() => onPress(value)}
    style={({ pressed }) => ({
      transform: [{ scale: pressed ? 0.98 : 1 }],
      opacity: pressed ? 0.9 : 1,
    })}
    className={`p-4 rounded-2xl border-2 flex-row items-center justify-between ${selected ? "bg-primary border-primary" : "bg-white border-gray-200"
      }`}
  >
    <Text className={`font-semibold text-base ${selected ? "text-white" : "text-gray-700"}`}>
      {label}
    </Text>
    {selected && (
      <View className="w-6 h-6 bg-white rounded-full items-center justify-center">
        <Ionicons name="checkmark" size={18} color="#6566fc" />
      </View>
    )}
  </Pressable>
);

export default Index;
