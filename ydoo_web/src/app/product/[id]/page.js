"use client";  // ✅ Make this a Client Component

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";  // ✅ Correct import for App Router

const ProductDetail = () => {
  const { id } = useParams();  // ✅ Get the dynamic `id` from the URL
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return; // Ensure the id is available

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError("Product details not found!");
      }
    };

    fetchProductDetails();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{product.title}</h1>
      <img src={product.image} alt={product.title} style={{ width: "200px" }} />
      <p>{product.description}</p>
      <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
      <p><strong>Category:</strong> {product.category}</p>
      <p><strong>Rating:</strong> {product.rating.rate} / 5 (Based on {product.rating.count} reviews)</p>
    </div>
  );
};

export default ProductDetail;
