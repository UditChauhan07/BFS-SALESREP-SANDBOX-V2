import React, { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./Styles.module.css";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import { Link, useNavigate } from "react-router-dom";
import { GetAuthData, OrderPlaced, POGenerator, ShareDrive, getProductImageAll, getBrandPaymentDetails, defaultLoadTime } from "../../lib/store";
import OrderLoader from "../loader";
import ModalPage from "../Modal UI";
import StylesModal from "../Modal UI/Styles.module.css";
import LoaderV2 from "../loader/v2";
import ProductDetails from "../../pages/productDetails";
import Loading from "../Loading";
import { useCart } from "../../context/CartContent";
import { DeleteIcon } from "../../lib/svg";
import CustomAccordion from "../CustomAccordian/CustomAccordain";
import StripePay from "../StripePay";
import { originAPi } from "../../lib/store";
import Swal from "sweetalert2";
import ShipmentHandler from "./ShipmentHandler";
import useBackgroundUpdater from "../../utilities/Hooks/useBackgroundUpdater";
import { PaymentElement } from "@stripe/react-stripe-js";
function MyBagFinal() {
  let Img1 = "/assets/images/dummy.png";
  const { order, updateProductQty, removeProduct, deleteOrder, keyBasedUpdateCart, getOrderTotal, fetchCart } = useCart();

  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [alert, setAlert] = useState(0);
  const [PONumber, setPONumber] = useState();
  const [buttonActive, setButtonActive] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(0);

  const [orderStatus, setorderStatus] = useState({
    status: false,
    message: "",
  });
  const [orderDesc, setOrderDesc] = useState(null);
  const [isPOEditable, setIsPOEditable] = useState(false);
  const [PONumberFilled, setPONumberFilled] = useState(true);
  const [clearConfim, setClearConfim] = useState(false);
  const [productDetailId, setProductDetailId] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  // console.log({aa:Object.values(bagValue?.orderList)?.length});
  const [limitInput, setLimitInput] = useState(PONumber);
  const [isLoading, setIsLoading] = useState(true);
  const [limitCheck, setLimitCheck] = useState(false);
  const [isPlayAble, setIsPlayAble] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({ PK_KEY: null, SK_KEY: null, Amount: 0 });
  const [detailsAccordian, setDetailsAccordian] = useState(true);
  const [paymentAccordian, setPaymentAccordian] = useState(false);
  const [intentRes, setIntentRes] = useState();
  const [isAccordianOpen, setIsAccordianOpen] = useState(false);
  const [paymentValue, setPaymentValue] = useState(false);
  const [qunatityChange, setQuantityChange] = useState()
  const [paymentType, setPaymentType] = useState();
  const [orderShipment, setOrderShipment] = useState([]);
  const [isSelect, setIsSelect] = useState(false);
  const [greenStatus, setGreenStatus] = useState()

  useEffect(() => {
    if (order?.Account?.id && order?.Manufacturer?.id && order?.items?.length > 0) {
      setButtonActive(true);
    }
  }, [order, buttonActive])
  useEffect(() => {
    if (paymentDetails.PK_KEY === null && paymentDetails.SK_KEY === null) {
      setIsPlayAble(0);
    }
  }, [paymentDetails]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setQuantityChange(false)
        setIsAccordianOpen(false);
        setDetailsAccordian(true);
        setPaymentAccordian(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  const handleAccordian = () => {

    if (order?.items?.length) {
      if (PONumber.length) {
        if (order?.items?.length > 100) {
          setLimitCheck(true);
        } else {
          if (!order?.Account?.shippingMethod?.method && orderShipment?.length > 0) {
            setAlert(3);
            return;
          } else {
            if (order.Account.discount.MinOrderAmount > total) {
              setAlert(1);
            } else {
              setQuantityChange(true)
              setIsAccordianOpen(true);
              setDetailsAccordian(false);
              setPaymentAccordian(true);
            }
          }
        }
      } else {
        setPONumberFilled(false);
      }
    }
  };
  const onToggle = () => {

    setQuantityChange(false)
    if (isAccordianOpen == true) setIsAccordianOpen(false)
    if (isAccordianOpen == false) setIsAccordianOpen(true)
    if (detailsAccordian == true) {
      setDetailsAccordian(false);
      setPaymentAccordian(true);
    } else if (detailsAccordian == false) {
      setDetailsAccordian(true);
      setPaymentAccordian(false);
    }
  };

  const handleNameChange = (event) => {
    const limit = 20;
    setLimitInput(event.target.value.slice(0, limit));
  };
  const fetchBrandPaymentDetails = async () => {
    try {


      let id = order?.Manufacturer?.id;
      let AccountID = order?.Account?.id;
      const user = await GetAuthData();

      const brandRes = await getBrandPaymentDetails({
        key: user.data.x_access_token,
        Id: id,
        AccountId: AccountID,
      });

      setIntentRes(brandRes);

      brandRes.accountManufacturerData.map((item) =>
        setPaymentType(item.Payment_Type__c)
      );

      // Check for null keys
      if (
        !brandRes?.brandDetails.Stripe_Secret_key_test__c ||
        !brandRes?.brandDetails.Stripe_Publishable_key_test__c
      ) {
        setIsPlayAble(0);
        console.log("Brand payment details are missing, skipping payment processing.");
        return {
          PK_KEY: null,
          SK_KEY: null,
        };
      }

      let paymentIntent = await fetch(`${originAPi}/stripe/payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: "100",
          paymentId: brandRes?.brandDetails.Stripe_Secret_key_test__c,
        }),
      });

      setGreenStatus(paymentIntent.status)
      if (paymentIntent.status === 200) {
        setIsPlayAble(1);
      } else if (paymentIntent.status === 400) {
        setIsPlayAble(0);
        console.log(isPlayAble, "is play able ");
      }

      setPaymentDetails({
        PK_KEY: brandRes?.brandDetails.Stripe_Publishable_key_test__c,
        SK_KEY: brandRes?.brandDetails.Stripe_Secret_key_test__c,
      });

      return {
        PK_KEY: brandRes?.brandDetails.Stripe_Publishable_key_test__c,
        SK_KEY: brandRes?.brandDetails.Stripe_Secret_key_test__c,
      };
    } catch (error) {
      console.log("Error fetching brand payment details:", error);
      return null;
    }
  };
  const hasPaymentType = intentRes?.accountManufacturerData?.some((item) => item.Payment_Type__c);

  useEffect(() => {
    fetchBrandPaymentDetails()
  }, [buttonActive])

  useEffect(() => {
    setTotal(getOrderTotal() ?? 0);
  }, [order]);

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     // Check if the tab is active
  //     if (document.visibilityState === 'visible') {
  //       // Reload the page when the tab becomes active
  //       window.location.reload();
  //     }
  //   };

  //   // Add event listener for visibilitychange
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   // Cleanup the event listener when the component unmounts
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);
  const FetchPoNumber = async () => {
    try {
      await order?.Account?.id;
      const res = await POGenerator({ orderDetails: order });
      let data = await fetchBrandPaymentDetails();

      if (res) {
        if (res?.address || res?.brandShipping) {
          let tempOrder = order.Account;
          if (res?.address) {
            tempOrder = { ...tempOrder, address: res?.address }
          }
          if (res.checkBrandAllow) {
            if (res?.shippingMethod) {
              tempOrder = { ...tempOrder, shippingMethod: res?.shippingMethod }
            } else {
              if (!isSelect) {
                tempOrder = { ...tempOrder, shippingMethod: null }
              }
            }
          } else {
            if (!isSelect) {
              tempOrder = { ...tempOrder, shippingMethod: null }
            }
          }
          keyBasedUpdateCart({ Account: tempOrder })
          if (res?.brandShipping) {
            if (res?.brandShipping.length) {
              setOrderShipment(res?.brandShipping)
            }
          }
        }
        let isPreOrder = order?.items?.some((product) => product?.Category__c?.toUpperCase()?.includes("PREORDER") || product?.Category__c?.toUpperCase()?.includes("EVENT"));
        let poInit = res?.poNumber;
        if (isPreOrder) {
          poInit = `PRE-${poInit}`;
        }
        setPONumber(poInit);
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching PO number:", error);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchCart();

    FetchPoNumber();
  }, [buttonActive, isSelect]);
  const bgUpdateHandler = () => {
    FetchPoNumber();
    fetchBrandPaymentDetails()
  }
  useBackgroundUpdater(bgUpdateHandler, defaultLoadTime)

  const [productImage, setProductImage] = useState({
    isLoaded: false,
    images: {},
  });

  useEffect(() => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }
    if (order) {
      if (order?.Manufacturer) {
        if (order?.Manufacturer?.id) {
          if (!data[order?.Manufacturer?.id]) {
            data[order?.Manufacturer?.id] = {};
          }
          if (Object.values(data[order.Manufacturer.id]).length > 0) {
            setProductImage({
              isLoaded: true,
              images: data[order.Manufacturer.id],
            });
          } else {
            setProductImage({ isLoaded: false, images: {} });
          }
        }
      }
      if (order.items) {
        if (order.items.length > 0) {
          let productCode = "";
          order.items.map((element, index) => {
            productCode += `'${element.product?.ProductCode}'`;
            if (order.items.length - 1 != index) productCode += ", ";
          });
          getProductImageAll({ rawData: { codes: productCode } })
            .then((res) => {
              if (res) {
                if (data[order.Manufacturer.id]) {
                  data[order.Manufacturer.id] = {
                    ...data[order.Manufacturer.id],
                    ...res,
                  };
                } else {
                  data[order.Manufacturer.id] = res;
                }
                ShareDrive(data);
                setProductImage({ isLoaded: true, images: res });
              } else {
                setProductImage({ isLoaded: true, images: {} });
              }
            })
            .catch((err) => {
              console.log({ err });
            });
        }
      }
    }
  }, []);

  const orderPlaceHandler = () => {
    if (order?.Account?.SalesRepId) {
      setIsOrderPlaced(1);
      setIsDisabled(true);
      GetAuthData()
        .then((user) => {
          // let bagValue = fetchBeg()
          if (order.Account.id && order.Manufacturer.id) {
            // setButtonActive(true)
            let list = [];
            let orderType = "Wholesale Numbers";
            if (order.items.length) {
              order.items.map((product) => {
                let productCategory = product?.Category__c?.toUpperCase()?.trim();

                // Set orderType based on product category and prepend "PRE" to PONumber if "PREORDER"
                if (productCategory?.toUpperCase()?.includes("PREORDER") || productCategory?.toUpperCase()?.match("EVENT")?.length > 0) {
                  orderType = "Pre Order";
                }
                let temp = {
                  Id: product.Id,
                  ProductCode: product.ProductCode,
                  qty: product.qty,
                  price: product?.price,
                  discount: product?.discount,
                };
                list.push(temp);
              });
            }
            let begToOrder = {
              AccountId: order?.Account?.id,
              Name: order?.Account?.name,
              ManufacturerId__c: order?.Manufacturer?.id,
              PONumber: PONumber,
              desc: order?.Note,
              SalesRepId: order?.Account?.SalesRepId,
              Type: orderType,
              ShippingCity: order?.Account?.address?.city,
              ShippingStreet: order?.Account?.address?.street,
              ShippingState: order?.Account?.address?.state,
              ShippingCountry: order?.Account?.address?.country,
              ShippingZip: order?.Account?.address?.postalCode,
              list,
              key: user.data.x_access_token,
              shippingMethod: order.Account.shippingMethod,
              Payment_Type__c: paymentValue,
            };
            OrderPlaced({ order: begToOrder, cartId: order.id })
              .then((response) => {
                if (response) {

                  if (response?.err) {
                    setIsDisabled(false);
                    setIsOrderPlaced(0);
                    setorderStatus({
                      status: true,
                      message: response?.err[0].message,
                    });
                  }
                  if (response?.orderId) {

                    setIsDisabled(false);

                    let status = deleteOrder();
                    setConfirm(false)
                    localStorage.setItem("OpportunityId", JSON.stringify(response.orderId));
                    window.location.href = window.location.origin + '/orderDetails';
                    setIsOrderPlaced(2);
                  }
                }
              })
              .catch((err) => {
                console.error({ err });
              });
          }
        })
        .catch((error) => {
          console.error({ error });
        });
    } else {
      alert("no sales rep.");
    }
  };

  const deleteBag = () => {
    // localStorage.removeItem("AA0KfX2OoNJvz7x")
    deleteOrder()
      .then((res) => {
        if (res) {
          window.location.reload();
        }
      })
      .catch((err) => console.error({ err }));
  };
  // console.log("fetch bag", fetchBag)

  const OrderQuantity = () => {
    const { getOrderQuantity } = useCart();

    return getOrderQuantity() || 0;
  };
  const getMinHeight = () => {
    const hasPayment = hasPaymentType;
    const hasShipments = orderShipment.length > 0;
    const hasPKKey = paymentDetails.PK_KEY != null;
    const hasSKKey = paymentDetails.SK_KEY != null;

    // Check conditions
    if (hasPayment && (hasPKKey && hasSKKey) && hasShipments) {
      return '700px'; // Payment type and one payment detail key
    }
    if (hasPayment && hasShipments) {
      return '500px'; // Both conditions true
    }
    if (hasPayment && (hasPKKey && hasSKKey)) {
      return '600px'; // Only payment type
    }
    if (hasShipments && (hasPKKey && hasSKKey)) {
      return '500px'; // Only shipments
    }
    if (hasPKKey && hasSKKey) {
      return '650px'; // One of the payment details keys is present
    }
    if (hasPayment || hasShipments) {
      return '400px'; // One of the conditions true
    }
    return 'null'; // All conditions false
  };

  if (isOrderPlaced === 1) return <OrderLoader />;
  return (
    <div className="mt-4">
      {/* {alert === 5 && (
  <ModalPage
    open
    content={
      <>
        <div style={{ maxWidth: "309px" }}>
          <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
          <p className={`${Styles.ModalContent}`}>
            Your PK or SK key is incorrect. Place the order without payment?
          </p>
          <div className="d-flex justify-content-center">
            <button className={Styles.btnHolder} onClick={() => setAlert(0)}>
              OK
            </button>
          </div>
        </div>
      </>
    }
    onClose={() => {
      setAlert(0);
    }}
  />
)} */}
      {isLoading ? (
        <Loading height={"50vh"} /> // Display full-page loader while data is loading
      ) : (
        <section>
          {alert == 1 && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent}`}>Please Select Products of Minimum Order Amount</p>
                    {/* <p className={` ${Styles.ModalContent}`}><b>Current Order Total:</b> ${formentAcmount(orderTotal)}</p> */}
                    <div className="d-flex justify-content-center">
                      <button className={Styles.btnHolder} onClick={() => setAlert(0)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => setAlert(0)}
            />
          )}
          {alert == 2 && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                    <p className={` ${Styles.ModalContent}`}>Please Select Tester Product of Minimum Order Amount</p>
                    <div className="d-flex justify-content-center">
                      <button className={Styles.btnHolder} onClick={() => setAlert(0)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => {
                setAlert(0);
              }}
            />
          )}
          {alert == 3 && (
            <ModalPage
              open
              content={
                <>
                  <div style={{ maxWidth: "309px" }}>
                    <h1 className={`fs-5 ${Styles.ModalHeader}`}>Alert!!</h1>
                    <p className={` ${Styles.ModalContent}`}>Please Select Shipping Method for this order</p>
                    <div className="d-flex justify-content-center">
                      <button className={Styles.btnHolder} onClick={() => setAlert(0)}>
                        OK
                      </button>
                    </div>
                  </div>
                </>
              }
              onClose={() => {
                setAlert(0);
              }}
            />
          )}
          <ModalPage
            open={limitCheck || false}
            content={
              <>
                <div style={{ maxWidth: "309px" }}>
                  <h1 className={`fs-5 ${Styles.ModalHeader}`}>Warning</h1>
                  <p className={` ${Styles.ModalContent}`}>Please upload file with less than 100 products</p>
                  <div className="d-flex justify-content-center">
                    <button className={StylesModal.modalButton} onClick={() => setLimitCheck(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </>
            }
            onClose={() => setLimitCheck(false)}
          />
          <ModalPage
            open={confirm || false}
            content={
              <div className="d-flex flex-column gap-3">
                <h2 style={{ textDecoration: "underline" }}>Confirm</h2>
                <p>
                  Are you sure you want to generate a order?
                  <br /> This action cannot be undone.
                </p>
                <div className="d-flex justify-content-around ">
                  <button className={Styles.btnHolder} onClick={orderPlaceHandler} disabled={isDisabled}>
                    Submit
                  </button>
                  <button className={Styles.btnHolder} onClick={() => setConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            }
            onClose={() => {
              setConfirm(false);
            }}
          />
          {clearConfim ? (
            <ModalPage
              open
              content={
                <div className="d-flex flex-column gap-3">
                  <h2 className={`${Styles.warning} `}>Warning</h2>
                  <p className={`${Styles.warningContent} `}>Are you Sure you want to clear bag?</p>
                  <div className="d-flex justify-content-around ">
                    <button
                      style={{
                        backgroundColor: "#000",
                        color: "#fff",
                        fontFamily: "Montserrat-600",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        height: "30px",
                        letterSpacing: "1.4px",
                        lineHeight: "normal",
                        width: "100px",
                      }}
                      onClick={deleteBag}
                    >
                      Yes
                    </button>
                    <button
                      style={{
                        backgroundColor: "#000",
                        color: "#fff",
                        fontFamily: "Montserrat-600",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        height: "30px",
                        letterSpacing: "1.4px",
                        lineHeight: "normal",
                        width: "100px",
                      }}
                      onClick={() => setClearConfim(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              }
              onClose={() => {
                setClearConfim(false);
              }}
            />
          ) : null}
          {orderStatus?.status ? (
            <ModalPage
              open
              content={
                <div className="d-flex flex-column gap-3" style={{ maxWidth: "700px" }}>
                  <h2 className={`${Styles.warning} `}>Error while Generating order</h2>
                  <p className={`${Styles.warningContent} `} style={{ lineHeight: "22px" }}>
                    We apologize for inconvenience, But we are facing trouble placing your order.
                    <br />
                    <p style={{ fontSize: "14px" }}>Please contact your SalesRep or Portal Support.</p>
                    <small>{orderStatus.message}</small>
                  </p>
                  <div className="d-flex justify-content-around ">
                    <button
                      style={{
                        backgroundColor: "#000",
                        color: "#fff",
                        fontFamily: "Montserrat-600",
                        fontSize: "14px",
                        fontStyle: "normal",
                        fontWeight: "600",
                        height: "30px",
                        letterSpacing: "1.4px",
                        lineHeight: "normal",
                        width: "100px",
                      }}
                      onClick={() => setorderStatus({ status: false, message: "" })}
                    >
                      OK
                    </button>
                  </div>
                </div>
              }
              onClose={() => {
                setorderStatus({ status: false, message: "" });
              }}
            />
          ) : null}
          <div className="">
            <div>
              <div className={Styles.MyBagFinalTop}>
                <div className={Styles.MyBagFinalRight}>
                  <button onClick={() => navigate("/orders")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16" fill="none">
                      <path
                        d="M8.94284 2.27615C9.46349 1.75544 9.46349 0.911229 8.94284 0.390521C8.42213 -0.130174 7.57792 -0.130174 7.05721 0.390521L2.3911 5.05666C2.39092 5.05684 2.39128 5.05648 2.3911 5.05666L0.390558 7.05721C0.153385 7.29442 0.024252 7.59868 0.00313201 7.90895C-0.00281464 7.99562 -0.000321319 8.08295 0.010852 8.17002C0.0431986 8.42308 0.148118 8.66868 0.325638 8.87322C0.348651 8.89975 0.372651 8.92535 0.397585 8.94989L7.05721 15.6095C7.57792 16.1302 8.42213 16.1302 8.94284 15.6095C9.46349 15.0888 9.46349 14.2446 8.94284 13.7239L4.55231 9.33335H22.6667C23.4031 9.33335 24 8.73642 24 8.00002C24 7.26362 23.4031 6.66668 22.6667 6.66668H4.55231L8.94284 2.27615Z"
                        fill="black"
                      />
                    </svg>
                  </button>
                  <h4>
                    {buttonActive ? (
                      <>
                        <span>
                          {" "}
                          <Link style={{ color: "#000" }} to={`/Brand/${order?.Manufacturer?.id}`}>
                            {order?.Manufacturer?.name}
                          </Link>{" "}
                          |
                        </span>
                        &nbsp;
                        <Link style={{ color: "#000" }} to={`/store/${order?.Account?.id}`}>
                          {order?.Account?.name}
                        </Link>
                      </>
                    ) : (
                      <span>Empty bag</span>
                    )}
                  </h4>
                </div>

                <div className={Styles.MyBagFinalleft}>
                  <h5>
                    PO Number{" "}
                    {!isPOEditable ? (
                      <b>
                        {buttonActive
                          ? // If it's a Pre Order and PONumber doesn't already start with "PRE", prepend "PRE"
                          PONumber
                          : "---"}
                      </b>
                    ) : (
                      <input
                        type="text"
                        defaultValue={PONumber}
                        onKeyUp={(e) => setPONumber(e.target.value)}
                        placeholder=" Enter PO Number"
                        style={{ borderBottom: "1px solid black" }}
                        id="limit_input"
                        name="limit_input"
                        value={limitInput}
                        onChange={qunatityChange ? null : handleNameChange}
                        onKeyPress={(e) => {
                          if (e.key === " ") {
                            e.preventDefault(); // Prevent space character from being entered
                          }
                        }}
                      />
                    )}
                  </h5>
                  {qunatityChange ? null : <>
                    {!isPOEditable && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none" onClick={() => setIsPOEditable(true)} style={{ cursor: "pointer" }}>
                        <path
                          d="M19.3078 10.6932V19.2841C19.3078 19.6794 18.9753 20 18.5652 20H0.742642C0.332504 20 0 19.6794 0 19.2841V2.10217C0 1.70682 0.332504 1.38627 0.742642 1.38627H9.65389C10.064 1.38627 10.3965 1.70682 10.3965 2.10217C10.3965 2.49754 10.064 2.81809 9.65389 2.81809H1.48519V18.5682H17.8226V10.6932C17.8226 10.2979 18.1551 9.97731 18.5652 9.97731C18.9753 9.97731 19.3078 10.2979 19.3078 10.6932ZM17.9926 5.11422L15.6952 2.89943L7.72487 10.5832L7.09297 13.4072L10.0223 12.7981L17.9926 5.11422ZM21 2.2148L18.7027 0L16.8541 1.78215L19.1515 3.99692L21 2.2148Z"
                          fill="black"
                        />
                      </svg>
                    )}
                  </>}

                </div>
              </div>

              <div className={Styles.MyBagFinalMain}>
                <div className="row">
                  <div className="col-lg-7 col-md-8 col-sm-12">
                    <div className={Styles.MainBag}>
                      <h3>
                        SHOPPING BAG (<OrderQuantity />)
                      </h3>
                      <div className={Styles.scrollP}>
                        <div className={`${Styles.MainInner} overflow-auto`} style={{ minHeight: getMinHeight() }}>
                          {order && order.items?.length > 0 ? (
                            order.items?.map((ele) => {
                              let salesPrice = ele?.price;
                              let listPrice = Number().toFixed(2);
                              if (salesPrice == "NaN") {
                                salesPrice = 0;
                              }
                              listPrice = Number(ele?.usdRetail__c?.replace("$", "").replace(",", "")).toFixed(2);
                              if (ele?.usdRetail__c?.includes("$")) {
                                if (listPrice == "NaN") {
                                  listPrice = 0;
                                }
                              }

                              return (
                                <div className={Styles.Mainbox}>
                                  <div className={Styles.Mainbox1M}>
                                    <div className={Styles.Mainbox2} style={{ cursor: "pointer" }}>
                                      {/* {
                                        ele?.ContentDownloadUrl ? <img src={ele?.ContentDownloadUrl} f className="zoomInEffect" alt="img" width={50} onClick={() => { setProductDetailId(ele?.Id) }} /> : ele?.ProductImage ? <img src={ele?.ProductImage} f className="zoomInEffect" alt="img" width={50} onClick={() => { setProductDetailId(ele?.Id) }} /> : !productImage.isLoaded ? <LoaderV2 /> :
                                          productImage.images?.[ele?.ProductCode] ?
                                            productImage.images[ele?.ProductCode]?.ContentDownloadUrl ?
                                              <img src={productImage.images[ele?.ProductCode]?.ContentDownloadUrl} alt="img" width={25} onClick={() => { setProductDetailId(ele?.Id) }} />
                                              : <img src={productImage.images[ele?.ProductCode]} alt="img" width={25} onClick={() => { setProductDetailId(ele?.Id) }} />
                                            : <img src={Img1} alt="img" onClick={() => { setProductDetailId(ele?.Id) }} />
                                      } */}

                                      {ele?.ContentDownloadUrl ? (
                                        <img
                                          src={ele?.ContentDownloadUrl}
                                          className="zoomInEffect"
                                          alt="img"
                                          width={50}
                                          onClick={() => {
                                            setProductDetailId(ele?.Id);
                                          }}
                                        />
                                      ) : ele?.ProductImage ? (
                                        <img
                                          src={ele?.ProductImage}
                                          className="zoomInEffect"
                                          alt="img"
                                          width={50}
                                          onClick={() => {
                                            setProductDetailId(ele?.Id);
                                          }}
                                        />
                                      ) : !productImage.isLoaded ? (
                                        <LoaderV2 />
                                      ) : productImage.images?.[ele?.ProductCode] ? (
                                        productImage.images[ele?.ProductCode]?.ContentDownloadUrl ? (
                                          <img
                                            src={productImage.images[ele?.ProductCode]?.ContentDownloadUrl}
                                            alt="img"
                                            width={25}
                                            onClick={() => {
                                              setProductDetailId(ele?.Id);
                                            }}
                                          />
                                        ) : (
                                          <img
                                            src={productImage.images[ele?.ProductCode]}
                                            alt="img"
                                            width={25}
                                            onClick={() => {
                                              setProductDetailId(ele?.Id);
                                            }}
                                          />
                                        )
                                      ) : (
                                        <span
                                          style={{
                                            display: "inline-block",
                                            width: "50px",
                                            height: "50px",
                                            lineHeight: "50px",
                                            textAlign: "center",
                                            border: "1px solid #ccc",
                                            background: "#f9f9f9",
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            setProductDetailId(ele?.Id);
                                          }}
                                        >
                                          <img src={Img1}></img>
                                        </span>
                                      )}
                                    </div>
                                    <div className={Styles.Mainbox3}>
                                      <h2
                                        onClick={() => {
                                          setProductDetailId(ele?.Id);
                                        }}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {ele?.Name}
                                      </h2>
                                      <p>
                                        <span className={Styles.Span1}>{`$${listPrice}`}</span>
                                        <span className={Styles.Span2}>${Number(salesPrice).toFixed(2)}</span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className={Styles.Mainbox2M}>

                                    {qunatityChange ? (
                                      <>
                                        <div
                                          className={Styles.Mainbox4}
                                          style={{ opacity: '0.3' }}
                                        >
                                          <DeleteIcon fill="red" />
                                        </div>
                                        <div style={{ opacity: "0.3" }} className={Styles.Mainbox5}>

                                          <QuantitySelector min={ele?.Min_Order_QTY__c || 0} value={ele.qty} />
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div
                                          className={Styles.Mainbox4}
                                          onClick={() => {
                                            if (order.items.length == 1) {
                                              setClearConfim(true);
                                            } else {
                                              removeProduct(ele.Id);
                                            }
                                          }}
                                        >
                                          <DeleteIcon fill="red" />
                                        </div>
                                        <div className={Styles.Mainbox5}>
                                          <QuantitySelector
                                            min={ele?.Min_Order_QTY__c || 0}
                                            onChange={(quantity) => {
                                              updateProductQty(ele.Id, quantity);
                                            }}
                                            value={ele.qty}
                                          />
                                        </div>
                                      </>

                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <>
                              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "35vh" }}>
                                No Products in Bag
                              </div>
                            </>
                          )}
                        </div>
                        <div className={Styles.TotalPricer}>
                          <div className="d-flex justify-content-between">
                            <div>
                              <h2>{order?.Account?.shippingMethod?.cal ? 'Sub-' : null}Total</h2>
                            </div>
                            <div>
                              <h2>${Number(total).toFixed(2)}</h2>
                            </div>
                          </div>
                          {order.Account?.shippingMethod?.cal ?
                            <div className="d-flex justify-content-between">
                              <div>
                                <h2 className="text-capitalize">Shipping ({order.Account.shippingMethod?.name})</h2>
                              </div>
                              <div>
                                <h2>${order.Account.shippingMethod?.cal ? Number(total * order.Account.shippingMethod?.cal).toFixed(2) : 0}</h2>
                              </div>
                            </div> : null}
                          {order.Account?.shippingMethod?.cal ?
                            <div className="d-flex justify-content-between">
                              <div>
                                <h2>Total</h2>
                              </div>
                              <div>
                                <h2>${Number(total + (total * order.Account.shippingMethod?.cal)).toFixed(2)}</h2>
                              </div>
                            </div> : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-4 col-sm-12">
                    {isPlayAble === 1 && total > 0 ? (
                      <CustomAccordion title="Shipping Address" isOpen={detailsAccordian} onToggle={onToggle} isModalOpen={isAccordianOpen}>

                        <div className={Styles.ShipAdress}>

                          {buttonActive ? (
                            <p>
                              {order?.Account?.address?.street}, {order?.Account?.address?.city} <br />
                              {order?.Account?.address?.state}, {order?.Account?.address?.country} {order?.Account?.address?.postalCode}
                              <br />
                              {order?.Account?.address?.email} {order?.Account?.address?.contact && `{ |  ${order?.Account?.address?.contact}}`}
                            </p>
                          ) : (
                            <p>No Shipping Address</p>
                          )}
                        </div>
                        {(hasPaymentType && paymentDetails.PK_KEY != null && paymentDetails.SK_KEY != null && total > 0 && greenStatus === 200) ? (
                          <div className={Styles.PaymentType}>
                            <label className={Styles.shipLabelHolder}>Payment Type:</label>
                            <div className={Styles.PaymentTypeHolder}>
                              {intentRes.accountManufacturerData?.[0]?.Payment_Type__c?.split(";")?.map((item) => (
                                <div className={`${Styles.templateHolder} ${isPlayAble == 0 ? paymentValue ? paymentValue == item ? Styles.selected : '' : Styles.selected : ''}`} onClick={() => {
                                  setIsPlayAble(0); setPaymentValue(item);
                                }}>
                                  <div className={Styles.labelHolder} >
                                    {item}
                                  </div>
                                </div>
                              ))} <div className={`${Styles.templateHolder} ${isPlayAble == 1 ? Styles.selected : ''}`} onClick={() => setIsPlayAble(1)}>
                                <div className={Styles.labelHolder} >
                                  Pay now
                                </div>
                              </div>
                            </div></div>
                        ) : null}
                        {orderShipment.length > 0 ?
                          <div className={Styles.PaymentType}>
                            <label className={Styles.shipLabelHolder}>Select Shipping method:</label>
                            <ShipmentHandler data={orderShipment} total={total} setIsSelect={setIsSelect} />
                          </div>
                          : null}
                        <div className={Styles.ShipAdress2}>
                          <textarea
                            onKeyUp={(e) => {
                              keyBasedUpdateCart({ Note: e.target.value });
                            }}
                            placeholder="NOTE"
                            className="placeholder:font-[Arial-500] text-[14px] tracking-[1.12px] "
                          >
                            {order?.Note}
                          </textarea>
                        </div>
                        {!PONumberFilled ? (
                          <ModalPage
                            open
                            content={
                              <>
                                <div style={{ maxWidth: "309px" }}>
                                  <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Warning</h1>
                                  <p className={` ${StylesModal.ModalContent}`}> Please Enter PO Number</p>
                                  <div className="d-flex justify-content-center">
                                    <button
                                      className={`${StylesModal.modalButton}`}
                                      onClick={() => {
                                        setPONumberFilled(true);
                                      }}
                                    >
                                      OK
                                    </button>
                                  </div>
                                </div>
                              </>
                            }
                            onClose={() => {
                              setPONumberFilled(true);
                            }}
                          />
                        ) : null}
                        <div className={Styles.ShipBut}>
                          <button onClick={handleAccordian}>PROCEED TO PAY</button>
                        </div>
                      </CustomAccordion>
                    ) : (
                      <div className={Styles.ShippControl} style={{ padding: '5px 10px' }}>
                        <h2>Shipping Address</h2>

                        <div className={Styles.ShipAdress}>
                          {buttonActive ? (
                            <p>
                              {order?.Account?.address?.street}, {order?.Account?.address?.city} <br />
                              {order?.Account?.address?.state}, {order?.Account?.address?.country} {order?.Account?.address?.postalCode}
                              <br />
                              {order?.Account?.address?.email} {order?.Account?.address?.contact && `{ |  ${order?.Account?.address?.contact}}`}
                            </p>
                          ) : (
                            <p>No Shipping Address</p>
                          )}
                        </div>
                        {(hasPaymentType && paymentDetails.PK_KEY != null && paymentDetails.SK_KEY != null && total > 0 && greenStatus === 200) ? (
                          <div className={Styles.PaymentType}>
                            <label className={Styles.shipLabelHolder}>Payment Type:</label>
                            <div className={Styles.PaymentTypeHolder}>
                              {intentRes.accountManufacturerData?.[0]?.Payment_Type__c?.split(";")?.map((item) => (
                                <div className={`${Styles.templateHolder} ${isPlayAble == 0 ? paymentValue ? paymentValue == item ? Styles.selected : '' : Styles.selected : ''}`} onClick={() => {
                                  setIsPlayAble(0); setPaymentValue(item);
                                }}>
                                  <div className={Styles.labelHolder} >
                                    {item}
                                  </div>
                                </div>
                              ))} <div className={`${Styles.templateHolder} ${isPlayAble == 1 ? Styles.selected : ''}`} onClick={() => setIsPlayAble(1)}>
                                <div className={Styles.labelHolder} >
                                  Pay now
                                </div>
                              </div>
                            </div></div>
                        ) : null}
                        {orderShipment.length > 0 ?
                          <div className={Styles.ShipAdress}>
                            <div className={Styles.shipLabelHolder}>Select Shipping method</div>
                            <ShipmentHandler data={orderShipment} total={total} setIsSelect={setIsSelect} />
                          </div>
                          : null}
                        <div className={Styles.ShipAdress2}>
                          <textarea
                            onKeyUp={(e) => {
                              keyBasedUpdateCart({ Note: e.target.value });
                            }}
                            placeholder="NOTE"
                            className="placeholder:font-[Arial-500] text-[14px] tracking-[1.12px] "
                          >
                            {order?.Note}
                          </textarea>
                        </div>
                        {!PONumberFilled ? (
                          <ModalPage
                            open
                            content={
                              <>
                                <div style={{ maxWidth: "309px" }}>
                                  <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Warning</h1>
                                  <p className={` ${StylesModal.ModalContent}`}> Please Enter PO Number</p>
                                  <div className="d-flex justify-content-center">
                                    <button
                                      className={`${StylesModal.modalButton}`}
                                      onClick={() => {
                                        setPONumberFilled(true);
                                      }}
                                    >
                                      OK
                                    </button>
                                  </div>
                                </div>
                              </>
                            }
                            onClose={() => {
                              setPONumberFilled(true);
                            }}
                          />
                        ) : null}
                        <div className={Styles.ShipBut}>
                          <button
                            onClick={() => {
                              if (order?.items?.length) {
                                if (PONumber.length) {
                                  if (order?.items?.length > 100) {
                                    setLimitCheck(true);
                                  } else {
                                    if (order.Account.discount.MinOrderAmount > total) {
                                      setAlert(1);
                                    } else {
                                      if (!order?.Account?.shippingMethod?.method && orderShipment?.length > 0) {
                                        setAlert(3);
                                        return;
                                      } else {

                                        // if (testerInBag && order.Account.discount.testerproductLimit > total) {
                                        //   setAlert(2);
                                        // } else {
                                        setConfirm(true);
                                        // }
                                      }
                                    }
                                  }
                                } else {
                                  setPONumberFilled(false);
                                }
                              }
                            }}
                            disabled={!buttonActive}
                          >
                            ${Number(total + (total * (order?.Account?.shippingMethod?.cal || 0))).toFixed(2)} PLACE ORDER
                          </button>
                          <p
                            className={`${Styles.ClearBag}`}
                            style={{ textAlign: "center", cursor: "pointer" }}
                            onClick={() => {
                              if (buttonActive) {
                                setClearConfim(true);
                              }
                            }}
                            disabled={!buttonActive}
                          >
                            Clear Bag
                          </p>
                          {/* {Number(total) ? null : window.location.reload()} */}
                        </div>
                      </div>
                    )}

                    {isPlayAble === 1 && total > 0 ? (
                      <CustomAccordion title="Payment Details" isOpen={paymentAccordian} onToggle={onToggle}>
                        <StripePay
                          description={order?.Note}
                          PO_Number={PONumber}
                          PK_KEY={paymentDetails.PK_KEY}
                          SK_KEY={paymentDetails.SK_KEY}
                          amount={total + (total * (order?.Account?.shippingMethod?.cal || 0))}
                          order={order}
                          PONumber={PONumber}
                          orderDesc={orderDesc}
                        />
                      </CustomAccordion>
                    ) : null}

                    {isPlayAble == 1 && total > 0 ? (
                      <p
                        className={`${Styles.ClearBag}`}
                        style={{ textAlign: "center", cursor: "pointer" }}
                        onClick={() => {
                          if (buttonActive) {
                            setClearConfim(true);
                          }
                        }}
                        disabled={!buttonActive}
                      >
                        {paymentAccordian ? null : "Clear Bag"}

                      </p>
                    ) : null}
                    {paymentAccordian ? <p className={`${Styles.ClearBag}`}
                      style={{ textAlign: "center", cursor: "pointer" }} onClick={onToggle}>Edit Bag</p> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} AccountId={[order?.Account?.id]} qunatityChangeState={qunatityChange} />
    </div>
  );
}

export default MyBagFinal;
