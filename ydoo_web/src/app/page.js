"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import NavBar from "./components/navBar";
import styles from './page.module.css';
import { FaAngleLeft, FaAngleRight, FaEdit, FaTrashAlt } from "react-icons/fa";

export default function Home() {
  const { token, username, logout } = useContext(AuthContext);
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const totalPages = Math.ceil(20 / limit);
  const [searchId, setSearchId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState(null);
  const categories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  const fetchProductsFromCache = (key) => {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
  };

  const storeProductsInCache = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const clearCache = () => {
    localStorage.clear();
    setProducts([]);
    setSearchId("");
    setSelectedCategory("");
    setError(null);
    fetchData();
  };

  const getDeletedProducts = () => {
    const deletedProducts = localStorage.getItem("deletedProducts");
    return deletedProducts ? JSON.parse(deletedProducts) : [];
  };

  const saveDeletedProducts = (deletedProducts) => {
    localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts));
  };

  const deleteProductFromCache = (deletedProductId) => {
    const deletedProducts = getDeletedProducts();

    if (!deletedProducts.includes(deletedProductId)) {
      deletedProducts.push(deletedProductId);
      saveDeletedProducts(deletedProducts);
    }

    categories.forEach((category) => {
      const categoryCacheKey = `category_${category}`;
      const cachedCategoryProducts = fetchProductsFromCache(categoryCacheKey);
      if (cachedCategoryProducts) {
        const updatedCategoryProducts = cachedCategoryProducts.filter(product => product.id !== deletedProductId);
        storeProductsInCache(categoryCacheKey, updatedCategoryProducts);
      }
    });

    const searchCacheKey = `product_${searchId}`;
    const cachedProduct = fetchProductsFromCache(searchCacheKey);
    if (cachedProduct && cachedProduct.id === deletedProductId) {
      localStorage.removeItem(searchCacheKey);
    }

    for (let i = 1; i <= totalPages; i++) {
      const pageCacheKey = `page_${i}`;
      const cachedPageProducts = fetchProductsFromCache(pageCacheKey);
      if (cachedPageProducts) {
        const updatedPageProducts = cachedPageProducts.filter(product => product.id !== deletedProductId);
        storeProductsInCache(pageCacheKey, updatedPageProducts);
      }
    }

    setProducts(prevProducts => prevProducts.filter(product => product.id !== deletedProductId));
  };

  const fetchData = () => {
    let cacheKey = searchId ? `product_${searchId}` : selectedCategory ? `category_${selectedCategory}` : `page_${page}`;
    const cachedProducts = fetchProductsFromCache(cacheKey);

    if (cachedProducts) {
      const deletedProducts = getDeletedProducts();
      const filteredProducts = cachedProducts.filter(product => !deletedProducts.includes(product.id));
      setProducts(filteredProducts);

      if (searchId && selectedCategory && filteredProducts[0]?.category !== selectedCategory) {
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

      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error("Product not found");
          return res.json();
        })
        .then((data) => {
          const fetchedProducts = Array.isArray(data) ? data : [data];
          const deletedProducts = getDeletedProducts();
          const filteredFetchedProducts = fetchedProducts.filter(product => !deletedProducts.includes(product.id));
          
          setProducts(filteredFetchedProducts);
          storeProductsInCache(cacheKey, filteredFetchedProducts);

          if (searchId && selectedCategory && filteredFetchedProducts[0]?.category !== selectedCategory) {
            setError("Product does not belong to the selected category");
          } else {
            setError(null);
          }
        })
        .catch(() => {
          setProducts([]);
          setError("No products found!");
        });
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchId, selectedCategory, page]);

  const handleReset = () => {
    setSearchId("");
    setSelectedCategory("");
    setError(null);
  };

  const handleDeleteProduct = (deletedProductId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
    if (isConfirmed) {
      deleteProductFromCache(deletedProductId);
      fetch(`https://fakestoreapi.com/products/${deletedProductId}`, {
        method: 'DELETE',
      })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      });
    } else {
      console.log("Deletion canceled");
    }
  };

  const handleEditProduct = (product) => {
    setEditedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editedProduct) {
      fetch(`https://fakestoreapi.com/products/${editedProduct.id}`, {
        method: "PUT",
        body: JSON.stringify(editedProduct),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.json())
      .then((updatedProduct) => {
        setProducts(prevProducts => prevProducts.map(product => product.id === updatedProduct.id ? updatedProduct : product));
        setIsEditModalOpen(false);
      })
      .catch((error) => {
        console.error("Error updating product:", error);
      });
    }
  };

  const handleSaveNewProduct = () => {
    // Ensure price is a number
    const price = parseFloat(newProduct.price);
    if (isNaN(price)) {
      alert("Please enter a valid price.");
      return;
    }
  
    const newProductWithPrice = { ...newProduct, price };
    // Proceed with adding the product
    fetch("https://fakestoreapi.com/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProductWithPrice),
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts([...displayedProducts, data]);
        setNewProduct({ title: "", price: "", category: "", image: "" });
        setIsAddModalOpen(false);
      });
  };  

  let displayedProducts = [];
  if (error === "Product does not belong to the selected category") {
    displayedProducts = [];
  } else {
    displayedProducts = searchId || selectedCategory ? products : products.slice(-limit);
  }

  return (
    <div style={{ textAlign: "center"}}>
      <NavBar/>
      <div className={styles.productControls}>
        <div className={styles.categorySearchContainer}>
          <div className={styles.categoryButtons}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className={styles.searchSection}>
            <input
              type="number"
              min="1"
              placeholder="Search by Product ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className={styles.searchInput}
            />
            {(searchId || selectedCategory) && (
              <button onClick={handleReset} className={styles.resetButton}>Reset</button>
            )}
          </div>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      
      <div className={styles.actionButtons}>
        {token && (
          <button 
            onClick={handleAddProduct} 
            className={styles.actionButton}
          >
            Add Item
          </button>
        )}
      </div>

      <div className={styles.productGridWrapper}>
        {!(searchId || selectedCategory) && (
          <>
            <button
              className={styles.leftArrow}
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <FaAngleLeft />
            </button>

            <button
              className={styles.rightArrow}
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
            >
              <FaAngleRight />
            </button>
          </>
        )}

        <div className={styles.productGrid}>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                {product.discount && (
                  <span className={styles.discountBadge}>{product.discount}%</span>
                )}
                <img
                  onClick={() => router.push(`/product/${product.id}`)}
                  src={product.image}
                  alt={product.title}
                  className={styles.productImage}
                />
                <div className={styles.productDetails}>
                  <p className={styles.productCategory}>{product.category}</p>
                  <h3 className={styles.productTitle}>{product.title}</h3>
                  <p className={styles.productPrice}>
                    <strong>{product.price.toFixed(2)} $</strong>
                  </p>
                  {product.originalPrice && (
                    <p className={styles.originalPrice}>{product.originalPrice.toFixed(2)} $</p>
                  )}
                </div>

                {/* Edit and Delete buttons for each product */}
                {token && (
                  <div className={styles.productActions}>
                    <button onClick={() => handleEditProduct(product)} className={styles.editButton}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className={styles.deleteButton}>
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noProducts}>No products found!</p>
          )}
        </div>
      </div>
      <div className={styles.footer}>
        <p>© 2025 Maroua Sedoud. All rights reserved.</p>
        <button onClick={clearCache} className={styles.actionButton}>Clear Cached Data</button>
      </div>

      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Edit Product</h3>
            <input
              type="text"
              value={editedProduct?.title || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
              placeholder="Title"
              className={styles.inputField}
            />
            <input
              type="number"
              min="0"
              value={editedProduct?.price || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
              placeholder="Price"
              className={styles.inputField}
            />
            <select
              value={editedProduct?.category || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              className={styles.inputField}
            >
              <option value="electronics">electronics</option>
              <option value="jewelery">jewelery</option>
              <option value="men's clothing">men's clothing</option>
              <option value="women's clothing">women's clothing</option>
            </select>
            <input
              type="text"
              value={editedProduct?.description || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              placeholder="Description"
              className={styles.inputField}
            />
            <input
              type="text"
              value={editedProduct?.image || ""}
              onChange={(e) => setEditedProduct({ ...editedProduct, image: e.target.value })}
              placeholder="Image URL"
              className={styles.inputField}
            />
            
            {/* Button Container for Save & Cancel */}
            <div className={styles.buttonContainer}>
              <button onClick={handleSaveEdit} className={styles.saveBtn}>
                Save Changes
              </button>
              <button onClick={() => setIsEditModalOpen(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Add New Product</h3>
            <input
              type="text"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              placeholder="Title"
              className={styles.inputField}
            />
            <input
              type="number"
              min="0"
              value={newProduct.price}
              placeholder="Price"
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className={styles.inputField}
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              className={styles.inputField}
            >
              <option value="electronics">electronics</option>
              <option value="jewelery">jewelery</option>
              <option value="men's clothing">men's clothing</option>
              <option value="women's clothing">women's clothing</option>
            </select>
            <input
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Description"
              className={styles.inputField}
            />
            <input
              type="text"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              placeholder="Image URL"
              className={styles.inputField}
            />
            
            {/* Button Container for Save & Cancel */}
            <div className={styles.buttonContainer}>
              <button onClick={handleSaveNewProduct} className={styles.saveBtn}>
                Save
              </button>
              <button onClick={() => setIsAddModalOpen(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
