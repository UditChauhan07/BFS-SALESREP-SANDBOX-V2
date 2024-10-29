import React, { useEffect, useState } from "react";
import Page from "../pages/page.module.css";
import Select from 'react-select'
import makeAnimated from 'react-select/animated';

export const FilterItem = ({ label, options, onChange, minWidth, value, name = 'drop-down1', containNullValue = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const onMouseEnter = () => {
      setIsOpen(true)
    };

    const onMouseLeave = () => {
      setIsOpen(false)
    };
    document.getElementById(name)?.addEventListener("mouseenter", onMouseEnter);
    document.getElementById(name)?.addEventListener("mouseleave", onMouseLeave);
  }, [])
  return (
    <div className={`relative filterItem ${Page.FilterNoneClass}  d-flex align-self-center`} style={{ position: 'relative' }} id={name}>
      <div
        className="flex justify-center items-center gap-1 leading-tight cursor-pointer select-none "
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {value || containNullValue ? options?.find((option) => option.value === value)?.label : label}
        <img src={"/assets/images/downArrowWhite.svg"} style={isOpen ? { transform: 'rotate(35deg)', transition: 'all 750ms ease-out' } : { transition: 'all 300ms ease-out' }} alt="img" />
      </div>
      {isOpen ? (
        <div className="absolute" style={{ minWidth: minWidth || "120px", maxHeight: "450px", overflow: "auto", top: "5px" }}>
          <div className={Page.upArrow}></div>
          <ul
            className={`bg-white z-10 rounded-[5px] shadow-sm text-black py-2 pr-2 flex flex-col  list-disc`}
            style={{ maxHeight: '350px', overflowY: 'scroll' }}
          >
            {options?.map((option, index) => (
              <li
                key={index}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer hover:bg-[#eeeeef] p-1 hover:rounded-lg ${option.value === value ? `bg-[lightgrey] rounded` : null}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export const MultiFilterItem = ({ label, options, onChange, name, minWidth, value, closeMenuOnSelect = false, isSearchable = false }) => {
  const animatedComponents = makeAnimated();
  const onChangeHandler = (values) => {
    let temp = [];
    if (values.length > 0) {
      values.map((element) => {
        temp.push(element.value)
      })
    }
    onChange(temp)
  }
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "transparent",
      color: "#FFF",
      borderColor: 'transparent',
      width: 'fit-content',
      maxWidth: '400px',
      // match with the menu
      // borderRadius: state.isFocused ? "3px 3px 0 0" : 3,
      // // Overwrittes the different states of border
      // borderColor: state.isFocused ? "yellow" : "green",
      // Removes weird border around container
      // boxShadow: state.isFocused ? null : null,
      "&:hover": {
        borderColor: 'transparent'
        // Overwrittes the different states of border
        // borderColor: state.isFocused ? "red" : "blue"
      },
    }),
    valueContainer: (provided, state) => ({
      ...provided,
    }),
    indicatorContainer: base => ({
      color: 'red'
    }),
    placeholder: base => ({
      ...base,
      color: "#fff"
      // kill the gap
    }),
    menu: base => ({
      ...base,
      width: '200px',
      // override border radius to match the box
      borderRadius: '5px',
      // kill the gap
    }),
    menuList: base => ({
      ...base,
      color: "#000",
      // kill the white space on first and last option
      padding: 0
    })
  };
  return (
    <Select
      styles={customStyles}
      components={animatedComponents}
      isMulti
      options={options}
      defaultValue={value?.map((element) => ({
        label: element,
        value: element,
      }))}
      name={name}
      closeMenuOnSelect={closeMenuOnSelect}
      isSearchable={isSearchable}
      onChange={onChangeHandler}
    />
  )
}
