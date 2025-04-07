import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProductDetail = () => {
  const route = useRoute();
  const { id } = route.params;
  const [product, setProduct] = useState(null);

  const fetchProductsFromCache = async (key) => {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error("Failed to fetch from AsyncStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProductDetails = async () => {
      const cacheKey = `product_${id}`;
      const cachedProduct = await fetchProductsFromCache(cacheKey);
      setProduct(cachedProduct);
    };

    fetchProductDetails();
  }, [id]);

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const renderStars = (rating) => {
    const filledStars = Math.round(rating);
    const halfStars = rating - filledStars >= 0.5 ? 1 : 0;
    const emptyStars = 5 - filledStars - halfStars;

    return (
      <View style={styles.starsContainer}>
        {[...Array(filledStars)].map((_, i) => (
          <AntDesign
            key={`filled-${i}`}
            name="star"
            size={20}
            color="#f5b50a"
            style={styles.star}
          />
        ))}
        {[...Array(halfStars)].map((_, i) => (
          <AntDesign
            key={`half-${i}`}
            name="staro"
            size={20}
            color="#f5b50a"
            style={styles.star}
          />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <AntDesign
            key={`empty-${i}`}
            name="staro"
            size={20}
            color="#f5b50a"
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView>
      {/* Optional Custom NavBar */}
      {/* <NavBar /> */}

      <View style={styles.container}>
        <View style={styles.leftColumn}>
          <Text style={styles.productName}>{product.title}</Text>
          <Text style={styles.category}>{product.category}</Text>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.ratingSection}>
            {renderStars(product.rating.rate)}
            <Text style={styles.reviewInfo}>
              ({product.rating.rate} - {product.rating.count} reviews)
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    flexDirection: "column",
  },
  leftColumn: {
    alignItems: "center",
    marginBottom: 20,
  },
  rightColumn: {
    paddingHorizontal: 10,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
  },
  category: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
  },
  productImage: {
    height: 200,
    width: "100%",
    borderRadius: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    flexWrap: "wrap",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    marginRight: 4,
  },
  reviewInfo: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductDetail;
