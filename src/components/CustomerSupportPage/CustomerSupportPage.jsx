import React, { useMemo, useState } from "react";
import Styles from "./Style.module.css";
import MySupportTicket from "./MySupportTicket";
import { Link } from "react-router-dom";
import { CustomerServiceIcon, OrderStatusIcon, DefaultSupportIcon, MarketingSupportIcon, DIFTestIcon, DisplayIssuesIcon } from "../../lib/svg";
import ModalPage from "../Modal UI";
import SelectCaseReason from "../CustomerServiceFormSection/SelectCaseReason/SelectCaseReason";
import BrandManagementModal from "../Brand Management Approval/BrandManagementModal";

function CustomerSupportPage({ data, PageSize, currentPage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [brandManagementModalOpen, setBrandManagementModalOpen] = useState(false);
  const reasons = {
    Charges: "Charges",
    "Product Missing": "Product Missing",
    "Product Overage Shipped": "Product Overage",
    "Product Damage": "Product Damage",
    "Update Account Info": "Update Account Info",
  };
  return (
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
                <Link to={"/orderStatus"}>
                  <div className={Styles.supportLeftBox}>
                    <div className={Styles.supportLeftImg}>
                      <OrderStatusIcon width={42} height={42} />
                    </div>

                    <div className={Styles.supportLeftContent}>
                      <h2>Order Status</h2>
                      <p>Track Your Orders with Ease.</p>
                    </div>
                  </div>
                </Link>
                <Link to={"/customerService"}>
                <div
                  className={Styles.supportLeftBox}
                  style={{ cursor: "pointer" }}
                  // onClick={() => {
                  //   setModalOpen(true);
                  // }}
                >
                  <div className={Styles.supportLeftImg}>
                    <CustomerServiceIcon width={42} height={42} />
                  </div>
                  <div className={Styles.supportLeftContent}>
                    <h2>Customer Services </h2>
                    <p>Resolving Concerns Serving Solutions</p>
                  </div>
                </div>
                </Link>
                <div>
                  <div className={Styles.supportLeftBox}>
                    <div className={Styles.supportLeftImg}>
                      <DisplayIssuesIcon width={42} height={42} />
                    </div>

                    <div className={Styles.supportLeftContent}>
                      <h2>Displays Issues </h2>
                      <p>Empowering Solutions for Effective Management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-9 col-md-12 col-sm-12">
              {data.length ? (
                <MySupportTicket data={data} currentPage={currentPage} PageSize={PageSize} />
              ) : (
                <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No data found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupportPage;
