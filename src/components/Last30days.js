import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Last30days.css'; // Ensure this path is correct

const Last30days = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log('Fetching data from the backend...');
            const response = await axios.get('http://localhost:3000/api/last30days');
            console.log('Fetched data:', response.data);  // Debugging: Log fetched data
            setData(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="last30days-container">
            <button className="last30days-back-button" onClick={() => window.location.href = "/"}>Home</button>
            <div className="header">
                <h1>Last 30 Days Data</h1>
            </div>
            {isLoading ? (
                <p>Loading data...</p>
            ) : (
                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th scope="col">Received At</th>
                            <th scope="col">Unit (°C / °F)</th>
                            <th scope="col">Setpoint</th>
                            <th scope="col">Temperature</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center">No data available</td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{formatDate(item.waktu)}</td>
                                    <td>{item.nilai.Unit}</td>
                                    <td>{item.nilai.Setpoint}</td>
                                    <td>{item.nilai.Temperature}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Last30days;
