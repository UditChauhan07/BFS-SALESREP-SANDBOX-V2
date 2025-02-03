import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { Link, useNavigate } from "react-router-dom";
import { CustomerServiceIcon, HelpIcon, NeedHelp, OrderStatusIcon } from "../../../lib/svg";
import ModalPage from "../../Modal UI";
import SelectCaseReason from "../../CustomerServiceFormSection/SelectCaseReason/SelectCaseReason";
import { GetAuthData,getSessionStatus } from "../../../lib/store";
import { RiGuideLine } from "react-icons/ri";
// import Redirect from "../../Redirect";
const TopNav = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  // useEffect(()=>{
  //   GetAuthData().then((res)=>{
  //     setUserName(res.data.firstName+" "+res.data.lastName)
  //   }).catch((err)=>{
  //     console.log({err});
  //   })
  // },[])

  useEffect(()=>{
    GetAuthData().then((user)=>{      
      setUserName((user?.data?.firstName || "") + " " + (user?.data?.lastName || ""));
      getSessionStatus({key:user.data?.x_access_token,retailerId:user.data?.retailerId}).then((status)=>{

      }).catch((statusErr)=>{
        console.log({statusErr});
      })
    }).catch((userErr)=>{
      console.log({userErr});
    })
  },[])


  // console.log("userDetails", userDetails);
  const reasons = {
    Charges: "Charges",
    "Product Missing": "Product Missing",
    "Product Overage Shipped": "Product Overage",
    "Product Damage": "Product Damage",
    "Update Account Info": "Update Account Info",
  };
  return (
    <>
      {/* {userDetails?.status === 200 ? ( */}
      <>
        <div className={`${styles.NeedNone} d-none-print`}>
          <ModalPage
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            content={<SelectCaseReason reasons={reasons} onClose={() => setModalOpen(false)} recordType={{ id: "0123b0000007z9pAAA", name: "Customer Service" }} />}
          />

          <div className={`${styles.topNav} d-flex justify-content-between  align-items-center gap-2 `}>
            <div className="d-flex justify-content-center align-items-center gap-2">
              <img src={"/assets/images/americanFlag.svg"} alt="img" />
              <div className={styles.vr}></div>
              <p className={`m-0 ${styles.language}`}>EN</p>
              <p className={`m-0 ${styles.language} ${styles.text} flex`}>
                <div className="dropdown d-flex justify-content-center align-items-center " role="button" data-bs-toggle="dropdown" style={{zIndex:1021}}>
                Need Help?&nbsp; <NeedHelp />
                  {/* </a> */}
                  <ul className="dropdown-menu">
                  <li onClick={() => navigate("/orderStatus")}>
                      <Link to="/order-list" className={`dropdown-item text-start d-flex align-items-center ${styles.nameText}`}>
                        <OrderStatusIcon width={15} height={15}/>&nbsp;Order Status
                      </Link>
                    </li>
                    <li
                      onClick={() => {
                        // setModalOpen(true);
                        navigate("/customerService")
                      }}
                    >
                      <Link to="/customerService" className={`dropdown-item text-start d-flex align-items-center ${styles.nameText}`}>
                       <CustomerServiceIcon width={15} height={15}/>&nbsp;Customer Services
                      </Link>
                    </li>
                    <li
                      onClick={() => {
                        // setModalOpen(true);
                        navigate("/needHelp")
                      }}
                    >
                      {/* <Link to="/needHelp" className={`dropdown-item text-start d-flex align-items-center ${styles.nameText}`}>
                       <HelpIcon width={15} height={15}/>&nbsp;Portal Help
                      </Link> */}
                    </li>
                    <li
                      onClick={() => {
                        // setModalOpen(true);
                        navigate("/Help-Section")
                      }}
                    >
                      <Link to="/Help-Section" className={`dropdown-item text-start d-flex align-items-center ${styles.nameText}`}>
                       <RiGuideLine  width={15} height={15}/>&nbsp;How-To Guides
                      </Link>
                    </li>
                  </ul>
                </div>
                {/* <img src={"/assets/images/dropDownArrow.svg"} alt="img" /> */}
              </p>
              
            </div>
          
            <div className="d-flex justify-content-center align-items-center gap-3">
            {userName && (
  <p className={`m-0 ${styles.welcomeText}`}>
    Welcome, 
    <span className={`m-0 ${styles.nameText}`}>
      {userName.split(" ").length > 20 
        ? userName.split(" ").slice(0, 20).join(" ") + "..."
        : userName}
    </span>
  </p>
)}
              <div className={styles.vr}></div>
              <p className={`m-0 ${styles.nameText}`}>
                <Link to="/order-list" className="linkStyle">
                  My Orders{" "}
                </Link>
              </p>
              <div className={styles.vr}></div>
              <p className={`m-0 ${styles.nameText}`}>
                <Link to="/logout" className="linkStyle">
                  Logout
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
      {/* ) : (
        <>
          <Redirect href="https://b2b-v3.vercel.app/#/" />
        </>
      )} */}
    </>
  );
};

export default TopNav;
