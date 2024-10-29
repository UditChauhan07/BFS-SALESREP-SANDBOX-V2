import React, { useEffect, useState } from "react";
import AppLayout from "../../components/AppLayout";
import Loading from "../../components/Loading";
import ComparisonReportTable from "../../components/comparison report table/ComparisonReportTable";
import { useComparisonReport } from "../../api/useComparisonReport";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { FilterItem } from "../../components/FilterItem";
import { MdOutlineDownload } from "react-icons/md";
import ModalPage from "../../components/Modal UI";
import styles from "../../components/Modal UI/Styles.module.css";
import { CloseButton, SearchIcon } from "../../lib/svg";
import Styles from "./index.module.css";
import { GetAuthData, sortArrayHandler } from "../../lib/store";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";
const date = new Date();
const ComparisonReport = () => {
  const [exportToExcelState, setExportToExcelState] = useState(false);

  const initialValues = {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    accountIds: null
  };
  const [filter, setFilter] = useState(initialValues);
  const originalApiData = useComparisonReport();
  const [apiData, setApiData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [accountList, setAccountList] = useState([]);
  sortArrayHandler(apiData?.data || [], g => g.ManufacturerName__c)
  //csv Data
  let csvData = [];
  if (apiData?.data?.length) {
    let totalRetail = 0;
    let totalWhole = 0
    apiData?.data?.map((ele) => {
      totalRetail += ele.retail_revenue__c
      totalWhole += ele.Whole_Sales_Amount
      return csvData.push({
        "Store Name": ele.Retail_Store_Name__c,
        Brand: ele.ManufacturerName__c,
        "Estee Lauder Number": ele.Estee_Lauder_Number__c ?? "NA",
        "Sales Rep": ele.Sales_Rep__c,
        "Purchase": `$${Number(ele.Whole_Sales_Amount).toFixed(2)}`,
        "Sale": ele.retail_revenue__c ? `$${Number(ele.retail_revenue__c).toFixed(2)}` : 'NA',
      });
    });
    csvData.push({
      "Store Name": "Total",
      "Sale": totalRetail ? `$${Number(totalRetail).toFixed(2)}` : 'NA',
      "Purchase": `$${Number(totalWhole).toFixed(2)}`,
    })
  }
  useEffect(() => {
    GetAuthData().then((user) => {
      setUserData(user)
      setAccountList(user.data.accountList)
      filter.accountIds = JSON.stringify(user?.data?.accountIds)
      if (filter.accountIds) {
        sendApiCall();
      }
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }, []);

  const handleExportToExcel = () => {
    setExportToExcelState(true);
  };
  const exportToExcel = () => {
    setExportToExcelState(false);
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `Comparison Report ${new Date().toDateString()}` + fileExtension);
  };
  const resetFilter = async () => {
    setIsLoading(true);
    setFilter(() => initialValues);
    initialValues.accountIds = JSON.stringify(userData?.data?.accountIds)
    const result = await originalApiData.fetchComparisonReportAPI(initialValues);
    setApiData(result);
    setIsLoading(false);
  };
  const sendApiCall = async () => {
    setIsLoading(true);
    const result = await originalApiData.fetchComparisonReportAPI(filter);
    setApiData(result);
    setIsLoading(false);
  };
  const { accountIds } = filter
  return (
    <AppLayout
      filterNodes={
        <>
          {accountList?.length > 1 &&
            <FilterItem
              minWidth="220px"
              label="All Store"
              value={JSON.parse(accountIds)?.length == 1 ? JSON.parse(accountIds)[0] : null}

              options={[...accountList.map((month, i) => ({
                label: month.Name,
                value: month.Id,
              })), { label: 'All Accounts', value: null }]}
              onChange={(value) => {
                if (value) {
                  setFilter({ ...filter, accountIds: JSON.stringify([value]) })
                } else {
                  resetFilter();
                }
              }}
              name={"Account-menu"}
            />}
          <FilterItem
            minWidth="220px"
            label="Months"
            name="Months"
            value={filter.month}
            options={apiData?.date?.monthList?.map((month) => ({
              label: month?.name,
              value: month.value,
            }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, month: value }))}
          />
          <FilterItem
            minWidth="220px"
            label="Year"
            name="Year"
            value={filter.year}
            options={apiData?.date?.yearList?.map((year) => ({
              label: year?.name,
              value: year.value,
            }))}
            onChange={(value) => setFilter((prev) => ({ ...prev, year: value }))}
          />
          <div className="d-flex gap-3">
            <button className="border px-2 d-grid py-1 leading-tight" onClick={sendApiCall}>
              <SearchIcon fill="#fff" width={20} height={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>search</small>
            </button>
            <button className="border px-2 d-grid py-1 leading-tight" onClick={resetFilter}>
              <CloseButton crossFill={'#fff'} height={20} width={20} />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
            </button>
          </div>
          <button className="border px-2 d-grid py-1 leading-tight d-grid" onClick={handleExportToExcel}>
            <MdOutlineDownload size={16} className="m-auto" />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>export</small>
          </button>
        </>
      }
    >
      {exportToExcelState && (
        <ModalPage
          open
          content={
            <>
              <div style={{ maxWidth: "380px" }}>
                <h1 className={`fs-5 ${styles.ModalHeader}`}>Warning</h1>
                <p className={` ${styles.ModalContent}`}>Do you want to download Comparison Report?</p>
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
            Comparison Report
          </h2>
        </div>
        <div></div>
      </div>
      {!isLoading ? <ComparisonReportTable comparisonData={apiData} /> : <Loading height={"70vh"} />}
    </AppLayout>
  );
};

export default ComparisonReport;
