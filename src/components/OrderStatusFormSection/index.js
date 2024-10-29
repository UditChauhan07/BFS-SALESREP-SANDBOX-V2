import { useEffect, useState } from "react";
import styles from "./style.module.css";
import stylesV2 from "./stylev2.module.css";
import { DateConvert, GetAuthData, getOrderDetailId, getSupportFormRaw, postSupport, supportClear, supportDriveBeg, supportShare, uploadFileSupport } from "../../lib/store";
import { Link, useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { OrderStatusSchema } from "../../validation schema/OrderStatusValidation";
import TextError from "../../validation schema/TextError";
import Select from "react-select";
import { BiUpload } from "react-icons/bi";
import Loading from "../Loading";
import ModalPage from "../Modal UI";

const OrderStatusFormSection = () => {
  const navigate = useNavigate();
  const [supportTicketData, setTicket] = useState();
  const [activeBtn, setActive] = useState(false);
  const [submitLoad, setSubmitLoad] = useState(false)
  const [confirm, setConfirm] = useState(false);
  const [orderDetails, setOrderDetail] = useState();

  useEffect(() => {
    let data = supportDriveBeg();
    setTicket(data);
    GetAuthData().then((user) => {
      if (data.orderStatusForm.opportunityId) {
        let rawData = { key: user.data.x_access_token, opportunity_id: data.orderStatusForm.opportunityId }
        getOrderDetailId({ rawData }).then((res) => {
          setOrderDetail(res)
        }).catch((orderErr) => {
          console.log({ orderErr });
        })
      }
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }, []);

  const onChangeHandler = (key, value) => {
    let temp = supportTicketData;
    temp.orderStatusForm[key] = value;
    supportShare(temp)
      .then((response) => {
        let data = supportDriveBeg();
        setTicket(data);
      })
      .catch((error) => {
        console.error({ error });
      });
  };
  const onSubmitHandler = (values) => {
    setSubmitLoad(true)
    setActive(true);
    let temp = supportTicketData;
    temp.orderStatusForm["desc"] = values.description;
    supportShare(temp)
      .then((response) => {
        let data = supportDriveBeg();
        setTicket(data);
        GetAuthData()
          .then((user) => {
            supportTicketData.key = user?.data?.x_access_token;
            postSupport({ rawData: supportTicketData })
              .then((response) => {
                let flush = supportClear();
                if (response) {
                  if (files.length > 0) {
                    uploadFileSupport({ key: user?.data?.x_access_token, supportId: response, files }).then((fileUploader) => {
                      if (fileUploader) {
                        setSubmitLoad(false)
                        navigate("/CustomerSupportDetails?id=" + response);
                      }
                    }).catch((fileErr) => {
                      setSubmitLoad(false)
                      console.log({ fileErr });
                    })
                  } else {
                    setSubmitLoad(false)
                    navigate("/CustomerSupportDetails?id=" + response);
                  }
                }
              })
              .catch((err) => {
                console.error({ err });
              });
          })
          .catch((error) => {
            console.error({ error });
          });
      })
      .catch((error) => {
        console.error({ error });
      });
    return;
  };
  const initialValues = {
    description: supportTicketData?.orderStatusForm?.desc || ""
  };
  let [files, setFile] = useState([])
  function handleChange(e) {
    let tempFile = [...files];
    let reqfiles = e.target.files;
    if (reqfiles) {
      if (reqfiles.length > 0) {
        Object.keys(reqfiles).map((index) => {
          let url = URL.createObjectURL(reqfiles[index])
          if (url) {
            tempFile.push({ preview: url, file: reqfiles[index] });
          }
          // this thoughing me Failed to execute 'createObjectURL' on 'URL': Overload resolution failed?
        })
      }
    }
    setFile(tempFile);
  }
  const fileRemoveHandler = (index) => {
    let tempFile = [...files];
    tempFile.splice(index, 1)
    setFile(tempFile);
  }
  const formentAcmount = (amount) => {
    return `${Number(amount).toFixed(2)?.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`
  }
  if (supportTicketData?.orderStatusForm?.opportunityId) {
    if (!orderDetails?.Id) {
      return <Loading />
    }
    return (<section>
      <ModalPage
        open={confirm || false}
        content={
          <div className="d-flex flex-column gap-3">
            <h2>
              Confirm
            </h2>
            <p>
              Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
            </p>
            <div className="d-flex justify-content-around ">
              <button className={styles.btn} onClick={() => onSubmitHandler(confirm)}>
                Submit
              </button>
              <button className={styles.btn} onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        }
        onClose={() => {
          setConfirm(false);
        }}
      />
      <Formik initialValues={initialValues} validationSchema={OrderStatusSchema} onSubmit={(values) => { setConfirm(values) }}>
        <Form>
          <h2 className={stylesV2.TitleHolder}><b>Order Po</b> {orderDetails.PO_Number__c} {orderDetails.Order_Number__c && <>({orderDetails.Order_Number__c})</>} <span style={{ float: 'right', fontWeight: 'bold' }}>Support For <p style={{ margin: 0, fontWeight: 'initial' }}>{supportTicketData?.orderStatusForm?.reason}</p></span></h2>
          <p className={stylesV2.titleSubHolder}>{DateConvert(orderDetails.CreatedDate, true)}</p>
          <div className={`${stylesV2.dFlex} ${stylesV2.spaceBetween}`}>
            <div className={stylesV2.itemsHolder}>
              <div className={stylesV2.detailsCardTitleHolder}>
                <b className="mt-2">Order Item</b>
                <div className={stylesV2.itemHolder}>
                  {orderDetails.OpportunityLineItems.map((item) => (
                    <div className={`${stylesV2.dFlex} ${stylesV2.borderBottom}`}>
                      <div className={stylesV2.imgHolder}>
                        <img src={item.ContentDownloadUrl ?? "https://b2b.beautyfashionsales.com/dummy.png"} alt="dummy" />
                      </div>
                      <div className={stylesV2.productDetailsHolder}>
                        <p className={stylesV2.productTitleHolder}>{item.Name.split(orderDetails.Name)}&nbsp;<span className={stylesV2.contentHolder}>({item.ProductCode})</span></p>
                        <div className={`${stylesV2.dFlex} ${stylesV2.spaceEnd} mt-2`}>
                          <p className={`${stylesV2.productTitleHolder} ml-4`}><small style={{ fontSize: '9px' }}>qty</small> {item.Quantity} x {formentAcmount(item.UnitPrice)}</p>
                          <p className={`${stylesV2.productTitleHolder} ml-4`}><small style={{ fontSize: '9px' }}>pirce</small> {formentAcmount(item.TotalPrice)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`${stylesV2.detailsCardTitleHolder}`}>
                <b>Order Summary</b>
                <p className={`${stylesV2.dFlex} ${stylesV2.spaceBetween} mt-2 mb-1`}><span>Total</span> <span>{formentAcmount(orderDetails.Amount)}</span></p>
              </div>
            </div>
            <div className={stylesV2.orderDetailsHolder}>
              <div className={stylesV2.detailsCardTitleHolder}>
                <b>Notes</b>
                <p className="mb-2 mt-1">{orderDetails.Description ?? "NA"}</p>
              </div>
              <div className={stylesV2.detailsCardTitleHolder}>
                <b>Store</b>
                <p className="mb-2 mt-1">{orderDetails.Name}</p>
              </div>
              <div className={stylesV2.detailsCardTitleHolder}>
                <b>Brand</b>
                <p className="mb-2 mt-1">{orderDetails.ManufacturerName__c}</p>
              </div>
              <div className={stylesV2.detailsCardTitleHolder}>
                <b>Shipping Address</b>
                <p className="mb-2 mt-1">{orderDetails.Shipping_Street__c},<br />{orderDetails.Shipping_City__c},{orderDetails.Shipping_State__c}, {orderDetails.Shipping_Country__c}<br /> {orderDetails.Shipping_Zip__c}</p>
              </div>
              {/* <div className={stylesV2.detailsCardTitleHolder}>
              <b>Description</b>
              <p className="mb-2 mt-1"> <Field component="textarea" rows={6} style={{ width: '100%',background:'#f0f5f5' }} name="description" defaultValue={initialValues.description} />
              <p className="mt-1">
                <ErrorMessage component={TextError} name="description" />
                </p>
              </p>
            </div> */}
            </div>
            <Link to={"/orderStatus"} className={`${styles.btn} ${stylesV2.backButton}`}>
              Cancel
            </Link>
            <input type="submit" className={`${styles.btn} ${stylesV2.submitButton}`} value={"Submit"} disabled={activeBtn} />
          </div>
        </Form>
      </Formik>
    </section>)
  } else {
    return (
      <>
        {submitLoad ? <Loading height={"70vh"} /> :
          <>
            <ModalPage
              open={confirm || false}
              content={
                <div className="d-flex flex-column gap-3">
                  <h2>
                    Confirm
                  </h2>
                  <p>
                    Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
                  </p>
                  <div className="d-flex justify-content-around ">
                    <button className={styles.btn} onClick={() => onSubmitHandler(confirm)}>
                      Submit
                    </button>
                    <button className={styles.btn} onClick={() => setConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              }
              onClose={() => {
                setConfirm(false);
              }}
            />
            <Formik initialValues={initialValues} validationSchema={OrderStatusSchema} onSubmit={(values) => { setConfirm(values) }}>
              {(formProps) => (
                <div className={styles.container}>
                  <Form className={styles.formContainer}>
                    <b className={styles.containerTitle}>{supportTicketData?.orderStatusForm?.reason == "Status of Order" ? "Status of the order" : supportTicketData?.orderStatusForm?.reason == "Invoice" ? "Invoice of the order" : supportTicketData?.orderStatusForm?.reason == "Tracking Status" ? "Tracking status of the order" : null}</b>
                    <label className={styles.labelHolder}>
                      Describe your issues
                      <Field component="textarea" placeholder="Description" rows={4} name="description" defaultValue={initialValues.description}></Field>
                    </label>
                    <ErrorMessage component={TextError} name="description" />
                    <div className={styles.attachHolder}>
                      <p className={styles.subTitle}>upload some attachments</p>
                      <label className={styles.attachLabel} for="attachement"><div><div className={styles.attachLabelDiv}><BiUpload /></div></div></label>
                      <input type="file" style={{ width: 0, height: 0 }} id="attachement" onChange={handleChange} multiple accept="image/*" />
                      <div className={styles.imgHolder}>
                        {files.map((file, index) => (
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', right: '5px', top: '-5px', color: '#000', zIndex: 1, cursor: 'pointer', fontSize: '18px' }} onClick={() => { fileRemoveHandler(index) }}>x</span>
                            <a href={file?.preview} target="_blank" title="Click to Download">
                              <img src={file?.preview} key={index} alt={file?.preview} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* <label className={styles.labelHolder} title="Please select for get email Notification">
              &nbsp;Send Updates via email
              <p className="ml-2">
                <input
                  type="checkbox"
                  
                  checked={supportTicketData?.orderStatusForm?.sendEmail}
                  onChange={(e) => {
                    onChangeHandler("sendEmail", e.target.checked);
                  }}
                />&nbsp;
                Yes Please
              </p>
            </label> */}
                    <div className={styles.dFlex}>
                      {" "}
                      <Link to={"/orderStatus"} className={styles.btn}>
                        Cancel
                      </Link>
                      <input type="submit" className={styles.btn} value={"Submit"} disabled={activeBtn} />
                    </div>
                  </Form>
                </div>
              )}
            </Formik></>}
      </>
    );
  }
};
export default OrderStatusFormSection;
