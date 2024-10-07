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
  const [loading, setLoading] = useState(true);
  const [spotlightData, setSpotlightData] = useState(null);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");

  // State to manage selected fields for PDF report
  const [selectedFields, setSelectedFields] = useState([
    "employeeId", // Added Employee ID
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
        case "employeeId": return "Employee ID"; // Added Employee ID header
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
    { label: "Employee ID", value: "employeeId" }, // Added Employee ID option
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
    <div className="manage-employees-1234" style={{ padding: "24px" }}>
      <EmployeeSpotlight />
      <Card
        className="margin-top"
        title={<Title level={4}>Existing Employees</Title>}
        extra={
          <Space>
            <Button type="primary" onClick={() => showModal(null)} icon={<PlusOutlined />}>
              Add Employee
            </Button>
            
          </Space>
        }
      >
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <Title level={5}>Select Fields for PDF Report</Title>
    <Checkbox.Group
      options={availableFields}
      value={selectedFields}
      onChange={handleFieldChange}
    />
  </div>
  <Button type="primary" icon={<DownloadOutlined />} onClick={downloadPDF}>
    Download PDF
  </Button>
</div>
        <Input
          placeholder="Search employees"
          className="margin-top"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "16px" }}
          prefix={<SearchOutlined />}
        />
        <Table
          columns={columns}
          dataSource={employees.filter((employee) => 
            employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.lastName.toLowerCase().includes(searchTerm.toLowerCase())
          )}
          rowKey="employeeId"
          loading={loading}
        />
      </Card>
      <Modal
        title={
          <Title level={4}>
            {editingEmployee ? "Edit Employee" : "Add New Employee"}
          </Title>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleAddEdit} layout="vertical">
          <Form.Item
            name="imageUrl"
            label="Profile Picture URL"
            rules={[
              {
                required: true,
                type: "url",
                message: "Please enter a valid URL",
              },
            ]}
          >
            <Input placeholder="Enter image URL" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true }]}
          >
            <Select placeholder="Select a department">
              <Option value="HR">Human Resources</Option>
              <Option value="IT">Information Technology</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Operations">Operations</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="customerSatisfaction"
            label="Customer Satisfaction"
            rules={[{ required: true }]}
          >
            <Input type="number" min={0} max={5} />
          </Form.Item>
          <Form.Item
            name="tasksCompleted"
            label="Tasks Completed"
            rules={[{ required: true }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="recentAchievement" label="Recent Achievement">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingEmployee ? "Update" : "Add"} Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
    </div>
  );
}

export default ManageEmployees;
