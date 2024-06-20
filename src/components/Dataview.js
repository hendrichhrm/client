import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dataview.css';

const Dataview = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://client-pi-roan.vercel.app/data');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container">
            <h1>Data View</h1>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">Received At</th>
                        <th scope="col">Unit (c / f)</th>
                        <th scope="col">Setpoint</th>
                        <th scope="col">Temperature</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{new Date(item.receivedAt).toLocaleString()}</td>
                            <td>{item.Unit}</td>
                            <td>{item.Setpoint}</td>
                            <td>{item.Temperature}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => window.location.href = "/"}>Back to Control Panel</button>
        </div>
    );
};

export default Dataview;
