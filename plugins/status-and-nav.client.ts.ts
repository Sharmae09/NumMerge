import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export default defineNuxtPlugin(() => {
  if (Capacitor.getPlatform() !== "android") return;

  // Ensure StatusBar doesn't overlay the WebView
  StatusBar.setOverlaysWebView({ overlay: false });

  // Set color and style
  StatusBar.setBackgroundColor({ color: "#0E1323" });
  StatusBar.setStyle({ style: Style.Dark });

  // NavigationBar
  const NavigationBar = (window as any).Capacitor?.Plugins?.NavigationBar;
  if (NavigationBar) {
    NavigationBar.setColor({ color: "#0E1323" });
    NavigationBar.setBackgroundColor({ color: "#0E1323" });
    NavigationBar.setNavigationBarStyle({ style: "dark" });
  }
});
