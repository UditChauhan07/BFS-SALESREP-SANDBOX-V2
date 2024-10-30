import React, { useEffect } from "react";
import TopNav from "./All Headers/topNav/TopNav";
import LogoHeader from "./All Headers/logoHeader/LogoHeader";
import Header from "./All Headers/header/Header";
import MobileHeader from "./All Headers/mobileHeader/MobileHeader";
import HelpSection from "./Footer/HelpSection";
import Footer from "./Footer/Footer";
import { GetAuthData, getAllAccountStore } from "../lib/store";

const AppLayout = ({ children, filterNodes }) => {
  // useEffect(()=>{
  //   GetAuthData().then((user)=>{
  //     console.log({user});
  //     getAllAccountStore({key:user.data.x_access_token,retailerId:user.data.retailerId}).then((store)=>{
  //       localStorage.setItem("Name", store?.data?.Name);
  //       console.log({store});
  //       localStorage.setItem("Api Data", JSON.stringify(store));
  //       localStorage.setItem("jAuNW7c6jdi6mg7", JSON.stringify(store));
  //     }).catch((storeErr)=>{
  //       console.log({storeErr});
  //     })
  //   }).catch((userErr)=>{
  //     console.log({userErr});
  //   })
  // },[])
  return (
    <div className="col-12">
      <div className="container p-0">
        <TopNav />
        <hr className="hrBgColor" />
        <div className="sticky-top">
          <LogoHeader />
          <Header />
          <MobileHeader />
          <div className="filter-container">{filterNodes}</div>
        </div>
        <main>{children}</main>
      </div>
      {/* <HelpSection /> */}
      <Footer />
    </div>
  );
};

export default AppLayout;
