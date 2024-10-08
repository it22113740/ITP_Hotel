import React, { useEffect, useState } from "react";
import { Table, Button, Select, Input } from "antd"; // Import Input for title searching
import axios from "axios";
import { CSVLink } from "react-csv";
import { AiFillPrinter } from "react-icons/ai";

const { Option } = Select; // For category selection

function ManageFeedbacks() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [allFeedbacks, setAllFeedbacks] = useState([]); // All feedbacks for CSV
    const [selectedCategory, setSelectedCategory] = useState(""); // Selected category for filtering
    const [searchTitle, setSearchTitle] = useState(""); // Search title for filtering
    const limit = 7;

    useEffect(() => {
        fetchFeedbacks(page, selectedCategory); // Fetch feedbacks with selected category
        fetchAllFeedbacks(); // Fetch all feedbacks for CSV
    }, [page, selectedCategory]);

    const fetchFeedbacks = async (page, category) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/feedback/getFeedback", { page, limit, category });
            setFeedbacks(response.data.feedbacks);
            setTotal(response.data.total);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch all feedbacks for CSV export
    const fetchAllFeedbacks = async () => {
        try {
            const response = await axios.post("/api/feedback/getFeedback", { page: 1, limit: 0 });
            setAllFeedbacks(response.data.feedbacks); // Store all feedbacks for CSV download
        } catch (error) {
            console.error("Error fetching all feedbacks:", error);
        }
    };

    const columns = [
        {
            title: "Feedback ID",
            dataIndex: "_id",
            key: "feedbackId",
            render: (text, record, index) => (
                String.fromCharCode(65 + index) // Convert index to letters A, B, C, etc.
            )
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "User ID",
            dataIndex: "userID",
            key: "userID",
        },
        {
            title: "Rating",
            dataIndex: "rating",
            key: "rating",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text) => (
                text.length > 30 ? `${text.substring(0, 30)}...` : text
            ),
        },
        {
            title: "Timestamp",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString(),
        },
    ];

    // Function to filter the CSV data based on the search title
    const getFilteredCSVData = () => {
        const filteredFeedbacks = searchTitle
            ? allFeedbacks.filter(feedback => feedback.title.toLowerCase().includes(searchTitle.toLowerCase())) // Filter by title
            : allFeedbacks; // If no title is entered, export all feedbacks

        return filteredFeedbacks.map(feedback => ({
            FeedbackID: feedback._id,
            Title: feedback.title,
            Category: feedback.category,
            Username: feedback.username,
            UserID: feedback.userID,
            Rating: feedback.rating,
            Description: feedback.description,
            Timestamp: new Date(feedback.createdAt).toLocaleString(),
        }));
    };

    // Function to generate the CSV filename based on the first filtered feedback title
    const getCSVFilename = () => {
        const filteredFeedbacks = getFilteredCSVData();
        if (filteredFeedbacks.length > 0) {
            const title = filteredFeedbacks[0].Title.replace(/\s+/g, '_'); // Replace spaces with underscores
            return `${title}-feedbacks.csv`; // Format filename as "Title-feedbacks.csv"
        }
        return "filtered-feedbacks.csv"; // Default filename if no feedback is filtered
    };

    return (
        <div className="manage_feedback_main_container_admin_123">
            <h1>Manage Feedbacks</h1>

            {/* Title Search Input */}
            <Input
                placeholder="Search by Title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)} // Update search title
                style={{ width: 200, marginBottom: '20px' }}
            />

            <div className="csv_button_container_123">
                <Button type="primary" className="csv_button_admin_123">
                    <CSVLink
                        data={getFilteredCSVData()} // Export only filtered feedbacks
                        filename={getCSVFilename()} // Set filename based on filtered feedback title
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        Export <AiFillPrinter style={{ marginLeft: '8px' }} />
                    </CSVLink>
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={feedbacks.filter(feedback =>
                    feedback.title.toLowerCase().includes(searchTitle.toLowerCase()) // Filter table data by title
                )}
                loading={loading}
                pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: (page) => setPage(page),
                }}
                rowKey="_id"
            />
        </div>
    );
}

export default ManageFeedbacks;
