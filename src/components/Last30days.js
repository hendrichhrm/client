import React, { useState, useEffect } from 'react';
import axios from './axiosConfig';
import './Last30days.css';

const Last30days = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastLogin, setLastLogin] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log('Fetching data from the backend...');
            const response = await axios.get('http://localhost:3000/api/last30days');
            console.log('Fetched response:', JSON.stringify(response.data, null, 2));  // Pretty print response

            if (response && response.data) {
                console.log('Response data:', response.data);  // Log the response data
                const fetchedData = response.data.data;
                const fetchedLastLoggedInUser = response.data.lastLoggedInUser;
                console.log('Fetched data:', fetchedData);  // Log the fetched data
                console.log('Last logged in user:', fetchedLastLoggedInUser);  // Log the last logged in user

                setData(fetchedData || []);  // Set to an empty array if undefined
                setLastLogin(fetchedLastLoggedInUser || '');
            } else {
                console.log('No data in response');
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString('en-GB', options).replace(',', ' at');
    };

    return (
        <div className="last30days-container">
            <button className="last30days-back-button" onClick={() => window.location.href = "/"}>Home</button>
            <div className="header">
                <h2>Last 30 Days Data</h2>
                {lastLogin && <p>Current: {lastLogin}</p>}
            </div>
            {isLoading ? (
                <p>Loading data...</p>
            ) : (
                <table className="last30days-table">
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
                                <td colSpan="5" className="text-center">No data available</td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{formatDate(item.waktu)}</td>
                                    <td>{item.nilai && item.nilai.Unit !== null ? item.nilai.Unit : '-'}</td>
                                    <td>{item.nilai && item.nilai.Setpoint !== null ? item.nilai.Setpoint : '-'}</td>
                                    <td>{item.nilai && item.nilai.Temperature !== null ? item.nilai.Temperature : '-'}</td>
                                    
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
