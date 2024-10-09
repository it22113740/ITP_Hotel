import React, { useState, useEffect } from "react";
import {
        Space,
        Table,
        Tag,
        Modal,
        Input,
        message,
        Form,
        Select,
        InputNumber,
        Card,
        DatePicker,Avatar
} from "antd";

import { Icon } from "@iconify/react";
import axios from "axios";
import {
        LineChart,
        Line,
        BarChart,
        Bar,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip as RechartsTooltip,
        ResponsiveContainer,
} from "recharts";
import {
        UserOutlined
      } from "@ant-design/icons";
import { CSVLink } from "react-csv"; // Import CSVLink

const ManageRooms = () => {
        // State declarations for modals and data
        const [loading, setLoading] = useState(false);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
        const [rooms, setRooms] = useState([]);
        const [editingRoom, setEditingRoom] = useState(null);
        const [searchTerm, setSearchTerm] = useState("");
        const [filteredRooms, setFilteredRooms] = useState([]);
        const [selectedItems, setSelectedItems] = useState([]);
        const [filteredRoomsReserve, setFilteredRoomsReserve] = useState([]);

        const [form] = Form.useForm(); // Form instance for add room
        const [updateForm] = Form.useForm(); // Form instance for update room

        const [filterBookingDate, setFilterBookingDate] = useState(null);
        const [employeeId, setEmployeeId] = useState('');
        const [dutyDate, setDutyDate] = useState('');
        const [message, setMessage] = useState('');
        const [employeesOnDutyToday, setEmployeesOnDutyToday] = useState([]);

        const [selectedSecurityEmployee, setSelectedSecurityEmployee] = useState(null);
        const [employees, setEmployees] = useState([]);
        const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
        
        const [selectedDate, setSelectedDate] = useState("");

        const [reservations, setReservations] = useState([]); // Initialize state for reservations

        const OPTIONS = [
                "WiFi",
                "Air Conditioning",
                "Swimming Pool",
                "Gym",
                "Spa",
                "Restaurant",
        ];

  

        const fetchReservations = async () => {
                try {
                  const response = await axios.get('/api/room/getBookings');
                  console.log(response.data); // Log response to see if it contains 'bookings'
                  setReservations(response.data.bookings); // Use 'bookings', not 'reservations'
                } catch (error) {
                  console.error('Error fetching reservations:', error);
                  message.error('Failed to fetch reservations.');
                }
              };
              

      // Fetch reservations data when component mounts
      useEffect(() => {
        fetchReservations();
        console.log(reservations); // Check if reservations state has the correct data after setting it
    }, [reservations]);
    

    



    // Internal CSS styles
    const styles = {
        container: {
            padding: '20px',
            backgroundColor: '#f7f9fc',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            margin: 'auto',
            textAlign: 'center',
        },
        input: {
            width: '80%',
            padding: '10px',
            margin: '10px 0',
            border: '1px solid #ccc',
            borderRadius: '5px',
        },
        button: {
            backgroundColor: '#27ae60',
            color: 'white',
            padding: '10px 18px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s',
        },
        buttonHover: {
            backgroundColor: '#219150',
        },
        message: {
            marginTop: '15px',
            color: '#e74c3c', // Red color for error messages
        },
    };

    

   

        // CSV data
        const csvHeaders = [
                { label: "Room Number", key: "roomNumber" },
                { label: "Room Type", key: "roomType" },
                { label: "Bed Type", key: "bedType" },
                { label: "Size", key: "size" },
                { label: "View Information", key: "viewInformation" },
                { label: "Facilities", key: "facilities" },
                { label: "Price", key: "price" },
                { label: "Amenities", key: "amenities" },
                { label: "Status", key: "status" },
        ];

        const filteredOptions = OPTIONS.filter(
                (option) => !selectedItems.includes(option)
        );


         // Define your columns
         const column= [
           {
             title: 'Booking ID',
             dataIndex: 'bookingID',
             key: 'bookingID',
           },
           {
             title: 'Room Number',
             dataIndex: 'roomNumber',
             key: 'roomNumber',
           },
           {
             title: 'Guest Name',
             dataIndex: 'guestName',
             key: 'guestName',
           },
           {
             title: 'Email',
             dataIndex: 'guestEmail',
             key: 'guestEmail',
           },
           {
             title: 'Phone',
             dataIndex: 'guestPhone',
             key: 'guestPhone',
           },
           {
             title: 'Check-in Date',
             dataIndex: 'checkInDate',
             key: 'checkInDate',
           },
           {
             title: 'Check-out Date',
             dataIndex: 'checkOutDate',
             key: 'checkOutDate',
           },
           {
             title: 'Total Amount',
             dataIndex: 'totalAmount',
             key: 'totalAmount',
           },
         ];





    

        // Show and hide modals
        const showModal = () => setIsModalOpen(true);
        const handleCancel = () => {
                setIsModalOpen(false);
                form.resetFields();
        };

        const showUpdateModal = (room) => {
                setEditingRoom(room);
                setIsUpdateModalOpen(true);
                updateForm.setFieldsValue(room);
                setSelectedItems(room.amenities || []); // Set initial selected amenities
        };

        const handleUpdateCancel = () => {
                setIsUpdateModalOpen(false);
                updateForm.resetFields();
                setEditingRoom(null);
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
                fetchEmployeesByDepartment("Cleaner");
            };

            


            const handleEmployeeSelection = (employeeId) => {
                const selectedEmployee = employees.find(emp => emp._id === employeeId);
                setSelectedSecurityEmployee(employeeId);
                setSelectedEmployeeData({
                    name: selectedEmployee.firstName,
                    imageUrl: selectedEmployee.profilePictureUrl || null,
                });
            };

            const handleAssignClick = async () => {
                try {
                    const response = await axios.put(`/api/employee/updateDutyDate/${employeeId}`, {
                        dutyDate,
                    });
            
            
                    setMessage(`Duty date updated successfully: ${response.data.dutyDate}`);
                    setEmployeeId(''); // Clear employee ID
                    setDutyDate('');
                } catch (error) {
                   
                }
            };

        

        // Fetch rooms from the API
        const fetchRooms = async () => {
                try {
                        const response = await axios.get("/api/room/getRooms");
                        setRooms(response.data.rooms);
                        setFilteredRooms(response.data.rooms); // Initialize filteredRooms with all rooms
                } catch (err) {
                        console.log(err);
                }
        };
        const mockReservations = [
                {
                    bookingID: '123',
                    roomNumber: '101',
                    guestName: 'John Doe',
                    guestEmail: 'john@example.com',
                    guestPhone: '1234567890',
                    checkInDate: '2024-10-10',
                    checkOutDate: '2024-10-15',
                    totalAmount: 500,
                },
                {
                    bookingID: '124',
                    roomNumber: '102',
                    guestName: 'Jane Smith',
                    guestEmail: 'jane@example.com',
                    guestPhone: '9876543210',
                    checkInDate: '2024-10-12',
                    checkOutDate: '2024-10-18',
                    totalAmount: 650,
                },
                {
                    bookingID: '125',
                    roomNumber: '103',
                    guestName: 'David Johnson',
                    guestEmail: 'davidj@example.com',
                    guestPhone: '4567890123',
                    checkInDate: '2024-10-11',
                    checkOutDate: '2024-10-14',
                    totalAmount: 450,
                },
                {
                    bookingID: '126',
                    roomNumber: '104',
                    guestName: 'Emily Davis',
                    guestEmail: 'emilyd@example.com',
                    guestPhone: '7890123456',
                    checkInDate: '2024-10-15',
                    checkOutDate: '2024-10-20',
                    totalAmount: 700,
                },
                {
                    bookingID: '127',
                    roomNumber: '105',
                    guestName: 'Michael Wilson',
                    guestEmail: 'michaelw@example.com',
                    guestPhone: '3216549870',
                    checkInDate: '2024-10-16',
                    checkOutDate: '2024-10-22',
                    totalAmount: 800,
                },
                {
                    bookingID: '128',
                    roomNumber: '106',
                    guestName: 'Sarah Brown',
                    guestEmail: 'sarahb@example.com',
                    guestPhone: '2345678901',
                    checkInDate: '2024-10-20',
                    checkOutDate: '2024-10-25',
                    totalAmount: 550,
                },
            ];
            

        useEffect(() => {
                fetchRooms();
        }, []);

        

        // Update filtered rooms when search term changes
        useEffect(() => {
                const tempList = rooms.filter(
                        (room) =>
                                (room.roomType &&
                                        room.roomType
                                                .toLowerCase()
                                                .includes(
                                                        searchTerm.toLowerCase()
                                                )) || // Filter by room type
                                (room.roomNumber &&
                                        room.roomNumber
                                                .toLowerCase()
                                                .includes(
                                                        searchTerm.toLowerCase()
                                                )) || // Filter by room number
                                (room.facilities &&
                                        room.facilities
                                                .toLowerCase()
                                                .includes(
                                                        searchTerm.toLowerCase()
                                                )) // Filter by room facilities
                );
                setFilteredRooms(tempList);
        }, [searchTerm, rooms]);

        // Handle search input change
        const handleSearchChange = (e) => {
                setSearchTerm(e.target.value);
        };

        // Add new room
        const addRoom = async () => {
                try {
                        const values = await form.validateFields();
                        const roomData = {
                                ...values,
                                amenities: selectedItems,
                        }; // Include amenities
                        await axios.post("/api/room/addRoom", roomData);
                        setIsModalOpen(false);
                        message.success("Room added successfully");
                        fetchRooms();
                        form.resetFields();
                } catch (err) {
                        console.log(err);
                        message.error(
                                err.response?.data?.message ||
                                        "Failed to add room"
                        );
                }
        };

        // Update room
        const handleUpdate = async () => {
                try {
                        const values = await updateForm.validateFields();
                        await axios.put(
                                `/api/room/updateRoom/${editingRoom._id}`,
                                {
                                    ...values,
                                    amenities: selectedItems,
                                }
                            );
                        setIsUpdateModalOpen(false);
                        message.success("Room updated successfully");
                        fetchRooms();
                        updateForm.resetFields();
                } catch (err) {
                        console.log(err);
                        message.error(
                                err.response?.data?.message ||
                                        "Failed to update room"
                        );
                }
        };

        // Delete room
        const deleteRoom = async (id) => {
                try {
                        await axios.delete(`/api/room/deleteRoom/${id}`);

                        message.success("Room deleted successfully");
                        fetchRooms(); // Refresh the list of rooms after deletion
                } catch (err) {
                        console.log(err);
                        message.error("Failed to delete room");
                }
        };

        // Table columns for Ant Design Table component
        const columns = [
                {
                        title: "Room no",
                        dataIndex: "roomNumber",
                        key: "roomNumber",
                        render: (text) => <a>{text}</a>,
                },
                {
                        title: "Room Type",
                        dataIndex: "roomType",
                        key: "roomType",
                },
                {
                        title: "Facilities",
                        dataIndex: "facilities",
                        key: "facilities",
                },
                {
                        title: "Price",
                        dataIndex: "price",
                        key: "price",
                },
                {
                        title: "Status",
                        key: "status",
                        dataIndex: "status",
                        render: (status) => (
                                <Tag
                                        color={
                                                status === "Suspended"
                                                        ? "volcano"
                                                        : "green"
                                        }
                                >
                                        {status.toUpperCase()}
                                </Tag>
                        ),
                },
                {
                        title: "Action",
                        key: "action",
                        render: (_, record) => (
                                <Space size="middle">
                                        <Icon
                                                onClick={() =>
                                                        showUpdateModal(record)
                                                }
                                                icon="akar-icons:edit"
                                                width="24"
                                                height="24"
                                        />
                                        <Icon
                                                onClick={() =>
                                                        deleteRoom(record._id)
                                                }
                                                icon="material-symbols:delete"
                                                width="24"
                                                height="24"
                                        />
                                </Space>
                        ),
                },
        ];

        return (
                <div className="manage_room">
                        <div className="manage_room_content">
                                <div className="manage_room_header">
                                        <h1>Manage Rooms</h1>
                                        <div className="search-container-122313">
                                                <div className="search-bar_">
                                                        <Input
                                                                type="text"
                                                                placeholder="Search rooms"
                                                                value={
                                                                        searchTerm
                                                                }
                                                                onChange={
                                                                        handleSearchChange
                                                                }
                                                                style={{
                                                                        width: 300,
                                                                        marginLeft: 20,
                                                                        height: 40,
                                                                }}
                                                        />
                                                </div>
                                                <button
                                                        className="add_new_room"
                                                        onClick={showModal}
                                                >
                                                        Add Room
                                                </button>
                                                <button className="download_pkg">
                                                        <CSVLink
                                                                data={
                                                                        filteredRooms
                                                                } // Data to be exported
                                                                headers={
                                                                        csvHeaders
                                                                } // Headers for CSV
                                                                filename={
                                                                        "rooms-list.csv"
                                                                } // Name of the downloaded file
                                                                className="download-link"
                                                                target="_blank"
                                                                style={{
                                                                        textDecoration:
                                                                                "none",
                                                                        color: "inherit",
                                                                }} // Remove underline and keep original color
                                                        >
                                                                Download CSV
                                                        </CSVLink>
                                                </button>
                                                <div>
                                                
                                                        
                                                        </div>
                                        </div>

                                        <Modal
                                                title="Add Room"
                                                open={isModalOpen}
                                                onOk={addRoom}
                                                onCancel={handleCancel}
                                        >
                                                <Form
                                                        form={form}
                                                        layout="vertical"
                                                >
                                                        <Form.Item
                                                                label="Image URL"
                                                                name="imageUrl"
                                                        >
                                                                <Input placeholder="Paste image URL" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Room Number"
                                                                name="roomNumber"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please enter the room number",
                                                                        },
                                                                ]}
                                                        >
                                                                <Input placeholder="Enter room number" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Room Type"
                                                                name="roomType"
                                                                rules={[
                                                                        {
                                                                        required: true,
                                                                        message: "Please select a room type",
                                                                        },
                                                                ]}
                                                                >
                                                                <Select placeholder="Select room type">
                                                                        <Select.Option value="Luxury Room">Luxury Room</Select.Option>
                                                                        <Select.Option value="Double Room">Double Room</Select.Option>
                                                                        <Select.Option value="Single Room">Single Room</Select.Option>
                                                                </Select>
                                                        </Form.Item>

                                                        <Form.Item
                                                                label="Room Facilities"
                                                                name="facilities"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please enter the room facilities",
                                                                        },
                                                                ]}
                                                        >
                                                                <Input placeholder="Enter room facilities" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Bed Type"
                                                                name="bedType"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please enter the bed type",
                                                                        },
                                                                ]}
                                                        >
                                                                <Input placeholder="Enter bed type" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Number of Person"
                                                                name="size"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please enter the number of person",
                                                                        },
                                                                        {
                                                                                type: "number",
                                                                                message: "Price must be a number",
                                                                                transform: (
                                                                                        value
                                                                                ) =>
                                                                                        Number(
                                                                                                value
                                                                                        ),
                                                                        },
                                                                ]}
                                                        >
                                                                <Input placeholder="Enter the number of person" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="View information"
                                                                name="viewInformation"
                                                        >
                                                                <Input placeholder="Enter View Information" />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Room Price"
                                                                name="price"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please enter the room price",
                                                                        },
                                                                        {
                                                                                type: "number",
                                                                                message: "Price must be a number",
                                                                                transform: (
                                                                                        value
                                                                                ) =>
                                                                                        Number(
                                                                                                value
                                                                                        ),
                                                                        },
                                                                ]}
                                                        >
                                                                <InputNumber
                                                                        placeholder="Enter room price"
                                                                        style={{
                                                                                width: "100%",
                                                                        }}
                                                                />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Room Amenities"
                                                                name="amenities"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please select the Room Amenities",
                                                                        },
                                                                ]}
                                                        >
                                                                <Select
                                                                        mode="multiple"
                                                                        placeholder="Select Room Amenities"
                                                                        value={
                                                                                selectedItems
                                                                        }
                                                                        onChange={
                                                                                setSelectedItems
                                                                        }
                                                                        style={{
                                                                                width: "100%",
                                                                        }}
                                                                        options={filteredOptions.map(
                                                                                (
                                                                                        item
                                                                                ) => ({
                                                                                        value: item,
                                                                                        label: item,
                                                                                })
                                                                        )}
                                                                />
                                                        </Form.Item>
                                                        <Form.Item
                                                                label="Room Status"
                                                                name="status"
                                                                rules={[
                                                                        {
                                                                                required: true,
                                                                                message: "Please select the room status",
                                                                        },
                                                                ]}
                                                        >
                                                                <Select
                                                                        style={{
                                                                                width: "100%",
                                                                        }}
                                                                        options={[
                                                                                {
                                                                                        value: "Activate",
                                                                                        label: "Activate",
                                                                                },
                                                                                {
                                                                                        value: "Suspended",
                                                                                        label: "Suspended",
                                                                                },
                                                                        ]}
                                                                />
                                                        </Form.Item>
                                                </Form>
                                        </Modal>
                                </div>

       
        
       
       

<div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px", marginTop: "20px", marginBottom: "20px" }}>
  {/* Left Column - Assign Duty Date */}
  <div style={{ ...styles.container, textAlign: "left", width: "30%" }}>
    <h2>Assign Cleaner for Today</h2>
    <select
      value={employeeId}
      onChange={(e) => setEmployeeId(e.target.value)}
      style={styles.input}
      onFocus={handleShowSecurityEmployees}
    >
      <option value="" disabled>Select Cleaner</option>
      {employees.length > 0 ? (
        employees.map((employee) => (
          <option key={employee.id} value={employee.employeeId}>
            {employee.firstName}
          </option>
        ))
      ) : (
        <option disabled>No Employees Available</option>
      )}
    </select>
    
    <input
      type="date"
      value={dutyDate}
      onChange={(e) => setDutyDate(e.target.value)}
      style={styles.input}
    />
    
    <button
     onClick={handleAssignClick}
      style={styles.button}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
    >
      Assign
    </button>
    
    {message && <p style={styles.message}>{message}</p>}
  </div>
{/* Middle Column - Employees on Duty Today */}
<div style={{ ...styles.container, textAlign: "left", width: "30%" }}>
    <h2>Cleaner on Duty Today</h2>
    
    {/* Debugging logs */}
    {console.log("Loading status:", loading)}
    {console.log("Employees on duty today:", employeesOnDutyToday)}

    {loading ? (
        <p>Loading employees...</p>
    ) : employeesOnDutyToday && employeesOnDutyToday.length > 0 ? ( 
        employeesOnDutyToday.map((employee) => (
            <div
                key={employee._id}
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                    padding: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Gray shadow
                    borderRadius: "8px",
                }}
            >
                <Avatar
                    size={50}
                    src={employee.imageUrl || null}
                    icon={<UserOutlined />}
                    style={{ marginRight: "10px" }}
                />
                <span>{employee.firstName} {employee.lastName}</span>
            </div>
        ))
    ) : (
        <p>No employees are on duty today.</p>
    )}
</div>

    
    
   
  
</div>

<Table
      columns={column}   // Use the column structure defined above
      dataSource={reservations}  // reservations data fetched from the backend
      rowKey="bookingID"   // Unique key for each row
    />

        </div>

                        {/* Room Analytics Section */}
                                <div className="Type_Distribution">
                                        <RoomAnalyticsDashboard />
                                </div>
                                <div className="manageroom_table">
                                        <Table
                                                columns={columns}
                                                dataSource={[
                                                        ...filteredRooms,
                                                ].reverse()} // Use filteredRooms instead of rooms
                                                pagination={{ pageSize: 6 }} // Display 6 rows per page
                                        />
                                </div>

                                <Modal
                                        title="Update Room"
                                        open={isUpdateModalOpen}
                                        onOk={handleUpdate}
                                        onCancel={handleUpdateCancel}
                                >
                                        <Form
                                                form={updateForm}
                                                layout="vertical"
                                        >
                                                <Form.Item
                                                        label="Image URL"
                                                        name="imageUrl"
                                                >
                                                        <Input placeholder="Paste image URL" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Room Number"
                                                        name="roomNumber"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please enter the room number",
                                                                },
                                                        ]}
                                                >
                                                        <Input placeholder="Enter room number" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Room Type"
                                                        name="roomType"
                                                        rules={[
                                                                {
                                                                required: true,
                                                                message: "Please select a room type",
                                                                },
                                                        ]}
                                                        >
                                                        <Select placeholder="Select room type">
                                                                <Select.Option value="Luxury Room">Luxury Room</Select.Option>
                                                                <Select.Option value="Double Room">Double Room</Select.Option>
                                                                <Select.Option value="Single Room">Single Room</Select.Option>
                                                        </Select>
                                                </Form.Item>

                                                <Form.Item
                                                        label="Room Facilities"
                                                        name="facilities"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please enter the room facilities",
                                                                },
                                                        ]}
                                                >
                                                        <Input placeholder="Enter room facilities" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Bed Type"
                                                        name="bedType"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please enter the bed type",
                                                                },
                                                        ]}
                                                >
                                                        <Input placeholder="Enter bed type" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Number of Person"
                                                        name="size"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please enter the number of person",
                                                                },
                                                                {
                                                                        type: "number",
                                                                        message: "Price must be a number",
                                                                        transform: (
                                                                                value
                                                                        ) =>
                                                                                Number(
                                                                                        value
                                                                                ),
                                                                },
                                                        ]}
                                                >
                                                        <Input placeholder="Enter the number of person" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="View information"
                                                        name="viewInformation"
                                                >
                                                        <Input placeholder="Enter View Information" />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Room Price"
                                                        name="price"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please enter the room price",
                                                                },
                                                                {
                                                                        type: "number",
                                                                        message: "Price must be a number",
                                                                        transform: (
                                                                                value
                                                                        ) =>
                                                                                Number(
                                                                                        value
                                                                                ),
                                                                },
                                                        ]}
                                                >
                                                        <InputNumber
                                                                placeholder="Enter room price"
                                                                style={{
                                                                        width: "100%",
                                                                }}
                                                        />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Room Amenities"
                                                        name="amenities"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please select the Room Amenities",
                                                                },
                                                        ]}
                                                >
                                                        <Select
                                                                mode="multiple"
                                                                placeholder="Select Room Amenities"
                                                                value={
                                                                        selectedItems
                                                                }
                                                                onChange={
                                                                        setSelectedItems
                                                                }
                                                                style={{
                                                                        width: "100%",
                                                                }}
                                                                options={filteredOptions.map(
                                                                        (
                                                                                item
                                                                        ) => ({
                                                                                value: item,
                                                                                label: item,
                                                                        })
                                                                )}
                                                        />
                                                </Form.Item>
                                                <Form.Item
                                                        label="Room Status"
                                                        name="status"
                                                        rules={[
                                                                {
                                                                        required: true,
                                                                        message: "Please select the room status",
                                                                },
                                                        ]}
                                                >
                                                        <Select
                                                                style={{
                                                                        width: "100%",
                                                                }}
                                                                options={[
                                                                        {
                                                                                value: "Activate",
                                                                                label: "Activate",
                                                                        },
                                                                        {
                                                                                value: "Suspended",
                                                                                label: "Suspended",
                                                                        },
                                                                ]}
                                                        />
                                                </Form.Item>
                                        </Form>
                                </Modal>
                        </div>
                
        );
};

// Room Analytics Dashboard Component
const RoomAnalyticsDashboard = () => {
        const [analytics, setAnalytics] = useState({
                occupancyRate: 0,
                averagePrice: 0,
                roomTypeDistribution: [],
                revenueData: [],
                popularAmenities: [],
        });

        useEffect(() => {
                const calculateAnalytics = async () => {
                        try {
                                // Fetch both rooms and reservations data
                                const [roomsResponse, bookingsResponse] =
                                        await Promise.all([
                                                axios.get("/api/room/getRooms"),
                                                axios.get(
                                                        "/api/room/getBookings"
                                                ),
                                        ]);

                                const rooms = roomsResponse.data.rooms;
                                const bookings = bookingsResponse.data.bookings;

                                // Calculate occupancy rate
                                const activeRooms = rooms.filter(
                                        (room) => room.status === "Activate"
                                ).length;
                                const currentBookings = bookings.filter(
                                        (booking) =>
                                                new Date(booking.checkInDate) <=
                                                        new Date() &&
                                                new Date(
                                                        booking.checkOutDate
                                                ) >= new Date()
                                ).length;
                                const occupancyRate =
                                        (currentBookings / activeRooms) * 100;

                                // Calculate average room price
                                const averagePrice =
                                        rooms.reduce(
                                                (acc, room) => acc + room.price,
                                                0
                                        ) / rooms.length;

                                // Calculate room type distribution
                                const typeCount = rooms.reduce((acc, room) => {
                                        acc[room.roomType] =
                                                (acc[room.roomType] || 0) + 1;
                                        return acc;
                                }, {});
                                const roomTypeDistribution = Object.entries(
                                        typeCount
                                ).map(([type, count]) => ({
                                        type,
                                        count,
                                }));

                                // Calculate revenue data (last 7 days)
                                const last7Days = [...Array(7)]
                                        .map((_, i) => {
                                                const date = new Date();
                                                date.setDate(
                                                        date.getDate() - i
                                                );
                                                return date
                                                        .toISOString()
                                                        .split("T")[0];
                                        })
                                        .reverse();

                                const revenueData = last7Days.map((date) => ({
                                        date,
                                        revenue: bookings
                                                .filter(
                                                        (booking) =>
                                                                booking.checkInDate.split(
                                                                        "T"
                                                                )[0] === date
                                                )
                                                .reduce(
                                                        (acc, booking) =>
                                                                acc +
                                                                booking.totalAmount,
                                                        0
                                                ),
                                }));

                                // Calculate popular amenities
                                const amenitiesCount = rooms.reduce(
                                        (acc, room) => {
                                                room.amenities.forEach(
                                                        (amenity) => {
                                                                acc[amenity] =
                                                                        (acc[
                                                                                amenity
                                                                        ] ||
                                                                                0) +
                                                                        1;
                                                        }
                                                );
                                                return acc;
                                        },
                                        {}
                                );
                                const popularAmenities = Object.entries(
                                        amenitiesCount
                                )
                                        .map(([name, count]) => ({
                                                name,
                                                count,
                                        }))
                                        .sort((a, b) => b.count - a.count)
                                        .slice(0, 5);

                                setAnalytics({
                                        occupancyRate,
                                        averagePrice,
                                        roomTypeDistribution,
                                        revenueData,
                                        popularAmenities,
                                });
                        } catch (error) {
                                console.error(
                                        "Error fetching analytics:",
                                        error
                                );
                        }
                };

                calculateAnalytics();
                const interval = setInterval(calculateAnalytics, 300000); // Update every 5 minutes
                return () => clearInterval(interval);
        }, []);

        return (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card
                                className="shadow-lg"
                                title="Room Type Distribution"
                        >
                                <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                                data={
                                                        analytics.roomTypeDistribution
                                                }
                                        >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="type" />
                                                <YAxis />
                                                <RechartsTooltip />
                                                <Bar
                                                        dataKey="count"
                                                        fill="#82ca9d"
                                                />
                                        </BarChart>
                                </ResponsiveContainer>
                        </Card>
                </div>
        );
};

export default ManageRooms;



