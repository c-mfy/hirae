export default {
  expo: {
    name: "hirae-app",
    slug: "hirae-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "hiraeapp",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      bundleIdentifier: "com.xinyu.hirae",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
  package: "com.xinyu.hirae",
  predictiveBackGestureEnabled: false,
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png"
  }
},
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76
        }
      ],
      "@rnmapbox/maps",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Hirae uses your location to reveal the map as you explore.",
          locationWhenInUsePermission: "Hirae uses your location to reveal the map as you explore.",
          isAndroidBackgroundLocationEnabled: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      eas: {
        projectId: "4f53f7a4-899e-4e68-b118-13fcd4c52045"
      }
    }
  }
};