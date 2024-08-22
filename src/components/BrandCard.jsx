import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../pages/page.module.css";
import { ArrowRightInBrands } from "../lib/svg";
const BrandCard = ({ brand, image }) => {
  const navigate = useNavigate();
  return (
    <div className={`w-full last:mb-0 mb-4 ${Page.HoverArrow} cardHover`}>
      <div className={`border-b-[0.5px] border-[#D0CFCF] flex flex-col gap-4 h-full  ${Page.ImgHover1}`}>
        {image ? (
          <Link to={'/Brand/' + brand.Id}>
            <div className={`border-[0.5px]  relative  border-[#D0CFCF] ${Page.ImgHover}`}>
              <img src={`/assets/images/${image}`} className="object-scale-down max-h-[200px] h-full w-full" alt="img" />
            </div>
          </Link>
        ) : null}
        <div
          className="flex justify-between items-start h-full px-[10px]"
          onClick={() => {
            if (brand?.Accounds) navigate(`/my-retailers?manufacturerId=${brand.Id}`);
          }}
        >
          <div className="flex flex-col justify-between h-full">
            <div className="font-medium text-black text-[20px] tracking-[1.12px] leading-[20px] [font-family:'Arial-500'] text-ellipsis overflow-hidden whitespace-nowrap" style={{ whiteSpace: 'pre-wrap' }}>{brand.Name}</div>

            <button
              className="flex items-center gap-2"
            // onClick={() => {
            //   if (brand?.Accounds) navigate(`/my-retailers?manufacturerId=${brand.Id}`);
            // }}
            >
              <div className="[font-family:'Montserrat-400'] font-normal text-black text-[12px] tracking-[0] leading-[32px] whitespace-nowrap">SHOW RETAILERS</div>
              {/* <img src={"/assets/images/ArrowRight.svg"} alt="img" /> */}
              <ArrowRightInBrands />
            </button>
          </div>
          <div className="bg-black rounded-full w-[40px] h-[40px] flex justify-center items-center">
            <div className="font-medium text-white text-[20px] whitespace-nowrap h-[40px] w-[40px] flex justify-center items-center" >{brand?.Accounds}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandCard;
