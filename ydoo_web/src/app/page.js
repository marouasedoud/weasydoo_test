"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { useRouter } from "next/navigation";

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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #ddd" }}>
        <img src="/Weasydoo.png" alt="Weasydoo Logo" style={{ height: "40px" }} />
        <button onClick={clearCache} style={{ marginBottom: "20px", padding: "8px", backgroundColor: "#f44336", color: "#fff" }}>
          Clear Cached Data
        </button>
        {token ? (
          <div>
            <span style={{ marginRight: "10px" }}>Welcome, {username}!</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={() => router.push("/login")}>Login</button>
        )}
      </nav>
      
      <div style={{ margin: "20px 0" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{ marginRight: "10px", padding: "8px", backgroundColor: selectedCategory === category ? "#ddd" : "#fff" }}
          >
            {category}
          </button>
        ))}
        <input
          type="number"
          min="1"
          placeholder="Search by Product ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        {(searchId || selectedCategory) && (
          <button onClick={handleReset} style={{ padding: "8px" }}>Reset</button>
        )}
      </div>
      {error && <p>{error}</p>}

      {token && <button onClick={handleAddProduct}>+ Add New Product</button>}
      {displayedProducts.length > 0 ? (
        <table style={{ width: "80%", margin: "20px auto", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Image</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Title</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Price</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Category</th>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map((product) => (
              <tr key={product.id}>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <img src={product.image} alt={product.title} style={{ width: "50px" }} />
                </td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{product.title}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>${product.price.toFixed(2)}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>{product.category}</td>
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <button onClick={() => router.push(`/product/${product.id}`)}>View More</button>
                  {token && (
                    <>
                      <button onClick={() => handleEditProduct(product)}>Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !error && <p>No products found!</p>
      )}
      
      {!(searchId || selectedCategory) && (
        <div>
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} style={{ marginRight: "10px" }}>Previous</button>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>Next</button>
        </div>
      )}

      {isEditModalOpen && (
        <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.7)" }}>
          <div style={{ margin: "100px auto", padding: "20px", background: "#fff", width: "80%", maxWidth: "500px" }}>
            <h3>Edit Product</h3>
            <input
              type="text"
              value={editedProduct?.title || ""}
              onChange={(e) => setEditedProduct({...editedProduct, title: e.target.value})}
              placeholder="Title"
            />
            <input
              type="text"
              value={editedProduct?.price || ""}
              onChange={(e) => setEditedProduct({...editedProduct, price: e.target.value})}
              placeholder="Price"
            />
            <input
              type="text"
              value={editedProduct?.category || ""}
              onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
              placeholder="Category"
            />
            <button onClick={handleSaveEdit}>Save Changes</button>
            <button onClick={() => setIsEditModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div style={{ position: "fixed", top: "0", left: "0", width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.7)" }}>
          <div style={{ margin: "100px auto", padding: "20px", background: "#fff", width: "80%", maxWidth: "500px" }}>
            <h3>Add New Product</h3>
            <input
              type="text"
              value={newProduct.title}
              onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
              placeholder="Title"
            />
            <input
              type="text"
              value={newProduct.price}
              placeholder="Price"
              onChange={(e) => setNewProduct({
                ...newProduct,
                price: e.target.value
              })}
            />
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              placeholder="Category"
            />
            <input
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              placeholder="Description"
            />
            <input
              type="text"
              value={newProduct.image}
              onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
              placeholder="Image URL"
            />
            <button onClick={handleSaveNewProduct}>Save New Product</button>
            <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
