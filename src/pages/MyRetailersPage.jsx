import React, { useEffect, useState } from "react";
import MyRetailers from "../components/My Retailers/MyRetailers";
import { FilterItem } from "../components/FilterItem";
import FilterSearch from "../components/FilterSearch";
import { useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { GetAuthData, defaultLoadTime, getAllAccountBrand, getAllAccountLocation } from "../lib/store";
import dataStore from "../lib/dataStore";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";

const MyRetailersPage = ({manufacturerId}) => {
  const location = useLocation();

  const [manufacturerFilter, setManufacturerFilter] = useState(manufacturerId);
  const [sortBy, setSortBy] = useState();
  const [searchBy, setSearchBy] = useState("");
  const [storeList, setStoreList] = useState({ isLoading: true, data: [] });
  const [manufacturerList,setManufacturerList] = useState([])
  useEffect(() => {
    if (!manufacturerId) {
      setManufacturerFilter(null);
    } else {
      setManufacturerFilter(manufacturerId);
    }
  }, [manufacturerId]);
  const navigate = useNavigate();
  const getAccountsHandler = () => {
    GetAuthData().then(async (user) => {
      // ["0011400001bsBxdAAE"]||
      const cachedData = await dataStore.retrieve(location.pathname);
      if (cachedData) {
        setStoreList({ isLoading: false, data: cachedData });
      }
      dataStore.getPageData(location.pathname, () => getAllAccountLocation({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) })).then((accounts) => {
        setStoreList({ isLoading: false, data: accounts });
        dataStore.getPageData("getAllAccountBrand", () => getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) })).then((brands)=>{
          setManufacturerList(brands);
        }).catch((brandErr)=>{
          console.log({brandErr});
        })
      }).catch((actErr) => {
        console.log({ actErr });
      })
    }).catch((err) => {
      console.log({ err });
    })
  }
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (!userData) {
      navigate("/");
    }
    dataStore.subscribe(location.pathname, (accounts)=>setStoreList({ isLoading: false, data: accounts }))
    getAccountsHandler()
    return ()=>{
      dataStore.unsubscribe(location.pathname, (accounts)=>setStoreList({ isLoading: false, data: accounts }))
    }
  }, []);
  useBackgroundUpdater(getAccountsHandler,defaultLoadTime);

  const { isLoading, data } = storeList
  return (
    <AppLayout
      filterNodes={
        <>
          <FilterItem
            label="Sort by"
            value={sortBy}
            options={[
              {
                label: "A-Z",
                value: "a-z",
              },
              {
                label: "Z-A",
                value: "z-a",
              },
            ]}
            name="sortBy1"
            onChange={(value) => {
              setSortBy(value);
            }}
          />
          <FilterItem
            minWidth="220px"
            label="All Brand"
            name="Manufacturer1"
            value={manufacturerFilter}
            options={manufacturerList.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setManufacturerFilter(value)}
          />
          <FilterSearch
            onChange={(e) => setSearchBy(e.target.value)}
            value={searchBy}
            placeholder={"Search by account"}
            minWidth={"167px"}
          />
          <button
            className="border px-2.5 py-1 leading-tight"
            onClick={() => {
              setSortBy(null);
              setManufacturerFilter(null);
              setSearchBy("");
            }}
          >
            CLEAR ALL
          </button>
        </>
      }
    >
      <MyRetailers
        pageData={data}
        sortBy={sortBy}
        searchBy={searchBy}
        isLoading={isLoading}
        filterBy={
          manufacturerFilter
            ? manufacturerList?.find(
              (manufacturer) => manufacturer.Id === manufacturerFilter
            )
            : null
        }
      />
      {/* <OrderStatusFormSection /> */}
    </AppLayout>
  );
};

export default MyRetailersPage;
