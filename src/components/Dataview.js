import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';
import './Dataview.css';

const Dataview = () => {
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

        mqttClient.on('connect', () => {
            console.log('Connected to broker');
            mqttClient.subscribe(['skripsi/byhendrich/dashtoesp', 'skripsi/byhendrich/esptodash'], { qos: 2 }, (error) => {
                if (error) {
                    console.error('Subscription error:', error);
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            const parsedMessage = JSON.parse(message.toString());
            setData(prevData => [parsedMessage, ...prevData]); // Prepend new data
        });

        fetchData();
        const intervalId = setInterval(fetchData, 10 * 60 * 1000);

        return () => {
            mqttClient.end();
            clearInterval(intervalId);
        };
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/data');
            const now = new Date();
            const filteredData = response.data.filter(item => {
                const itemTime = new Date(item.Timestamp);
                return now - itemTime >= 10 * 60 * 1000; // Only include data that is at least 10 minutes old
            });
            setData(filteredData.reverse());
            setIsFetching(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="wrapper">
            <button className="button back-button" onClick={() => window.location.href = "/"}>Back</button>
            <button className="button top-right-button" onClick={() => window.location.href = "/last30days"}>View Last 30 Days Data</button>
            <div className="container">
                <div className="header">
                    <h1>Data View</h1>
                </div>
                {isFetching && <p>Loading data...</p>}
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
                        {isFetching ? (
                            <tr>
                                <td colSpan="4" className="text-center">Loading...</td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{formatDate(item.Timestamp)}</td>
                                    <td>{item.Unit}</td>
                                    <td>{item.Setpoint}</td>
                                    <td>{item.Temperature}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dataview;
