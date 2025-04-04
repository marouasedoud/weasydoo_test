"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./ProductDetail.module.css";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import NavBar from "../../components/navBar";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const renderStars = (rating) => {
    const filledStars = Math.round(rating);
    const halfStars = rating - filledStars >= 0.5 ? 1 : 0;
    const emptyStars = 5 - filledStars - halfStars;

    return (
      <>
        {[...Array(filledStars)].map((_, i) => (
          <AiFillStar key={`filled-${i}`} className={styles.stars} />
        ))}
        {[...Array(halfStars)].map((_, i) => (
          <AiOutlineStar key={`half-${i}`} className={styles.stars} />
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <AiOutlineStar key={`empty-${i}`} className={styles.stars} />
        ))}
      </>
    );
  };

  return (
    <div>
      <NavBar />
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h1 className={styles.productName}>{product.title}</h1>
          <div className={styles.category}>{product.category}</div>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
          />
        </div>

        <div className={styles.rightColumn}>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.ratingSection}>
            {renderStars(product.rating.rate)}
            <span className={styles.reviewInfo}>
              ({product.rating.rate} - {product.rating.count} reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
