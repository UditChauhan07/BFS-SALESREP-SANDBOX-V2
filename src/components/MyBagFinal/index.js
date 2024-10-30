/* eslint-disable no-lone-blocks */
import React, { useEffect, useState } from "react";
import Styles from "./Styles.module.css";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import { useNavigate } from "react-router-dom";
import { GetAuthData, OrderPlaced, POGenerator, ShareDrive, fetchBeg, getProductImageAll, getBrandPaymentDetails } from "../../lib/store";
import { useBag } from "../../context/BagContext";
import OrderLoader from "../loader";
import ModalPage from "../Modal UI";
import StylesModal from "../Modal UI/Styles.module.css";
import LoaderV2 from "../loader/v2";
import ProductDetails from "../../pages/productDetails";
import Loading from "../Loading";
import CustomAccordion from "../CustomAccordian/CustomAccordain";
import StripePay from "../StripePay";
function MyBagFinal() {
  let Img1 = "/assets/images/dummy.png";
  const navigate = useNavigate();
  const [orderDesc, setOrderDesc] = useState(null);
  // const [PONumber, setPONumber] = useState();
  const [PONumber, setPONumber] = useState();
  const [buttonActive, setButtonActive] = useState(false);
  const { addOrder, orderQuantity, deleteOrder, orders, setOrders, setOrderProductPrice } = useBag();
  const [bagValue, setBagValue] = useState(fetchBeg());
  const bgData = bagValue?.orderList[0];
  console.log("bgdara", bgData);
  let uniqueId = bagValue?.orderList[0]?.uniqueId;
  localStorage.setItem("bagValues", JSON.stringify(bgData));

  const [isOrderPlaced, setIsOrderPlaced] = useState(0);
  const [isPOEditable, setIsPOEditable] = useState(false);
  const [PONumberFilled, setPONumberFilled] = useState(true);
  const [clearConfim, setClearConfim] = useState(false);
  const [productDetailId, setProductDetailId] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  // console.log({aa:Object.values(bagValue?.orderList)?.length});
  const [limitInput, setLimitInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayAble, setIsPlayAble] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({ PK_KEY: null, SK_KEY: null, Amount: 0 });
  const [detailsAccordian, setDetailsAccordian] = useState(true);
  const [paymentAccordian, setPaymentAccordian] = useState(false);
  const fetchBag = fetchBeg({});
  const productLists = Object.values(fetchBag.orderList ?? {});
  const handleNameChange = (event) => {
    const limit = 20;
    setLimitInput(event.target.value.slice(0, limit));
  };
  useEffect(() => {
    const FetchPoNumber = async () => {
      try {
        const res = await POGenerator();
        if (res) {
          let isPreOrder = productLists.some(product => (product.Category__c?.toUpperCase()?.includes("PREORDER") || product.Category__c?.toUpperCase()?.includes("EVENT")))
          let poInit = res;
          if (isPreOrder) {
            poInit = `PRE-${poInit}`
          }

          setPONumber(poInit);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching PO number:", error);
        setIsLoading(false);
      } finally {

      }
    };

    FetchPoNumber();
  }, []);

  useEffect(() => {
    if (bagValue?.Account?.id && bagValue?.Manufacturer?.id && Object.values(bagValue?.orderList)?.length > 0) {
      setButtonActive(true);
    }
  }, []);

  let total = 0;
  const [productImage, setProductImage] = useState({ isLoaded: false, images: {} });

  useEffect(() => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }

    if (bagValue) {
      if (bagValue?.Manufacturer?.id) {
        if (!data[bagValue?.Manufacturer?.id]) {
          data[bagValue?.Manufacturer?.id] = {};
        }
        if (Object.values(data[bagValue.Manufacturer.id]).length > 0) {
          setProductImage({ isLoaded: true, images: data[bagValue.Manufacturer.id] });
        } else {
          setProductImage({ isLoaded: false, images: {} });
        }
      }

      // Check for orderList and fetch product images
      if (bagValue.orderList?.length > 0) {
        let productCode = "";
        bagValue.orderList.map((element, index) => {
          productCode += `'${element.product?.ProductCode}'`;
          if (bagValue.orderList.length - 1 !== index) productCode += ", ";
        });

        getProductImageAll({ rawData: { codes: productCode } })
          .then((res) => {
            if (res) {
              console.log({ res });
              if (data[bagValue.Manufacturer.id]) {
                data[bagValue.Manufacturer.id] = { ...data[bagValue.Manufacturer.id], ...res };
              } else {
                data[bagValue.Manufacturer.id] = res;
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

    // Activate button if all required conditions are met
    if (bagValue?.Account?.id && bagValue?.Manufacturer?.id && Object.values(bagValue?.orderList)?.length > 0 && total > 0) {
      setButtonActive(true);
    }
  }, [total, bagValue]);

  const onPriceChangeHander = (product, price = "0") => {
    if (price == "") price = 0;
    setOrderProductPrice(product, price).then((res) => {
      if (res) {
        setBagValue(fetchDataFromBag());
      }
    });
  };
  const orderPlaceHandler = () => {
    if (localStorage.getItem("Sales_Rep__c")) {
      let fetchBag = fetchBeg();
      setIsOrderPlaced(1);
      setIsDisabled(true);
      GetAuthData()
        .then((user) => {
          // let bagValue = fetchBeg()
          if (fetchBag) {
            // setButtonActive(true)
            let list = [];
            let orderType = "Wholesale Numbers";
            let oPONumber = PONumber;
            let productLists = Object.values(fetchBag.orderList);
            if (productLists.length) {
              productLists.map((product) => {
                let productCategory = product?.product?.Category__c?.toUpperCase()?.trim();

                // Set orderType based on product category and prepend "PRE" to PONumber if "PREORDER"
                if (productCategory?.includes("PREORDER") || productCategory?.toUpperCase()?.match("event")?.length > 0) {
                  orderType = "Pre Order";
                  if (!PONumber.startsWith("PRE")) {
                    oPONumber = `PRE-${PONumber}`; // Prepend "PRE" to the PO number
                  }
                }
                let temp = {
                  ProductCode: product.product.ProductCode,
                  qty: product.quantity,
                  price: product.product?.salesPrice,
                  discount: product.product?.discount,
                };
                list.push(temp);
              });
            }
            let begToOrder = {
              AccountId: fetchBag?.Account?.id,
              Name: fetchBag?.Account?.name,
              ManufacturerId__c: fetchBag?.Manufacturer?.id,
              PONumber: PONumber,
              desc: orderDesc,
              SalesRepId: localStorage.getItem("Sales_Rep__c"),
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
            OrderPlaced({ order: begToOrder })
              .then((response) => {
                if (response) {
                  fetchBag.orderList.map((ele) => addOrder(ele.product, 0, ele.discount));
                  localStorage.removeItem("orders");
                  setIsDisabled(false);
                  navigate("/order-list");
                  setIsOrderPlaced(2);
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
  const handleRemoveProductFromCart = (ele) => {
    addOrder(ele.product, 0, ele.discount);
  };
console.log(bagValue , "bagvalue")
  const fetchDataFromBag = () => {
    let orderStr = localStorage.getItem("orders");
    let orderDetails = {
      orderList: [],
      Account: {
        name: null,
        id: null,
        address: null,
      },
      Manufacturer: {
        name: null,
        id: null,
      },
    };
    if (orderStr) {
      let orderList = Object.values(JSON.parse(orderStr));
      if (orderList.length > 0) {
        orderDetails.Account.id = orderList[0].account.id;
        orderDetails.Account.name = orderList[0].account.name;
        orderDetails.Account.address = JSON.parse(orderList[0].account.address);
        orderDetails.Manufacturer.id = orderList[0].manufacturer.id;
        orderDetails.Manufacturer.name = orderList[0].manufacturer.name;
        orderDetails.orderList = orderList;
      }
    }
    return orderDetails;
  };
  const deleteBag = () => {
    localStorage.removeItem("orders");
    window.location.reload();
  };

  const fetchBrandPaymentDetails = async () => {
    try {
      let fetchBag = fetchBeg();
      const user = await GetAuthData();
      const brandRes = await getBrandPaymentDetails({
        key: user.data.x_access_token,
        Id: fetchBag?.Manufacturer?.id,
      });
      if (brandRes.Stripe_Secret_key_test__c && brandRes.Stripe_Secret_key_test__c) {
        setIsPlayAble(1);
      }

      console.log("Brand Payment Details:", brandRes);
      setPaymentDetails({ PK_KEY: brandRes.Stripe_Publishable_key_test__c, SK_KEY: brandRes.Stripe_Secret_key_test__c });
      return {
        PK_KEY: brandRes.Stripe_Publishable_key_test__c,
        SK_KEY: brandRes.Stripe_Secret_key_test__c,
      };
    } catch (error) {
      console.log("Error fetching brand payment details:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchBrandPaymentDetails();
  }, []);
  const orderGenerationHandler = () => {
    if (paymentDetails.PK_KEY && paymentDetails.SK_KEY) {
      setPaymentDetails((prev) => ({
        ...prev,
        Amount: total,
      }));
      setIsPlayAble(1);
    } else {
      if (Object.keys(orders)?.length) {
        if (PONumber?.length) {
          setConfirm(true);
        } else {
          setPONumberFilled(false);
        }
      }
    }
  };

  const handleAccordian = () => {
    setDetailsAccordian(false);
    setPaymentAccordian(true);
  };

  const doNothing = () => {};
  if (isOrderPlaced === 1) return <OrderLoader />;
  return (
    <div className="mt-4">
      {isLoading ? (
        <Loading height={"50vh"} />
      ) : (
        <section>
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
                        <span> {bagValue?.Manufacturer?.name} | </span> {bagValue?.Account?.name}
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
                            productLists.some((product) => product.product.Category__c?.toUpperCase()?.includes("PREORDER")) && !PONumber.startsWith("PRE")
                            ? `PRE-${PONumber}`
                            : PONumber
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
                        onChange={handleNameChange}
                      />
                    )}
                  </h5>

                  {!isPOEditable && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none" onClick={() => setIsPOEditable(true)} style={{ cursor: "pointer" }}>
                      <path
                        d="M19.3078 10.6932V19.2841C19.3078 19.6794 18.9753 20 18.5652 20H0.742642C0.332504 20 0 19.6794 0 19.2841V2.10217C0 1.70682 0.332504 1.38627 0.742642 1.38627H9.65389C10.064 1.38627 10.3965 1.70682 10.3965 2.10217C10.3965 2.49754 10.064 2.81809 9.65389 2.81809H1.48519V18.5682H17.8226V10.6932C17.8226 10.2979 18.1551 9.97731 18.5652 9.97731C18.9753 9.97731 19.3078 10.2979 19.3078 10.6932ZM17.9926 5.11422L15.6952 2.89943L7.72487 10.5832L7.09297 13.4072L10.0223 12.7981L17.9926 5.11422ZM21 2.2148L18.7027 0L16.8541 1.78215L19.1515 3.99692L21 2.2148Z"
                        fill="black"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className={Styles.MyBagFinalMain}>
                <div className="row">
                  <div className="col-lg-7 col-md-8 col-sm-12">
                    <div className={Styles.MainBag}>
                      <h3>SHOPPING BAG ({orderQuantity})</h3>
                      <div className={Styles.scrollP}>
                        <div className={`${Styles.MainInner} overflow-auto`} style={{ minHeight: "400px" }}>
                          {localStorage.getItem("orders") && Object.values(JSON.parse(localStorage.getItem("orders")))?.length > 0 ? (
                            Object.values(JSON.parse(localStorage.getItem("orders")))?.map((ele) => {
                              // console.log(ele);
                              total += parseFloat(ele.product?.salesPrice * ele.quantity);
                              return (
                                <div className={Styles.Mainbox}>
                                  <div className={Styles.Mainbox1M}>
                                    <div className={Styles.Mainbox2} style={{ cursor: "pointer" }}>
                                      {ele.product?.ContentDownloadUrl ? (
                                        <img
                                          src={ele.product?.ContentDownloadUrl}
                                          f
                                          className="zoomInEffect"
                                          alt="img"
                                          width={50}
                                          onClick={() => {
                                            setProductDetailId(ele?.product?.Id);
                                          }}
                                        />
                                      ) : !productImage.isLoaded ? (
                                        <LoaderV2 />
                                      ) : productImage.images?.[ele.product?.ProductCode] ? (
                                        productImage.images[ele.product?.ProductCode]?.ContentDownloadUrl ? (
                                          <img
                                            src={productImage.images[ele.product?.ProductCode]?.ContentDownloadUrl}
                                            alt="img"
                                            width={25}
                                            onClick={() => {
                                              setProductDetailId(ele?.product?.Id);
                                            }}
                                          />
                                        ) : (
                                          <img
                                            src={productImage.images[ele.product?.ProductCode]}
                                            alt="img"
                                            width={25}
                                            onClick={() => {
                                              setProductDetailId(ele?.product?.Id);
                                            }}
                                          />
                                        )
                                      ) : (
                                        <img
                                          src={Img1}
                                          alt="img"
                                          onClick={() => {
                                            setProductDetailId(ele?.product?.Id);
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div className={Styles.Mainbox3}>
                                      <h2
                                        onClick={() => {
                                          setProductDetailId(ele?.product?.Id);
                                        }}
                                        style={{ cursor: "pointer" }}
                                      >
                                        {ele.product?.Name}
                                      </h2>
                                      <p>
                                        <span className={Styles.Span1}>
                                          {ele.product?.usdRetail__c.includes("$") ? `$${(+ele.product?.usdRetail__c.substring(1)).toFixed(2)}` : `$${Number(ele.product?.usdRetail__c).toFixed(2)}`}
                                        </span>
                                        <span className={Styles.Span2}>${Number(ele.product?.salesPrice).toFixed(2)}</span>
                                        {false && (
                                          <span className={Styles.Span2}>
                                            <input type="number" onKeyUp={(e) => onPriceChangeHander(ele.product, e.target.value)} />
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  <div className={Styles.Mainbox2M}>
                                    <div className={Styles.Mainbox4} onClick={() => handleRemoveProductFromCart(ele)}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="19" viewBox="0 0 14 19" fill="none">
                                        <path
                                          d="M1.02103 2.77521H4.90502V1.78442C4.90522 1.49679 5.0213 1.22098 5.22779 1.01753C5.43429 0.814078 5.71433 0.699599 6.00645 0.699219H7.99421C8.28633 0.699599 8.56637 0.814078 8.77287 1.01753C8.97936 1.22098 9.09545 1.49679 9.09564 1.78442V2.77521H12.9796C13.2504 2.77521 13.51 2.88111 13.7015 3.06962C13.8929 3.25812 14.0005 3.51378 14.0005 3.78036V4.96501C14.0004 5.21951 13.9022 5.4645 13.7258 5.65052C13.5494 5.83654 13.3079 5.94974 13.05 5.96729V16.6215C13.0495 17.1206 12.8481 17.5991 12.4898 17.9521C12.1315 18.3052 11.6457 18.5039 11.1388 18.5047H2.86258C2.35572 18.5039 1.86988 18.3052 1.51161 17.9521C1.15334 17.5991 0.951874 17.1206 0.951392 16.6215V5.96836C0.693394 5.95099 0.451705 5.83786 0.275144 5.65183C0.0985832 5.46579 0.00030899 5.22071 0.000172615 4.96608V3.78144C2.86102e-05 3.64935 0.0263271 3.51853 0.0775661 3.39646C0.128804 3.27438 0.203979 3.16345 0.298788 3.07C0.393598 2.97655 0.506184 2.90241 0.630111 2.85183C0.754039 2.80125 0.886876 2.77521 1.02103 2.77521ZM8.51229 1.78442C8.5122 1.64909 8.4576 1.51933 8.36049 1.42357C8.26337 1.32781 8.13165 1.27388 7.99421 1.27359H6.00645C5.86901 1.27388 5.73729 1.32781 5.64017 1.42357C5.54306 1.51933 5.48847 1.64909 5.48837 1.78442V2.77521H8.51229V1.78442ZM1.53401 16.6215C1.5343 16.9683 1.67424 17.3008 1.92316 17.5462C2.17207 17.7916 2.50964 17.9297 2.86185 17.9304H11.1381C11.4903 17.9297 11.8279 17.7916 12.0768 17.5462C12.3257 17.3008 12.4656 16.9683 12.4659 16.6215V5.97123H1.53401V16.6215ZM0.583519 4.96608C0.583519 5.08033 0.629614 5.1899 0.711662 5.27069C0.793712 5.35148 0.904994 5.39686 1.02103 5.39686H12.9796C13.0957 5.39686 13.2069 5.35148 13.289 5.27069C13.371 5.1899 13.4171 5.08033 13.4171 4.96608V3.78144C13.4171 3.66719 13.371 3.55762 13.289 3.47684C13.2069 3.39605 13.0957 3.35066 12.9796 3.35066H1.02103C0.904994 3.35066 0.793712 3.39605 0.711662 3.47684C0.629614 3.55762 0.583519 3.66719 0.583519 3.78144V4.96608Z"
                                          fill="black"
                                        />
                                        <path
                                          d="M9.28889 16.1916C9.21154 16.1916 9.13735 16.1613 9.08265 16.1075C9.02795 16.0536 8.99722 15.9806 8.99722 15.9044V7.95906C8.99722 7.88289 9.02795 7.80985 9.08265 7.75599C9.13735 7.70213 9.21154 7.67188 9.28889 7.67188C9.36625 7.67188 9.44044 7.70213 9.49514 7.75599C9.54984 7.80985 9.58057 7.88289 9.58057 7.95906V15.9044C9.58057 15.9806 9.54984 16.0536 9.49514 16.1075C9.44044 16.1613 9.36625 16.1916 9.28889 16.1916Z"
                                          fill="black"
                                        />
                                        <path
                                          d="M4.83479 16.1916C4.75744 16.1916 4.68325 16.1613 4.62855 16.1075C4.57385 16.0536 4.54312 15.9806 4.54312 15.9044V7.95906C4.54312 7.88289 4.57385 7.80985 4.62855 7.75599C4.68325 7.70213 4.75744 7.67188 4.83479 7.67188C4.91215 7.67188 4.98634 7.70213 5.04104 7.75599C5.09574 7.80985 5.12646 7.88289 5.12646 7.95906V15.9044C5.12646 15.9806 5.09574 16.0536 5.04104 16.1075C4.98634 16.1613 4.91215 16.1916 4.83479 16.1916Z"
                                          fill="black"
                                        />
                                      </svg>
                                    </div>
                                    <div className={Styles.Mainbox5}>
                                      <QuantitySelector
                                        min={ele.product.Min_Order_QTY__c || 0}
                                        onChange={(quantity) => {
                                          addOrder(ele.product, quantity, ele.discount);
                                        }}
                                        value={ele.quantity}
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <>
                              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                                No Products in Bag
                              </div>
                            </>
                          )}
                        </div>
                        <div className={Styles.TotalPricer}>
                          <div>
                            <h2>Total</h2>
                          </div>
                          <div>
                            <h2>${Number(total).toFixed(2)}</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-5 col-md-4 col-sm-12">
                    {isPlayAble === 1 ? (
                      <CustomAccordion title="Shipping Address" isOpen={detailsAccordian}>
                        <div className={Styles.ShippControl}>
                          {/* <h2>Shipping Address</h2> */}

                          <div className={Styles.ShipAdress}>
                            {buttonActive ? (
                              <p>
                                {bagValue?.Account?.address?.street}, {bagValue?.Account?.address?.city} <br />
                                {bagValue?.Account?.address?.state}, {bagValue?.Account?.address?.country} {bagValue?.Account?.address?.postalCode}
                                <br />
                                {bagValue?.Account?.address?.email} {bagValue?.Account?.address?.contact && `{ |  ${bagValue?.Account?.address?.contact}}`}
                              </p>
                            ) : (
                              <p>No Shipping Address</p>
                            )}
                          </div>

                          <div className={Styles.ShipAdress2}>
                            {/* <label>NOTE</label> */}
                            <textarea onKeyUp={(e) => setOrderDesc(e.target.value)} placeholder="NOTE" className="placeholder:font-[Arial-500] text-[14px] tracking-[1.12px] " />
                          </div>
                          {!PONumberFilled ? (
                            <ModalPage
                              open
                              content={
                                <>
                                  <div style={{ maxWidth: "309px" }}>
                                    <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Warning</h1>
                                    <p className={` ${StylesModal.ModalContent}`}>Enter PO Number</p>
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
                            {isPlayAble === 1 ? (
                              <button onClick={handleAccordian} disabled={!buttonActive}>
                                PROCEED TO PAY
                              </button>
                            ) : (
                              <button onClick={orderGenerationHandler} disabled={!buttonActive}>
                                ${Number(total).toFixed(2)} PLACE ORDER
                              </button>
                            )}
                            {isPlayAble != 0 ? (
                              <p
                                className={`${Styles.ClearBag}`}
                                style={{ textAlign: "center", cursor: "pointer" }}
                                onClick={() => {
                                  if (Object.keys(orders).length) {
                                    if (clearConfim.length) {
                                      orderPlaceHandler();
                                    } else {
                                      setClearConfim(true);
                                    }
                                  }
                                }}
                                disabled={!buttonActive}
                              >
                                Clear Bag
                              </p>
                            ) : null}

                            {/* {Number(total) ? null : window.location.reload()} */}
                          </div>
                        </div>
                      </CustomAccordion>
                    ) : (
                      <div className={Styles.ShippControl}>
                        <h2>Shipping Address</h2>

                        <div className={Styles.ShipAdress}>
                          {buttonActive ? (
                            <p>
                              {bagValue?.Account?.address?.street}, {bagValue?.Account?.address?.city} <br />
                              {bagValue?.Account?.address?.state}, {bagValue?.Account?.address?.country} {bagValue?.Account?.address?.postalCode}
                              <br />
                              {bagValue?.Account?.address?.email} {bagValue?.Account?.address?.contact && `{ |  ${bagValue?.Account?.address?.contact}}`}
                            </p>
                          ) : (
                            <p>No Shipping Address</p>
                          )}
                        </div>

                        <div className={Styles.ShipAdress2}>
                       
                          <textarea onKeyUp={(e) => setOrderDesc(e.target.value)} placeholder="NOTE" className="placeholder:font-[Arial-500] text-[14px] tracking-[1.12px] " />
                        </div>
                        {!PONumberFilled ? (
                          <ModalPage
                            open
                            content={
                              <>
                                <div style={{ maxWidth: "309px" }}>
                                  <h1 className={`fs-5 ${StylesModal.ModalHeader}`}>Warning</h1>
                                  <p className={` ${StylesModal.ModalContent}`}>Enter PO Number</p>
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
                          {isPlayAble === 1 ? (
                            <button onClick={handleAccordian} disabled={!buttonActive}>
                              PROCEED TO PAY
                            </button>
                          ) : (
                            <button onClick={orderGenerationHandler} disabled={!buttonActive}>
                              ${Number(total).toFixed(2)} PLACE ORDER
                            </button>
                          )}
                          <p
                            className={`${Styles.ClearBag}`}
                            style={{ textAlign: "center", cursor: "pointer" }}
                            onClick={() => {
                              if (Object.keys(orders).length) {
                                if (clearConfim.length) {
                                  orderPlaceHandler();
                                } else {
                                  setClearConfim(true);
                                }
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

                    <div>
                      {isPlayAble === 1 ? (
                        <CustomAccordion title="Payment Details" isOpen={paymentAccordian}>
                          <StripePay description={orderDesc} PO_Number={PONumber} PK_KEY={paymentDetails.PK_KEY} SK_KEY={paymentDetails.SK_KEY} amount={total} uniqueId={uniqueId} />
                        </CustomAccordion>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <ProductDetails
        productId={productDetailId}
        setProductDetailId={setProductDetailId}
        ManufacturerId={bagValue?.Manufacturer?.id}
        AccountId={bagValue?.Account?.id}
        SalesRepId={localStorage.getItem("Sales_Rep__c")}
      />
      {/* ManufacturerId={Object.values(JSON.parse(localStorage.getItem("orders")))?.[0]?.manufacturer?.id} AccountId={Object.values(JSON.parse(localStorage.getItem("orders")))?.[0]?.account?.id} */}
    </div>
  );
}

export default MyBagFinal;
