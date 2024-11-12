import React, { useEffect, useState } from "react";
import { FilterItem } from "../FilterItem";
import FilterSearch from "../FilterSearch";
import { GetAuthData, getAllAccountBrand } from "../../lib/store";
import { CloseButton } from "../../lib/svg";

const Filters = ({ value, onChange, resetFilter,monthHide=true }) => {
  const [manufacturerData,setManufacturerData ] = useState([]);
  useEffect(()=>{
    GetAuthData().then((user)=>{
      getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) }).then((resManu)=>{
        setManufacturerData(resManu);
      }).catch((err)=>{
        console.log({err});
      })
    }).catch((error)=>{
      console.log({error});
    })
  },[])
  const handleMonthFilter = (v) => onChange("month", v);
  const handleManufacturerFilter = (v) => onChange("manufacturer", v);
  const handleSearchFilter = (v) => onChange("search", v);

  return (
    <>
      {monthHide&&<FilterItem
        label="Months"
        name="Months"
        value={value.month}
        options={[
          {
            label: "Last 6 Months",
            value: null,
          },
          {
            label: "Current Year",
            value: `${new Date().getFullYear()}`,
          },
          {
            label: `${new Date().getFullYear() - 1}`,
            value: `${new Date().getFullYear() - 1}`,
          },
        ]}
        onChange={handleMonthFilter}
      />}
      <FilterItem
        label="MANUFACTURER"
        name="MANUFACTURER"
        value={value.manufacturer}
        options={
          Array.isArray(manufacturerData)
            ? manufacturerData?.map((manufacturer) => ({
                label: manufacturer.Name,
                value: manufacturer.Id,
              }))
            : []
        }
        onChange={handleManufacturerFilter}
      />
      {/* <FilterSearch
        onChange={(e) => handleSearchFilter(e.target.value)}
        value={value.search}
        placeholder="Search By Account"
        minWidth="167px"
      /> */}
      <button
        className="border px-2 py-1 leading-tight d-grid"
        onClick={resetFilter}
      >
                            <CloseButton crossFill={'#fff'} height={20} width={20} />
                    <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>clear</small>
      </button>
    </>
  );
};

export default Filters;
