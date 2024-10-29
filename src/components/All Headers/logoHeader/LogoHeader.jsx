import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styles from "../topNav/index.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContent";
import { originAPi } from "../../../lib/store";
import "./style.css";
import { GetAuthData } from "../../../lib/store"
import { FaStore } from "react-icons/fa";
import { CustomerServiceIcon } from "../../../lib/svg";
const LogoHeader = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [key , setKey] = useState()
  const navigate = useNavigate();
  const searchRef = useRef(null); 
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };
  const searchAccounts = async (term) => {
    try {
      let authData = await GetAuthData();
      let accessToken = authData?.data?.x_access_token;
      setKey(accessToken)
      const accountIds = authData?.data?.accountIds;

      let finalAccounts = accountIds.map((item) => item);
      let finalAccountsJson = JSON.stringify(finalAccounts);

      if (term.length > 2) {
        const response = await axios.post(`${originAPi}/retailerv2/search-accounts`, {
          searchTerm: term,
          accessToken: accessToken,
          accountIds: finalAccountsJson,
        });

        const combinedSuggestions = [
          ...response.data.accounts.map((account) => ({ ...account, type: "account" })),
          ...response.data.manufacturers.map((manufacturer) => ({ ...manufacturer, type: "Account_Manufacturer__c" })),

          ...response.data.opportunityLineItems.flatMap((opportunity) => {
            if (opportunity.OpportunityLineItems && opportunity.OpportunityLineItems.records) {
              return opportunity.OpportunityLineItems.records.map((lineItem) => ({
                ...lineItem.Product2,
                type: "Product2",
              }));
            }
            return [];
          }),
          // Add products to the suggestions array
          ...response.data.products.map((product) => ({
            ...product,
            type: "Product2",
          })),
          ...response.data.case.map((item) => ({
            ...item,
            type: "case",
          })),
        ];

        setSuggestions(combinedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchAccounts(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSuggestionClick = (id, manufacturerId, type, opportunityId) => {
    if (type === "account") {
      navigate(`/store/${id}`);
    } else if (type === "Account_Manufacturer__c") {
      navigate(`/Brand/${manufacturerId}`);
    } else if (type === "Product2") {
      if (opportunityId) {
        // For opportunity line items, navigate to `orderDetails`
        localStorage.setItem("OpportunityId", JSON.stringify(opportunityId));
        navigate(`/orderDetails`);
      } else {
        // For standalone products, navigate to product details
        navigate(`/productPage/${id}`);
      }
    } else if (type === "case") {
      navigate(`/CustomerSupportDetails?id=${id}`);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchTerm("");
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const CartHandler = () => {
    const { getOrderQuantity } = useCart();
    let quantity = getOrderQuantity() ?? 0;
    return quantity ? (
      <Link to="/my-bag" className="linkStyle">
        My Bag ({quantity})
      </Link>
    ) : (
      "My Bag(0)"
    );
  };


  return (
    <>
      <div className={styles.laptopModeSticky}>
        <div className={styles.laptopMode}>
          <div className={`${styles.lapSetting} d-none-print`} style={{ minWidth: "300px" }}>
            <p className={`m-0 ${styles.language}`}>
              <Link to="/order" className="linkStyle">
                Order Now
              </Link>
            </p>
            <p className={`m-0 ${styles.language}`}>
              <Link to="/new-arrivals" className="linkStyle">
                New Arrivals
              </Link>
            </p>
          </div>

          <div className={styles.lapSetting}>
            <Link to="/dashboard" className="linkStyle">
              <img src="/assets/images/BFSG_logo.svg" alt="img" />
            </Link>
          </div>

          <div className={`${styles.lapSetting} d-none-print`} style={{ minWidth: "300px", justifyContent: "end" }}>
            <p className={`m-0 w-[100px] ${styles.language} flex search-bar`}>
              <div className="search-container" ref={searchRef}>
                <input className="search expandright" id="searchright" type="search" placeholder="Search..." value={searchTerm} onChange={handleInputChange} />
                <label className="button searchbutton" htmlFor="searchright">
                  <span className="searchCode">Search...</span>
                  <span className="mglass">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="8.24976" cy="8.25" r="4.5" stroke="black" />
                      <path
                        d="M8.24976 6C7.95428 6 7.6617 6.0582 7.38872 6.17127C7.11574 6.28434 6.8677 6.45008 6.65877 6.65901C6.44983 6.86794 6.2841 7.11598 6.17103 7.38896C6.05795 7.66195 5.99976 7.95453 5.99976 8.25"
                        stroke="black"
                        strokeLinecap="round"
                      />
                      <path d="M14.9998 15L12.7498 12.75" stroke="black" strokeLinecap="round" />
                    </svg>
                  </span>
                </label>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <ul className="dropdown-search">
                    {suggestions.map((suggestion) => (
                      <li key={suggestion.Id} onClick={() => handleSuggestionClick(suggestion.Id, suggestion.ManufacturerId__c, suggestion.type, suggestion.OpportunityId)} className="">
                        <div className="suggested-images">
                          {suggestion.type === "Account_Manufacturer__c" ? (
                            <>
                              <img
                                className="search-logo"
                                src={`\\assets\\images\\brandImage\\${suggestion.ManufacturerId__c}.png`}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "\\assets\\images\\dummy.png";
                                }} //
                                alt="Manufacturer Logo"
                              />
                            </>
                          ) : null}
                          {suggestion.type === "case" ? (
                            <>
                              <CustomerServiceIcon width={30} height={30} />{" "}
                            </>
                          ) : null}
                          {suggestion.type === "account" ? (
                            <>
                              <FaStore />
                            </>
                          ) : null}

                          {suggestion.type === "Product2" ? <>
                          
                          <img  className="search-logo" src={`${suggestion.imageUrl}?oauth_token=${key}`} alt="" 
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "\\assets\\images\\dummy.png";
                              }}
                          /></> : null}
                         
                        </div>
                        <div className="suggested-content">
                          <div className="api-name">
                            {suggestion.type === "Account_Manufacturer__c" ? <>{suggestion.ManufacturerName__c}</> : null}

                            {suggestion.type === "account" ? <>{suggestion.Name}</> : null}
                            {suggestion.type === "case" ? <>{suggestion.CaseNumber}</> : null}
                            {suggestion.type === "Product2" ? (
  <>
    {suggestion.Name.length > 18
      ? `${suggestion.Name.substring(0, 18)}...`
      : suggestion.Name}
  </>
) : null}

                          </div>
                          <div className="suggested-name">
                            {suggestion.type === "Account_Manufacturer__c" ? <p className="suggestion-name">BRAND</p> : null}
                            {suggestion.type === "account" ? <p className="suggestion-name">STORE</p> : null}
                            {suggestion.type === "case" ?<p className="suggestion-name">CASE</p>: null}
                            {suggestion.type === "Product2"  &&  suggestion.OpportunityId ?<p className="suggestion-name">ORDER</p> : null}
                            {suggestion.type === "Product2" &&  !suggestion.OpportunityId ? <p className="suggestion-name">PRODUCT</p> : null}
                            
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </p>

            <p className={`m-0 ${styles.language}`}>
              <Link to="/dashboard" className="linkStyle">
                Dashboard
              </Link>
            </p>

            <p className={`m-0 ${styles.language}`}>
              <CartHandler />
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoHeader;
