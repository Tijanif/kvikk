import { Platform } from "react-native"

const isWeb = Platform.OS === "web"

export const log = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args)

    if (!isWeb) {
      // For native platforms, we'll use Alert for critical logs
      // You might want to replace this with a more sophisticated logging solution in the future
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Debug Log",
          args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg.toString())).join("\n"),
        )
      })
    }
  }
}