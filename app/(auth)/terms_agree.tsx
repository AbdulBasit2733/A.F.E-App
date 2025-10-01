import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import { moderateScale, verticalScale } from "react-native-size-matters";
import { Link } from "expo-router";
import Checkbox from "expo-checkbox";
const terms_agree = () => {
  const [isChecked, setChecked] = useState(false);
  return (
    <View className="bg-white h-screen px-5 pt-10">
      <Text
        className="font-extrabold text-center text-[#ff9f1c]"
        style={{ fontSize: moderateScale(20) }}
      >
        Terms And Conditions
      </Text>
      <View className="pt-12" style={{ gap: verticalScale(10) }}>
        <Text style={{ fontSize: moderateScale(15) }}>
          <Text className="font-semibold">1) Data Collection:</Text> We collect
          personal details (name, email), financial data (transactions,
          investments), and device information (IP address. browser type).
        </Text>
        <Text style={{ fontSize: moderateScale(15) }}>
          <Text className="font-semibold">2) Data Usage:</Text> Your data is
          used to provide personalized financial insights, improve services, and
          communicate updates. browser type).
        </Text>
        <Text style={{ fontSize: moderateScale(15) }}>
          <Text className="font-semibold"> 3) Data Protection:</Text> We store
          your data securely with encryption, limit access to authorized
          personnel, and never sell or share data for marketing. browser type).
        </Text>
        <Text style={{ fontSize: moderateScale(15) }}>
          <Text className="font-semibold">4) Your Rights:</Text> You can access,
          update, or delete your data anytime and withdraw consent for data
          processing.
        </Text>
        <Text style={{ fontSize: moderateScale(15) }}>
          <Text className="font-semibold">5) No Misuse:</Text>Wealth Engineers
          strictly prohibits the unauthorized use of your data and ensures
          compliance with legal standards.
        </Text>
      </View>
      <View style={styles.section}>
        <Checkbox
          className=""
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? "#4630EB" : undefined}
        />
        <Text>Do You Agree</Text>
      </View>
      {isChecked && (
        <View style={{ paddingHorizontal: moderateScale(80) }}>
          <Link
            className="bg-[#ff9f1c] text-white py-3 rounded-md shadow"
            style={{ marginTop: verticalScale(20) }}
            href={"/(auth)/login"}
          >
            <Text className="w-fit text-center text-xl font-semibold">
              Next
            </Text>
          </Link>
        </View>
      )}
    </View>
  );
};

export default terms_agree;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(32),
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(30),
  },
  paragraph: {
    fontSize: moderateScale(15),
  },
  checkbox: {
    margin: moderateScale(8),
  },
});
