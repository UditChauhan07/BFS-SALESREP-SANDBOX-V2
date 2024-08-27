import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Table from '../components/MarketingMaterial/Table';
import {FilterItem} from '../components/FilterItem'

function MaterialMarketing() {
  const [manufacturerFilter, setManufacturerFilter] = useState('');

  const [manufacturers, setManufacturers] = useState([]); // State to store manufacturer names

  // Handle filter changes
  const btnHandler = (filters) => {
    const { manufacturerId } = filters;
    setManufacturerFilter(manufacturerId || '');
  
  };

  return (
    <AppLayout
      filterNodes={
        <>
          <FilterItem
            minWidth="220px"
            label="All Brands"
            name="Manufacturer1"
            value={manufacturerFilter}
            options={manufacturers.map(manufacturer => ({
              label: manufacturer,
              value: manufacturer,
            }))}
            onChange={(value) => btnHandler({ manufacturerId: value})}
          />
        
        </>
      }
    >
      <div>
        <Table setManufacturers={setManufacturers} manufacturerFilter={manufacturerFilter} />
      </div>
    </AppLayout>
  );
}

export default MaterialMarketing;
