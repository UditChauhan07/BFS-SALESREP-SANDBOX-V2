import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppLayout from "../../components/AppLayout";
import Loading from "../../components/Loading";
import NewnessReportTable from "../../components/newness report table/NewnessReportTable";
import { useNewnessReport } from "../../api/useNewnessReport";
import { useManufacturer } from "../../api/useManufacturer";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { FilterItem } from "../../components/FilterItem";
import FilterDate from "../../components/FilterDate";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import LoaderV3 from "../../components/loader/v3";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const NewnessReport = () => {
  const navigate = useNavigate();
  const [exportToExcelState, setExportToExcelState] = useState(false);

  let currentDate = new Date().toJSON().slice(0, 10);
  const subtract6Months = (date) => {
    date.setMonth(date.getMonth() - 6);
    return date;
  };
  let past6monthDate = subtract6Months(new Date());
  const initialValues = {
    ManufacturerId__c: "a0O3b00000p7zqKEAQ",
    toDate: currentDate,
    fromDate: past6monthDate.toJSON().slice(0, 10),
    dataDisplay: "quantity",
  };
  const [dataDisplayHandler, setDataDisplayHandler] = useState('quantity');
  const [filter, setFilter] = useState(initialValues);
  const originalApiData = useNewnessReport();
  const { data: manufacturers, isLoading, error } = useManufacturer();
  const [newnessData, setNewnessData] = useState({});
  const [loading, setLoading] = useState(false);
  // if (manufacturers?.status !== 200) {
  //   // DestoryAuth();
  // }
  const resetFilter = async () => {
    setLoading(true);
    setFilter(initialValues);
    const result = await originalApiData.fetchNewnessApiData(initialValues);
    setNewnessData(result);
    setLoading(false);
  };
  const PriceDisplay = (value) => {
    return `$${Number(value).toFixed(2)?.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`;
  };
  const csvData = () => {
    let finalData = [];
    if (newnessData?.AccountList?.length) {
      newnessData?.AccountList?.map((ele) => {
        let temp = {};
        temp["Account_Name"] = ele.AccountName__c;
        temp["Account_Owner_Name"] = ele.OwnerName;
        temp["Account_Status"] = ele.Active_Closed__c;
        temp["Sales_Rep"] = ele.Sales_Rep_Name__c;
        temp["ManufacturerName__c"] = ele.ManufacturerName__c;
        newnessData?.header?.map((item) => {
          temp[`${item.name} Price`] = PriceDisplay(ele[item.name]?.price);
          temp[`${item.name} Quantity`] = ele[item.name]?.qty;
        });
        finalData.push(temp);
      });
    }
    return finalData;
  };

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData());
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Newness Report ${new Date().toDateString()}` + fileExtension);
  };
  useEffect(() => {
    const userData = localStorage.getItem("Name");
    if (!userData) {
      navigate("/");
    }
  }, []);
  useEffect(() => {
    sendApiCall();
  }, []);
  const sendApiCall = async () => {
    setLoading(true);
    const result = await originalApiData.fetchNewnessApiData(filter);
    setFilter((prev) => ({
      ...prev,
      dataDisplay: dataDisplayHandler,
    }));
    setNewnessData(result);
    setLoading(false);
  };
  return (
    <AppLayout
      filterNodes={
        <>
          <FilterItem
            minWidth="200px"
            label="All Manufacturers"
            name="AllManufacturers12"
            value={filter.ManufacturerId__c}
            options={manufacturers?.data?.map((manufacturer) => ({
              label: manufacturer.Name,
              value: manufacturer.Id,
            }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, ManufacturerId__c: value }))}
          />
          <FilterItem
            label="Qty/price"
            name="Qty/price"
            value={dataDisplayHandler}
            // value={filter.dataDisplay}
            options={[
              {
                label: "Quantity",
                value: "quantity",
              },
              {
                label: "Price",
                value: "price",
              },
            ]}
            onChange={(value) => {
              // setFilter((prev) => ({
              //   ...prev,
              //   dataDisplay: value,
              // }));
              setDataDisplayHandler(value)
            }}
          />
          {/* First Calender Filter-- from date */}
          <FilterDate
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                fromDate: new Date(e).toJSON().slice(0, 10),
              }));
            }}
            value={filter.fromDate}
            label={"start date : "}
            minWidth="95px"
          />
          {/* Second Calender Filter -- to date */}
          <FilterDate
            onChange={(e) => {
              setFilter((prev) => ({
                ...prev,
                toDate: new Date(e).toJSON().slice(0, 10),
              }));
            }}
            value={filter.toDate}
            label={"end date :"}
            minWidth="95px"
          />
           <div className="d-flex gap-1 ">
            <button className="border px-2 py-1 leading-tight  d-grid ms-3" onClick={sendApiCall}>
            <SearchIcon fill="#fff" width={20} height={20}/>
            <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>search</small>
            </button>
            <button className="border px-2 py-1 leading-tight d-grid" onClick={resetFilter}>
            <CloseButton crossFill={'#fff'} height={20} width={20}/>
            <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>clear</small>
            </button>
          </div>
          <button className="border px-2 py-1 leading-tight d-grid" onClick={handleExportToExcel}>
            <MdOutlineDownload size={16} className="m-auto"/>
            <small style={{ fontSize: '6px',letterSpacing: '0.5px',textTransform:'uppercase'}}>export</small>
          </button>
          
        </>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "370px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Newness Report?</p>
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
      {loading ? <LoaderV3 text={"Loading Newness Report, Please wait..."} /> : <NewnessReportTable newnessData={newnessData} dataDisplay={filter.dataDisplay} />}
    </AppLayout>
  );
};

export default NewnessReport;
