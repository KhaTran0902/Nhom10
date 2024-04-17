import React, { useEffect, useState } from "react";
import { Select, Button } from "antd";
import productApi from "../../apis/productApi";
import "./comparing.css"; 

const { Option } = Select;

const CompareProducts = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productDetails, setProductDetails] = useState([]);
    const [comparisonResult, setComparisonResult] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productApi.getListProducts({ page: 1, limit: 10 });
                setProducts(response.data.docs);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };
        fetchProducts();
    }, []);

    const fetchProductDetail = async (productId) => {
        try {
            const productDetail = await productApi.getDetailProduct(productId);
            return productDetail.product;
        } catch (error) {
            console.error("Failed to fetch product detail:", error);
            return null;
        }
    };

    const handleProductChange = async (value, index) => {
        try {
            const productDetail = await fetchProductDetail(value);
            if (productDetail) {
                setSelectedProducts(prevSelected => [...prevSelected.slice(0, index), value]);
                setProductDetails(prevDetails => [...prevDetails.slice(0, index), productDetail]);
            }
        } catch (error) {
            console.error("Failed to fetch product detail:", error);
        }
    };

    const handleCompare = () => {
        if (selectedProducts.length === 2) {
            const attributesToCompare = ["price", "promotion", "quantity"];
            let comparisonText = "";
            attributesToCompare.forEach(attribute => {
                const value1 = productDetails[0][attribute];
                const value2 = productDetails[1][attribute];
                if (value1 > value2) {
                    comparisonText += `${productDetails[0].name}'s ${attribute} lớn hơn của ${productDetails[1].name}\n`;
                } else if (value1 < value2) {
                    comparisonText += `${productDetails[1].name}'s ${attribute} lớn hơn của ${productDetails[0].name}\n`;
                } else {
                    comparisonText += `${attribute} của ${productDetails[0].name} và ${productDetails[1].name} bằng nhau\n`;
                }
            });
            setComparisonResult(comparisonText);
        }
    };

    return (
        <div className="compare-container">
            <div className="select-boxes">
                <Select
                    className="select-box"
                    placeholder="Chọn sản phẩm thứ nhất"
                    onChange={(value) => handleProductChange(value, 0)}
                >
                    {products.map((product) => (
                        <Option key={product._id} value={product._id}>
                            {product.name}
                        </Option>
                    ))}
                </Select>
                <Select
                    className="select-box"
                    placeholder="Chọn sản phẩm thứ hai"
                    onChange={(value) => handleProductChange(value, 1)}
                >
                    {products.map((product) => (
                        <Option key={product._id} value={product._id}>
                            {product.name}
                        </Option>
                    ))}
                </Select>
            </div>
            {selectedProducts.length === 2 && (
                <div className="compare-button">
                    <Button onClick={handleCompare}>So sánh</Button>
                </div>
            )}
            {comparisonResult && (
                <div className="comparison-result">
                    <h2>Kết quả so sánh</h2>
                    <pre>{comparisonResult}</pre>
                </div>
            )}
        </div>
    );
};

export default CompareProducts;
