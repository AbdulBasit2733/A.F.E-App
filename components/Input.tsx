import { View, Text, TextInput } from "react-native";
import React from "react";

import type { KeyboardTypeOptions } from "react-native";

interface InputProps {
  variant: "primary" | "secondary";
  placeholder?: string;
  editable?: boolean;
  onChange?: (value: string) => void; // Proper type for onChange
  value?: string | number;
  keyboardType?: KeyboardTypeOptions;
  defaultValue?: string | number;
}

const variantStyles = {
  primary: "bg-slate-100 text-black",
  secondary: "bg-white text-slate-600",
};

const Input = ({
  placeholder,
  onChange,
  value,
  keyboardType = "default",
  variant,
  editable = true,
  defaultValue,
}: InputProps) => {
  return (
    <TextInput
      editable={editable}
      selectTextOnFocus={editable}
      className={`${
        variant === "primary" ? variantStyles.primary : variantStyles.secondary
      } border border-slate-400 font-medium rounded-md px-2 py-4 w-full`}
      onChangeText={(text) => onChange && onChange(text)} // Call onChange with the new value
      value={value?.toString()} // Controlled input
      placeholder={placeholder}
      keyboardType={keyboardType}
      defaultValue={defaultValue?.toString()} // Handle defaultValue as a fallback
    />
  );
};

export default Input;
