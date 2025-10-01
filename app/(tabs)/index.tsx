import { useGetAllSessionsFnQuery } from "@/redux/features/session-api/session-api";
import { useGetUserDetailsQuery } from "@/redux/features/user-api/user-api";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  Image,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, verticalScale } from "react-native-size-matters";

const Index = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Query with pagination params
  const {
    data: sessionsResponse,
    isLoading,
    isFetching,
    refetch: refetchSessions,
  } = useGetAllSessionsFnQuery(
    { page, limit },
    { refetchOnMountOrArgChange: true }
  );


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setPage(1);
      await Promise.all([refetchSessions()]);
    } catch (err) {
      console.error("Refresh failed:", err);
    }
    setRefreshing(false);
  }, [refetchSessions]);

  const sessions = sessionsResponse?.data || [];
  const pagination = sessionsResponse?.pagination;
  // console.log(sessions);

  const loadMore = () => {
    if (pagination && page < pagination.pages && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6566fc" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider
        style={{ padding: moderateScale(20), backgroundColor: "white" }}
      >
        <SafeAreaView className="min-h-screen">
          <Text
            style={{ fontFamily: "Poppins-Regular" }}
            className="text-4xl font-extrabold tracking-tighter"
          >
            Welcome To Academy Of Financial Engineering
          </Text>

          <View style={{ marginVertical: verticalScale(20) }}>
            <Text className="text-2xl font-bold text-primary">
              Our Sessions
            </Text>
          </View>

          <FlatList
            data={sessions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/form",
                    params: {
                      id: item._id,
                    },
                  })
                }
              >
                <View className="mb-4 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  {/* Image Section */}
                  <Image
                    source={{ uri: item.thumbnail }}
                    className="w-full h-48"
                    resizeMode="cover"
                  />

                  {/* Content Section */}
                  <View className="p-4">
                    {/* Title */}
                    <Text
                      className="text-xl font-bold text-gray-800 mb-2"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    {/* Session Details */}
                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-full">
                        <Text className="text-sm font-semibold text-primary">
                          {item.sessionType}
                        </Text>
                      </View>

                      <View className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full">
                        <Text className="text-sm font-medium text-gray-600">
                          {item.mode}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#6566fc"]}
                tintColor="#6566fc"
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetching && page > 1 ? (
                <ActivityIndicator size="small" color="#6566fc" />
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View className="w-full items-center p-5">
                  <Text className="text-xl font-bold mb-2">
                    No upcoming sessions found.
                  </Text>
                  <Text className="text-base text-slate-500">
                    Pull down to refresh and check for new sessions.
                  </Text>
                </View>
              ) : null
            }
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default Index;
