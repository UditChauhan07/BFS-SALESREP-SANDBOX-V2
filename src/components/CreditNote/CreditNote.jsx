import React, { useState, useEffect } from 'react';
import AppLayout from '../AppLayout';
import POPUPS from './POPUPS';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; // Import custom CSS for additional styling
import ViewPopUp from './ViewPopUp';
import { Modal, Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { IoMdRadioButtonOn } from "react-icons/io";
import CloseIcon from '@mui/icons-material/Close';  // Correct import for CloseIcon

function CreditNote() {
    const [manufacturerDetails, setManufacturerDetails] = useState([]);
    const [showModal, setShowModal] = useState(true); // State to control modal visibility

    const handleProductSelect = (manufacturers) => {
        setManufacturerDetails(manufacturers);
        setShowModal(false); // Close the modal when a selection is made
    };

    useEffect(() => {
        // Automatically open the modal when the component loads
        setShowModal(true);
    }, []);

    const handleClose = () => {
        setShowModal(false);
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false  // This option ensures the 24-hour format
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <AppLayout>
                {/* MUI Modal to display the POPUPS component */}
                <Modal
                    open={showModal}
                    onClose={handleClose}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '60%', // Set width to fit content
                        height: 'max-content', // Set height to fit content
                        bgcolor: 'background.paper',
                        border: 'none', // Removed border
                        borderRadius: '5px', // Added border-radius
                        boxShadow: 24,
                        p: 4,
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography id="modal-title" variant="h6" component="h2">
                               
                            </Typography>
                            <IconButton onClick={handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Box id="modal-description" mt={2}>
                            {/* Pass handleClose to POPUPS */}
                            <POPUPS onProductSelect={handleProductSelect} onClose={handleClose} />
                        </Box>
                    </Box>
                </Modal>

                {/* Display manufacturer details in a table */}
                {manufacturerDetails.length > 0 && (
                    <div className="manufacturer-details">
                     

{/*  */}

<div class="CreditNote_filterTransaction__2uRP9"><div class="search-icon"><img src="https://bfs-portal-sandbox.vercel.app/assets/images/Group235.png" alt="nn" /></div><div class="CreditNote_inputMain__pHygv"><input class="CreditNote_searchInput__paDPf" type="text" placeholder="TYPE TO SEARCH FOR A TRANSACTION" /></div></div>
                        {/*  */}


                        {/*  */}
                        <TableContainer component={Paper}>
                            <Table  className='credit-note-table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className='credit-note-heading'> <h4>PRODUCTS DETAILS</h4></TableCell>
                                        <TableCell></TableCell>
                                        <TableCell ></TableCell>
                                        <TableCell></TableCell>
                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody className='t-body' >
                                    {manufacturerDetails.map((manufacturer, mIndex) => (
                                        manufacturer.creditNotes.map((note, cIndex) => (
                                            <TableRow key={`${mIndex}-${cIndex}`}>
                                                <TableCell className='manufacturer-name-credit-note'><h6>
                                                {manufacturer.manufacturerName}
                                                    </h6></TableCell>
                                                <TableCell> <b>+${note.amount.toFixed(2)}</b>  <br /> <div className='credit-date'>
                                                {formatDate(note.date)}
                                                    </div> </TableCell>
                                               
                                                <TableCell > <div className='credit-note-status'>
                                                {note.status == 'AVAILABLE' ? <>
                                                    <IoMdRadioButtonOn size={27} color="#20C820" /> <br /> 
                                                </>: <><IoMdRadioButtonOn size={27} color="#DD8500" /></>}  <br /> {note.status}
                                                    
                                                    </div>  </TableCell>
                                                <TableCell><ViewPopUp /></TableCell>
                                            </TableRow>
                                        ))
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                )}
            </AppLayout>
        </div>
    );
}

export default CreditNote;
