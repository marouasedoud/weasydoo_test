import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

const EditProductModal = ({ visible, onClose, onSave, product }) => {
  const [editedProduct, setEditedProduct] = useState({
    title: "",
    price: "",
    category: "electronics",
    description: "",
    image: "",
  });

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const categories = [
    { label: "electronics", value: "electronics" },
    { label: "jewelery", value: "jewelery" },
    { label: "men's clothing", value: "men's clothing" },
    { label: "women's clothing", value: "women's clothing" },
  ];

  useEffect(() => {
    if (product) {
      setEditedProduct({
        title: product.title,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        image: product.image,
      });
    }
  }, [product]);

  const handleSave = () => {
    const price = parseFloat(editedProduct.price);
    if (isNaN(price)) {
      Alert.alert("Invalid Input", "Please enter a valid price.");
      return;
    }

    const updatedProduct = { ...editedProduct, price };

    fetch(`https://fakestoreapi.com/products/${product.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    })
      .then((res) => res.json())
      .then((data) => {
        onSave(data);
        onClose();
      })
      .catch(() => {
        Alert.alert("Error", "Failed to save product");
      });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Product</Text>

          <TextInput
            placeholder="Title"
            value={editedProduct.title}
            onChangeText={(text) =>
              setEditedProduct({ ...editedProduct, title: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            value={editedProduct.price}
            onChangeText={(text) =>
              setEditedProduct({ ...editedProduct, price: text })
            }
            style={styles.input}
          />

          {/* Category Picker */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.inputText}>
              {editedProduct.category
                ? editedProduct.category
                : "Select Category"}
            </Text>
          </TouchableOpacity>

          {/* Category Options Modal */}
          <Modal visible={categoryModalVisible} transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    onPress={() => {
                      setEditedProduct({
                        ...editedProduct,
                        category: category.value,
                      });
                      setCategoryModalVisible(false);
                    }}
                    style={styles.option}
                  >
                    <Text style={styles.optionText}>{category.label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => setCategoryModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TextInput
            placeholder="Description"
            value={editedProduct.description}
            onChangeText={(text) =>
              setEditedProduct({ ...editedProduct, description: text })
            }
            style={styles.input}
            multiline={true}
          />
          <TextInput
            placeholder="Image URL"
            value={editedProduct.image}
            onChangeText={(text) =>
              setEditedProduct({ ...editedProduct, image: text })
            }
            style={styles.input}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  inputText: {
    color: "#333",
  },
  option: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  saveBtn: {
    backgroundColor: "#007BFF",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 5,
  },
  cancelBtn: {
    backgroundColor: "#F8D7DA",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 5,
  },
  btnText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});

export default EditProductModal;
