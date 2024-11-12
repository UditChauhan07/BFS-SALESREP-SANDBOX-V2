import React, { useEffect } from "react";
import styles from "../topNav/index.module.css";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContent";

const LogoHeader = () => {

  const CartHandler = () => {
    const { getOrderQuantity ,deleteOrder} = useCart()
    let quantity = getOrderQuantity() ?? 0;
    if (quantity) {

      return (<Link to="/my-bag" className={`linkStyle`}> My Bag ({getOrderQuantity()})
      </Link>)
    } else {
      return "My Bag(0)";
    }
  }
  return (
    <>
      <div className={styles.laptopModeSticky}>
        <div className={` ${styles.laptopMode}`}>
          <div className={`${styles.lapSetting} d-none-print`} style={{ minWidth: '300px' }}>
            <p className={`m-0  ${styles.language}`}>
              <Link to="/order" className={`linkStyle`}>
                Order Now
              </Link>
            </p>
            <p className={`m-0   ${styles.language}`}>
              <Link to="/new-arrivals" className={`linkStyle`}>
                New Arrivals
              </Link>
            </p>
          </div>
          {/* image div */}
          <div className={styles.lapSetting}>
            <Link to="/dashboard" className={`linkStyle`}>
              <img src={"/assets/images/BFSG_logo.svg"} alt="img" />
            </Link>
          </div>
          {/* my bag */}
          <div className={`${styles.lapSetting} d-none-print`} style={{ minWidth: '300px', justifyContent: 'end' }}>
            <p className={`m-0 w-[100px]  ${styles.language} flex`}>
              <a href="#search" data-rr-ui-event-key="#search" className=" pr-0 nav-link active"><div className="search-container"><input className="search expandright" id="searchright" type="search" name="" placeholder="Search..." /><label className="button searchbutton" for="searchright"><span className="searchCode">Search...</span> <span className="mglass">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="8.24976" cy="8.25" r="4.5" stroke="black" />
                  <path d="M8.24976 6C7.95428 6 7.6617 6.0582 7.38872 6.17127C7.11574 6.28434 6.8677 6.45008 6.65877 6.65901C6.44983 6.86794 6.2841 7.11598 6.17103 7.38896C6.05795 7.66195 5.99976 7.95453 5.99976 8.25" stroke="black" stroke-linecap="round" />
                  <path d="M14.9998 15L12.7498 12.75" stroke="black" stroke-linecap="round" />
                </svg>
              </span> </label></div></a>
              {/* <img src={"/assets/images/searchIcon.svg"} alt="img" /> */}
            </p>

            <p className={`m-0  ${styles.language}`}>
              <Link to="/dashboard" className={`linkStyle`}>
                Dashboard
              </Link>
            </p>
            <p className={`m-0  ${styles.language}`}>
                <CartHandler />
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoHeader;
