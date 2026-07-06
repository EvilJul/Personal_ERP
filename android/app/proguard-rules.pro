# Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.capacitor.** { *; }
-keep class org.chromium.** { *; }

# WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# General
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
