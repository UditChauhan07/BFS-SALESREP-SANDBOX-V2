import { useEffect, useState, forwardRef, useRef } from "react";
import CustomerSupportLayout from "../components/customerSupportLayout";
import BMAIHandler from "../components/IssuesHandler/BMAIHandler";
import Attachements from "../components/IssuesHandler/Attachements";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { DestoryAuth, getAllAccountBrand, getAllAccountOrders, GetAuthData, months, postSupportAny, uploadFileSupport } from "../lib/store";
import { CalenderIcon } from "../lib/svg";
import OrderListHolder from "../components/OrderList/List";
import LoaderV4 from "../components/loader/v4";
import ModalPage from "../components/Modal UI";
import LoaderV3 from "../components/loader/v3";
import AppLayout from "../components/AppLayout";
import SelectableCardList from "../components/Badges";
import Bubbles from "../components/Badges/bubble";
const PortalHelp = () => {
    const navigate = useNavigate();
    const [maxDate, setMaxDate] = useState(new Date());
    let recordId = "012Rb000003EFK1IAO";
    const [vType, setVType] = useState({ main: null, child: null });
    const [files, setFile] = useState([]);
    const [desc, setDesc] = useState();
    const [confirm, setConfirm] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState();
    const [browserInfo, setBrowserInfo] = useState();
    const [manufacturer, setManufacturer] = useState();
    const [orderId, setOrderId] = useState();
    const [subject, setSubject] = useState();
    const [orderType, setOrderType] = useState();
    const [orderDate, setOrderDate] = useState();
    const [manufacturerList, setManufacturerList] = useState([]);
    const [pageAffected, setPageAffected] = useState();
    const [orderList, setOrderList] = useState({ isLoaded: false, data: [] });
    const [isNoneCheck, setIsNoneCheck] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false)
    const [sumitForm, setSubmitForm] = useState(false)
    // const [accountList, setAccountList] = useState([]);
    useEffect(() => {
        GetAuthData().then((user) => {
            if (user) {
                getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) }).then((brands) => {
                    setManufacturerList(brands);
                }).catch((brandErr) => {
                    console.log({ brandErr });
                })
                // getAllAccountLocation({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) }).then((accounts) => {
                //     console.log({accounts});

                //     setAccountList(accounts)
                //     if(accounts.length==1){
                //         setManufacturerList(accounts[0].data);

                //     }
                //   }).catch((storeErr) => {
                //     console.log({ storeErr });
                //   })
            } else {
                DestoryAuth();
            }
        }).catch((err) => {
            console.log({ err });
        })
    }, [])
    let visitType = [
        { name: "Portal Issues", icon: '/assets/images/portalIssuesicon.svg', desc: "Get support for issues related to portal" },
        { name: "Order Issues", icon: '/assets/images/orderIssuesIcon.svg', desc: "Find solutions for problems related to order" },
        { name: "General Feedback", icon: '/assets/images/infoIcon.svg', desc: "Share feedback related to portal" },
    ]
    let orderIssues = [
        {
            name: "Can't find my Order in portal", icon: '/assets/images/orderUnknownIcon.png',
            desc: "Order Disappeared? Solutions to Get It Back."
        },
        {
            name: "Not able to Order", icon: '/assets/images/orderFailedIcon.png',
            desc: "Addressing Your Concerns About Ordering"
        },
    ]


    let orderTypes = [
        { name: "Wholesale Numbers", value: "Wholesale Numbers" },
        { name: "Pre order", value: "Pre order" },
    ]
    const pages = [
        { name: "Dashboard", value: "Dashboard" },
        { name: "Orders", value: "Orders" },
        { name: "Marketing Calendar", value: "Marketing Calendar" },
        { name: "Reports", value: "Reports" }
    ]
    let styles = {
        holder: {
            border: '1px dashed #ccc',
            padding: '10px',
            width: '100%',
            marginBottom: '20px'
        },
        title: {
            color: '#000',
            textAlign: 'left',
            fontFamily: 'Montserrat',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: '24px',
            letterSpacing: '2.2px',
            textTransform: 'uppercase'
        },
        field: {
            width: '100%',
            minHeight: '40px',
            borderBottom: '1px solid #ccc',
            borderRadius: '10px',
            background: '#f4f4f4'
        }
    }


    // Function to get the browser information
    const getBrowserInfo = () => {
        const userAgent = navigator.userAgent;
        let browser = "Unknown";

        if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Edg") === -1 && userAgent.indexOf("OPR") === -1) {
            browser = "Chrome"; // Google Chrome
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            browser = "Safari"; // Apple Safari
        } else if (userAgent.indexOf("Firefox") > -1) {
            browser = "Firefox"; // Mozilla Firefox
        } else if (userAgent.indexOf("Edg") > -1) {
            browser = "Edge"; // Microsoft Edge
        } else if (userAgent.indexOf("OPR") > -1 || userAgent.indexOf("Opera") > -1) {
            browser = "Opera"; // Opera
        } else if (userAgent.indexOf("Brave") > -1) {
            browser = "Brave"; // Brave
        } else if (userAgent.indexOf("Vivaldi") > -1) {
            browser = "Vivaldi"; // Vivaldi
        } else if (userAgent.indexOf("SamsungBrowser") > -1) {
            browser = "Samsung Internet"; // Samsung Internet
        } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
            browser = "Internet Explorer"; // Internet Explorer
        } else if (userAgent.indexOf("DuckDuckGo") > -1) {
            browser = "DuckDuckGo"; // DuckDuckGo Privacy Browser
        } else if (userAgent.indexOf("OPiMini") > -1) {
            browser = "Opera Mini"; // Opera Mini
        }

        return browser;
    };

    // Use useEffect to run the function when the component mounts
    useEffect(() => {
        const browser = getBrowserInfo();
        setBrowserInfo({ value: browser });
    }, []);

    // Function to detect the device type
    const getDeviceInfo = () => {
        const userAgent = navigator.userAgent;

        // Device detection logic to match your predefined options
        if (/Android/i.test(userAgent)) {
            return 'Android';
        } else if (/iPhone|iPod/i.test(userAgent)) {
            return 'iOS'; // iOS for iPhones
        } else if (/iPad/i.test(userAgent)) {
            return 'iPadOS'; // iPadOS for iPads
        } else if (/Windows NT/i.test(userAgent)) {
            return 'Windows';
        } else if (/Mac OS/i.test(userAgent) && !/iPhone|iPad/i.test(userAgent)) {
            return 'Mac';
        } else if (/Linux/i.test(userAgent)) {
            return 'Linux';
        } else if (/CrOS/i.test(userAgent)) {
            return 'Chrome OS';
        } else {
            return 'Other'; // Default case for unmatched devices
        }
    };


    // Use useEffect to run the function when the component mounts
    useEffect(() => {
        const device = getDeviceInfo();
        setDeviceInfo({ value: device });
    }, []);


    const HtmlFieldInput = ({ id, title, value, onChange, type = 'text' }) => {
        return (<div style={styles.holder}>
            <p style={styles.title}>{title}</p>
            <input type={type} style={styles.field} id={id} value={value} onKeyUp={onChange} />
        </div>)
    }

    const HtmlFieldSelect = ({ title, list = [], value, onChange }) => {
        return (<div style={styles.holder}>
            <p style={styles.title}>{title}</p>
            <Select
                type="text"
                id={title.replaceAll(/\s+/g, '-')}
                options={list}
                onChange={(option) => {
                    onChange?.(option)
                }}
                value={list ? list.find((option) => option.value === value?.value) : ""}
            />
        </div>)
    }

    const ResetHandler = () => {
        resetErrorHandler();
        setDesc('');
        setConfirm(false);
        const device = getDeviceInfo();
        setDeviceInfo({ value: device });
        const browser = getBrowserInfo();
        setBrowserInfo({ value: browser });
        setFile([])
        setPageAffected();
        setSubject();
        setOrderList({ isLoaded: false, data: [] });
        setIsNoneCheck(false)
        setVType((prevState) => ({
            ...prevState,        // Spread the previous state
            child: null // Update the child value
        }));
        setOrderDate();
        setOrderType();
        setManufacturer();
    }
    const ResetHandlerChild = () => {
        resetErrorHandler();
        setOrderType();
        setOrderDate()
        setDesc('');
        setConfirm(false);
        const device = getDeviceInfo();
        setDeviceInfo({ value: device });
        const browser = getBrowserInfo();
        setBrowserInfo({ value: browser });
        setFile([])
        setPageAffected();
        setSubject();
        setOrderList({ isLoaded: false, data: [] });
        setIsNoneCheck(false);
        setManufacturer();
    }
    const resetErrorHandler = () => {
        let descElement = document.getElementById("desc");
        let pageEElement = document.getElementById("Page-Affected");
        let brandElement = document.getElementById("Choose-Brand");
        let orderTypeElement = document.getElementById("Choose-Order-Type");
        if (descElement) {
            descElement.style.border = '1px solid #ccc';
        }
        if (pageEElement) {
            pageEElement.style.border = '1px solid #ccc';
        }
        if (brandElement) {
            brandElement.style.border = '1px solid #ccc';
        }
        if (orderTypeElement) {
            orderTypeElement.style.border = '1px solid #ccc';
        }
    }
    const DatePickerLabel = forwardRef(({ value, onClick }, ref) => (
        <button type='button' className='w-[100%] d-flex justify-content-between align-items-center m-0' style={{ background: '#fff', color: '#000', height: '38px', padding: '15px' }} onClick={onClick} ref={ref}>
            <span>{value}</span>
            <CalenderIcon fill='#000' />
        </button>
    ));

    const getSelectDateOrder = (value) => {
        setOrderList({ isLoaded: false, data: [] })
        let date = new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
        setOrderDate(value)
        GetAuthData()
            .then((response) => {
                getAllAccountOrders({
                    key: response.data.x_access_token,
                    accountIds: JSON.stringify(response.data.accountIds),
                    date: formattedDate,
                })
                    .then((order) => {
                        setOrderList({ isLoaded: true, data: order })
                        console.log({ order });
                    })
                    .catch((error) => {
                        console.log({ error });
                    });
            })
            .catch((err) => {
                console.log({ err });
            });
    }
    const shakeHandler = (id = null) => {
        if (id) {

            let lock = document.getElementById(id);
            if (lock) {
                setTimeout(() => {
                    lock.classList.remove('shake');
                }, 300)
                lock.classList.add('shake')
            }
        }
    }
    const SubmitHandler = () => {
        setIsDisabled(true)
        setSubmitForm(true)
        GetAuthData()
            .then((user) => {
                if (user) {
                    let subject = `Portal Help for ${vType.main}`;
                    if (vType.child) {
                        subject += ` that ${vType.child}`
                    }
                    let systemDesc = `Device : ${deviceInfo.value},\nBrowser : ${browserInfo.value},\n`;
                    if (pageAffected) {
                        if (pageAffected.value) {
                            systemDesc += `Issue on : ${pageAffected.value},\n`
                        }
                    }
                    if (orderDate) {
                        let date = new Date(orderDate);
                        let datemonth = `${date.getDate()} ${months[date.getMonth()]}`;
                        subject += ` Created On ${datemonth}`
                    }
                    if (orderType) {
                        if (orderType?.value) {
                            systemDesc += `Order Type : ${orderType.value},\n`
                        }
                    }
                    if (desc) {
                        systemDesc += `User Wrote : ${desc}`
                    }
                    let rawData = {
                        orderStatusForm: {
                            typeId: "012Rb000003EFK1IAO",
                            reason: vType.main,
                            salesRepId: "0053b00000DgEvqAAF",
                            contactId: user.data.retailerId,
                            accountId: user.data.accountIds[0],
                            opportunityId: orderId,
                            manufacturerId: manufacturer?.value || null,
                            desc: systemDesc,
                            priority: "Medium",
                            sendEmail: true,
                            subject,
                        },
                        key: user.data.x_access_token,
                    };
                    postSupportAny({ rawData })
                        .then((response) => {
                            if (response) {
                                if (response) {
                                    if (files.length > 0) {
                                        setIsDisabled(false);
                                        uploadFileSupport({ key: user.x_access_token, supportId: response, files }).then((fileUploader) => {
                                            setIsDisabled(false)
                                            if (fileUploader) {
                                                navigate("/CustomerSupportDetails?id=" + response);
                                                setSubmitForm(false);
                                            }
                                        }).catch((fileErr) => {
                                            console.log({ fileErr });
                                        })
                                    } else {
                                        setIsDisabled(false);
                                        setSubmitForm(false);

                                        navigate("/CustomerSupportDetails?id=" + response);
                                    }
                                }
                            }
                        })
                        .catch((err) => {
                            setSubmitForm(false);
                            setIsDisabled(false);
                            console.error({ err });
                        });
                }
            })
            .catch((error) => {
                setSubmitForm(false);
                setIsDisabled(false);
                console.log(error);
            });
    }
    const confimationHandler = (value) => {
        if (value) {
            let error = false;
            let descElement = document.getElementById("desc");
            let pageEElement = document.getElementById("Page-Affected");
            let brandElement = document.getElementById("Choose-Brand");
            let orderTypeElement = document.getElementById("Choose-Order-Type");

            if (vType.main == "Portal Issues") {
                if (pageEElement) {
                    if (!pageAffected) {
                        error = true;
                        pageEElement.style.border = '1px solid red';
                        pageEElement.style.borderRadius = '4px'
                        shakeHandler("Page-Affected");
                    } else {
                        pageEElement.style.border = '1px solid #ccc';
                    }
                }
            } else if (vType.main == "Order Issues") {
                if (vType.child) {
                    if (vType.child == "Not able to Order") {
                        if (!orderType) {
                            error = true;
                            orderTypeElement.style.border = '1px solid red';
                            orderTypeElement.style.borderRadius = '4px';
                            shakeHandler("Choose-Order-Type");
                        } else {
                            orderTypeElement.style.border = '1px solid #ccc';
                        }
                    }
                    if (!manufacturer) {
                        error = true;
                        brandElement.style.border = '1px solid red';
                        brandElement.style.borderRadius = '4px';
                        shakeHandler("Choose-Brand");
                    } else {
                        brandElement.style.border = '1px solid #ccc';
                    }
                }
            } else {

            }
            if (descElement) {
                if (!desc) {
                    error = true;
                    descElement.style.border = '1px solid red';
                    shakeHandler("desc");
                } else {
                    descElement.style.border = 'none';
                }
            }
            if (!error) {
                setConfirm(value);
            }
        }
    }

    if (sumitForm) return <AppLayout><LoaderV3 text={"Generating You ticket. Please wait..."} /></AppLayout>;
    return (<CustomerSupportLayout>
        <ModalPage
            open={confirm}
            content={
                <div className="d-flex flex-column gap-3" style={{ maxWidth: '700px' }}>
                    <h2 >Please Confirm</h2>
                    <p style={{ lineHeight: '22px' }}>
                        Are you sure you want to generate a ticket?<br /> This action cannot be undone.<br /> You will be redirected to the ticket page after the ticket is generated.
                    </p>
                    <div className="d-flex justify-content-around ">
                        <button disabled={isDisabled} style={{ backgroundColor: '#000', color: '#fff', fontFamily: 'Montserrat-600', fontSize: '14px', fontStyle: 'normal', fontWeight: '600', height: '30px', letterSpacing: '1.4px', lineHeight: 'normal', width: '100px' }} onClick={() => { SubmitHandler() }}>
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
        {orderDate ?
            <LoaderV4 loading={!orderList.isLoaded} /> : null
        }
        <BMAIHandler title reasons={visitType} setReason={(reason) => setVType({ main: reason })} reason={vType.main} resetHandler={ResetHandler} />
        {vType?.main == "Order Issues" ?
            <div>

                <BMAIHandler name="sub categories" title={false} reasons={orderIssues} setReason={(reason) => {
                    setVType((prevState) => ({
                        ...prevState,        // Spread the previous state
                        child: reason // Update the child value
                    }));
                }} reason={vType.child} resetHandler={ResetHandlerChild} />
                <>
                    {(vType.child == "Can't find my Order in portal" && isNoneCheck) ?
                        <div className=" mr-2 w-full">
                            <Bubbles title={"Choose Brand"} data={manufacturerList} value={manufacturer} handleChange={(value) => setManufacturer(value)} />
                        </div>
                        : vType.child == "Not able to Order" ?
                            <>
                                <div className=" mr-2 w-full">
                                    <Bubbles title={"Choose Brand"} data={manufacturerList} value={manufacturer} handleChange={(value) => setManufacturer(value)} />
                                </div>
                                <div className="ml-2 mr-2 w-full">
                                    <SelectableCardList title={"Choose Order Type"} data={orderTypes} onCardSelect={(value) => setOrderType(value)
                                    } />
                                </div>
                            </>
                            :
                            null}
                </>
            </div>
            : vType.main == "Portal Issues" ? <SelectableCardList data={pages} title={"Page Affected"} onCardSelect={(value) => setPageAffected(value)} /> : null}
        {vType ? vType.main ? (vType.child != "Can't find my Order in portal" || isNoneCheck) ?
            <Attachements title={vType?.main == "General Feedback" ? "Please define your feedBack below" : "to Help us by sharing details"} files={files} setFile={setFile} setDesc={setDesc} orderConfirmed={(vType?.main == "Order Issues" && vType.child) ? true : (vType?.main && vType?.main != "Order Issues") ? true : false} setConfirm={confimationHandler} unLockIcon={<div className="d-flex flex-column text-[10px]" style={{ float: 'right' }}><small style={{ lineHeight: 1, letterSpacing: '0.5px' }}><b>device:</b>&nbsp;{deviceInfo?.value ?? 'Other'}</small><small style={{ lineHeight: 1, letterSpacing: '0.5px' }}><b>browser:</b>&nbsp;{browserInfo?.value ?? 'Other'}</small></div>}>
            </Attachements> : null : null : null}
        {vType ? vType.main == "Order Issues" ? (vType.child == "Can't find my Order in portal" && !isNoneCheck) ?
            <>
                <div id="needHelpDatePickerHolder" className="" style={{ ...styles.holder, marginTop: '1rem' }}>
                    <p style={styles.title}>{'Order Date'}</p>
                    <div style={{ width: '300px' }}>
                        <DatePicker
                            selected={orderDate}
                            onChange={(value) => getSelectDateOrder(value)}
                            dateFormat="MMM/dd/yyyy"
                            popperPlacement="auto"
                            // minDate={minDate}
                            // maxDate={maxDate}
                            popperModifiers={{
                                preventOverflow: {
                                    enabled: true,
                                },
                            }}
                            inline={(!orderList.isLoaded && !orderDate)}
                            maxDate={maxDate}
                            customInput={<DatePickerLabel />}
                        />
                    </div>
                    {orderList.isLoaded ?
                        <div>
                            <p style={styles.title}>{'Order List'}</p>
                            <OrderListHolder data={orderList.data || []} />
                            <div className="d-flex" style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontFamily: "Montserrat",
                                fontSize: '16px',
                                fontStyle: 'normal',
                                fontWeight: 600,
                                padding: '0px 10px',
                                lineHeight: '33px',
                                letterSpacing: '1.6px',
                                textTransform: 'uppercase',
                                border: '1px solid #ccc',
                                background: '#000',
                                width: 'fit-content',
                                float: 'left',
                                margin: '20px auto'
                            }}>
                                <input type="checkbox" id="none" onClick={() => setIsNoneCheck(!isNoneCheck)} checked={isNoneCheck} />
                                <label for="none">&nbsp;
                                    {orderList.data.length ? "None of this?" : "Still can't find your order?"}
                                </label>
                            </div>
                        </div>
                        :
                        null}
                </div>

            </> : null : null : null}

    </CustomerSupportLayout>)
}
export default PortalHelp;