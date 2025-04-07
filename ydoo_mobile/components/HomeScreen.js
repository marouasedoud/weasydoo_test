import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

export default function HomeScreen() {
  const [searchId, setSearchId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

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
        // Try fallback to just product by ID if not stored under other keys
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
      
      // Also store individual product data
      if (Array.isArray(data)) {
        data.forEach(product => {
          AsyncStorage.setItem(`product_${product.id}`, JSON.stringify(product));
        });
      } else if (data?.id) {
        AsyncStorage.setItem(`product_${data.id}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error storing data in cache:", error);
    }
  };

  const fetchData = async () => {
    let cacheKey = searchId ? `product_${searchId}` : selectedCategory ? `category_${selectedCategory}` : `page_1`;

    const cachedProducts = await fetchProductsFromCache(cacheKey);
    if (cachedProducts) {
      const deletedProducts = await getDeletedProducts();
      const filteredProducts = Array.isArray(cachedProducts) ? cachedProducts : [cachedProducts];
      const finalProducts = filteredProducts.filter(product => !deletedProducts.includes(product.id));
      setProducts(finalProducts);

      if (searchId && selectedCategory && finalProducts[0]?.category !== selectedCategory) {
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
        url = `https://fakestoreapi.com/products?limit=10`; // Use pagination if needed
      }

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        const fetchedProducts = Array.isArray(data) ? data : [data];
        const deletedProducts = await getDeletedProducts();
        const filteredFetchedProducts = fetchedProducts.filter(product => !deletedProducts.includes(product.id));

        setProducts(filteredFetchedProducts);
        storeProductsInCache(cacheKey, filteredFetchedProducts);

        if (searchId && selectedCategory && filteredFetchedProducts[0]?.category !== selectedCategory) {
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
  }, [searchId, selectedCategory]);

  const limit = 10;
  let displayedProducts = [];
  if (error === "Product does not belong to the selected category") {
    displayedProducts = [];
  } else {
    displayedProducts = searchId || selectedCategory ? products : products.slice(-limit);
  }

  return (
    <View style={styles.container}>
      <View style={styles.categorySearchContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.categoryButtons}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleCategorySelect(category)}
                style={[styles.categoryButton, selectedCategory === category && styles.active]}
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
              <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {error && <Text style={styles.errorMessage}>{error}</Text>}

      <View>
        {displayedProducts.map(product => (
          <Text key={product.id}>{product.title}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  categorySearchContainer: {
    width: '100%',
    maxWidth: 1200,
    marginBottom: 20,
  },
  scrollView: {
    paddingBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#036',
    borderRadius: 8,
    cursor: 'pointer',
  },
  active: {
    backgroundColor: '#2563EB',
    color: 'white',
  },
  categoryButtonText: {
    color: '#036',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 250,
  },
  resetButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#036',
  },
  errorMessage: {
    color: '#f44336',
    fontSize: 14,
  },
});
