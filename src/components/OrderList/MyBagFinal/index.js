import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Styles from "./Styles.module.css";
import Img1 from "./Images/Eye1.png";
import axios from "axios";
import Loading from "../../Loading";
import { useNavigate } from "react-router-dom";
import { GetAuthData, ShareDrive, getOrderDetailId, getOrderDetailsBasedId, getOrderDetailsInvoice, getProductImageAll, originAPi, supportShare } from "../../../lib/store";
import { MdOutlineDownload } from "react-icons/md";
import LoaderV2 from "../../loader/v2";
import ProductDetails from "../../../pages/productDetails";

function MyBagFinal() {
  const [OrderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const OrderId = JSON.parse(localStorage.getItem("OpportunityId"));
  const Key = JSON.parse(localStorage.getItem("Api Data"));
  const [productImage, setProductImage] = useState({ isLoaded: false, images: {} });
  const [ productDetailId, setProductDetailId] = useState(null)
  useEffect(() => {
    // let rawData = {key:Key.data.access_token,id:OrderId}
    // getOrderDetailsBasedId({rawData}).then((res)=>{
    //   console.warn({res});
    // }).catch((error)=>{
    //   console.warn({error});
    // })
    getOrderDetails();
  }, []);

  let headersList = {
    Accept: "*/*",
    "Content-Type": "application/json;charset=UTF-8",
  };
  let BodyContent = new FormData();
  BodyContent.append("key", Key.data.access_token);
  BodyContent.append("opportunity_id", OrderId);
  // getOrderDetailsInvoice({ rawData: { key: Key.data.access_token, id: OrderId } }).then((response) => {
  //   console.log({ response });
  // }).catch((error) => {
  //   console.error({ error });
  // })
  const getOrderDetails = async () => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }
    GetAuthData().then((user) => {
      let rawData = { key: user.data.x_access_token, opportunity_id: OrderId }
      getOrderDetailId({ rawData }).then((res) => {
        if (res?.ManufacturerId__c) {
          if (!data[res?.ManufacturerId__c]) {
            data[res?.ManufacturerId__c] = {};
          }
          if (Object.values(data[res?.ManufacturerId__c]).length > 0) {
            setProductImage({ isLoaded: true, images: data[res?.ManufacturerId__c] })
          } else {
            setProductImage({ isLoaded: false, images: {} })
          }
        }
        setOrderData(res);
        setIsLoading(true);
        if (res.OpportunityLineItems.length > 0) {
          let productCode = "";
          res.OpportunityLineItems?.map((element, index) => {
            productCode += `'${element?.ProductCode}'`
            if (res.OpportunityLineItems.length - 1 != index) productCode += ', ';
          })
          getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
            if (res) {
              if (data[res?.ManufacturerId__c]) {
                data[res?.ManufacturerId__c] = { ...data[res?.ManufacturerId__c], ...res }
              } else {
                data[res?.ManufacturerId__c] = res
              }
              ShareDrive(data)
              setProductImage({ isLoaded: true, images: res });
            } else {
              setProductImage({ isLoaded: true, images: {} });
            }
          }).catch((err) => {
            console.log({ err });
          })
        }
      }).catch((err1) => {
        console.log({ err1 });
      })
    }).catch((err) => {
      console.log({ err });
    })
  };
  const handleback = () => {
    navigate("/order-list");
  };
  const invoiceHandler = () => {
    if (false) {
    } else {
      GetAuthData().then((user)=>{
        let ticket = {
          orderStatusForm: {
            accountId: OrderData?.AccountId,
            contactId: user.data.retailerId,
            desc: null,
            manufacturerId: OrderData.ManufacturerId__c,
            opportunityId: OrderData.Id,
            orderNumber: OrderData.Order_Number__c,
            poNumber: OrderData.PO_Number__c,
            priority: "Medium",
            reason: "Invoice",
            salesRepId: OrderData.OwnerId,
            sendEmail: false,
          },
        };
        let statusOfSupport = supportShare(ticket)
        .then((response) => {
          if (response) navigate("/orderStatusForm");
        })
        .catch((error) => {
          console.error({ error });
        });
      }).catch((err)=>{
        console.error({err});
      })
    }
  };
  if (!isLoading) return <Loading />;

  return (
    <div>
      <section>
        <div className=" mt-4">
          <div>
            <div className={Styles.MyBagFinalTop}>
              <div className={Styles.MyBagFinalRight}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: "pointer" }}
                  width="24"
                  height="16"
                  viewBox="0 0 24 16"
                  fill="none"
                  onClick={handleback}
                >
                  <path
                    d="M8.94284 2.27615C9.46349 1.75544 9.46349 0.911229 8.94284 0.390521C8.42213 -0.130174 7.57792 -0.130174 7.05721 0.390521L2.3911 5.05666C2.39092 5.05684 2.39128 5.05648 2.3911 5.05666L0.390558 7.05721C0.153385 7.29442 0.024252 7.59868 0.00313201 7.90895C-0.00281464 7.99562 -0.000321319 8.08295 0.010852 8.17002C0.0431986 8.42308 0.148118 8.66868 0.325638 8.87322C0.348651 8.89975 0.372651 8.92535 0.397585 8.94989L7.05721 15.6095C7.57792 16.1302 8.42213 16.1302 8.94284 15.6095C9.46349 15.0888 9.46349 14.2446 8.94284 13.7239L4.55231 9.33335H22.6667C23.4031 9.33335 24 8.73642 24 8.00002C24 7.26362 23.4031 6.66668 22.6667 6.66668H4.55231L8.94284 2.27615Z"
                    fill="black"
                  />
                </svg>
                <h4>
                  {" "}
                  <span> {OrderData.ManufacturerName__c} | </span>
                  {OrderData.Name}
                </h4>{" "}
              </div>

              <div className={Styles.MyBagFinalleft}>
                <h5>
                  PO Number <b>{OrderData.PO_Number__c}</b>{" "}
                </h5>
              </div>
            </div>
            <div className={Styles.MyBagFinalMain}>
              <div className="row">
                <div className="col-lg-7 col-md-8 col-sm-12">
                  <div className={Styles.MainBag}>
                    <h3>
                      Order Details ({OrderData?.OpportunityLineItems?.length})
                    </h3>
                    <div className={Styles.scrollP}>
                      <div className={Styles.MainInner}>
                        <div className={Styles.Mainbox3}>
                          {OrderData.OpportunityLineItems?.length > 0 ? (
                            OrderData.OpportunityLineItems?.map((item) => {
                              return (
                                <div className={Styles.Mainbox}>
                                  <div className={Styles.Mainbox1M}>
                                  <div className={Styles.Mainbox2} style={{cursor:'pointer'}}>
                                      {
                                        !productImage.isLoaded ? <LoaderV2 /> :
                                          productImage.images?.[item.ProductCode] ?
                                            productImage.images[item.ProductCode]?.ContentDownloadUrl ?
                                              <img src={productImage.images[item.ProductCode]?.ContentDownloadUrl} alt="img" width={25} onClick={()=>{setProductDetailId(item?.Product2Id)}}/>
                                              : <img src={productImage.images[item.ProductCode]} alt="img" width={25} onClick={()=>{setProductDetailId(item?.Product2Id)}}/>
                                            : <img src={Img1} alt="img" onClick={()=>{setProductDetailId(item?.Product2Id)}}/>
                                      }
                                    </div>
                                    <div className={Styles.Mainbox3}>
                                    <h2 onClick={()=>{setProductDetailId(item?.Product2Id)}} style={{cursor:'pointer'}}>{item.Name.split(OrderData.Name)}</h2>
                                      <p>
                                        <span className={Styles.Span1}>
                                          ${Number(item.ListPrice).toFixed(2)}
                                        </span>
                                        <span className={Styles.Span2}>
                                          ${Number(item.UnitPrice).toFixed(2)}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className={Styles.Mainbox2M}>
                                    <div className={Styles.Mainbox5}>
                                      <button
                                        className={Styles.qtyLabelHolder}
                                        style={{ cursor: "default" }}
                                      >
                                        {item.Quantity}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <>No Products.</>
                          )}
                        </div>
                      </div>

                      <div className={Styles.TotalPricer}>
                        <div>
                          <h2>Total</h2>
                        </div>
                        <div>
                          <h2>${Number(OrderData.Amount).toFixed(2)}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 col-md-4 col-sm-12">
                  <div className={Styles.ShippControl}>
                    <h2>Shipping Address</h2>
                    <div className={Styles.ShipAdress}>
                      <p>
                        {OrderData?.Shipping_Street__c ? (
                          <>
                            {OrderData?.Shipping_Street__c},{" "}
                            {OrderData?.Shipping_City__c} <br />
                            {OrderData?.Shipping_State__c},{" "}
                            {OrderData?.Shipping_Country__c}{" "}
                            {OrderData?.Shipping_Zip__c}
                            <br />
                            {OrderData?.email}{" "}
                            {OrderData?.contact
                              ? ` | ${OrderData?.contact}`
                              : null}
                          </>
                        ) : (
                          "No Shipping Address"
                        )}
                      </p>
                    </div>
                    {OrderData.Order_Number__c && <>
                      <h2>Order Number</h2>
                      <div className={Styles.ShipAdress}>
                        <p>
                          {OrderData.Order_Number__c}
                        </p>
                      </div></>}
                    {OrderData.Tracking__c && <>
                      <h2>Tracking Number</h2>
                      <div className={Styles.ShipAdress}>
                        <p>
                          {OrderData.Tracking__c}
                        </p>
                      </div></>}

                    <div className={Styles.ShipAdress2}>
                      {/* <label>NOTE</label> */}
                      <p
                        className="placeholder:font-[Arial-500] text-[14px] tracking-[1.12px] m-0"
                        style={{ minHeight: "119px" }}
                      >
                        {OrderData.Description}
                      </p>
                    </div>
                  </div>

                  {true && (
                    <div className={Styles.ShipBut}>
                      <button className="py-1 d-flex justify-content-center" onClick={() => invoiceHandler()}>
                        <span style={{ margin: 'auto 0' }}><MdOutlineDownload size={16} /></span>&nbsp;INVOICE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} isAddtoCart={false} AccountId={OrderData.AccountId} ManufacturerId={OrderData.ManufacturerId__c}/>
    </div>
  );
}

export default MyBagFinal;
