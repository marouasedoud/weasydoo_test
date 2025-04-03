"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
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

  const fetchProductsFromCache = (key) => {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
  };

  const storeProductsInCache = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    let cacheKey = searchId ? `product_${searchId}` : selectedCategory ? `category_${selectedCategory}` : `page_${page}`;
    const cachedProducts = fetchProductsFromCache(cacheKey);
  
    if (cachedProducts) {
      setProducts(cachedProducts);
      if (searchId && selectedCategory && cachedProducts[0]?.category !== selectedCategory) {
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
          setProducts(fetchedProducts);
          storeProductsInCache(cacheKey, fetchedProducts);
  
          // Check category mismatch case
          if (searchId && selectedCategory && fetchedProducts[0]?.category !== selectedCategory) {
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
  }, [searchId, selectedCategory, page]);  

  const handleReset = () => {
    setSearchId("");
    setSelectedCategory("");
    setError(null);
  };

  let displayedProducts = [];
  if (error === "Product does not belong to the selected category") {
    displayedProducts = []; // Ensure no product is displayed
  } else {
    displayedProducts = searchId || selectedCategory ? products : products.slice(-limit);
  }
  
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #ddd" }}>
        <img src="/Weasydoo.png" alt="Weasydoo Logo" style={{ height: "40px" }} />
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
    </div>
  );
}