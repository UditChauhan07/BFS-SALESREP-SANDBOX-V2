import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { GetAuthData, ShareDrive, defaultLoadTime, getAllAccountBrand, getProductImageAll, topProduct } from "../lib/store";
import TopProductCard from "../components/TopProductCard";
import { FilterItem } from "../components/FilterItem";
import { CloseButton } from "../lib/svg";
import LoaderV3 from "../components/loader/v3";
import dataStore from "../lib/dataStore";
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const TopProducts = () => {
  const [manufacturerData, setManufacturerData] = useState([]);
  const [topProductList, setTopProductList] = useState({ isLoaded: false, data: [], message: null, accountDetails: {} });
  const [monthList, setMonthList] = useState([])
  const d = new Date();
  let monthIndex = d.getMonth();
  const [manufacturerFilter, setManufacturerFilter] = useState();
  const [selectedMonth, setSelectedMonth] = useState();
  const [productImages, setProductImages] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [selectAccount, setSelectAccount] = useState();
  const currentYear = new Date().getFullYear() 
  const previousYear = new Date().getFullYear() -1
  useEffect(() => {
    dataStore.subscribe(`/top-products${JSON.stringify({ month: selectedMonth, manufacturerId: manufacturerFilter })}`, topProductReady);
    btnHandler({ manufacturerId: null, month: monthIndex + 1 });
    let indexMonth = [];
    let helperArray = [];
    months.map((month, i) => {
      if (i <= monthIndex) {
        helperArray.push({ label: `${month.slice(0,3)}, ${currentYear}`, value: i + 1 })
      } else {
        indexMonth.push({ label: `${month.slice(0,3)}, ${previousYear}`, value: i + 1 })
      }
    })
    let finalArray = indexMonth.concat(helperArray)
    setMonthList(finalArray.reverse())
    return () => {
      dataStore.unsubscribe(`/top-products${JSON.stringify({ month: selectedMonth, manufacturerId: manufacturerFilter })}`, topProductReady);
    }
  }, [])

  // const topProductData = useMemo(() => {
  //   return (
  //     topProductList.data1
  //       ?.filter(
  //         (product) =>
  //           !searchText ||
  //           searchText === product.Name
  //       )
  //     // Search by account filter
  //     // ?.filter((product) => {
  //     //   return (
  //     //     !filterValue?.search?.length ||
  //     //     order.AccountName?.toLowerCase().includes(
  //     //       filterValue?.search?.toLowerCase()
  //     //     )
  //     //   );
  //     // })
  //   );
  // }, [searchText, topProductList, selectedMonth])

  const SearchData = ({ selectedMonth, manufacturerFilter, accountId = null }) => {
    let data = ShareDrive();
    if (!data) {
      data = {};
    }
    if (manufacturerFilter) {
      if (!data[manufacturerFilter]) {
        data[manufacturerFilter] = {};
      }

      if (Object.values(data[manufacturerFilter]).length > 0) {
        setIsLoaded(true)
        setProductImages({ isLoaded: true, images: data[manufacturerFilter] })
      } else {
        setProductImages({ isLoaded: false, images: {} })
      }
    }
    GetAuthData().then(async (user) => {
      setSelectAccount(accountId || user.data.accountIds[0])
      setAccountList(user.data.accountList);
      dataStore.getPageData("getAllAccountBrand", () => getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) })).then((resManu) => {
        setManufacturerData(resManu);
      }).catch((err) => {
        console.log({ err });
      })

      let value = { month: selectedMonth, manufacturerId: manufacturerFilter, accountIds: JSON.stringify(user.data.accountIds) }

      dataStore.getPageData(`/top-products${JSON.stringify({ month: selectedMonth, manufacturerId: manufacturerFilter })}`, () => topProduct(value)).then((products) => {
        topProductReady(products)
      }).catch((err) => {
        // console.log({ aaa: err });
      })
    }).catch((error) => {
      console.log({ error });
    })
  }
  useBackgroundUpdater(()=>btnHandler({ manufacturerId: manufacturerFilter, month: selectedMonth }),defaultLoadTime);
  const topProductReady = (products) => {
    let data = ShareDrive();
    GetAuthData().then(async (user) => {
      let result = [];
      if (products?.data?.length > 0) {
        result = products?.data?.sort(function (a, b) {
          return b.Sales - a.Sales;
        });
      }
      let message = products?.message
      if (result.length == 0) {
        message = "No Data Found";
      }
      setTopProductList({ isLoaded: true, data: result, message, accountDetails: products?.accountDetails })
      if (result.length > 0) {
        let productCode = "";
        result?.map((product, index) => {
          productCode += `'${product.ProductCode}'`
          if (result.length - 1 != index) productCode += ', ';
        })
        getProductImageAll({ rawData: { codes: productCode } }).then((res) => {
          if (res) {
            if(manufacturerFilter){
              if (data[manufacturerFilter]) {
                data[manufacturerFilter] = { ...data[manufacturerFilter], ...res }
              } else {
                data[manufacturerFilter] = res
              }
              setProductImages({ isLoaded: true, images: res });
            }else{
              setProductImages({ isLoaded: true, images: [] });
            }
            setIsLoaded(true)
            ShareDrive(data)
          } else {
            setIsLoaded(true)
            setProductImages({ isLoaded: true, images: {} });
          }
        }).catch((err) => {
          console.log({ aaa111: err });
        })
      }
    }).catch((error) => {
      console.log({ error });
    })
  }

  const btnHandler = ({ month, manufacturerId, accountId = null }) => {
    setIsLoaded(false)
    setManufacturerData([]);
    setTopProductList({ isLoaded: false, data: [], message: null })
    setManufacturerFilter(manufacturerId);
    setSelectedMonth(month);
    SearchData({ selectedMonth: month, manufacturerFilter: manufacturerId, accountId })
  }

  return (
    <AppLayout filterNodes={<>
      {/* {accountList.length > 1 &&
        <FilterItem
          minWidth="220px"
          label="All Store"
          value={selectAccount}
          options={[...accountList.map((month, i) => ({
            label: month.Name,
            value: month.Id,
          }))]}
          onChange={(value) => {
            btnHandler({ manufacturerId: manufacturerFilter, month: selectedMonth, accountId: value });
          }}
          name={"Account-menu"}
        />} */}
        {manufacturerData.length >  0  ?
        
        <FilterItem
        minWidth="220px"
        label="All Brand"
        name="Manufacturer1"
        value={manufacturerFilter}
        options={manufacturerData.map((manufacturer) => ({
          label: manufacturer.Name,
          value: manufacturer.Id,
        }))}
        onChange={(value) => btnHandler({ manufacturerId: value, month: selectedMonth, accountId: selectAccount })}
      />
        : null }
   
      <FilterItem
        label="Month"
        minWidth="140px"
        name="Month"
        value={selectedMonth}
        options={monthList}
        onChange={(value) => btnHandler({ manufacturerId: manufacturerFilter, month: value, accountId: selectAccount })}
      />
      {/* <FilterSearch
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        placeholder="Search By Product"
        minWidth="167px"
      /> */}
      <button
        className="border px-2.5 py-1 leading-tight d-grid"
        onClick={() => { btnHandler({ manufacturerId: null, month: monthIndex + 1 }); }}
      >
        <CloseButton crossFill={'#fff'} height={20} width={20} />
        <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
      </button>
    </>
    }>
      {!topProductList.isLoaded ? <LoaderV3 text={`loading Top product of ${months[selectedMonth - 1]} ${((selectedMonth - 1) <= monthIndex) ? currentYear : previousYear}`} /> : (topProductList.data.length == 0 && topProductList.message) ?
        <div className="row d-flex flex-column justify-content-center align-items-center lg:min-h-[300px] xl:min-h-[400px]">
          <div className="col-4">
            <p className="m-0 fs-2 text-center font-[Montserrat-400] text-[14px] tracking-[2.20px] text-center">
              {topProductList.message}
            </p>
          </div>
        </div>
        :
        <TopProductCard data={topProductList.data} accountDetails={topProductList.accountDetails} isLoaded={isLoaded} productImages={productImages} />}
    </AppLayout>
  );
};

export default TopProducts;
