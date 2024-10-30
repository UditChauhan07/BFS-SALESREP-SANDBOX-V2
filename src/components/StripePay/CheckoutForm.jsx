import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import Swal from 'sweetalert2';
import { GetAuthData, fetchBeg, salesRepIdKey, OrderPlaced } from '../../lib/store';
import { useBag } from '../../context/BagContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { orderListHandler } from './orderService';

const CheckoutForm = ({ clientSecret, orderDes, PONumber, amount, uniqueId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const { addOrder } = useBag();
    const navigate = useNavigate();
    const [orderStatus, setOrderStatus] = useState({ status: false, message: "" });
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setLoading(true); // Start loading
        const cardNumberElement = elements.getElement(CardNumberElement);
        const cardExpiryElement = elements.getElement(CardExpiryElement);
        const cardCvcElement = elements.getElement(CardCvcElement);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        name: 'Customer Name',
                    },
                },
            });

            if (error) {
                console.error('Payment error:', error.message);
                Swal.fire('Payment Failed', error.message, 'error');
                setLoading(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                console.log('Payment successful!', paymentIntent);
                Swal.fire('Payment Successful', 'Your payment was processed successfully!', 'success');

                // Additional code to handle successful payment...
                let fetchBag = fetchBeg();
                const user = await GetAuthData();
                const SalesRepId = localStorage.getItem(salesRepIdKey) || user.Sales_Rep__c;

                if (fetchBag) {
                    let list = [];
                    let orderType = "Wholesale Numbers";
                    const productLists = Object.values(fetchBag.orderList);

                    if (productLists.length) {
                        productLists.forEach((product) => {
                            if (product.product.Category__c === "PREORDER") {
                                orderType = "Pre Order";
                            }
                            list.push({
                                ProductCode: product.product.ProductCode,
                                qty: product.quantity,
                                price: product.product?.salesPrice,
                                discount: product.product?.discount,
                            });
                        });
                    }

                    const begToOrder = {
                        uniqueId: uniqueId,
                        AccountId: fetchBag?.Account?.id,
                        Name: fetchBag?.Account?.name,
                        ManufacturerId__c: fetchBag?.Manufacturer?.id,
                        PONumber,
                        paymentId: paymentIntent.id,
                        paymentStatus: paymentIntent.status,
                        desc: `PaymentId: ${paymentIntent.id} Payment Status: ${paymentIntent.status} ${orderDes}`,
                        SalesRepId,
                        Type: orderType,
                        ShippingCity: fetchBag?.Account?.address?.city,
                        ShippingStreet: fetchBag?.Account?.address?.street,
                        ShippingState: fetchBag?.Account?.address?.state,
                        ShippingCountry: fetchBag?.Account?.address?.country,
                        ShippingZip: fetchBag?.Account?.address?.postalCode,
                        list,
                        key: user.data.x_access_token,
                        shippingMethod: fetchBag.Account.shippingMethod,
                    };

                    // Call OrderPlaced API
                    try {
                        const orderPlacedResponse = await OrderPlaced({ order: begToOrder });

                        if (orderPlacedResponse.length) {
                            setOrderStatus({ status: true, message: orderPlacedResponse[0].message });
                        } else {
                            productLists.forEach((ele) => addOrder(ele.product, 0, ele.discount));
                           
                            navigate("/order-list");
                        }

                        // Wait for 3 seconds before sending to backend
                        setTimeout(async () => {
                            const latestOrderId = localStorage.getItem("latestOrderId"); // Fetch latest order ID from local storage
                            begToOrder.orderId = latestOrderId; // Add orderId to begToOrder
              
                            try {
                                const backendResponse = await axios.post('http://localhost:2611/stripe/order/details', begToOrder, { timeout: 5000 });
                                if (backendResponse.data.success) {
                                    productLists.forEach((ele) => addOrder(ele.product, 0, ele.discount));
                                    localStorage.removeItem("orders");
                                    navigate("/order-list");
                                    localStorage.removeItem("bagValues")
                                }
                            } catch (orderError) {
                                console.error('Error sending order to backend:', orderError);
                                Swal.fire('Order Placement Failed', 'Please try again.', 'error');
                            }
                        }, 3000); // 3 seconds delay
                    } catch (orderError) {
                        console.error('Error placing order:', orderError);
                        Swal.fire('Order Placement Failed', 'Please try again.', 'error');
                    }
                }
            }
        } catch (err) {
            console.error('Error during payment or order placement:', err);
            Swal.fire('Error', 'Something went wrong during payment or order placement.', 'error');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
            

            <div className="mb-4">
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">Card Number</label>
                <CardNumberElement
                    id="cardNumber"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    options={{
                        style: {
                            base: {
                                color: '#32325d',
                                fontSize: '16px',
                                lineHeight: '24px',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#fa755a',
                                iconColor: '#fa755a',
                            },
                        },
                    }}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">Expiration Date (MM/YY)</label>
                <CardExpiryElement
                    id="cardExpiry"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    options={{
                        style: {
                            base: {
                                color: '#32325d',
                                fontSize: '16px',
                                lineHeight: '24px',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#fa755a',
                                iconColor: '#fa755a',
                            },
                        },
                    }}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="cardCvc" className="block text-sm font-medium text-gray-700 uppercase tracking-wider">CVC</label>
                <CardCvcElement
                    id="cardCvc"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    options={{
                        style: {
                            base: {
                                color: '#32325d',
                                fontSize: '16px',
                                lineHeight: '24px',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#fa755a',
                                iconColor: '#fa755a',
                            },
                        },
                    }}
                />
            </div>

            <div className="text-center">
            <button type="submit" disabled={!stripe || loading} className={`mt-4 w-full py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-400' : 'bg-black hover:bg-black'} transition`}>
                    {loading ? "Processing..." : `PAY $${Number(amount).toFixed(2)}`} AND PLACE ORDER
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
