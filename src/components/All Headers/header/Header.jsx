import React, { useState } from "react";
import styles from "./index.module.css";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
const Header = () => {
  const navigate = useNavigate();
  const path = window.location.pathname;
  return (
    <div className="d-none-print">
      <div id={`${styles.main}`} className="d-flex justify-content-between  align-items-center gap-1">
        <p className={`m-0 ${styles.text}`}>
          <Link to="/top-products" className="linkStyle">
            Top Products
          </Link>
        </p>

{/* marketing material  */}

<p className={`m-0 ${styles.text}`}>
          <Link to="/marketing-material" className="linkStyle">
          Marketing Material
          </Link>
        </p>

{/*  */}

        <p className={`m-0  ${styles.text}`}>
          <Link to="/marketing-calendar" className="linkStyle">
            Marketing Calendar
          </Link>
        </p>

        <p className={`m-0  ${styles.text}`}>
          <Link to="/education-center" className="linkStyle">
            Education Center
          </Link>
        </p>
        <p className={`m-0  ${styles.text}`}>
          <Link to="/customer-support" className="linkStyle">
            Customer Support
          </Link>
        </p>
        {/* credit note  */}
        <p className={`m-0  ${styles.text}`}>
          <Link to="/credit-note" className="linkStyle">
            Credit Note
          </Link>
        </p>

        {/*  */}
        <p className={`m-0  ${styles.text}`}>
          <Link to="" className="linkStyle">
            <div className="dropdown dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {path === "/sales-report" ? "Sales Report" : null || path === "/newness-report" ? "Newness Report" : null || path === "/comparison-report" ? "Comparison Report" : null|| path === "/comparison" ? "Yearly Comparison Report" : null || path === "/Target-Report" ? "Target Report" : "Reports"}
              <ul className="dropdown-menu">
                <li>
                  <Link
                    to="/sales-report"
                    className="dropdown-item text-start"
                    onClick={() => {
                      navigate("/sales-report");
                    }}
                  >
                    Sales Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newness-report"
                    className="dropdown-item text-start"
                    onClick={() => {
                      navigate("/newness-report");
                    }}
                  >
                    Newness Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/comparison-report"
                    className="dropdown-item  text-start"
                    onClick={() => {
                      navigate("/comparison-report");
                    }}
                  >
                    Comparison Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/comparison-report"
                    className="dropdown-item  text-start"
                    onClick={() => {
                      navigate("/comparison");
                    }}
                  >
                    Yearly Comparison Report
                  </Link>
                </li>
                <li>
                  <Link
                    to="/Target-Report"
                    className="dropdown-item  text-start"
                    onClick={() => {
                      navigate("/Target-Report");
                    }}
                  >
                    Target Report
                  </Link>
                </li>
              </ul>
            </div>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Header;
