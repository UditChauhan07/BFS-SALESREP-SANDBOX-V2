import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import LaunchCalendar from "../components/LaunchCalendar/LaunchCalendar";
import { FilterItem } from "../components/FilterItem";
import html2pdf from 'html2pdf.js';
import { MdOutlineDownload } from "react-icons/md";
import { GetAuthData, getAllAccountBrand, getMarketingCalendar, getMarketingCalendarPDF, getMarketingCalendarPDFV2, getMarketingCalendarPDFV3, originAPi, } from "../lib/store";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CloseButton } from "../lib/svg";
import LoaderV3 from "../components/loader/v3";
const fileExtension = ".xlsx";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MarketingCalendar = () => {
  let date = new Date();
  const [isLoaded, setIsloaed] = useState(false);
  const [isPDFLoaded, setPDFIsloaed] = useState(false);
  const [pdfLoadingText, setPdfLoadingText] = useState(".");
  const [productList, setProductList] = useState([]);
  const [month, setMonth] = useState("");
  let months = [
    { value: null, label: "All" },
    { value: "JAN", label: "JAN" },
    { value: "FEB", label: "FEB" },
    { value: "MAR", label: "MAR" },
    { value: "APR", label: "APR" },
    { value: "MAY", label: "MAY" },
    { value: "JUN", label: "JUN" },
    { value: "JUL", label: "JUL" },
    { value: "AUG", label: "AUG" },
    { value: "SEP", label: "SEP" },
    { value: "OCT", label: "OCT" },
    { value: "NOV", label: "NOV" },
    { value: "DEC", label: "DEC" },
    { value: "TBD", label: "TBD" },

  ];
  const [selectYear, setSelectYear] = useState(date.getFullYear())
  let yearList = [
    { value: date.getFullYear(), label: date.getFullYear() },
    { value: date.getFullYear()+1, label: date.getFullYear()+1 }
  ]
  // ...............
  const [isEmpty, setIsEmpty] = useState(false);
  const [brand, setBrand] = useState([]);
  const [selectBrand, setSelectBrand] = useState(null)

  useEffect(() => {
    setIsloaed(false)
    GetAuthData().then((user) => {
      getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) }).then((resManu) => {
        setBrand(resManu);
        getMarketingCalendar({ key: user.data.x_access_token,year:selectYear }).then((productRes) => {
          setProductList(productRes?.list)
          setIsloaed(true)
          setTimeout(() => {
            let getMonth = new Date().getMonth();
            var element = document.getElementById(monthNames[getMonth]);
            if (element && selectYear == date.getFullYear()) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 2000);
        }).catch((err) => console.log({ err }))
      }).catch((err) => {
        console.log({ err });
      })
    }).catch((error) => {
      console.log({ error });
    })
  }, [selectBrand, month,selectYear])

  const LoadingEffect = () => {
    const intervalId = setInterval(() => {
      if (pdfLoadingText.length > 6) {
        setPdfLoadingText('.');
      } else {
        setPdfLoadingText(prev => prev + '.');
      }
      if (pdfLoadingText.length > 12) {
        setPdfLoadingText('');
      }
    }, 1000);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 10000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }
  const generatePdfServerSide = (version = 0) => {
    GetAuthData().then((user) => {
      let manufacturerId = null;
      let manufacturerStr = "";
      brand.map((item, index) => {
        manufacturerStr += "'" + item.Id + "'";
        if (index != brand.length - 1) {
          manufacturerStr += ", ";
        }
        if (item?.Name?.toLowerCase() == selectBrand?.toLowerCase()) { manufacturerId = item.Id }
      })
      if(version === 1){
        getMarketingCalendarPDFV3({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr,year:selectYear }).then((file) => {
          if (file) {
            const a = document.createElement('a');
            a.href = originAPi + "/download/" + file + "/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          } else {
            const a = document.createElement('a');
            a.href = originAPi + "/download/blank.pdf/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          }
        }).catch((pdfErr) => {
          console.log({ pdfErr });
        })
      }else if(version === 2){
        getMarketingCalendarPDFV2({ key: user.data.x_access_token, manufacturerId , month , manufacturerStr , year:selectYear }).then((file) => {
        if (file) {
          
            const a = document.createElement('a');
            a.href = originAPi + "/download/" + file + "/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          } else {
            const a = document.createElement('a');
            a.href = originAPi + "/download/blank.pdf/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          }
        }).catch((pdfErr) => {
          console.log({ pdfErr });
        })
      }else{
        getMarketingCalendarPDF({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr,year:selectYear }).then((file) => {
          if (file) {
            const a = document.createElement('a');
            a.href = originAPi + "/download/" + file + "/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          } else {
            const a = document.createElement('a');
            a.href = originAPi + "/download/blank.pdf/1/index";
            // a.target = '_blank'
            setPDFIsloaed(false);
            a.click();
          }
        }).catch((pdfErr) => {
          console.log({ pdfErr });
        })
      }
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }

  // ...............................
  const generatePdf = () => {
    const element = document.getElementById('CalenerContainer'); // The HTML element you want to convert
    // element.style.padding = "10px"
    let filename = `Marketing Calender `;
    if (brand) {
      filename = brand + " "
    }
    filename += new Date();
    const opt = {
      margin: 1,
      filename: filename + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      // jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const generateXLSX = () => {
    const newValues = productList?.map((months) => {
      const filterData = months.content?.filter((item) => {
        // let match = item.OCDDate.split("/")
        if (month) {
          if (selectBrand) {
            if (selectBrand == item.ManufacturerName__c) {
              if (month == "TBD") {
                return parseInt(item.Ship_Date__c.split("-")[2]) == 15 && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              } else {
                return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase() && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              }
            }
          } else {
            if (month == "TBD") {
              return parseInt(item.Ship_Date__c.split("-")[2]) == 15 && brand.some((brand) => brand.Name === item.ManufacturerName__c);
            } else {
              return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase() && brand.some((brand) => brand.Name === item.ManufacturerName__c);
            }
          }
          // return match.includes(month.toUpperCase() )
        } else {
          if (selectBrand) {
            if (selectBrand == item.ManufacturerName__c) {
              return true;
            }
          } else {
            return brand.some((brand) => brand.Name === item.ManufacturerName__c);
          }
          // If month is not provided, return all items
        }
      });
      // Create a new object with filtered content
      return { ...months, content: filterData };
    });
    let fileData = exportToExcel({ list: newValues });
  }

  const csvData = ({ data }) => {
    let finalData = [];
    if (data.length) {
      data?.map((ele) => {
        if (ele.content.length) {
          ele.content.map((item) => {
            let temp = {};
            temp["MC Month"] = ele.month;
            temp["Product Title"] = item.Name;
            temp["Product Description"] = item.Description;
            temp["Product Size"] = item.Size_Volume_Weight__c;
            temp["Product Ship Date"] = item.Ship_Date__c;
            temp["Product OCD Date"] = item.Launch_Date__c;
            temp["Product Brand"] = item.ManufacturerName__c;
            temp["Product Price"] = !item.usdRetail__c  ? "TBH" : item.usdRetail__c ;
            finalData.push(temp);
          })
        }
      });
    }
    return finalData;
  };
  const exportToExcel = ({ list }) => {
    const ws = XLSX.utils.json_to_sheet(csvData({ data: list }));
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    let filename = `Marketing Calender`;
    if (selectBrand) {
      filename = selectBrand
    }
    FileSaver.saveAs(data, `${filename} ${new Date()}` + fileExtension);
  };

  return (
    <AppLayout
      filterNodes={
        <>
                  <FilterItem
            label="year"
            name="Year"
            value={selectYear}
            options={yearList}
            onChange={(value) => setSelectYear(value)}
          />
          <FilterItem
            minWidth="220px"
            label="All Brand"
            name="All-Brand"
            value={selectBrand}
            options={
              Array.isArray(brand)
                ? brand?.map((brands) => ({
                  label: brands.Name,
                  value: brands.Name,
                }))
                : []
            }
            onChange={(value) => {
              setSelectBrand(value);
            }}
          />
          <FilterItem
            minWidth="220px"
            label="JAN-DEC"
            name="JAN-DEC"
            value={month}
            options={months}
            onChange={(value) => {
              setMonth(value);
            }}
          />
          <button
            className="border px-2.5 py-1 leading-tight d-grid"
            // onClick={handleclick}
            onClick={() => {
              setSelectBrand(null);
              setMonth(null);
              setIsEmpty(false);
              setSelectYear(date.getFullYear())
              // setForceUpdate(prev=>prev)
            }}
          >
            <CloseButton crossFill={'#fff'} height={20} width={20} />
            <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>clear</small>
          </button>
          <div className="dropdown dropdown-toggle border px-2.5 py-1 leading-tight d-flex" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <div className=" d-grid" role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <MdOutlineDownload size={16} className="m-auto" />
              <small style={{ fontSize: '6px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Download</small>
            </div>
            <ul className="dropdown-menu">
              <li>
                <div className="dropdown-item text-start" onClick={() => { setPDFIsloaed(true);generatePdfServerSide()}}>&nbsp;Pdf</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => { setPDFIsloaed(true);generatePdfServerSide(1)}}>&nbsp;PDF Quickview 1</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => { setPDFIsloaed(true);generatePdfServerSide(2)}}>&nbsp;PDF Quickview 2</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => generateXLSX()}>&nbsp;XLSX</div>
              </li>
            </ul>
          </div>
        </>
      }
    >
       {isPDFLoaded ? <LoaderV3  text={"Generating Pdf Please wait..."} /> :
        isLoaded ? <LaunchCalendar brand={brand} selectBrand={selectBrand} month={month} productList={productList} /> : <LoaderV3 text={`Loading Upcoming New Product for ${selectBrand??"All Brands"}`} />}

    </AppLayout>
  );
};

export default MarketingCalendar;