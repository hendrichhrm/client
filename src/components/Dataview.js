import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import './Dataview.css';

const Dataview = () => {
    const [data, setData] = useState([]);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    useEffect(() => {
        const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
        client.on('connect', () => {
            console.log('Connected to broker');
            client.subscribe('skripsi/byhendrich/esptodash', { qos: 2 }, (error) => {
                if (error) {
                    console.error('Subscription error:', error);
                }
            });
        });

        client.on('message', (topic, message) => {
            console.log(`Received message on topic ${topic}: ${message.toString()}`);
            if (topic === 'skripsi/byhendrich/esptodash') {
                const parsedMessage = JSON.parse(message.toString());
                const timestamp = new Date();

                // Check if it's time to update the data (every 3 minutes)
                if (!lastUpdateTime || (timestamp - lastUpdateTime) >= 3 * 60 * 1000) {
                    setLastUpdateTime(timestamp);

                    setData((prevData) => {
                        const existingIndex = prevData.findIndex(item => item.Setpoint === parsedMessage.Setpoint);
                        if (existingIndex !== -1) {
                            const updatedData = [...prevData];
                            updatedData[existingIndex] = { ...parsedMessage, receivedAt: timestamp };
                            return updatedData;
                        }
                        // Add new data at the start of the array
                        return [{ ...parsedMessage, receivedAt: timestamp }, ...prevData];
                    });
                }
            }
        });

        client.on('error', (error) => {
            console.error('Connection error:', error);
        });

        return () => {
            client.end();
        };
    }, [lastUpdateTime]);

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
                            <td>{item.receivedAt.toLocaleString()}</td>
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
