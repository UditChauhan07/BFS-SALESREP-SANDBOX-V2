import { ErrorMessage, Field, Form, Formik } from "formik";
import TextError from "../../validation schema/TextError";
import styles from "../OrderStatusFormSection/style.module.css";
import { AccountInfoValidation, UpdateInfoWithStoreValidation } from "../../validation schema/AccountInfoValidation";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Select from "react-select";
import { uploadFileSupport } from "../../lib/store";
import { BiUpload } from "react-icons/bi";
import ModalPage from "../Modal UI";
const AccountInfo = ({ reason, Accounts, postSupportAny, GetAuthData, dSalesRepId, setSubmitForm, accountList }) => {
    const navigate = useNavigate();
    const [isDisabled, setIsDisabled] = useState(false)
    const [confirm, setConfirm] = useState(false);
    const [accountId, setAccountId] = useState();
    const [brandList, setBrandList] = useState([]);
    const [autoSelect, setAutoSelect] = useState(false);
    const [salesRep, setSalesRep] = useState();
    const initialValues = {
        description: "",
        account: null,
        brand: null,
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
    useEffect(() => {
        if (accountList.length == 1) {
            setAccountId(accountList[0].Id)
            setBrandList(accountList[0].data)
            setAutoSelect(true)
        }
    }, [])
    const onSubmitHandler = (values) => {
        if (accountId) {
            setSubmitForm(true)
            setIsDisabled(true)
            let subject = `Customer Service for ${reason}`;
            GetAuthData()
                .then((user) => {
                    if (user) {
                        let rawData = {
                            orderStatusForm: {
                                typeId: "0123b0000007z9pAAA",
                                reason: reason,
                                manufacturerId: values.brand.value,
                                contactId: user.data.retailerId,
                                salesRepId: salesRep,
                                accountId: accountId,
                                desc: values.description,
                                priority: "Medium",
                                subject,
                            },
                            key: user.data.x_access_token,
                        };
                        postSupportAny({ rawData })
                            .then((response) => {
                                if (response) {
                                    if (response) {
                                        if (files.length > 0) {
                                            uploadFileSupport({ key: user?.data?.x_access_token, supportId: response, files }).then((fileUploader) => {
                                                if (fileUploader) {
                                                    setSubmitForm(false)
                                                    setIsDisabled(false)
                                                    navigate("/CustomerSupportDetails?id=" + response);
                                                }
                                            }).catch((fileErr) => {
                                                setSubmitForm(false)
                                                setIsDisabled(false)
                                                console.log({ fileErr });
                                            })
                                        } else {
                                            setSubmitForm(false)
                                            setIsDisabled(false)
                                            navigate("/CustomerSupportDetails?id=" + response);
                                        }
                                    }
                                }
                            })
                            .catch((err) => {
                                console.error({ err });
                            });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            alert("Select account")
        }
    }
    const SearchableSelect = (FieldProps) => {
        return (
            <Select
                type="text"
                options={FieldProps.options}
                {...FieldProps.field}

                onChange={(option) => {
                    accountList.map((a) => {
                        if (a.Id == option.value) {
                            setBrandList(a.data ?? [])
                        }
                    })
                    setAccountId(option.value)
                    FieldProps.form.setFieldValue(FieldProps.field.name, option);
                    FieldProps.form.setFieldValue("brand", null);
                }}
                value={FieldProps.options ? FieldProps.options.find((option) => option.value === FieldProps.field.value?.value) : ""}
            />
        );
    };
    const SearchableSelect1 = (FieldProps) => {
        return (
            <Select
                type="text"
                options={FieldProps.options}
                {...FieldProps.field}
                onChange={(option) => {
                    FieldProps.form.setFieldValue(FieldProps.field.name, option);
                    accountList.map((a) => {
                        if (a.Id == accountId) {
                            a.data.map((brand) => {
                                if (brand.ManufacturerId__c == option.value) {
                                    setSalesRep(brand.Sales_Rep__c)
                                }
                            })
                        }
                    })
                }}
                value={FieldProps.options ? FieldProps.options.find((option) => option.value === FieldProps.field.value?.value) : ""}
            />
        );
    };
    return (
        <Formik initialValues={initialValues} validationSchema={!autoSelect ? UpdateInfoWithStoreValidation : AccountInfoValidation} onSubmit={(value) => { setConfirm(value) }}>
            {(formProps) => (
                <div className={styles.container}>
                    <ModalPage
                        open={confirm}
                        content={
                            <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                                <h2 >Please Confirm</h2>
                                <p style={{ lineHeight: '22px' }}>
                                    Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
                                </p>
                                <div className="d-flex justify-content-around ">
                                    <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => { onSubmitHandler(confirm) }} disabled={isDisabled}>
                                        Yes
                                    </button>
                                    <button style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => setConfirm(false)}>
                                        No
                                    </button>
                                </div>
                            </div>
                        }
                        onClose={() => {
                            setConfirm(false);
                        }}
                    />
                    <Form className={styles.formContainer}>
                        <b className={styles.containerTitle}>Customer Service : {reason}</b>
                        {!autoSelect && <>
                            <label className={styles.labelHolder}>
                                Store Name
                                <Field name="account" className="account" options={accountList.map((account) => ({ label: account.Name, value: account.Id }))} component={SearchableSelect} />
                            </label>
                            <ErrorMessage component={TextError} name="account" />
                        </>}
                        <label className={styles.labelHolder}>
                            Brand Name
                            <Field name="brand" className="brand" options={brandList?.map((brand) => ({ label: brand.ManufacturerName__c, value: brand.ManufacturerId__c }))} component={SearchableSelect1} />
                        </label>
                        <ErrorMessage component={TextError} name="brand" />
                        <label className={styles.labelHolder}>
                            Describe your details that want to update
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
                        <div className={styles.dFlex}>
                            {" "}
                            <Link to={"/customer-support"} className={styles.btn}>
                                Cancel
                            </Link>
                            <input type="submit" className={styles.btn} value={"Submit"} />
                        </div>
                    </Form>
                </div>
            )}
        </Formik>
    );
}
export default AccountInfo