import React, { useMemo, useState } from "react";
import Styles from "./Style.module.css";
import MySupportTicket from "./MySupportTicket";
import { Link } from "react-router-dom";
import { CustomerServiceIcon, OrderStatusIcon, DisplayIssuesIcon, HelpIcon } from "../../lib/svg";

function CustomerSupportPage({ data, PageSize, currentPage }) {
  return (
    <div>
      <div className="">
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
                      <p>View or Request Invoices and Tracking</p>
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
                      <p>Report order issues or update account</p>
                    </div>
                  </div>
                </Link>
                {/* <div>
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
                {/* <Link to={"/needHelp"}>
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
