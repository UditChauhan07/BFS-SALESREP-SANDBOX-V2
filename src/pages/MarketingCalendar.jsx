import React, { useState, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import LaunchCalendar from "../components/LaunchCalendar/LaunchCalendar";
import { FilterItem } from "../components/FilterItem";
import html2pdf from 'html2pdf.js';
import Loading from "../components/Loading";
import { MdOutlineDownload } from "react-icons/md";
import { GetAuthData, getMarketingCalendar, getMarketingCalendarPDF, getRetailerBrands, originAPi, } from "../lib/store";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { CloseButton } from "../lib/svg";
const fileExtension = ".xlsx";
const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";

const MarketingCalendar = () => {
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
    { value: "JULY", label: "JULY" },
    { value: "AUG", label: "AUG" },
    { value: "SEP", label: "SEP" },
    { value: "OCT", label: "OCT" },
    { value: "NOV", label: "NOV" },
    { value: "DEC", label: "DEC" },
    { value: "TBD", label: "TBD" },

  ];

  // ...............
  const [isEmpty, setIsEmpty] = useState(false);
  const [brand, setBrand] = useState([]);
  const [selectBrand, setSelectBrand] = useState(null)
  useEffect(() => {
    GetAuthData().then((user) => {
      let rawData = { accountId: user.data.accountId, key: user.data.x_access_token }
      getRetailerBrands({ rawData }).then((resManu) => {
        setBrand(resManu);
        getMarketingCalendar({ key: user.data.x_access_token }).then((productRes) => {
          console.log({ productRes });
          setProductList(productRes)
          setIsloaed(true)
          setTimeout(() => {

            var element = document.getElementById("Apr");
            if (element) {
              element.scrollIntoView();
              element.scrollIntoView(false);
              element.scrollIntoView({ block: "end" });
              element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
            }
          }, 2000);
        }).catch((err) => console.log({ err }))
      }).catch((err) => {
        console.log({ err });
      })
    }).catch((error) => {
      console.log({ error });
    })
  }, [selectBrand, month, isLoaded])

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
  const generatePdfServerSide = () => {
    setPDFIsloaed(true);
    LoadingEffect();
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
      getMarketingCalendarPDF({ key: user.data.x_access_token, manufacturerId, month, manufacturerStr }).then((file) => {
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
        // console.log(match)
        if (month) {
          if (brand) {
            if (brand == item.brand) {
              return item.date.toLowerCase().includes(month.toLowerCase())
            }
          } else {
            return item.date.toLowerCase().includes(month.toLowerCase())
          }
          // return match.includes(month.toUpperCase() )
        } else {
          if (brand) {
            if (brand == item.brand) {
              return true;
            }
          } else {
            return true;
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
            temp["Product Title"] = item.name;
            temp["Product Description"] = item.description;
            temp["Product Size"] = item.size;
            temp["Product Ship Date"] = item.date;
            temp["Product OCD Date"] = item.OCDDate;
            temp["Product Brand"] = item.brand;
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
    if (brand) {
      filename = brand
    }
    FileSaver.saveAs(data, `${filename} ${new Date()}` + fileExtension);
  };

  return (
    <AppLayout
      filterNodes={
        <>
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
              setIsEmpty(false)
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
                <div className="dropdown-item text-start" onClick={() => generatePdfServerSide()}>&nbsp;Pdf</div>
              </li>
              <li>
                <div className="dropdown-item text-start" onClick={() => generateXLSX()}>&nbsp;XLSX</div>
              </li>
            </ul>
          </div>
        </>
      }
    >
      {isLoaded ? (
        <LaunchCalendar selectBrand={selectBrand} brand={brand} isEmpty={isEmpty} month={month} productList={productList} />
      ) : (
        <Loading height={"70vh"} />
      )}

    </AppLayout>
  );
};

export default MarketingCalendar;