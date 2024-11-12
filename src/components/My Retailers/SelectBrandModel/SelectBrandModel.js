import React, { useState } from "react";
import Styles from "./style.module.css";
import { useNavigate } from "react-router-dom";
import { CloseButton } from "../../../lib/svg";

const SelectBrandModel = ({ brands, onClose }) => {
  // const [selectedBrandAccountId, setSelectedBrandAccountId] = useState();
  const [selectedBrandManufacturer, setSelectedBrandManufacturer] = useState(false);
  // const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  return (
    <>
      <div className="px-[10px] pb-[10px] pt-[10px] max-w-[900px]">
        <section>
        <div className="d-flex align-items-center justify-content-between gap-5 mb-4">
            <h1 className="font-[Montserrat-500] text-[22px] tracking-[2.20px] text-center">
              Choose the Manufacturer
            </h1>
            <button type="button" onClick={onClose}>
              <CloseButton />
            </button>
          </div>
          <div className={Styles.BrandInRadio}>
            <div className={Styles.ModalResponsive}>
              {brands?.map((brand, index) => (
                <div className={Styles.BrandName} key={index}>
                  <input
                    type="radio"
                    name="brand_names"
                    // checked={selectedBrandAccountId === brand.AccountId__c}
                    onChange={() => {
                      // setSelectedBrandAccountId(brand.AccountId__c);
                      localStorage.setItem("manufacturer", brand.ManufacturerName__c?? brand.Name);
                      localStorage.setItem("ManufacturerId__c", brand.ManufacturerId__c??  brand.Id);
                      localStorage.setItem("Sales_Rep__c", brand.Sales_Rep__c);
                      localStorage.setItem("shippingMethod", JSON.stringify({number:brand.Shipping_Account_Number__c,method:brand.Shipping_Method__c}));
                      // if (selectedBrandManufacturer) {
                        onClose();
                        navigate(`/orders`);
                      // } 
                    }}
                    id={brand.ManufacturerName__c||brand.Name}
                  />
                  <label htmlFor={brand.ManufacturerName__c||brand.Name}>{brand.ManufacturerName__c||brand.Name}</label>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>
    </>
  );
};

export default SelectBrandModel;
