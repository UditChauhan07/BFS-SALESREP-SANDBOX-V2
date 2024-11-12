import React, { useState } from "react";
import AppLayout from "../AppLayout";
import Styles from "../CustomerSupportPage/Style.module.css"
import Styles1 from "./Style.module.css"
import ModalPage from "../Modal UI";
import { Link, useNavigate } from "react-router-dom";
import { CustomerServiceIcon, OrderStatusIcon, DefaultSupportIcon, MarketingSupportIcon, DIFTestIcon, DisplayIssuesIcon, HelpIcon } from "../../lib/svg";
import SelectCaseReason from "../CustomerServiceFormSection/SelectCaseReason/SelectCaseReason";
import { BiLeftArrow } from "react-icons/bi";
import BrandManagementModal from "../Brand Management Approval/BrandManagementModal";

const CustomerSupportLayout = ({ children, filterNodes }) => {
    const navigate = useNavigate();
    const path = window.location.pathname;
    const [modalOpen, setModalOpen] = useState(false);
    const [brandManagementModalOpen, setBrandManagementModalOpen] = useState(false);
    let to = "/customer-support"
    if (path == "/orderStatusForm") {
        to = "/orderStatus"
    }

    const reasons = {
        Charges: "Charges",
        "Product Missing": "Product Missing",
        "Product Overage Shipped": "Product Overage",
        "Product Damage": "Product Damage",
        "Update Account Info": "Update Account Info",
    };
    return (
        <AppLayout
            filterNodes={filterNodes}
        >
            <div>
                <div className="">
                    <ModalPage
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        content={<SelectCaseReason reasons={reasons} onClose={() => setModalOpen(false)} recordType={{ id: "0123b0000007z9pAAA", name: "Customer Service" }} />}
                    />
                    <ModalPage
                        open={brandManagementModalOpen}
                        onClose={() => setBrandManagementModalOpen(false)}
                        content={<BrandManagementModal onClose={() => setBrandManagementModalOpen(false)} recordType={{ id: "0123b000000GfOEAA0", name: "Brand Management Approval" }} />}
                    />
                    <div className={Styles.supportMain}>
                        <div className="row">
                            <div className="col-lg-3 col-md-12 col-sm-12">
                                <div className={Styles.supportLeft}>
                                    <Link to={"/orderStatus"} className={`${(path == "/orderStatus" || path == "/orderStatusForm") && Styles1.activeReason}`}>
                                        <div className={`${Styles.supportLeftBox} cardHover`}>
                                            <div className={Styles.supportLeftImg}>
                                                <OrderStatusIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Order Status</h2>
                                                <p>View or Request Invoices and Tracking</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link to={"/customerService"} className={`${path == "/customerService" && Styles1.activeReason}`}>
                                        <div
                                            className={`${Styles.supportLeftBox} cardHover`}
                                        // onClick={() => {
                                        //   setModalOpen(true);
                                        // }}
                                        >
                                            <div className={Styles.supportLeftImg}>
                                                <CustomerServiceIcon width={42} height={42} />
                                            </div>
                                            <div className={Styles.supportLeftContent}>
                                                <h2>Customer Services </h2>
                                                <p>Report order issues or update account</p>
                                            </div>
                                        </div>
                                    </Link>
                                    {/* <Link to={"/brandManagementApproval"} className={`${path == "/brandManagementApproval" && Styles1.activeReason}`}>
                                        <div className={`${Styles.supportLeftBox} cardHover`}>
                                            <div className={Styles.supportLeftImg}>
                                                <DefaultSupportIcon width={42} height={42} />
                                            </div>
                                            <div className={Styles.supportLeftContent}>
                                                <h2>Brand Management Approval </h2>
                                                <p>Effective Management</p>
                                            </div>
                                        </div>
                                    </Link> */}
                                    {/* <div style={{cursor:'pointer'}}>
                                        <div className={Styles.supportLeftBox}>
                                            <div className={Styles.supportLeftImg}>
                                                <DisplayIssuesIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Displays Issues </h2>
                                                <p>Request updates</p>
                                            </div>
                                        </div>
                                    </div> */}
                                    {/* <Link to={"/needHelp"} className={`${path == "/needHelp" && Styles1.activeReason}`}>
                                        <div className={Styles.supportLeftBox}>
                                            <div className={Styles.supportLeftImg}>
                                                <HelpIcon width={42} height={42} />
                                            </div>

                                            <div className={Styles.supportLeftContent}>
                                                <h2>Portal Help</h2>
                                                <p>Need Help? Your Portal Solutions Await</p>
                                            </div>
                                        </div>
                                    </Link> */}
                                </div>
                            </div>

                            <div className="col-lg-9 col-md-12 col-sm-12">
                                <Link to={to} style={{ color: "#000", display: 'flex', alignItems: 'center' }}><BiLeftArrow />&nbsp;Go Back</Link>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default CustomerSupportLayout;
