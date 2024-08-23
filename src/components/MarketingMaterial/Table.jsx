import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import FileModal from './FileModal';
import { marketingProducts } from '../../api/useMarketingMaterial';
import OrderLoader from '../loader';
import {originAPi} from '../../lib/store'
function Table() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for table data
  const [modalLoading, setModalLoading] = useState(false); // Loading state for modal
  const [modalShow, setModalShow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading
      try {
        const data = await marketingProducts();
        console.log(data); // Inspect the response
        if (Array.isArray(data.records)) {
          setProducts(data.records);
        } else {
          console.error('Data records is not an array:', data.records);
          setProducts([]); // Fallback to empty array
        }
      } catch (error) {
        console.error('Error fetching marketing products:', error);
        setProducts([]); // Fallback to empty array in case of error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchProducts();
  }, []);

  const handleShowModal = async (contentVersionId, fileExtension) => {
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
      setSelectedFile({ url, fileName: `${contentVersionId}.${fileExtension}`, mimeType });
      setModalShow(true); // Show modal
    } catch (error) {
      console.error('Error fetching file details:', error);
    } finally {
      setModalLoading(false); // Stop loading for modal
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
      <h2 className="text-2xl font-bold mb-4">Marketing Products Table</h2>

      {loading ? (
        <OrderLoader /> // Display loader when loading is true
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Manufacturer Name</th>
              <th>Product Name</th>
              <th>Total Files</th>
              <th>File Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.manufacturerName}</td>
                  <td>{product.productName}</td>
                  <td>{product.files.length}</td>
                  <td>
                    {product.files.map((file, index) => (
                      <div key={index} className="mb-1">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleShowModal(file.contentVersionId, file.fileExtension)}
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No products available</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {modalLoading && <OrderLoader />} {/* Display loader while modal is loading */}

      {selectedFile && !modalLoading && ( /* Show modal only if not loading */
        <FileModal
          show={modalShow}
          onHide={handleCloseModal}
          file={selectedFile}
        />
      )}
    </div>
  );
}

export default Table;
