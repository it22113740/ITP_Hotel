import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  message,
  Table,
  Card,
  Avatar,
  Row,
  Col,
  Statistic,
  Spin,
  Input,
  Button,
  Modal,
  Form,
  Typography,
  Tag,
  Tooltip,
  Progress,
  Space,
  Popconfirm,
  Select,
  Checkbox,
} from "antd";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the jsPDF autotable plugin
import {
  UserOutlined,
  TrophyOutlined,
  SmileOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [spotlightData, setSpotlightData] = useState(null);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  
  // State to manage selected fields for PDF report
  const [selectedFields, setSelectedFields] = useState([
    "firstName",
    "lastName",
    "email",
    "username",
    "department",
    "customerSatisfaction",
    "tasksCompleted",
    "recentAchievement",
  ]);

  useEffect(() => {
    fetchEmployees();
    fetchSpotlightData();
  }, []);

  const fetchSpotlightData = async () => {
    setSpotlightLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/employee/spotlight");
      setSpotlightData(response.data);
    } catch (error) {
      message.error("Failed to fetch employee spotlight data");
    } finally {
      setSpotlightLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/employee/getEmployees");
      setEmployees(response.data || []);
    } catch (error) {
      message.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  // Function to generate PDF report
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    const headers = selectedFields.map((field) => {
      switch (field) {
        case "firstName": return "First Name";
        case "lastName": return "Last Name";
        case "email": return "Email";
        case "username": return "Username";
        case "department": return "Department";
        case "customerSatisfaction": return "Customer Satisfaction";
        case "tasksCompleted": return "Tasks Completed";
        case "recentAchievement": return "Recent Achievement";
        default: return "";
      }
    });

    const data = employees.map((employee) =>
      selectedFields.map((field) => employee[field])
    );

    doc.autoTable({
      head: [headers],
      body: data,
    });

    doc.save("employees_report.pdf");
  };

  const handleFieldChange = (checkedValues) => {
    setSelectedFields(checkedValues);
  };

  const availableFields = [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Email", value: "email" },
    { label: "Username", value: "username" },
    { label: "Department", value: "department" },
    { label: "Customer Satisfaction", value: "customerSatisfaction" },
    { label: "Tasks Completed", value: "tasksCompleted" },
    { label: "Recent Achievement", value: "recentAchievement" },
  ];

  const handleAddEdit = async (values) => {
    try {
      const employeeData = {
        ...values,
        imageUrl: values.imageUrl || "",
      };

      if (editingEmployee) {
        await axios.put(`http://localhost:5000/api/employee/${editingEmployee.employeeId}`, employeeData);
        message.success("Employee updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/employee/addEmployee", employeeData);
        message.success("Employee added successfully");
      }
      setIsModalVisible(false);
      fetchEmployees();
      fetchSpotlightData();
    } catch (error) {
      message.error(typeof error.response?.data === "string" ? error.response.data : "Failed to save employee");
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      await axios.post("http://localhost:5000/api/employee/deleteEmployee", { employeeId });
      message.success("Employee deleted successfully");
      fetchEmployees();
      fetchSpotlightData();
    } catch (error) {
      message.error("Failed to delete employee");
    }
  };

  const showModal = (employee = null) => {
    setEditingEmployee(employee);
    if (employee) {
      form.setFieldsValue(employee);
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "Employee",
      key: "employee",
      render: (_, record) => (
        <Space>
          <Avatar src={record.imageUrl || undefined} icon={<UserOutlined />} />
          <span>
            {record.firstName} {record.lastName}
          </span>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => <Tag color="blue">{department}</Tag>,
    },
    {
      title: "Customer Satisfaction",
      dataIndex: "customerSatisfaction",
      key: "customerSatisfaction",
      render: (satisfaction) => (
        <Tooltip title={`${satisfaction}/5`}>
          <Progress percent={satisfaction * 20} steps={5} />
        </Tooltip>
      ),
    },
    {
      title: "Tasks Completed",
      dataIndex: "tasksCompleted",
      key: "tasksCompleted",
      render: (tasks) => <Text strong>{tasks}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, employee) => (
        <Space>
          <Tooltip title="Edit">
            <Button icon={<EditOutlined />} onClick={() => showModal(employee)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this employee?"
              onConfirm={() => handleDelete(employee.employeeId)}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const EmployeeSpotlight = () => {
    if (spotlightLoading) {
      return (
        <Card>
          <Spin />
        </Card>
      );
    }
    if (!spotlightData) {
      return <Card>No spotlight data available</Card>;
    }
    return (
      <Card
        title={
          <Title level={4}>
            <TrophyOutlined /> Employee Spotlight
          </Title>
        }
        extra={<Tag color="gold">Top Performer</Tag>}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={spotlightData.imageUrl || undefined}
            />
            <Title level={3} style={{ marginTop: "16px", marginBottom: "4px" }}>
              {spotlightData.name}
            </Title>
            <Text type="secondary">{spotlightData.department}</Text>
          </Col>
          <Col xs={24} sm={16}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Customer Satisfaction"
                  value={spotlightData.customerSatisfaction}
                  suffix="/ 5"
                  prefix={<SmileOutlined style={{ color: "#52c41a" }} />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Tasks Completed"
                  value={spotlightData.tasksCompleted}
                  prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
                />
              </Col>
            </Row>
            <div style={{ marginTop: "20px" }}>
              <Title level={5}>Recent Achievement</Title>
              <Text>{spotlightData.recentAchievement}</Text>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div className="manage-employees" style={{ padding: "24px" }}>
      <EmployeeSpotlight />
      <Card
        title={<Title level={4}>Existing Employees</Title>}
        extra={
          <Space>
            <Checkbox.Group
              options={availableFields}
              defaultValue={selectedFields}
              onChange={handleFieldChange}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadPDF}
            >
              Download PDF
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Add Employee
            </Button>
          </Space>
        }
      >
        {loading ? (
          <Spin />
        ) : (
          <Table
            dataSource={employees.filter((employee) =>
              `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            rowKey="employeeId"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      <Modal
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddEdit}
        >
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select>
              <Option value="Sales">Sales</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Marketing">Marketing</Option>
              {/* Add more departments as needed */}
            </Select>
          </Form.Item>
          <Form.Item name="customerSatisfaction" label="Customer Satisfaction" rules={[{ required: true }]}>
            <Input type="number" min={0} max={5} />
          </Form.Item>
          <Form.Item name="tasksCompleted" label="Tasks Completed" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="recentAchievement" label="Recent Achievement">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingEmployee ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ManageEmployees;
