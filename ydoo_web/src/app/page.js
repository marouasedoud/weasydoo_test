"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { token, username, logout } = useContext(AuthContext);
  const router = useRouter();

  const [products, setProducts] = useState([]); // Stores all fetched products
  const [page, setPage] = useState(1);
  const limit = 5; // Fixed limit per page

  const totalPages = Math.ceil(20 / limit); // 20 total products

  // Check if the products for the current page are in the localStorage
  const fetchProductsFromCache = (page) => {
    const cachedData = localStorage.getItem(`products_page_${page}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  };

  // Store fetched products in localStorage to prevent re-fetching
  const storeProductsInCache = (page, data) => {
    localStorage.setItem(`products_page_${page}`, JSON.stringify(data));
  };

  // Fetch products on page change
  useEffect(() => {
    const cachedProducts = fetchProductsFromCache(page);
    
    if (cachedProducts) {
      // If cached data exists, set it directly
      setProducts(cachedProducts);
    } else {
      // Otherwise, fetch from the API and cache the result
      fetch(`https://fakestoreapi.com/products?limit=${limit * page}`)
        .then((res) => res.json())
        .then((data) => {
          setProducts(data);
          storeProductsInCache(page, data); // Store in cache
        })
        .catch((error) => console.error("Error fetching products:", error));
    }
  }, [page]);

  // Display only the last 5 of fetched data
  const displayedProducts = products.slice(-limit); 

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Navbar */}
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

      {/* Product Table */}
      <table style={{ width: "80%", margin: "20px auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Image</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Title</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Price</th>
            <th style={{ border: "1px solid #ddd", padding: "10px" }}>Category</th>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Buttons */}
      <div>
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page <= 1}
          style={{ marginRight: "10px" }}
        >
          Previous
        </button>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
