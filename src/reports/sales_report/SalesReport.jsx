import React, { useEffect, useMemo, useState } from "react";
import useSalesReport from "../../api/useSalesReport";
import { useNavigate } from "react-router";
import AppLayout from "../../components/AppLayout";
import { FilterItem } from "../../components/FilterItem";
import { useManufacturer } from "../../api/useManufacturer";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import SalesReportTable from "../../components/sales report table/SalesReportTable";
import Loading from "../../components/Loading";
import FilterDate from "../../components/FilterDate";
import FilterSearch from "../../components/FilterSearch";
import Styles from "./index.module.css";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { GetAuthData, getRetailerBrands } from "../../lib/store";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

const SalesReport = () => {
  const [yearFor, setYearFor] = useState(2024);
  const salesReportApi = useSalesReport();
  const [isLoading, setIsLoading] = useState(false);
  const [manufacturerFilter, setManufacturerFilter] = useState();
  const [highestOrders, setHighestOrders] = useState(true);
  const [salesReportData, setSalesReportData] = useState([]);
  const [ownerPermission, setOwnerPermission] = useState(false);
  const [searchBy, setSearchBy] = useState("");
  const [searchBySalesRep, setSearchBySalesRep] = useState("");
  const [salesRepList, setSalesRepList] = useState([]);
  const [yearForTableSort, setYearForTableSort] = useState(2024);
  const [exportToExcelState, setExportToExcelState] = useState(false);
  const filteredSalesReportData = useMemo(() => {
    let filtered = salesReportData.filter((ele) => {
      return !manufacturerFilter || !ele.ManufacturerName__c.localeCompare(manufacturerFilter);
    });
    if (searchBy) {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.filter((item) => {
          if (item.Name?.toLowerCase().includes(searchBy?.toLowerCase())) {
            return item;
          }
        });
        return {
          ...ele,
          Orders,
        };
      });
    }
    if (searchBySalesRep) {
      filtered = filtered?.map((ele) => {
        const Orders = ele.Orders.filter((item) => {
          if (item.AccountRepo?.toLowerCase().includes(searchBySalesRep?.toLowerCase())) {
            return item;
          }
        });
        return {
          ...ele,
          Orders,
        };
      });
    }
    if (highestOrders) {
      filtered = filtered.sort((a, b) => {
        // Sort by totalOrders in descending order
        const totalOrdersDiff = b.Orders[0].totalOrders - a.Orders[0].totalOrders;
        if (totalOrdersDiff !== 0) {
          return totalOrdersDiff;
        }

        // If totalOrders are equal, sort by totalorderPrice in descending order
        return b.Orders[0].totalorderPrice - a.Orders[0].totalorderPrice;
      });

    } else {
      filtered = filtered.sort((a, b) => {
        // Sort by totalOrders in descending order
        const totalOrdersDiff = a.Orders[0].totalOrders - b.Orders[0].totalOrders;
        if (totalOrdersDiff !== 0) {
          return totalOrdersDiff;
        }

        // If totalOrders are equal, sort by totalorderPrice in descending order
        return b.Orders[0].totalorderPrice - a.Orders[0].totalorderPrice;
      });
    }
    return filtered;
  }, [manufacturerFilter, salesReportData, highestOrders, searchBy, searchBySalesRep]);

  const csvData = useMemo(() => {
    return filteredSalesReportData?.map((ele) =>
      ele.Orders.map((item) => ({
        ManufacturerName__c: ele.ManufacturerName__c,
        AccountName: item.Name,
        JanOrders: item.Jan.items?.length,
        JanAmount: item.Jan.amount,
        FebOrders: item.Feb.items?.length,
        FebAmount: item.Feb.amount,
        MarOrders: item.Mar.items?.length,
        MarAmount: item.Mar.amount,
        AprOrders: item.Apr.items?.length,
        AprAmount: item.Apr.amount,
        MayOrders: item.May.items?.length,
        MayAmount: item.May.amount,
        JunOrders: item.Jun.items?.length,
        JunAmount: item.Jun.amount,
        JulOrders: item.Jul.items?.length,
        JulAmount: item.Jul.amount,
        AugOrders: item.Aug.items?.length,
        AugAmount: item.Aug.amount,
        SepOrders: item.Sep.items?.length,
        SepAmount: item.Sep.amount,
        OctOrders: item.Oct.items?.length,
        OctAmount: item.Oct.amount,
        NovOrders: item.Nov.items?.length,
        NovAmount: item.Nov.amount,
        DecOrders: item.Dec.items?.length,
        DecAmount: item.Dec.amount,
        TotalOrders: item.totalOrders,
        totalAmount: item.totalorderPrice,
      }))
    ).flat();
  }, [filteredSalesReportData, manufacturerFilter]);

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Sales Report ${new Date().toDateString()}` + fileExtension);
  };
  const resetFilter = () => {
    setManufacturerFilter(null);
    setHighestOrders(true);
    getSalesData(yearFor);
    setYearFor(2024);
    setSearchBy("");
    setSearchBySalesRep("");
    setYearForTableSort(2024);
  };

  const navigate = useNavigate();

  const getSalesData = async (yearFor) => {
    setIsLoading(true);
    setYearForTableSort(yearFor);
    const result = await salesReportApi.salesReportData({ yearFor });
    console.log({ result });
    let salesListName = [];
    let salesList = [];
    result.data.data.map((manu) => {
      if (manu.Orders.length) {
        manu.Orders.map((item) => {
          if (!salesListName.includes(item.AccountRepo)) {
            salesListName.push(item.AccountRepo);
            salesList.push({
              label: item.AccountRepo,
              value: item.AccountRepo,
            });
          }
        });
      }
    });
    setSalesRepList(salesList);
    setSalesReportData(result.data.data);
    setOwnerPermission(result.data.ownerPermission);
    setIsLoading(false);
  };
  // console.log("salesReportData", salesReportData);
  const [manufacturerData, setManufacturerData] = useState([]);
  useEffect(() => {
    GetAuthData().then((user) => {
      if (user) {
        let rawData = { accountId: user.data.accountId, key: user.data.x_access_token }
        getRetailerBrands({ rawData }).then((resManu) => {
          setManufacturerData(resManu);
          getSalesData(yearFor);
        }).catch((err) => {
          console.log({ err });
        })
      } else {
        navigate("/");
      }
    }).catch((error) => {
      console.log({ error });
    })
  }, []);
  const sendApiCall = () => {
    // setManufacturerFilter(null);
    // setHighestOrders(true);
    // getSalesData(yearFor);
    // setSearchBy("");
    // setSearchBySalesRep("");
    getSalesData(yearFor);
  };

  return (
    <AppLayout
      filterNodes={
        <>
          {ownerPermission && <FilterItem minWidth="220px" label="All Sales Rep" name="AllSalesRep" value={searchBySalesRep} options={salesRepList} onChange={(value) => setSearchBySalesRep(value)} />}
          <FilterItem
            minWidth="220px"
            label="All Manufacturers"
            name="AllManufacturers1"
            value={manufacturerFilter}
            options={manufacturerData?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Name,
            }))}
            onChange={(value) => setManufacturerFilter(value)}
          />
          <FilterItem
            minWidth="220px"
            label="Lowest Orders"
            name="LowestOrders"
            value={highestOrders}
            options={[
              {
                label: "Highest Orders",
                value: true,
              },
              {
                label: "Lowest Orders",
                value: false,
              },
            ]}
            onChange={(value) => setHighestOrders(value)}
          />
          {/* First Calender Filter-- start date */}
          <div className="d-flex gap-3">
            <button className="border px-2.5 py-1 leading-tight" onClick={resetFilter}>
              CLEAR ALL
            </button>
          </div>
          <button className="border px-2.5 py-1 leading-tight flex justify-center align-center gap-1" onClick={handleExportToExcel}>
            EXPORT
            <MdOutlineDownload size={16} />
          </button>
        </>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "330px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Sales Report?</p>
                <div className="d-flex justify-content-center gap-3 ">
                  <button className={`${styles.modalButton}`} onClick={exportToExcel}>
                    OK
                  </button>
                  <button className={`${styles.modalButton}`} onClick={() => setExportToExcelState(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          }
          onClose={() => {
            setExportToExcelState(false);
          }}
        />
      )}
      <div className={Styles.inorderflex}>
        <div>
          <h2>
            {ownerPermission ? `${searchBySalesRep ? searchBySalesRep + "`s" : "All"} Sales Report` : "Your Sales Report"}
            {manufacturerFilter && " for " + manufacturerFilter}
          </h2>
        </div>
        <div>
          <div className={`d-flex align-items-center ${Styles.InputControll}`}>
            <select onChange={(e) => setYearFor(e.target.value)}>
              <option value={2015} selected={yearFor == 2015 ? true : false}>
                2015
              </option>
              <option value={2016} selected={yearFor == 2016 ? true : false}>
                2016
              </option>
              <option value={2017} selected={yearFor == 2017 ? true : false}>
                2017
              </option>
              <option value={2018} selected={yearFor == 2018 ? true : false}>
                2018
              </option>
              <option value={2019} selected={yearFor == 2019 ? true : false}>
                2019
              </option>
              <option value={2020} selected={yearFor == 2020 ? true : false}>
                2020
              </option>
              <option value={2021} selected={yearFor == 2021 ? true : false}>
                2021
              </option>
              <option value={2022} selected={yearFor == 2022 ? true : false}>
                2022
              </option>
              <option value={2023} selected={yearFor == 2023 ? true : false}>
                2023
              </option>
              <option value={2024} selected={yearFor == 2024 ? true : false}>
                2024
              </option>
            </select>
            <button onClick={() => sendApiCall()}>Search Sales</button>
          </div>
        </div>
      </div>
      {filteredSalesReportData?.length && !isLoading ? (
        <SalesReportTable salesData={filteredSalesReportData} year={yearForTableSort} ownerPermission={ownerPermission} />
      ) : salesReportData.length && !isLoading ? (
        <div className="flex justify-center items-center py-4 w-full lg:min-h-[300px] xl:min-h-[380px]">No data found</div>
      ) : (
        <Loading height={"70vh"} />
      )}
    </AppLayout>
  );
};

export default SalesReport;
