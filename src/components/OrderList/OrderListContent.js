
import React, { useState } from "react";
import Styles from "./style.module.css";
import TrackingStatus from "./TrackingStatus/TrackingStatus";
import Orderstatus from "./OrderStatus/Orderstatus";
import { Link } from "react-router-dom";
import { GetAuthData, postSupport } from "../../lib/store";
import { useNavigate } from "react-router-dom";
import ProductDetails from "../../pages/productDetails";
import ModalPage from "../Modal UI";
import { BiExit, BiSave } from "react-icons/bi";
function OrderListContent({ data, hideDetailedShow = false }) {
  const navigate = useNavigate();
  const [Viewmore, setviewmore] = useState(false);
  const [modalData, setModalData] = useState({});
  const [productDetailId, setProductDetailId] = useState(null)
  const [accountId, setAccountId] = useState();
  const [manufacturerId, setManufacturerId] = useState();
  const [confirm, setConfirm] = useState({});
  const [modalType, setModalType] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let size = 3;
  const MyBagId = (id) => {
    localStorage.setItem("OpportunityId", JSON.stringify(id));
  };

  const generateSuportHandler = ({ data, value }) => {
    setIsDisabled(true)
    GetAuthData().then((user) => {
      if (user.status == 200) {
        let beg = {
          orderStatusForm: {
            salesRepId: data.OwnerId,
            reason: value,
            contactId: user.data.retailerId,
            accountId: data.AccountId,
            orderNumber: data?.Order_Number__c ?? "Not Available",
            poNumber: data.PO_Number__c,
            manufacturerId: data.ManufacturerId__c,
            invoiceNumber: data.Wholesale_Invoice__c ? data.Wholesale_Invoice__c ?? "Not Available" : "Not Available",
            desc: null,
            opportunityId: data.Id,
            priority: "Medium",
            sendEmail: true
          },
          key: user?.data?.x_access_token
        };
        postSupport({ rawData: beg })
          .then((response) => {
            setIsDisabled(false)
            if (response) {
              navigate("/CustomerSupportDetails?id=" + response);
            }
          })
          .catch((err) => {
            console.error({ err });
          });
      }
    }).catch((userErr) => {
      console.error({ userErr });
    })
  };
  function downloadFiles(invoices) {
    GetAuthData().then((user) => {
      invoices.forEach(file => {
        const link = document.createElement("a");
        link.href = `${file.VersionDataUrl}?oauth_token=${user.data.x_access_token}`;
        link.download = `${file.VersionDataUrl}?oauth_token=${user.data.x_access_token}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }

  return (
    <>
      {modalType == 1 && <Orderstatus data={modalData} onClose={() => { setModalData({}); setModalType(false) }} />}
      {modalType == 3 && <TrackingStatus data={modalData} onClose={() => { setModalData({}); setModalType(false) }} />}
      <ModalPage
        open={confirm.data && confirm.value ? true : false}
        content={<div className="d-flex flex-column gap-3">
          <h2>
            Confirm
          </h2>
          <p className={Styles.modalContent}>
            Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
          </p>
          <div className="d-flex justify-content-around">
            <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => generateSuportHandler(confirm)} disabled={isDisabled}>
              <BiSave />&nbsp;generate
            </button>
            <button className={`${Styles.btn} d-flex align-items-center`} onClick={() => setConfirm(false)}>
              <BiExit /> &nbsp;Cancel
            </button>
          </div>
        </div>}
        onClose={() => { setConfirm({}) }}
      />

      {data?.length ? (
        data?.map((item, index) => {
          let [year, month, day] = item.CreatedDate.split(/[T]/)[0].split(/[-/]/);
          return (
            <div className={` ${Styles.orderStatement}`} key={index}>
              <div>
                <div className={Styles.poNumber}>
                  <div className={Styles.poNumb1}>
                    <h3>PO Number</h3>
                    <p>{item.PO_Number__c}</p>
                  </div>

                  <div className={`${Styles.poNumb1}`}>
                    <h3>Brand</h3>
                    <p className={Styles.LinkHolder} onClick={() => navigate("/Brand/" + item.ManufacturerId__c)}>{item.ManufacturerName__c}</p>
                  </div>
                  <div className={Styles.PoOrderLast}>
                    <h3>Ship To</h3>
                    <p style={{ cursor: 'pointer' }} onClick={()=>navigate("/store/"+item.AccountId)}>{item.AccountName}</p>
                  </div>
                </div>

                <div className={Styles.productDetail}>
                  <div className={Styles.Prod1}>
                    <div className={Styles.ProtuctInnerBox}>
                      <div className={Styles.BoxBlack}>
                        <div className={Styles.Boxwhite}>
                          <h1>
                            {item.ProductCount} <span>Products</span>
                          </h1>
                        </div>
                      </div>
                    </div>

                    <div className={Styles.ProtuctInnerBox1}>
                      <ul>
                        {item.OpportunityLineItems?.records.length > 0 ? (
                          item.OpportunityLineItems?.records
                            .slice(0, size)
                            .map((ele, index) => {
                              return (
                                <>
                                  <li key={index} onClick={() => { setProductDetailId(ele.Product2Id); setAccountId(item.AccountId); setManufacturerId(item.ManufacturerId__c) }} style={{ cursor: 'pointer' }}>
                                    {Viewmore
                                      ? ele.Name.split(item.AccountName)[1]
                                      : ele.Name.split(item.AccountName)
                                        .length > 1
                                        ? ele.Name.split(item.AccountName)[1]
                                          .length >= 31
                                          ? `${ele.Name.split(
                                            item.AccountName
                                          )[1].substring(0, 28)}...`
                                          : `${ele.Name.split(
                                            item.AccountName
                                          )[1].substring(0, 31)}`
                                        : ele.Name.split(item.AccountName)[0]
                                          .length >= 31
                                          ? `${ele.Name.split(
                                            item.AccountName
                                          )[0].substring(0, 28)}...`
                                          : `${ele.Name.split(
                                            item.AccountName
                                          )[0].substring(0, 31)}`}
                                  </li>
                                </>
                              );
                            })
                        ) : (
                          <p className={Styles.noProductLabel}>No Product</p>
                        )}
                      </ul>
                      <span>
                        <Link to="/orderDetails" className="linkStyling">
                          <button onClick={() => MyBagId(item.Id)}>
                            {item.OpportunityLineItems?.records?.length &&
                              item.OpportunityLineItems?.records?.length > 3 &&
                              `+${item.OpportunityLineItems?.totalSize - 3} More`}
                          </button>
                        </Link>
                      </span>
                    </div>
                  </div>

                  <div className={Styles.totalProductPrice}>
                    <div className={Styles.Margitotal}>
                      <h3>Total</h3>
                      <p>${Number(item.Amount).toFixed(2)}</p>
                    </div>
                    <div className={Styles.TicketWidth} style={hideDetailedShow ? { display: 'none' } : null}>
                      {/* <button className="me-4">View Ticket</button> */}
                      <Link to="/orderDetails">
                        <button title="View Order Information" onClick={() => MyBagId(item.Id)}>
                          View Order Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className={Styles.StatusOrder}>
                  <div className={Styles.Status1}>
                    {!item.Order_Number__c ?
                      <h3
                        title="Raise a Support Ticket for this Order on Status"
                        onClick={(e) =>
                          setConfirm({
                            data: item,
                            value: "Status of Order",
                          })
                        }
                      >
                        {" "}
                        Request status update
                      </h3> : <h3
                        title="Click to see order Status"
                        onClick={(e) => {
                          setModalData(item);
                          setModalType(1)
                        }
                        }
                      >
                        {" "}
                        View Order Status
                      </h3>}
                    {item?.Attachment && item.Attachment?.length ?
                      <h4
                        title="click to download invoice"
                        onClick={(e) =>
                          downloadFiles(item.Attachment)
                        }
                      >
                        Download Invoice
                      </h4>
                      :
                      <h4
                        title="Support Inquiry for this Order on Invoice"
                        onClick={(e) =>
                          setConfirm({
                            data: item,
                            value: "Invoice",
                          })
                        }
                      >
                        Request invoice
                      </h4>}
                    {!item?.Tracking__c ?
                      <h4
                        title="Get Help with Tracking Status"
                        onClick={(e) =>
                          setConfirm({
                            data: item,
                            value: "Tracking Status",
                          })
                        }
                      >
                        Request tracking number
                      </h4> : <h4
                        title="Click to see the tracking status"
                        onClick={(e) => { setModalData(item); setModalType(3) }
                        }
                      >
                        View Tracking
                      </h4>}
                  </div>

                  <div className={Styles.Status2}>
                    <h6>
                      Order Placed <span>: {months[parseInt(month) - 1]} {day}, {year}</span>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">
          No data found
        </div>
      )}
      <ProductDetails productId={productDetailId} setProductDetailId={setProductDetailId} AccountId={[accountId]} />
    </>
  );
}

export default OrderListContent;
