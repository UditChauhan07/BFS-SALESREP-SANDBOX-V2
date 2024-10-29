import React, { useEffect, useState } from "react";
import Styles from "./Styles.module.css";
import SelectBrandModel from "./SelectBrandModel/SelectBrandModel";
import ModalPage from "../Modal UI";
import { useNavigate } from "react-router-dom";

const MyRetailerCard = ({ placeName, title, brands, accountId, address }) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [onHoverDiv,setOnHoverDiv] = useState();
  const bgColors = {
    "Kevyn Aucoin Cosmetics": "KevynAucoinCosmeticsBg",
    "Bumble and Bumble": "BumbleandBumbleBg",
    "BY TERRY": "BYTERRYBg",
    "Bobbi Brown": "BobbiBrownBg",
    "ReVive": "ReViveBg",
    "Maison Margiela": "MaisonMargielaBg",
    "Smashbox": "SmashboxBg",
    "RMS Beauty": "RMSBeautyBg",
    "ESTEE LAUDER": "esteeLauderBg",
  };
  let bgColor = ["KevynAucoinCosmeticsBg", "BumbleandBumbleBg","BYTERRYBg","BobbiBrownBg","ReViveBg","MaisonMargielaBg","SmashboxBg","RMSBeautyBg"]
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  useEffect(()=>{
    // const onMouseEnter = (e) => {
    //   console.log({e});
    // };

    // const onMouseLeave = (e) => {
    // };
    // document.getElementsByClassName("btnColor")?.addEventListener("mouseenter", onMouseEnter);
    // document.getElementsByClassName("btnColor")?.addEventListener("mouseleave", onMouseLeave);
  },[onHoverDiv])

  const getNumberSpace = (num) => {
    if (num < 1000) return `${num} bytes`;
    if (num < 1000000) return `${(num / 1000).toFixed(2)} KB`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(2)} MB`;
    return `${(num / 1000000000).toFixed(2)} GB`;
  };
  //onClick={navigate(()=>"/store/"+accountId)}
  return (
    <>
      <ModalPage open={modalOpen} onClose={() => setModalOpen(false)} content={<SelectBrandModel brands={brands} onClose={() => setModalOpen(false)} />} />
      <div
        className={`${Styles.Retailer} cursor-pointer flex`}
      >
        <div className={`${Styles.mainRetailer} flex flex-col justify-between`}>
          <h2 className="leading-normal" onClick={()=>navigate("/store/"+accountId)}>{title}</h2>
          <div>
            <div>
              <div className={Styles.RetailerImg}>
                {/* <img
                  className="position-absolute w-100"
                  src={require("./Image/MapLocation.png")}
                  alt="img"
                  style={{
                    zIndex: 0,
                  }}
                /> */}
                <div className="d-flex ps-2 gap-2" style={{ zIndex: 1 }} >
                  <img className={Styles.ControlerImg} src={"/assets/images/LocationPin.svg"} alt="img" />
                  <p 
                    className="w-100 mb-0"
                    style={{
                      fontFamily: "Arial",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "black",
                    }}
                    
                  >
                    {placeName || "No Location"}
                  </p>
                </div>
              </div>
            </div>
            <div className={Styles.BrandName}>
              <div className={Styles.Brandspan}>
                {brands?.map((brand, index) => {
                  let r= getRandomInt(bgColor.length)
                  return (
                    <span onClick={() => {
                      setModalOpen(true);
                      localStorage.setItem("Account", title);
                      localStorage.setItem("AccountId__c", accountId);
                      localStorage.setItem("address", JSON.stringify(address));
                    }} className={`${Styles.btnFillLTR} ${Styles.btn} ${Styles.btnColor} ${Styles[bgColor[brand.ManufacturerName__c]]}`} 
                    style={{ height: "fit-content" }} key={index} 
                    // onMouseEnter={(e)=>{setOnHoverDiv(brand.ManufacturerId__c);
                    //   // e.target.style.padding = `3px ${brand.ManufacturerName__c.length*2.15}px`;
                    // }} onMouseLeave={(e)=>{setOnHoverDiv();
                    //   // e.target.style.padding = '3px 5px';
                    // }}
                    >
                      {onHoverDiv!=brand.ManufacturerId__c?brand.ManufacturerName__c:
                      <>
                      Order now
                      </>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default MyRetailerCard;
