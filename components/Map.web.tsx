import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useLocationStore } from "@/store";

// Only use Google when a key configured for Maps Embed API is provided.
const mapsEmbedApiKey = process.env.EXPO_PUBLIC_MAPS_EMBED_API_KEY;

const Map = () => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  if (userLatitude == null || userLongitude == null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  const hasDestination =
    destinationLatitude != null && destinationLongitude != null;
  const latitude = hasDestination
    ? (userLatitude + destinationLatitude) / 2
    : userLatitude;
  const longitude = hasDestination
    ? (userLongitude + destinationLongitude) / 2
    : userLongitude;
  const latitudePadding = hasDestination
    ? Math.max(Math.abs(userLatitude - destinationLatitude) * 0.65, 0.01)
    : 0.01;
  const longitudePadding = hasDestination
    ? Math.max(Math.abs(userLongitude - destinationLongitude) * 0.65, 0.01)
    : 0.01;
  const bbox = [
    Math.max(-180, longitude - longitudePadding),
    Math.max(-85, latitude - latitudePadding),
    Math.min(180, longitude + longitudePadding),
    Math.min(85, latitude + latitudePadding),
  ].join(",");
  const marker = `${userLatitude},${userLongitude}`;
  const mapSrc = mapsEmbedApiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(mapsEmbedApiKey)}&center=${latitude},${longitude}&zoom=${hasDestination ? 12 : 14}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: "none", display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa da sua localização"
      />
    </View>
  );
};

export default Map;
