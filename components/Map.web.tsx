import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

import { useFetch } from "@/lib/fetch";
import { calculateRegion } from "@/lib/map";
import { useLocationStore } from "@/store";
import { Driver } from "@/types/type";

const mapsApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const { loading, error } = useFetch<Driver[]>("/(api)/driver");

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Erro: {error}</Text>
      </View>
    );

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  const lat = region.latitude;
  const lng = region.longitude;
  const zoom = destinationLatitude ? 12 : 14;

  const src = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${mapsApiKey}&center=${lat},${lng}&zoom=${zoom}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik`;

  return (
    <View style={{ flex: 1, width: "100%", height: "100%" }}>
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none", borderRadius: 16 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </View>
  );
};

export default Map;
