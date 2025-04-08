// AddProductModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const AddProductModal = ({ visible, onClose, onSave }) => {
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "electronics",
    description: "",
    image: "",
  });

  const handleSave = () => {
    const price = parseFloat(newProduct.price);
    if (isNaN(price)) {
      Alert.alert("Invalid Input", "Please enter a valid price.");
      return;
    }

    const newProductWithPrice = { ...newProduct, price };

    fetch("https://fakestoreapi.com/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProductWithPrice),
    })
      .then((res) => res.json())
      .then((data) => {
        onSave(data);
        setNewProduct({
          title: "",
          price: "",
          category: "",
          description: "",
          image: "",
        });
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
          <Text style={styles.modalTitle}>Add New Product</Text>

          <TextInput
            placeholder="Title"
            value={newProduct.title}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, title: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Price"
            keyboardType="numeric"
            value={newProduct.price}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, price: text })
            }
            style={styles.input}
          />
          <Picker
            selectedValue={newProduct.category}
            onValueChange={(itemValue) =>
              setNewProduct({ ...newProduct, category: itemValue })
            }
            style={styles.input}
          >
            <Picker.Item label="electronics" value="electronics" />
            <Picker.Item label="jewelery" value="jewelery" />
            <Picker.Item label="men's clothing" value="men's clothing" />
            <Picker.Item label="women's clothing" value="women's clothing" />
          </Picker>
          <TextInput
            placeholder="Description"
            value={newProduct.description}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, description: text })
            }
            style={styles.input}
          />
          <TextInput
            placeholder="Image URL"
            value={newProduct.image}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, image: text })
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
  container: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
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

export default AddProductModal;
