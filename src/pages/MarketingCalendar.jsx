import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import LaunchCalendar from "../components/LaunchCalendar/LaunchCalendar";
import { FilterItem } from "../components/FilterItem";
import html2pdf from 'html2pdf.js';
import { MdOutlineDownload } from "react-icons/md";
import { GetAuthData, defaultLoadTime, getAllAccountBrand, getMarketingCalendar, getMarketingCalendarPDF, getMarketingCalendarPDFV2, getMarketingCalendarPDFV3, originAPi, } from "../lib/store";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CloseButton } from "../lib/svg";
import LoaderV3 from "../components/loader/v3";
import dataStore from "../lib/dataStore";
import { useLocation } from 'react-router-dom';
import useBackgroundUpdater from "../utilities/Hooks/useBackgroundUpdater";
import ModalPage from "../components/Modal UI";
const fileExtension = ".xlsx";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MarketingCalendar = () => {
  const location = useLocation();

  let date = new Date();
  const [isAlert, setIsAlert] = useState(false);
  const [isLoaded, setIsloaed] = useState(false);
  const [isPDFLoaded, setPDFIsloaed] = useState(false);
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
    { value: date.getFullYear() + 1, label: date.getFullYear() + 1 }
  ]
  // ...............
  const [isEmpty, setIsEmpty] = useState(false);
  const [brand, setBrand] = useState([]);
  const [selectBrand, setSelectBrand] = useState(null)

  const handlePageData = async ()=>{
    GetAuthData().then((user) => {
      dataStore.getPageData("getAllAccountBrand", () => getAllAccountBrand({ key: user.data.x_access_token, accountIds: JSON.stringify(user.data.accountIds) })).then(async (resManu) => {
        setBrand(resManu);

        dataStore.getPageData(location.pathname + JSON.stringify(selectYear), () => getMarketingCalendar({ key: user.data.x_access_token, year: selectYear })).then((productRes) => {
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
  }

  useEffect(() => {
    setIsloaed(false)
    dataStore.subscribe(location.pathname + JSON.stringify(selectYear), (data) => { setProductList(data?.list); setIsloaed(true); });
    handlePageData()
    return () => {
      dataStore.subscribe(location.pathname + JSON.stringify(selectYear), (data) => { setProductList(data?.list); setIsloaed(true); });
    }
  }, [ selectYear])

  useBackgroundUpdater(handlePageData,defaultLoadTime)

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
      if (manufacturerId) {
        setPDFIsloaed(true);
      if (version === 1) {
        getMarketingCalendarPDFV3({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr, year: selectYear }).then((file) => {
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
      } else if (version === 2) {
        getMarketingCalendarPDFV2({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr, year: selectYear }).then((file) => {
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
      } else {
        getMarketingCalendarPDF({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr, year: selectYear }).then((file) => {
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
    }
    else{
      setIsAlert(true);
      setPDFIsloaed(false);
    }
    }).catch((userErr) => {
      console.log({ userErr });
    })
  }

//     setPDFIsloaed(true);  // Show loader when the PDF generation starts

//     GetAuthData().then((user) => {
   
//       const uniqueIds = new Set();
//       productList.forEach(monthly => {
//           monthly.content.forEach(product => {
//               uniqueIds.add(product.ManufacturerId__c);
//           });
//       });
      
//       // Format as quoted string
//       const manufacturerStr = Array.from(uniqueIds)
//           .map(id => `'${id}'`)
//           .join(", ");
        
       

//         const payload = {
//             key: user.x_access_token,
//             manufacturerId : brand ,
//             month,
//             manufacturerStr,
//             year: selectYear,
//         };

//         fetch(`${originAPi}/mIRX7B9FlQjmOaf/Finmh4OvrI0Yc467`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload),
//         })
//         .then(response => {
//             if (response.ok) {
//                 // Trigger the file download directly
//                 response.blob().then(blob => {
//                     // Create a new Date object to get the current timestamp
//                     const currentDate = new Date();
//                     const formattedDate = currentDate.toUTCString().replace(/ /g, "_").replace(/,/g, "").split("GMT")[0];

//                     // Create a download link
//                     const a = document.createElement('a');
//                     const url = URL.createObjectURL(blob);
//                     a.href = url;
//                     a.download = `Marketing_Calendar_${formattedDate}.pdf`;  // Set dynamic file name with date/time
//                     a.click();  // Trigger the download
//                     URL.revokeObjectURL(url);  // Release the object URL to clean up
//                     setPDFIsloaed(false);  // Hide loader after the action is done
//                 });
//             } else {
//                 throw new Error('PDF generation failed');
//             }
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             setPDFIsloaed(false);  // Hide loader in case of error
//             // alert('Failed to generate the PDF');
//         });
//     }).catch((userErr) => {
//         console.log('User Error:', userErr);
//         setPDFIsloaed(false);  // Hide loader in case of authentication error
//         alert('Failed to authenticate user');
//     });
// };


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
                return parseInt(item.Ship_Date__c.split("-")[2]) == 27 && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              } else {
                return monthNames[parseInt(item.Ship_Date__c.split("-")[1]) - 1].toLowerCase() == month.toLowerCase() && selectBrand === item.ManufacturerName__c && brand.some((brand) => brand.Name === item.ManufacturerName__c);
              }
            }
          } else {
            if (month == "TBD") {
              return parseInt(item.Ship_Date__c.split("-")[2]) == 27 && brand.some((brand) => brand.Name === item.ManufacturerName__c);
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
            temp["Product Price"] = !item.usdRetail__c ? "TBH" : item.usdRetail__c;
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
          {brand?.length > 0 ?
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
          : null }
      
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
                <div className="dropdown-item text-start" onClick={() => { generatePdfServerSide() }}>&nbsp;Pdf</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => { generatePdfServerSide(1) }}>&nbsp;PDF Quickview 1</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => { generatePdfServerSide(2) }}>&nbsp;PDF Quickview 2</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => generateXLSX()}>&nbsp;XLSX</div>
              </li>
            </ul>
          </div>
        </>
      }
    >
      <ModalPage
        open={isAlert}
        content={
          <div className="d-flex flex-column gap-3 ">
            <h2>Internal Server Error</h2>
            <p className="modalContent">
            <b>We apologize</b>, Currently the Server is unable to Take the load of Full Marketing Calendar including all brands.<br /><br />

              Kindly select 1 brand at time and try to download again.
            </p>
            <div className="d-flex justify-content-around ">
              <button className="modalButton" style={{width:'max-content'}} onClick={() => setIsAlert(false)}>
                Go Back
              </button>
            </div>
          </div>
        }
        onClose={() => setIsAlert(false)} />
      {isPDFLoaded ?<div><img src="https://i.giphy.com/7jtU9sxHNLZuv8HZCa.webp" style={{ margin: 'auto', mixBlendMode: 'luminosity' }} width="480" height="480" /><p className="text-center mt-2">{`Generating PDF`}</p></div> :
        isLoaded ? <LaunchCalendar brand={brand} selectBrand={selectBrand} month={month} productList={productList} /> : <LoaderV3 text={`Loading Upcoming New Product for ${selectBrand ?? "All Brands"}`} />}


    </AppLayout>
  );
};

export default MarketingCalendar;
