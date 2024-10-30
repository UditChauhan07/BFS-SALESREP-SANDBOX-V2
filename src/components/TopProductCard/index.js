import { useEffect, useState } from "react";
import Styles from "./index.module.css";
import LoaderV2 from "../loader/v2";
import { Link } from "react-router-dom";
import ProductDetails from "../../pages/productDetails";
import { useBag } from "../../context/BagContext";
import ModalPage from "../Modal UI";
import QuantitySelector from "../BrandDetails/Accordion/QuantitySelector";
import { DeleteIcon } from "../../lib/svg";
import { useNavigate } from "react-router-dom";

const TopProductCard = ({ data, productImages, to = null, accountDetails = {}, addToCart = true }) => {
  const navigate = useNavigate();
  const [productDetailId, setProductDetailId] = useState(null);
  const { orders, setOrders, setOrderQuantity, addOrder, setOrderProductPrice } = useBag();
  const [product, setProduct] = useState({ isLoaded: false, data: [], discount: {} });
  const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
  const [replaceCartProduct, setReplaceCartProduct] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectBrand, setBrand] = useState();
  const [salesRepId, setsalesRepId] = useState();
  useEffect(() => {}, [productDetailId, productImages]);

  const orderSetting = (element, quantity, manufacturer) => {
    setReplaceCartModalOpen(false);
    addOrder(element, quantity, product.discount, manufacturer);
  };
  const onQuantityChange = (element, quantity, salesPrice = null, discount = null) => {
    if (accountDetails?.[element.ManufacturerId__c]?.SalesRepId) {
      setIsModalOpen(false);
      localStorage.setItem("manufacturer", element.ManufacturerName__c);
      localStorage.setItem("ManufacturerId__c", element.ManufacturerId__c);
      localStorage.setItem("address", JSON.stringify(accountDetails?.[element.ManufacturerId__c]?.ShippingAddress));
      localStorage.setItem(
        "shippingMethod",
        JSON.stringify({
          number: accountDetails?.[element.ManufacturerId__c]?.AccountNumber,
          method: accountDetails?.[element.ManufacturerId__c]?.ShippingMethod,
        })
      );
      localStorage.setItem("Sales_Rep__c", accountDetails?.[element.ManufacturerId__c]?.SalesRepId);
      element.salesPrice = salesPrice;
      if (Object.values(orders).length) {
        if (
          Object.values(orders)[0]?.manufacturer?.id === element.ManufacturerId__c &&
          Object.values(orders)[0].account.id === localStorage.getItem("AccountId__c") &&
          Object.values(orders)[0].productType === (element.Category__c === "PREORDER" ? "pre-order" : "wholesale")
        ) {
          orderSetting(element, quantity, { id: element.ManufacturerId__c, name: element.ManufacturerName__c });
          setReplaceCartModalOpen(false);
        } else {
          setReplaceCartModalOpen(true);
          setReplaceCartProduct({ product: element, quantity });
        }
      } else {
        orderSetting(element, quantity, { id: element.ManufacturerId__c, name: element.ManufacturerName__c });
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const onPriceChangeHander = (element, price = "0") => {
    if (price == "") price = 0;
    setOrderProductPrice(element, price);
  };
  const replaceCart = () => {
    localStorage.removeItem("orders");
    setReplaceCartModalOpen(false);
    setOrderQuantity(0);
    setOrders({});
    addOrder(replaceCartProduct.product, replaceCartProduct.quantity, product.discount);
  };
  return (
    <section>
      {replaceCartModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2>Warning</h2>
              <p>
                Adding this item will replace <br></br> your current cart
              </p>
              <div className="d-flex justify-content-around ">
                <button className={Styles.btn} onClick={replaceCart}>
                  OK
                </button>
                <button className={Styles.btn} onClick={() => setReplaceCartModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setReplaceCartModalOpen(false);
          }}
        />
      ) : null}
      {isModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2>Warning</h2>
              <p>
              You can not order from this brand.<br/> Kindly contact your Sales Rep
              </p>
              <div className="d-flex justify-content-around ">
                <button className={Styles.btn} onClick={() => setIsModalOpen(false)}>
                  Ok
                </button>
              </div>
            </div>
          }
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      ) : null}
      <div>
        <div className={Styles.dGrid}>
          {data.map((product) => {
            let listPrice = Number(product?.usdRetail__c?.replace("$", "")?.replace(",", ""));
            let salesPrice = 0;
            let discount = accountDetails?.[product?.ManufacturerId__c]?.Discount?.margin||0;
            let inputPrice = Object.values(orders)?.find(
              (order) =>
                order.product.Id === product?.Id &&
                order.manufacturer.name === product?.ManufacturerName__c &&
                order.account.id === localStorage.getItem("AccountId__c")
            )?.product?.salesPrice;
            if (product?.Category__c === "TESTER") {
              discount = accountDetails?.[product?.ManufacturerId__c]?.Discount?.testerMargin;
              salesPrice = (+listPrice - ((accountDetails?.[product?.ManufacturerId__c]?.Discount?.testerMargin||0) / 100) * +listPrice).toFixed(2);
            } else if (product?.Category__c === "Samples") {
              discount = accountDetails?.[product?.ManufacturerId__c]?.Discount?.sample;
              salesPrice = (+listPrice - ((accountDetails?.[product?.ManufacturerId__c]?.Discount?.sample||0) / 100) * +listPrice).toFixed(2);
            } else {
              salesPrice = (+listPrice - ((accountDetails?.[product?.ManufacturerId__c]?.Discount?.margin||0) / 100) * +listPrice).toFixed(2);
            }
            return (
              <div className={Styles.cardElement}>
                <div className={Styles.salesHolder}>
                  <svg class="salesIcon" viewBox="0 0 100 100">
                    <circle  r="45" cx="50" cy="50"fill="none" stroke="#ccc"  stroke-width="5" stroke-dasharray="283" stroke-dashoffset="283">
                      {" "}
                      <animate attributeName="stroke-dashoffset" from="283" to="0" dur="2s" fill="freeze" />{" "}
                    </circle>
                    <text
                      x="50%"
                      y="50%"
                      dominant-baseline="middle"
                      text-anchor="middle"
                      fill="#6a6a6a"
                      font-family="Montserrat-500"
                      font-size="27px"
                      fontWeight="600"
                      line-height="42px"
                      text-shadow="2px 2px 2px rgba(0, 0, 0, 0.5)"
                      text-transform="uppercase"
                    >
                      {" "}
                      <tspan>{product.Sales}</tspan>{" "}
                    </text>{" "}
                  </svg>
                </div>
                {productImages?.isLoaded ? (
                  <div className={` last:mb-0 mb-4 ${Styles.HoverArrow}`}>
                  <div className={` border-[#D0CFCF] flex flex-col gap-4 h-full  ${Styles.ImgHover1}`}>
                  <img
                    className={Styles.imgHolder}
                    onClick={() => {
                      setProductDetailId(product.Id);
                      setBrand(product.ManufacturerId__c);
                      setsalesRepId(accountDetails?.[product.ManufacturerId__c]?.SalesRepId ?? null);
                    }}
                    src={product.ProductImage?product.ProductImage:productImages?.images?.[product.ProductCode]?.ContentDownloadUrl ?? "\\assets\\images\\dummy.png"}
                  />
                  </div>
                  </div>
                ) : (
                  <LoaderV2 />
                )}
                <p className={Styles.brandHolder} onClick={()=>navigate("/Brand/"+product.ManufacturerId__c)}>{product?.ManufacturerName__c}</p>
                <p
                  className={Styles.titleHolder}
                  onClick={() => {
                    setProductDetailId(product.Id);
                    setBrand(product.ManufacturerId__c);
                    setsalesRepId(accountDetails?.[product.ManufacturerId__c]?.SalesRepId ?? null);
                  }}
                >
                  {product?.Name.substring(0, 20)}...
                </p>
                {product?.Category__c === "PREORDER" && <small className={Styles.preOrderBadge}>Pre-Order</small>}
                <p className={Styles.priceHolder}>
                  
                {salesPrice!=listPrice&&<p className={Styles.priceCrossed}>${listPrice.toFixed(2)}</p>}
                  {orders[product?.Id] ? <Link to={"/my-bag"}>${salesPrice}</Link> : <p>${salesPrice}</p>}
                </p>
                {orders[product?.Id] ? (
                  <>
                    {/* <b className={Styles.priceHolder}>{inputPrice * orders[product?.Id]?.quantity}</b> */}
                    <div className="d-flex">
                      <QuantitySelector
                        min={product?.Min_Order_QTY__c || 0}
                        value={orders[product?.Id]?.quantity}
                        onChange={(quantity) => {
                          onQuantityChange(
                            product,
                            quantity,
                            inputPrice || parseFloat(salesPrice),
                            accountDetails?.[product?.ManufacturerId__c]?.Discount
                          );
                        }}
                      />
                      <button
                        className="ml-4"
                        onClick={() =>
                          onQuantityChange(product, 0, inputPrice || parseFloat(salesPrice), accountDetails?.[product?.ManufacturerId__c]?.Discount)
                        }
                      >
                        <DeleteIcon fill="red" />
                      </button>
                    </div>
                  </>
                ) : to ? (
                  <Link to={to} className={Styles.linkHolder}>
                    <p className={Styles.btnHolder}>add to Cart</p>
                  </Link>
                ) : (
                  <p
                    className={Styles.btnHolder}
                    onClick={() =>
                      onQuantityChange(
                        product,
                        product?.Min_Order_QTY__c || 1,
                        inputPrice || parseFloat(salesPrice),
                        accountDetails?.[product?.ManufacturerId__c]?.Discount
                      )
                    }
                    style={{ cursor: "pointer" }}
                  >
                    Add to Cart
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <ProductDetails
        productId={productDetailId}
        setProductDetailId={setProductDetailId}
        accountDetails={accountDetails?.[product?.ManufacturerId__c]}
        AccountId={localStorage.getItem("AccountId__c")}
        ManufacturerId={localStorage.getItem("ManufacturerId__c")}
        SalesRepId={salesRepId}
      />
    </section>
  );
};
export default TopProductCard;
