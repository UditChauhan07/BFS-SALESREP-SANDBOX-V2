import React, { useEffect, useState } from 'react';
import { getCreditNote } from '../../api/creditNote';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../Loading';

function POPUPS({ onProductSelect, onClose }) { // Accept onClose as a prop
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true); // State to manage loading status

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); // Start loading
            try {
                const res = await getCreditNote();
                console.log("res", res);

                if (Array.isArray(res)) {
                    setProducts(res);
                    console.log("products", res);
                }
            } catch (error) {
                console.log('Error', error);
            }
            setLoading(false); // End loading
        };
        fetchProducts();
    }, []);

    const handleProductSelection = (product) => {
        setSelectedProduct(product);
        console.log('Selected Product:', product);
    };

    const handleSubmit = () => {
        if (selectedProduct) {
            onProductSelect(selectedProduct.manufacturers);
        }
    };

    return (
        <>
            {loading ? (
                <Loading /> 
            ) : (
                <form>
                    <div className="heading">
                        <h3>Choose the Retailer</h3>
                    </div>
                    <div className='main-hero-sec'>
                        {products.map((item, index) => (
                            <div className="form-check" key={index}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="productRadio"
                                    id={`product${index}`}
                                    value={item.accountName}
                                    onChange={() => handleProductSelection(item)}
                                />
                                <label className="form-check-label" htmlFor={`product${index}`}>
                                    {item.accountName} 
                                </label>
                                <span className='wallet'>${item.totalWalletAmount} <div className='available'>Available Bal</div> </span>
                                <br /> 
                            </div>
                        ))}

                        <div className="btn">
                            {/* Close the modal when Cancel button is clicked */}
                            <button type="button" className='btn-cancel' onClick={onClose}>Cancel</button>
                            <button type="button" className='btn-submit' onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
}

export default POPUPS;
