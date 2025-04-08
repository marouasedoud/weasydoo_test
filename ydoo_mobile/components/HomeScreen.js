import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";

const categories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

export default function HomeScreen({ navigation, token }) {
  const [searchId, setSearchId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 5;
  const totalPages = Math.ceil(20 / limit);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleReset = () => {
    setSearchId("");
    setSelectedCategory("");
    setError(null);
  };

  const fetchProductsFromCache = async (key) => {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (!cachedData && key.startsWith("product_")) {
        const id = key.split("_")[1];
        const productData = await AsyncStorage.getItem(`product_${id}`);
        return productData ? JSON.parse(productData) : null;
      }
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error("Error fetching data from cache:", error);
      return null;
    }
  };

  const getDeletedProducts = async () => {
    try {
      const deletedProducts = await AsyncStorage.getItem("deletedProducts");
      return deletedProducts ? JSON.parse(deletedProducts) : [];
    } catch (error) {
      console.error("Error fetching deleted products:", error);
      return [];
    }
  };

  const storeProductsInCache = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      if (Array.isArray(data)) {
        data.forEach((product) => {
          AsyncStorage.setItem(
            `product_${product.id}`,
            JSON.stringify(product)
          );
        });
      } else if (data?.id) {
        AsyncStorage.setItem(`product_${data.id}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error storing data in cache:", error);
    }
  };

  const fetchData = async () => {
    let cacheKey = searchId
      ? `product_${searchId}`
      : selectedCategory
      ? `category_${selectedCategory}`
      : `page_${page}`;

    const cachedProducts = await fetchProductsFromCache(cacheKey);
    if (cachedProducts) {
      const deletedProducts = await getDeletedProducts();
      const filteredProducts = Array.isArray(cachedProducts)
        ? cachedProducts
        : [cachedProducts];
      const finalProducts = filteredProducts.filter(
        (product) => !deletedProducts.includes(product.id)
      );
      setProducts(finalProducts);

      if (
        searchId &&
        selectedCategory &&
        finalProducts[0]?.category !== selectedCategory
      ) {
        setError("Product does not belong to the selected category");
      } else {
        setError(null);
      }
    } else {
      let url = "";
      if (searchId) {
        url = `https://fakestoreapi.com/products/${searchId}`;
      } else if (selectedCategory) {
        url = `https://fakestoreapi.com/products/category/${selectedCategory}`;
      } else {
        url = `https://fakestoreapi.com/products?limit=${limit * page}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        const fetchedProducts = Array.isArray(data) ? data : [data];
        const deletedProducts = await getDeletedProducts();
        const filteredFetchedProducts = fetchedProducts.filter(
          (product) => !deletedProducts.includes(product.id)
        );

        setProducts(filteredFetchedProducts);
        storeProductsInCache(cacheKey, filteredFetchedProducts);

        if (
          searchId &&
          selectedCategory &&
          filteredFetchedProducts[0]?.category !== selectedCategory
        ) {
          setError("Product does not belong to the selected category");
        } else {
          setError(null);
        }
      } catch (error) {
        setProducts([]);
        setError("No products found!");
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchId, selectedCategory, page]);

  let displayedProducts = [];
  if (error === "Product does not belong to the selected category") {
    displayedProducts = [];
  } else {
    displayedProducts =
      searchId || selectedCategory ? products : products.slice(-limit);
  }

  const clearCache = async () => {
    try {
      await AsyncStorage.clear(); // Clear all stored data
      setProducts([]);
      setSearchId("");
      setSelectedCategory("");
      setError(null);
      fetchData(); // Re-fetch your data
    } catch (e) {
      console.error("Failed to clear cache", e);
    }
  };

  const handleAddProduct = () => {
    setIsModalVisible(true);
  };

  const handleProductSaved = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  const handleEditProduct = (product) => {
    setIsEditModalOpen(true);
    setUpdatingProduct(product);
  };

  const handleEditProductSaved = (updatedProduct) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    setIsEditModalOpen(false);
  };

  const handleDelete = (productId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            fetch(`https://fakestoreapi.com/products/${productId}`, {
              method: "DELETE",
            })
              .then((res) => res.json())
              .then(() => {
                setProducts((prevProducts) =>
                  prevProducts.filter((product) => product.id !== productId)
                );
              })
              .catch(() => {
                Alert.alert("Error", "Failed to delete product");
              });
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.innerContainer}>
        <View style={styles.categorySearchContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            <View style={styles.categoryButtons}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategorySelect(category)}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.active,
                  ]}
                >
                  <Text style={styles.categoryButtonText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Product ID"
                value={searchId}
                onChangeText={setSearchId}
                keyboardType="numeric"
              />
              {(searchId || selectedCategory) && (
                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.resetButton}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        <View style={styles.AddContainer}>
          {token && (
            <View style={styles.actionButtons}>
              <Button
                title="Add Item"
                onPress={handleAddProduct}
                color="#036"
              />
            </View>
          )}
          <AddProductModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSave={handleProductSaved}
          />
        </View>

        {error && <Text style={styles.errorMessage}>{error}</Text>}

        <View style={styles.productsContainer}>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                {token && (
                  <View style={styles.productActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditProduct(product)}
                    >
                      <FontAwesome name="pencil" size={18} color="#036" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleDelete(product.id)}
                    >
                      <FontAwesome name="trash" size={18} color="#B06347" />
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("Products", {
                      id: product.id,
                    })
                  }
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
                <View style={styles.productDetails}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>
                    {product.price.toFixed(2)} $
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noProducts}>No products found!</Text>
          )}
        </View>

        <EditProductModal
          visible={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditProductSaved}
          product={updatingProduct}
        />

        {!(searchId || selectedCategory) && (
          <>
            <View style={styles.arrowContainer}>
              <TouchableOpacity
                onPress={() => setPage(page - 1)}
                disabled={page <= 1}
                style={[styles.arrowButton, page <= 1 && styles.disabledButton]}
              >
                <FontAwesome
                  name="angle-left"
                  size={50}
                  color={page <= 1 ? "#ddd" : "#036"}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPage(page + 1)}
                disabled={page >= totalPages}
                style={[
                  styles.arrowButton,
                  page >= totalPages && styles.disabledButton,
                ]}
              >
                <FontAwesome
                  name="angle-right"
                  size={50}
                  color={page >= 10 ? "#ddd" : "#036"}
                />
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity onPress={clearCache} style={styles.actionButton}>
              <Text style={styles.buttonText}>Clear Cached Data</Text>
            </TouchableOpacity> */}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  AddContainer: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  scrollView: {
    paddingBottom: 10,
  },
  categoryButtons: {
    flexDirection: "row",
    gap: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#036",
    borderRadius: 8,
  },
  active: {
    backgroundColor: "#2563EB",
    color: "white",
  },
  categoryButtonText: {
    color: "#036",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    width: 250,
  },
  resetButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
  resetButtonText: {
    color: "#036",
  },
  container: {
    flex: 1,
    padding: 5,
  },
  categorySearchContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorMessage: {
    color: "#f44336",
    fontSize: 14,
  },
  productsContainer: {
    flex: 1,
    alignItems: "center", // Align items to the center horizontally
  },
  productCard: {
    width: "100%", // Full width of the container
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    textAlign: "center",
    overflow: "hidden",
    elevation: 5,
  },
  productImageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productDetails: {
    padding: 10,
  },
  productCategory: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  productTitle: {
    fontSize: 14,
    color: "#333",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  noProducts: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  arrowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  arrowButton: {
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButton: {
    backgroundColor: "#ff5c5c",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },

  innerContainer: {
    flexGrow: 1,
  },
  productActions: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    zIndex: 10,
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 50,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // For shadow effect on Android
    marginLeft: 10, // To create gap between buttons (similar to 'gap' in CSS)
  },
});
