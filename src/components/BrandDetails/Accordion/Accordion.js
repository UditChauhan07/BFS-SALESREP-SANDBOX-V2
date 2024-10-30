import React, { useState } from "react";
import styles from "./Style.module.css";
import CollapsibleRow from "../../CollapsibleRow";
import QuantitySelector from "./QuantitySelector";
import ModalPage from "../../Modal UI";
import { useBag } from "../../../context/BagContext";
import LoaderV2 from "../../loader/v2";
import ProductDetails from "../../../pages/productDetails";

const Accordion = ({ data, formattedData, productImage = [], productCartSchema = {} }) => {
  const { testerInclude, sampleInclude } = productCartSchema || true;
  
  let Img1 = "/assets/images/dummy.png";
  const { orders, setOrders, setOrderQuantity, addOrder, setOrderProductPrice } = useBag();
  const [replaceCartModalOpen, setReplaceCartModalOpen] = useState(false);
  // console.log(productCartSchema)
  const [replaceCartProduct, setReplaceCartProduct] = useState({});
  const [showName, setShowName] = useState(false);
  const [productDetailId, setProductDetailId] = useState(null)
  const [msg, setMsg] = useState('');
  const onQuantityChange = (
    product,
    quantity,
    salesPrice = null,
    discount = null
  ) => {
    product.salesPrice = salesPrice;

    const currentOrder = Object.values(orders)[0];
    const manufacturerName = localStorage.getItem("manufacturer");
    const accountName = localStorage.getItem("Account");

    // Determine the product type
    const productType =
      product?.Category__c === "PREORDER"
        ? "pre-order"
        : product?.Category__c === "TESTER"
          ? "tester"
          : product?.Category__c?.toUpperCase().match("EVENT")
            ? "event"
            : product?.Category__c?.toUpperCase() === "SAMPLES"
              ? "samples"
              : "wholesale"; // default to wholesale for anything else

    if (Object.values(orders).length) {
      const isSameManufacturer = currentOrder?.manufacturer?.name === manufacturerName;
      const isSameAccount = currentOrder?.account.name === accountName;
      const currentOrderType = currentOrder?.productType;
      console.log({ currentOrderType });


      const isTester = product?.Category__c === "TESTER";
      const isSample = product?.Category__c?.toUpperCase() === "SAMPLES";
      const isPreOrder = product?.Category__c === "PREORDER";
      const isEvent = product?.Category__c?.toUpperCase().includes("EVENT");

      // Check if manufacturer and account match
      if (isSameManufacturer && isSameAccount) {
        if (currentOrderType === "wholesale") {
          // Logic for wholesale order
          if (
            !isTester &&
            !isSample &&
            productType !== "wholesale"
          ) {
            // alert("You can only add Wholesale, Tester (if allowed), or Sample (if allowed) products to this order.");
            setReplaceCartModalOpen(true);
            setReplaceCartProduct({ product, quantity });
            return;
          }

          // Check if trying to add a tester or sample without permissions
          if ((!testerInclude && isTester) || (!sampleInclude && isSample)) {
            // alert(`You cannot add ${
            //   isTester ? "Tester" : "Sample"
            // } items to this Wholesale order unless allowed.`);
            setMsg(`This brand requires you to add ${isTester ? "Tester" : "Sample"
            } Products in a separate Order <br/> and cannot be mixed with Wholesale products.
`)
            setReplaceCartModalOpen(true);
            setReplaceCartProduct({ product, quantity });
            return;
          }

          // Allow adding testers or samples if flags are true, or regular wholesale products
          orderSetting(product, quantity);
          setReplaceCartModalOpen(false);
        } else if (currentOrderType === "pre-order") {
          // Logic for pre-order order
          if (!isPreOrder && !isEvent) {
            // alert("You can only add Pre-order or Event items to this Pre-order order.");
            setReplaceCartModalOpen(true);
            setReplaceCartProduct({ product, quantity });
            return;
          }

          // Allow adding pre-order or event products
          orderSetting(product, quantity);
          setReplaceCartModalOpen(false);
        } else if (currentOrderType == "tester" && productType == "wholesale" && testerInclude) {
          // Check pass, proceed with adding the product
          orderSetting(product, quantity);
          setReplaceCartModalOpen(false);
        } else {
          // Handle other product type mismatches
          if (currentOrderType !== productType) {
            // alert("You cannot mix different product types in the same order.");
            setReplaceCartModalOpen(true);
            setReplaceCartProduct({ product, quantity });
            return;
          }

          // Check pass, proceed with adding the product
          orderSetting(product, quantity);
          setReplaceCartModalOpen(false);
        }
      } else {
        // Alert if manufacturer or account does not match
        // alert("Manufacturer or Account does not match the current order.");
        setReplaceCartModalOpen(true);
        setReplaceCartProduct({ product, quantity });
        return;
      }
    } else {
      // No previous orders, proceed with adding the product
      orderSetting(product, quantity);
      setReplaceCartModalOpen(false);
    }
  };

  const onPriceChangeHander = (product, price = '0') => {
    if (price == '') price = 0;
    console.log({ product });
    setOrderProductPrice(product, price)
  }
  const orderSetting = (product, quantity) => {
    console.log(orderSetting)
    setReplaceCartModalOpen(false);
    addOrder(product, quantity, data.discount);
  };

  const replaceCart = () => {
    localStorage.removeItem("orders");
    setReplaceCartModalOpen(false);
    setOrderQuantity(0);
    setOrders({});
    addOrder(replaceCartProduct.product, replaceCartProduct.quantity, data.discount);
  };

  const sendProductIdHandler = ({ productId, productName }) => {
    // navigate('/product/'+productName.replaceAll(" ","-").replaceAll("=","-"), { state: { productId } });
    setProductDetailId(productId)
  }
  return (
    <>
      {replaceCartModalOpen ? (
        <ModalPage
          open
          content={
            <div className="d-flex flex-column gap-3">
              <h2 className={`${styles.warning} `}>Warning</h2>
              <p className={`${styles.warningContent} `} dangerouslySetInnerHTML={{ __html: msg ? msg : "Adding this item will replace </br> your current cart" }}>
              </p>
              <div className="d-flex justify-content-around ">
                <button className={`${styles.modalButton}`} style={msg?{width:'150px'}:{}} onClick={replaceCart}>
                {msg ? "Replace cart" : "OK"}
                </button>
                <button className={`${styles.modalButton}`} onClick={() => setReplaceCartModalOpen(false)}>
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
      <div className={styles.OverFloweClass}>
        <div className={styles.accordion}>
          <table className="table table-hover ">
            <thead>
              <tr>
                <th>Image</th>
                <th style={{ width: "200px" }}>Title</th>
                <th>Product Code</th>
                <th>UPC</th>
                <th>List Price</th>
                <th style={{ width: "175px" }}>Sale Price</th>
                <th>Min Qty</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            {Object.keys(formattedData).length ? (
              <>
                <tbody>
                  {Object.keys(formattedData)?.map((key, index) => {
                    let categoryOrderQuantity = 0;
                    Object.values(orders)?.forEach((order) => {
                      if ((order.account.name === localStorage.getItem("Account")) && (order.manufacturer.name === localStorage.getItem("manufacturer")) && (order.product?.Category__c === key || `${order.product?.Category__c}` === key)) {
                        categoryOrderQuantity += order.quantity;
                      }
                    });
                    return (
                      <CollapsibleRow title={key != "null" ? key : "No Category"} quantity={categoryOrderQuantity} key={index} index={index} >
                        {Object.values(formattedData)[index]?.map((value, indexed) => {
                          let listPrice = Number(value?.usdRetail__c?.replace('$', '').replace(',', ''));
                          let salesPrice = 0;
                          let discount = data?.discount?.margin;
                          let inputPrice = Object.values(orders)?.find((order) => order.product.Id === value.Id && order.manufacturer.name === value.ManufacturerName__c && order.account.name === localStorage.getItem("Account"))?.product?.salesPrice;
                          let qtyofItem = Object.values(orders)?.find((order) => order.product.Id === value.Id && order.manufacturer.name === value.ManufacturerName__c && order.account.name === localStorage.getItem("Account"))?.quantity;
                          if (value?.Category__c === "TESTER") {
                            discount = data?.discount?.testerMargin
                            salesPrice = (+listPrice - (data?.discount?.testerMargin / 100) * +listPrice).toFixed(2)
                          } else if (value?.Category__c === "Samples") {
                            discount = data?.discount?.sample
                            salesPrice = (+listPrice - (data?.discount?.sample / 100) * +listPrice).toFixed(2)
                          } else {
                            salesPrice = (+listPrice - (data?.discount?.margin / 100) * +listPrice).toFixed(2)
                          }
                          return (
                            <tr className={`${styles.ControlTR} w-full `} key={indexed}>
                              <td className={styles.ControlStyle} style={{ cursor: 'pointer' }}>
                                {
                                  value.ContentDownloadUrl ? <img src={value.ContentDownloadUrl} className="zoomInEffect" alt="img" width={50} onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })} /> :
                                    !productImage.isLoaded ? <LoaderV2 /> :
                                      productImage.images?.[value?.ProductCode] ?
                                        productImage.images[value?.ProductCode]?.ContentDownloadUrl ?
                                          <img src={productImage.images[value?.ProductCode]?.ContentDownloadUrl} className="zoomInEffect" alt="img" width={35} onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })} />
                                          : <img src={productImage.images[value?.ProductCode]} className="zoomInEffect" alt="img" width={35} onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })} />
                                        : <img src={Img1} className="zoomInEffect" alt="img" onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })} width={50} />
                                }
                                {/* {!productImage.isLoaded?<LoaderV2/>:productImage.images[value.ProductCode]?<img src={productImage.images[value.ProductCode]?.ContentDownloadUrl?productImage.images[value.ProductCode]?.ContentDownloadUrl:productImage.images[value.ProductCode]} alt="img" width={35} />:<img src={Img1} alt="img" />} */}
                              </td>
                              <td className="text-capitalize linkEffect" style={{ fontSize: '13px', cursor: 'pointer' }} onMouseEnter={() => setShowName({ index: indexed, type: true })}
                                onMouseLeave={() => setShowName({ index: indexed })} onClick={() => sendProductIdHandler({ productId: value.Id, productName: value.Name })}>
                                {indexed !== showName?.index && value.Name.length >= 23 ? `${value.Name.substring(0, 23)}...` : value.Name}
                              </td>
                              <td>{value.ProductCode}</td>
                              <td>{(value.ProductUPC__c === null || value.ProductUPC__c === "n/a") ? "--" : value.ProductUPC__c}</td>
                              <td>{value?.usdRetail__c?.includes("$") ? `$${listPrice}` : `$${Number(value.usdRetail__c).toFixed(2)}`}</td>
                              <td>
                                <div className="d-flex">
                                  ${(qtyofItem > 0 && inputPrice || inputPrice == 0) ? (<><input type="number" value={inputPrice} placeholder={Number(inputPrice).toFixed(2)}
                                    onChange={(e) => { onPriceChangeHander(value, e.target.value < 10 ? e.target.value.replace("0", "").slice(0, 4) : e.target.value.slice(0, 4) || 0) }} id="limit_input" minLength={0} maxLength={4}
                                    name="limit_input" /></>) : salesPrice}
                                </div>
                              </td>
                              <td>{value.Min_Order_QTY__c || 0}</td>
                              <td>
                                <QuantitySelector
                                  min={value.Min_Order_QTY__c || 0}
                                  onChange={(quantity) => {
                                    onQuantityChange(value, quantity, inputPrice || salesPrice, discount);
                                  }}
                                  value={qtyofItem}
                                />
                              </td>
                              <td>{(qtyofItem > 0) ? '$' + (inputPrice * qtyofItem).toFixed(2) : '----'}</td>
                            </tr>
                          );
                        })}
                      </CollapsibleRow>
                    );
                  })}{" "}
                </tbody>
              </>
            ) : (
              <tbody>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="flex justify-start items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No Data Found</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} ManufacturerId={localStorage.getItem("ManufacturerId__c")} AccountId={localStorage.getItem("AccountId__c")} />
    </>
  );
};

export default Accordion;
