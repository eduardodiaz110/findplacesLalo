import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  Text,
} from "react-native";
import Swiper from "react-native-swiper";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

interface PlaceType {
  id: string;
  placeId: string;
  name: string;
  photos: string[];
}

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [places, setPlaces] = useState<PlaceType[]>([]);

  useEffect(() => {
    console.log("places", places);
  }, [places]);

  const Foods = [
    {
      id: "1",
      uri: "https://www.celestronmexico.com/wp-content/uploads/2016/08/dummy-prod-1.jpg",
    },
    {
      id: "2",
      uri: "https://www.celestronmexico.com/wp-content/uploads/2016/08/dummy-prod-1.jpg",
    },
    {
      id: "3",
      uri: "https://www.celestronmexico.com/wp-content/uploads/2016/08/dummy-prod-1.jpg",
    },
    {
      id: "4",
      uri: "https://www.celestronmexico.com/wp-content/uploads/2016/08/dummy-prod-1.jpg",
    },
    {
      id: "5",
      uri: "https://www.celestronmexico.com/wp-content/uploads/2016/08/dummy-prod-1.jpg",
    },
  ];
  const [restaurants, setRestaurants] = useState<any>([]);

  useEffect(() => {
    fetch(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=25.770382,-100.459767&radius=50000&type=park&key=AIzaSyDAn7dhymK_Z0T33cpQO47quiBl7i2f-kM"
    )
      .then((response) => response.json())
      .then((data) => {
        const newRestaurants = data.results
          .filter(
            (restaurant: any) =>
              restaurant.photos && restaurant.photos.length > 0
          )
          .map((restaurant: any, index: string) => {
            const placeInfo = fetch(
              "https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
                restaurant.place_id +
                "&key=AIzaSyDAn7dhymK_Z0T33cpQO47quiBl7i2f-kM"
            )
              .then((response) => response.json())
              .then((data) => {
                const photoUris = data.result.photos.map((item: any) => {
                  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${item.photo_reference}&key=AIzaSyDAn7dhymK_Z0T33cpQO47quiBl7i2f-kM`;
                });
                const place = {
                  id: String(index),
                  placeId: restaurant.place_id,
                  name: restaurant.name,
                  photos: photoUris,
                };
                setPlaces((prevPlaces) => [...prevPlaces, place]);
              });

            const photoUris = restaurant.photos.map(
              (photo: any) =>
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=AIzaSyDAn7dhymK_Z0T33cpQO47quiBl7i2f-kM`
            );
            return {
              id: String(index),
              placeId: restaurant.place_id,
              name: restaurant.name,
              photos: photoUris,
            };
          });
        setRestaurants(newRestaurants);
      })
      .catch((error) => {
        console.error("There was an error fetching the restaurants: ", error);
      });
  }, []);

  const position = new Animated.ValueXY();
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  const rotateAndTranslate = {
    transform: [
      {
        rotate: rotate,
      },
      ...position.getTranslateTransform(),
    ],
  };
  const likeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: "clamp",
  });
  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: "clamp",
  });
  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: "clamp",
  });
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 120) {
        Animated.spring(position, {
          toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
          useNativeDriver: false, // Added this line
        }).start(() => {
          setCurrentIndex((prevIndex) => prevIndex + 1);
          position.setValue({ x: 0, y: 0 });
        });
      } else if (gestureState.dx < -120) {
        Animated.spring(position, {
          toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
          useNativeDriver: false, // Added this line
        }).start(() => {
          setCurrentIndex((prevIndex) => prevIndex + 1);
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false, // Added this line
        }).start();
      }
    },
  });

  const renderFoods = () => {
    return places
      .map((item, i) => {
        if (i < currentIndex) {
          return null;
        } else if (i == currentIndex) {
          return (
            <Animated.View
              {...panResponder.panHandlers}
              key={i}
              style={[
                rotateAndTranslate,
                {
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: "absolute",
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: likeOpacity,
                  transform: [{ rotate: "-30deg" }],
                  position: "absolute",
                  top: 50,
                  left: 40,
                  zIndex: 1000,
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    borderColor: "green",
                    color: "green",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10,
                  }}
                >
                  LIKE
                </Text>
              </Animated.View>
              <Animated.View
                style={{
                  opacity: nopeOpacity,
                  transform: [{ rotate: "30deg" }],
                  position: "absolute",
                  top: 50,
                  right: 40,
                  zIndex: 1000,
                }}
              >
                <Text
                  style={{
                    borderWidth: 1,
                    borderColor: "red",
                    color: "red",
                    fontSize: 32,
                    fontWeight: "800",
                    padding: 10,
                  }}
                >
                  NOPE
                </Text>
              </Animated.View>
              {/* <Image
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20,
                }}
                source={{ uri: p }}
              /> */}
              <Swiper style={{ borderRadius: 20 }} showsButtons={true}>
                {item.photos.map((photoUri, index) => (
                  <Image
                    key={index}
                    style={{
                      flex: 1,
                      height: null,
                      width: null,
                      resizeMode: "cover",
                      borderRadius: 20,
                    }}
                    source={{ uri: photoUri }}
                  />
                ))}
              </Swiper>
              <Text
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  color: "white",
                  fontSize: 24,
                  fontWeight: "bold",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: 5,
                  borderRadius: 5,
                }}
              >
                {item.name}
              </Text>
            </Animated.View>
          );
        } else {
          return (
            <Animated.View
              key={i}
              style={[
                {
                  opacity: nextCardOpacity,
                  transform: [{ scale: nextCardScale }],
                  height: SCREEN_HEIGHT - 120,
                  width: SCREEN_WIDTH,
                  padding: 10,
                  position: "absolute",
                },
              ]}
            >
              {/* <Image
                style={{
                  flex: 1,
                  height: null,
                  width: null,
                  resizeMode: "cover",
                  borderRadius: 20,
                }}
                source={{ uri: item.uri }}
              /> */}
              <Swiper style={{ borderRadius: 20 }} showsButtons={true}>
                {item.photos.map((photoUri, index) => (
                  <Image
                    key={index}
                    style={{
                      flex: 1,
                      height: null,
                      width: null,
                      resizeMode: "cover",
                      borderRadius: 20,
                    }}
                    source={{ uri: photoUri }}
                  />
                ))}
              </Swiper>
            </Animated.View>
          );
        }
      })
      .reverse();

    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }} />
        <View style={{ flex: 1 }}>{renderFoods()}</View>
        <View style={{ height: 60 }} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 60 }} />
      <View style={{ flex: 1 }}>{renderFoods()}</View>
      {/* <Text>{JSON.stringify(restaurants)}</Text> */}

      <View style={{ height: 60 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
