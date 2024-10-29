import React from "react";

import footerStyle from "./index.module.css";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <>
    <div className="container d-none-print">
      <div className=" ">
        {/* left part */}
        <div className="row ">
          
          
          <div className="col-lg-4 col-md-4 col-6">
        <div className="mt-3">
          <p className={`m-0 ${footerStyle.heading}`}>BFSG</p>
          <p className={`m-0 ${footerStyle.subheadings}`}>
            <Link to="/about-us" className="linkStyle">
              About Us
            </Link>
          </p>
          <p className={`m-0 ${footerStyle.subheadings}`}>
            <Link to="/customer-care" className="linkStyle">
              Customer Care
            </Link>
          </p>
          <p className={`m-0 ${footerStyle.subheadings}`}><Link to="/Careers" className="linkStyle">Careers</Link></p>
          
          <p className={`m-0 ${footerStyle.subheadings}`}>
          <Link to="/wholesale-inquiry" className="linkStyle">
          Wholesale Enquires
            </Link>
          
            </p>
          {/* <p className={`m-0 ${footerStyle.subheadings}`}>What our retailers are saying</p> */}
        </div>
        </div>

 {/* right part show in mobile version */}
 <div className={`col-lg-3 col-md-3 col-6 ${footerStyle.joinMobileUs }`}>
          <div className="d-flex justify-content-end ">
        <div className="mt-3  ">
          <p className={`m-0 ${footerStyle.heading}`}>
           Join US</p>
          <p className={`m-0 ${footerStyle.subheadings}`}>Instagram</p>
          <p className={`m-0 ${footerStyle.subheadings}`}>Linkedin</p>
        </div>
        </div>
        </div>

 {/* center part */}
        <div className="col-lg-5 col-md-5 col-sm-12">
        <div className="mt-3">
          <p className={`m-0 ${footerStyle.heading}`}>Newsletter</p>
          <p className={`m-0 ${footerStyle.subheadings}`}>Be the first to know about new arrivals and brand updates by</p>
          <p className={`m-0 ${footerStyle.subheadings}`}>submitting your email. You can opt out at any time.</p>
          {/* <p className={`m-0 ${footerStyle.subheadings} text-decoration-underline`}>privacy policy</p> */}
          <div className={`p-2 ps-3 mt-3 ${footerStyle.box}`}>
            <p className={`m-0 ${footerStyle.boxText}`}>
              <input type="text" placeholder="sign up for our newsletters." className={`${footerStyle.boxText} form-control border-0 m-0`} style={{outline:"none"}} />
              </p>
          </div>
        </div>
        </div>
        {/* right part */}
        <div className={`col-lg-3 col-md-3 col-sm-6 ${footerStyle.joinWebUs}`}>
          <div className="d-flex justify-content-end ">
        <div className="mt-3  ">
        <Link to="/join-us" className="linkStyle"> <p className={`m-0 ${footerStyle.heading}`}>Join US</p></Link>
        <Link to="/instagram"  className="linkStyle"><p className={`m-0 ${footerStyle.subheadings}`}>Instagram</p></Link>
        <Link to="/linkdin"  className="linkStyle"> <p className={`m-0 ${footerStyle.subheadings}`}>Linkedin</p></Link>
        </div>
        </div>
        </div>
      </div>
      <div className={`mt-3 ${footerStyle.copyright}`}>2023 © Beauty Fashion Sales Group, Inc. All rights reserved.</div>
      </div>
      </div>
    </>
  );
};

export default Footer;
