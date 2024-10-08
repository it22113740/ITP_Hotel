import React, { useState, useEffect } from "react";
import { Table, message, DatePicker, Modal, Button, Input, Checkbox ,Select ,Avatar} from "antd";
import moment from "moment";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Link } from "react-router-dom";
import {
    UserOutlined
  } from "@ant-design/icons";

function ManageParkings() {
    const [selectedDate, setSelectedDate] = useState("");
    const [availability, setAvailability] = useState([]);
    const [parkingCount, setParkingCount] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [editingBooking, setEditingBooking] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedParkingId, setSelectedParkingId] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [bookingDate, setBookingDate] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6 });
    const [selectedColumns, setSelectedColumns] = useState([
        "vehicleNumber", "price", "bookingDate", "packageType", "parkingId"
    ]);
    const [selectedSecurityEmployee, setSelectedSecurityEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

    // New state for booking date filter
    const [filterBookingDate, setFilterBookingDate] = useState(null);

    // Fetch bookings on component mount
    useEffect(() => {
        fetchBookings();
        fetchAvailability();
        fetchPakingCount();
    }, []);

    useEffect(() => {
        let tempList = bookings;

        // Search by vehicle number
        if (searchTerm !== "") {
            tempList = tempList.filter((item) =>
                item.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by booking date
        if (filterBookingDate) {
            const formattedDate = filterBookingDate.format("YYYY-MM-DD");
            tempList = tempList.filter((item) =>
                moment(item.bookingDate).isSame(formattedDate)
            );
        }

        setFilteredBookings(tempList);
        const total = tempList.reduce((acc, booking) => acc + booking.price, 0);
        setTotalPrice(total);
        setTotalBookings(tempList.length);
    }, [searchTerm, bookings, filterBookingDate]);

    const fetchBookings = async () => {
        try {
            const response = await axios.get("/api/parking/getAllParkings");
            setBookings(response.data);
        } catch (error) {
            message.error("Failed to fetch bookings.");
        }
    };

    const fetchEmployeesByDepartment = async (department) => {
        try {
            const response = await axios.get(`/api/employee/getEmployeesByDepartment/${department}`);
            setEmployees(response.data);
        } catch (error) {
            message.error(error.response?.data?.message || "Failed to fetch employees.");
        }
    };

    const handleShowSecurityEmployees = () => {
        fetchEmployeesByDepartment("Security");
    };

    const fetchPakingCount = async () => {
        try {
            const response = await axios.get('/api/parking/availability/today');
            setParkingCount(response.data.totalAvailableSlots);
        } catch (error) {
            console.error('Error fetching booking count', error);
        }
    };

    const fetchAvailability = async () => {
        try {
            const response = await axios.get(`/api/parking/availability`, {
                params: { date: selectedDate },
            });
            setAvailability(response.data);
        } catch (error) {
            message.error("Failed to fetch availability.");
        }
    };

    const showDeleteModal = (parkingId) => {
        setSelectedParkingId(parkingId);
        setIsDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        try {
            await axios.post("/api/parking/delete", {
                parkingId: selectedParkingId,
            });
            message.success("Booking deleted successfully.");
            fetchBookings();
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error("Failed to delete booking.");
        }
    };
    const handleApproveDecline = async (parkingId, action) => {
        try {
            await axios.post("/api/parking/cancel-booking", {
                parkingId,
                action,
            });
            message.success(`Cancellation request ${action === 'approve' ? 'approved' : 'declined'} successfully.`);
            fetchBookings(); // Refresh the bookings list after approval or decline
        } catch (error) {
            message.error("Failed to process the cancellation request.");
        }
    };

    const handleEdit = (record) => {
        setEditingBooking(record);
        setVehicleNumber(record.vehicleNumber);
        setBookingDate(moment(record.bookingDate, "YYYY-MM-DD"));
        setIsModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            await axios.post("/api/parking/update", {
                parkingId: editingBooking.parkingId,
                vehicleNumber,
                bookingDate: bookingDate.format("YYYY-MM-DD"),
            });
            message.success("Booking updated successfully.");
            setIsModalVisible(false);
            fetchBookings();
        } catch (error) {
            message.error("Failed to update booking.");
        }
    };

    const handleDateChange = (date) => {
        setBookingDate(date);
    };

    const handleView = (record) => {
        setSelectedBooking(record);
        setViewModalVisible(true);
    };

    // Generate PDF with selected columns
    const generatePDF = () => {
        const doc = new jsPDF();
        const columns = selectedColumns.map((column) => {
            switch (column) {
                case "vehicleNumber":
                    return { header: "Vehicle Number", dataKey: "vehicleNumber" };
                case "price":
                    return { header: "Price", dataKey: "price" };
                case "bookingDate":
                    return { header: "Booking Date", dataKey: "bookingDate" };
                case "packageType":
                    return { header: "Package Type", dataKey: "packageType" };
                case "parkingId":
                    return { header: "Parking ID", dataKey: "parkingId" };
                default:
                    return { header: column, dataKey: column };
            }
        });

        const data = filteredBookings.map((booking) =>
            selectedColumns.reduce((acc, column) => {
                acc[column] = booking[column];
                return acc;
            }, {})
        );

        doc.autoTable({
            columns,
            body: data,
        });
        doc.save("parking-bookings.pdf");
    };

    const handleEmployeeSelection = (employeeId) => {
        const selectedEmployee = employees.find(emp => emp._id === employeeId);
        setSelectedSecurityEmployee(employeeId);
        setSelectedEmployeeData({
            name: selectedEmployee.firstName,
            imageUrl: selectedEmployee.profilePictureUrl || null,
        });
    };

    // Handle column selection for PDF generation
    const handleColumnChange = (checkedValues) => {
        setSelectedColumns(checkedValues);
    };

    const columns = [
        {
            title: (
                <>
                    <Checkbox
                        onChange={(e) => handleColumnChange(["vehicleNumber"])}
                        checked={selectedColumns.includes("vehicleNumber")}
                        style={{ marginRight: '10px' }} 
                    />
                    Vehicle Number
                </>
            ),
            dataIndex: "vehicleNumber",
            key: "vehicleNumber",
        },
        {
            title: (
                <>
                    <Checkbox
                        onChange={(e) => handleColumnChange(["price"])}
                        checked={selectedColumns.includes("price")}
                        style={{ marginRight: '10px' }} 
                    />
                    Price
                </>
            ),
            dataIndex: "price",
            key: "price",
        },
        {
            title: (
                <>
                    <Checkbox
                        onChange={(e) => handleColumnChange(["bookingDate"])}
                        checked={selectedColumns.includes("bookingDate")}
                        style={{ marginRight: '10px' }} 
                    />
                    Booking Date
                </>
            ),
            dataIndex: "bookingDate",
            key: "bookingDate",
        },
        {
            title: (
                <>
                    <Checkbox
                        onChange={(e) => handleColumnChange(["packageType"])}
                        checked={selectedColumns.includes("packageType")}
                        style={{ marginRight: '10px' }} 
                    />
                    Package Type
                </>
            ),
            dataIndex: "packageType",
            key: "packageType",
        },
        {
            title: (
                <>
                    <Checkbox
                        onChange={(e) => handleColumnChange(["parkingId"])}
                        checked={selectedColumns.includes("parkingId")}
                        style={{ marginRight: '10px' }} 
                    />
                    Parking ID
                </>
            ),
            dataIndex: "parkingId",
            key: "parkingId",
        },
        {
                title: "Cancellation Status",
                dataIndex: "status",
                key: "status",
            },
        {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
                <div className="actions-container2345">
                        {record.status === 'pending' && (
                    <>
                        <Button onClick={() => handleApproveDecline(record.parkingId, 'approve')}>Approve</Button>
                        <Button onClick={() => handleApproveDecline(record.parkingId, 'decline')}>Decline</Button>
                    </>
                )}
                    <Button onClick={() => handleEdit(record)} className="edit-button2345">
                        Edit
                    </Button>
                    <Button onClick={() => showDeleteModal(record.parkingId)} className="delete-button2345">
                        Cancel
                    </Button>
                    <Button onClick={() => handleView(record)} style={{ backgroundColor: 'green', color: 'white' }} className="view-button2345">
                        View
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="admin-manage-parking-2313">
            <div className="parking-table-header-container">
                <h1>Parking Bookings</h1>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input-42424"
                    disabled={isModalVisible || isDeleteModalVisible}
                />
                {/* Date Picker for Booking Date Filter */}
            <DatePicker
                onChange={(date) => setFilterBookingDate(date)}
                style={{ marginBottom: '16px', width: '200px' }} 
                placeholder="Filter by Booking Date"
            />
                <button
                    onClick={generatePDF}
                    style={{
                        backgroundColor: "#27ae60",
                        color: "white",
                        padding: "6px 18px",
                        border: "none",
                        borderRadius: "5px",
                    }}
                >
                    Generate PDF
                </button>
            </div>

            




            
            <div>
            <DatePicker
            onChange={(date) => setSelectedDate(date)}
            value={selectedDate}
            style={{ width: 200, marginRight: '10px' }}
            placeholder="Select Date"
        />
        
        {/* Security employee selection */}
        <Select
            style={{ width: 200 }}
            placeholder="Select Security Employee"
            onChange={handleEmployeeSelection}
            onFocus={handleShowSecurityEmployees}
        >
            {employees.map(employee => (
                <Select.Option key={employee._id} value={employee._id}>
                    {employee.firstName}
                </Select.Option>
            ))}
        </Select>

        

        {selectedDate && selectedEmployeeData && (
            <div style={{ marginTop: '20px' }}>
                
                <Avatar
                    size={100}
                    src={selectedEmployeeData.imageUrl}
                    icon={<UserOutlined />}
                />
                <h3>{selectedEmployeeData.name}</h3>
                
            </div>
        )}
            </div>

            
            <div style={{ marginTop: '20px' }}>
                <h4>Total Bookings: {totalBookings}</h4>
                <h4>Total Price: ${totalPrice}</h4>
            </div>
            <div className="admin_dashboard_card card5">
                    <h1 style={{ fontSize: "30px" }}>Available Parkings</h1>
                    <h2 style={{ fontSize: "32px" }}>{parkingCount}</h2>
                    <Link to="/admin/bookings" style={{ textDecoration: "none" }}>
                        {/* Link content */}
                    </Link>
                </div>

<Table
    columns={columns}
    dataSource={filteredBookings}
    pagination={{
        position: ['bottomCenter'],
        current: pagination.current,
        pageSize: pagination.pageSize,
        onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
        className: 'pagination-center', // Custom class for pagination
    }}
    rowKey="parkingId"
/>

            {/* Edit Modal */}
            <Modal
                title="Edit Booking"
                visible={isModalVisible}
                onOk={handleUpdate}
                onCancel={() => setIsModalVisible(false)}
            >
                <Input
                    placeholder="Vehicle Number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                />
                <DatePicker
                    value={bookingDate}
                    onChange={handleDateChange}
                    placeholder="Booking Date"
                    style={{ marginTop: '10px' }}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="Confirm Delete"
                visible={isDeleteModalVisible}
                onOk={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
            >
                <p>Are you sure you want to delete this booking?</p>
            </Modal>

            {/* View Modal */}
            <Modal
                title="Booking Details"
                visible={viewModalVisible}
                onOk={() => setViewModalVisible(false)}
                onCancel={() => setViewModalVisible(false)}
            >
                {selectedBooking && (
                    <div>
                        <p>Vehicle Number: {selectedBooking.vehicleNumber}</p>
                        <p>Price: {selectedBooking.price}</p>
                        <p>Booking Date: {selectedBooking.bookingDate}</p>
                        <p>Package Type: {selectedBooking.packageType}</p>
                        <p>Parking ID: {selectedBooking.parkingId}</p>
                    </div>
                )}
            </Modal>
            

            
            
        </div>
    );
}

export default ManageParkings;


