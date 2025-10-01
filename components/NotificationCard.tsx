import { View, Text } from "react-native";

const NotificationCard = ({ sessionTitle, selectedDate }: { sessionId: string, selectedDate: string }) => {
  return (
    <View className="bg-slate-300" style={{ padding: 15, marginBottom: 10, borderRadius: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Session Title: {sessionTitle}</Text>
      <Text style={{ fontSize: 14 }}>Date: {selectedDate}</Text>
    </View>
  );
};

export default NotificationCard;
