import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Modal, Form, Select, InputNumber, Image, Dropdown, Menu, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import fileDownload from 'js-file-download'; // Import the file download package

const { Search } = Input;
const { Option } = Select;

const ManageCateringFoods = () => {
  const [foods, setFoods] = useState([]);
  const [allFoods, setAllFoods] = useState([]); // Store the original list of foods
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [selectedFields, setSelectedFields] = useState([
    'ItemID',
    'Name',
    'Description',
    'Price',
    'Category',
    'Type',
    'ImageURL',
  ]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFoods();
  }, []);

  // Fetch food items from the API
  const fetchFoods = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/catering/getItems');
      setFoods(response.data || []);
      setAllFoods(response.data || []); // Store the full list of foods
    } catch (error) {
      message.error('Failed to fetch foods');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (value) => {
    if (value.trim() === '') {
      setFoods(allFoods); // Reset to the full list when the search input is cleared
    } else {
      const filteredFoods = allFoods.filter((food) =>
        food.name.toLowerCase().includes(value.toLowerCase()) ||
        food.description.toLowerCase().includes(value.toLowerCase()) ||
        food.category.toLowerCase().includes(value.toLowerCase()) ||
        food.type.toLowerCase().includes(value.toLowerCase())
      );
      setFoods(filteredFoods);
    }
  };

  // Show the modal for adding/editing food items
  const showModal = (food = null) => {
    setEditingFood(food);
    setModalVisible(true);
    if (food) {
      form.setFieldsValue(food);
    } else {
      form.resetFields();
    }
  };

  // Handle submission of the form
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editingFood) {
          await axios.post('http://localhost:5000/api/catering/updateItem', { ...values, itemId: editingFood.itemId });
          message.success('Food item updated successfully');
        } else {
          await axios.post('http://localhost:5000/api/catering/addItem', values);
          message.success('Food item added successfully');
        }
        setModalVisible(false);
        fetchFoods();
      } catch (error) {
        message.error('Operation failed: ' + (error.response?.data?.error || error.message));
      }
    });
  };

  // Handle deletion of a food item
  const handleDelete = async (itemId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this food item?',
      onOk: async () => {
        try {
          await axios.post('http://localhost:5000/api/catering/deleteItem', { itemId });
          message.success('Food item deleted successfully');
          fetchFoods();
        } catch (error) {
          message.error('Failed to delete food item');
        }
      },
    });
  };

  // Export foods to CSV
  const exportToCSV = () => {
    const csvData = foods.map((food) => {
      const item = {};
      selectedFields.forEach((field) => {
        switch (field) {
          case 'ItemID':
            item[field] = food.itemId || '';
            break;
          case 'ImageURL':
            item[field] = food.imageUrl || '';
            break;
          case 'Name':
            item[field] = food.name || '';
            break;
          case 'Description':
            item[field] = food.description || '';
            break;
          case 'Price':
            item[field] = food.price ? `$${food.price.toFixed(2)}` : '';
            break;
          case 'Category':
            item[field] = food.category || '';
            break;
          case 'Type':
            item[field] = food.type || '';
            break;
          default:
            item[field] = ''; // Fallback for any unknown fields
        }
      });
      return item;
    });

    const csvContent = [
      selectedFields,
      ...csvData.map((item) => selectedFields.map((field) => item[field]))
    ]
      .map((e) => e.join(','))
      .join('\n');

    fileDownload(csvContent, 'catering_foods_report.csv');
  };

  // Dropdown menu with checkboxes for selecting fields
  const menu = (
    <Menu>
      {['ItemID', 'Name', 'Description', 'Price', 'Category', 'Type', 'ImageURL'].map((field) => (
        <Menu.Item key={field}>
          <Checkbox
            checked={selectedFields.includes(field)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedFields([...selectedFields, field]);
              } else {
                setSelectedFields(selectedFields.filter((item) => item !== field));
              }
            }}
          >
            {field}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Define columns for the table
  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) => (
        <Image 
          src={text} 
          alt="food" 
          width={100}  
          height={100} 
        />
      ),
    },
    { title: 'Item ID', dataIndex: 'itemId', key: 'itemId' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `$${price.toFixed(2)}` },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.itemId)} danger />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Manage Catering Foods</h1>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="Search foods"
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton
        />
        <div>
          <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
            <Button type="default" style={{ marginRight: 10 }}>
              Select Fields
            </Button>
          </Dropdown>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal(null)} // Show modal for adding new food item
            style={{ marginLeft: 10 }}
          >
            Add Food
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={foods}
        rowKey="itemId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingFood ? 'Edit Food Item' : 'Add New Food Item'}
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber style={{ width: '100%' }} step={0.01} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="vegetable">Vegetable</Option>
              <Option value="non-vegetable">Non-Vegetable</Option>
              <Option value="drink">Drink</Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Option value="starters">Starters</Option>
              <Option value="main course">Main Course</Option>
              <Option value="desserts">Desserts</Option>
              <Option value="beverages">Beverages</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCateringFoods;
