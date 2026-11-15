import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import CustomButton from "@/components/CustomButton";
import { onboarding } from "@/constants";

const Home = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;

  return (
    <SafeAreaView style={styles.screen}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => router.replace("/(auth)/sign-up")}
        style={styles.skip}
      >
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <View style={styles.carousel}>
        <Swiper
          ref={swiperRef}
          loop={false}
          dot={<View style={styles.dot} />}
          activeDot={<View style={[styles.dot, styles.activeDot]} />}
          paginationStyle={styles.pagination}
          onIndexChanged={setActiveIndex}
        >
          {onboarding.map((item) => (
            <ScrollView
              key={item.id}
              style={styles.slide}
              contentContainerStyle={styles.slideContent}
              showsVerticalScrollIndicator={false}
            >
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </ScrollView>
          ))}
        </Swiper>
      </View>

      <View style={styles.footer}>
        <CustomButton
          title={isLastSlide ? "Começar" : "Próximo"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, width: "100%", backgroundColor: "#fff" },
  skip: { alignSelf: "flex-end", paddingHorizontal: 24, paddingVertical: 20 },
  skipText: { color: "#000", fontSize: 16, fontFamily: "Jakarta-Bold" },
  carousel: { flex: 1, minHeight: 0, width: "100%" },
  slide: { flex: 1, width: "100%" },
  slideContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  image: { width: "100%", maxWidth: 480, height: 300, flexShrink: 0 },
  title: {
    width: "100%",
    maxWidth: 480,
    marginTop: 32,
    color: "#000",
    fontSize: 28,
    lineHeight: 36,
    fontFamily: "Jakarta-Bold",
    textAlign: "center",
  },
  description: {
    width: "100%",
    maxWidth: 440,
    marginTop: 12,
    color: "#858585",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Jakarta-SemiBold",
    textAlign: "center",
  },
  dot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  activeDot: { backgroundColor: "#0286FF" },
  pagination: { bottom: 20 },
  footer: {
    width: "100%",
    maxWidth: 528,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
});

export default Home;
