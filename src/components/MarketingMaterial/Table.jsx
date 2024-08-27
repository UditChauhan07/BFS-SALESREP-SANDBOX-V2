import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileModal from './FileModal';
import { marketingProducts } from '../../api/useMarketingMaterial';
import OrderLoader from '../loader';
import { originAPi } from '../../lib/store';
import { MdSlideshow } from "react-icons/md";
import './style.css';
import { Modal, Button } from 'react-bootstrap';
import Loading from '../Loading';

function Table({ setManufacturers, manufacturerFilter }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for table data
  const [modalLoading, setModalLoading] = useState(false); // Loading state for modal
  const [modalShow, setModalShow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileListModalShow, setFileListModalShow] = useState(false); // State to control file list modal
  const [currentProductFiles, setCurrentProductFiles] = useState([]); // Current files to show in list modal

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading
      try {
        const data = await marketingProducts();
        console.log(data); // Inspect the response
        if (Array.isArray(data.records)) {
          // Filter out products without files and set products
          const productsWithFiles = data.records.filter(
            (product) => product.files && product.files.length > 0
          );
          setProducts(productsWithFiles);

          // Extract unique manufacturer names and pass them to the parent component
          const uniqueManufacturers = [
            ...new Set(productsWithFiles.map((product) => product.manufacturerName)),
          ];
          setManufacturers(uniqueManufacturers);
        } else {
          console.error('Data records is not an array:', data.records);
          setProducts([]); // Fallback to empty array
          setManufacturers([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Error fetching marketing products:', error);
        setProducts([]); // Fallback to empty array in case of error
        setManufacturers([]); // Fallback to empty array
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProducts();
  }, [setManufacturers]);

  const handleShowModal = async (contentVersionId, fileExtension, title) => {
    setModalLoading(true); // Start loading for modal
    try {
      const response = await axios.post(
        `${originAPi}/marketing-material/file/${contentVersionId}`,
        {},
        { responseType: 'arraybuffer' } // Handle binary data
      );
  
      // Convert the response to a Blob and create a URL
      const mimeType = getMimeType(fileExtension); // Determine MIME type based on file extension
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
  
      // Create a file object to pass to the modal
      setSelectedFile({ url, fileName: `${contentVersionId}.${fileExtension}`, mimeType, title });
      setModalShow(true); // Show modal
    } catch (error) {
      console.error('Error fetching file details:', error);
    } finally {
      setModalLoading(false); // Stop loading for modal
    }
  };
  
  const handleFileClick = (file) => {
    handleShowModal(file.contentVersionId, file.fileExtension);
    setFileListModalShow(false); // Close the file list modal
  };

  const handleViewButtonClick = (files) => {
    if (files.length === 1) {
      handleShowModal(files[0].contentVersionId, files[0].fileExtension, files[0].title);
    } else {
      setCurrentProductFiles(files);
      setFileListModalShow(true); // Open the file list modal
    }
  };

  const handleCloseModal = () => {
    setModalShow(false);
    setSelectedFile(null);
  };

  const getMimeType = (fileExtension) => {
    switch (fileExtension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image/' + fileExtension.toLowerCase();
      case 'pdf':
        return 'application/pdf';
      case 'ppt':
      case 'pptx':
        return 'application/vnd.ms-powerpoint';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video/' + fileExtension.toLowerCase();
      default:
        return 'application/octet-stream'; // Default binary type
    }
  };

  return (
    <div className="p-4">
    

    <div className="relative mm-table">
  {loading && (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
      <Loading /> {/* Display loader when loading is true */}
    </div>
  )}

  <table className={`min-w-full divide-y divide-gray-200 ${loading ? 'opacity-50' : ''}`}>
    <thead className="bg-gray-50 mm-head className='flex items-center justify-between'">
      <tr>
        <th>Name</th>
        <th>Manufacturer</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 mm-body">
      {products
        .filter((product) => !manufacturerFilter || product.manufacturerName === manufacturerFilter)
        .map((product) => (
          <tr key={product.id} >
            <td>{product.name}</td>
            <td>{product.manufacturerName}</td>
            <td>
              <div className="mb-1">
                <button className='' onClick={() => handleViewButtonClick(product.files)}>
                  <MdSlideshow size={16} /> View
                </button>
              </div>
            </td>
          </tr>
        ))}
      {products.length === 0 && (
        <tr>
          <td colSpan="3" className="text-center">No products available</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{modalLoading && (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
    <Loading /> {/* Display loader while modal is loading */}
  </div>
)}

{selectedFile && !modalLoading && (
  <FileModal
    show={modalShow}
    onHide={handleCloseModal}
    file={selectedFile}
  />
)}

      {/* File List Modal */}
      <Modal
    show={fileListModalShow}
    onHide={() => setFileListModalShow(false)}
    centered
    dialogClassName="wider-modal" // Custom class to adjust modal width
>
    <Modal.Header closeButton>
        <Modal.Title>Select a file to view</Modal.Title>
    </Modal.Header>
    <Modal.Body>
  <div className="file-list">
    {currentProductFiles.map((file, index) => (
      <div key={index} className="file-box" onClick={() => handleFileClick(file)}>
        <p>File {index + 1}</p> 
      </div>
    ))}
  </div>
</Modal.Body>

</Modal>

    </div>
  );
}

export default Table;
