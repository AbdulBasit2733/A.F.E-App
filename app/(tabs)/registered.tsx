import { useGetAllRegisteredSessionsFnQuery } from "@/redux/features/session-api/session-api";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  differenceInDays,
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
} from "date-fns";
import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Helper to convert MongoDB Decimal128 to number safely
const decimal128ToNumber = (
  decimalObj?: { $numberDecimal: string } | number
): number => {
  if (!decimalObj) return 0;
  if (typeof decimalObj === "number") return decimalObj;
  return parseFloat(decimalObj.$numberDecimal);
};

const RegisteredSessions = () => {
  const { data: registeredSessionResponse, isFetching: isLoading } =
    useGetAllRegisteredSessionsFnQuery();
  const registeredSessions = registeredSessionResponse?.data ?? [];

  //   useEffect(() => {
  //     console.log("Registered Sessions data:", registeredSessions);
  //   }, [registeredSessions]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator
          size="large"
          color="#6566fc"
          accessibilityLabel="Loading registered sessions"
        />
      </View>
    );
  }

  // Filter upcoming sessions (today or future)
  const upcomingSessions = registeredSessions.filter((session) => {
    const sessionDate = new Date(session.selectedDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return sessionDate >= todayStart;
  });

  //   console.log("Upcoming", upcomingSessions);

  // Sort sessions by nearest date first
  const sortedSessions = [...upcomingSessions].sort(
    (a, b) =>
      new Date(a.selectedDate).getTime() - new Date(b.selectedDate).getTime()
  );

  //   console.log("sorted Sessions", sortedSessions);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaProvider>
        <SafeAreaView edges={['left', 'right']} className="flex-1">
          {/* Header */}
          <View className="px-4 py-6 flex-row items-center border-b border-gray-100 space-x-3">
            <Ionicons name="calendar-outline" size={24} color="#6566fc" />
            <Text className="text-2xl font-semibold text-primary">
              Registered Sessions
            </Text>
          </View>

          {sortedSessions.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Ionicons
                size={48}
                color="#9ca3af"
                name="calendar-outline"
                className="mb-4 opacity-50"
              />
              <Text className="text-xl font-semibold text-gray-700 mb-2">
                No Upcoming Sessions
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Your upcoming registered sessions will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedSessions}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
              renderItem={({ item }) => {
                const sessionData = item.sessions || item.sessionId;
                const sessionDate = new Date(item.selectedDate);
                const dayOfWeek = format(sessionDate, "EEEE");
                const daysRemaining = differenceInDays(sessionDate, new Date());
                const relativeTime = formatDistanceToNow(sessionDate, {
                  addSuffix: true,
                });
                const sessionTime = format(sessionDate, "hh:mm a");
                const hours = sessionDate.getHours();
                const timeOfDay =
                  hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening";
                const displayDate = isToday(sessionDate)
                  ? "Today"
                  : isTomorrow(sessionDate)
                    ? "Tomorrow"
                    : format(sessionDate, "MMMM dd, yyyy");

                const discountedPrice = decimal128ToNumber(
                  item.discountedPrice
                );

                return (
                  <View
                    className="bg-gray-50 p-4 mb-3 rounded-xl shadow-sm border border-gray-100"
                    accessibilityLabel={`Registered session: ${sessionData?.title ?? "unknown session"}`}
                  >
                    {sessionData ? (
                      <>
                        <Text className="text-lg font-semibold capitalize text-gray-900 mb-1">
                          {sessionData.title}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Scheduled for: {displayDate}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Day: {dayOfWeek}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          Time: {sessionTime} ({timeOfDay})
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {daysRemaining > 0
                            ? `${daysRemaining} days remaining (${relativeTime})`
                            : "Happening today!"}
                        </Text>
                        <Text className="text-sm font-bold mt-2 text-gray-600">
                          Price: <FontAwesome name="rupee" /> {discountedPrice}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-sm text-gray-500 italic">
                        No Title Available
                      </Text>
                    )}
                  </View>
                );
              }}
            />
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
};

export default RegisteredSessions;
