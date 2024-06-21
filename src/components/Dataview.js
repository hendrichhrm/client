import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import './Dataview.css';

const Dataview = () => {
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const esp32LastSeenRef = useRef(null);
    const [popupMessage, setPopupMessage] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [espStatus, setEspStatus] = useState('Disconnected');
    const [isEspConnected, setIsEspConnected] = useState(false);

    useEffect(() => {
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

        mqttClient.on('connect', () => {
            console.log('Connected to broker');
            mqttClient.subscribe(['skripsi/byhendrich/esptodash', 'skripsi/byhendrich/esp32status'], { qos: 2 }, (error) => {
                if (error) {
                    console.error('Subscription error:', error);
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                console.log(`Received message on topic ${topic}:`, parsedMessage);

                if (topic === 'skripsi/byhendrich/esp32status') {
                    if (parsedMessage.status) {
                        setEspStatus(parsedMessage.status === 'Connected' ? 'Connected' : 'Disconnected');
                        setPopupMessage(`ESP32 is ${parsedMessage.status}`);
                        setPopupVisible(true);
                        setTimeout(() => setPopupVisible(false), 3000);

                        if (parsedMessage.status === 'Connected') {
                            setIsEspConnected(true);
                            esp32LastSeenRef.current = new Date();
                        } else {
                            setIsEspConnected(false);
                        }
                    }
                } else if (topic === 'skripsi/byhendrich/esptodash') {
                    if (isEspConnected) {
                        const formattedData = {
                            ...parsedMessage,
                            Timestamp: new Date().toISOString()  // Add timestamp here
                        };
                        setData(prevData => [formattedData, ...prevData]);
                    }
                }
            } catch (e) {
                console.error('Error parsing JSON message:', e);
            }
        });

        const checkEspStatus = () => {
            if (esp32LastSeenRef.current) {
                const now = new Date();
                const diff = now - esp32LastSeenRef.current;
                if (diff > 10 * 1000) { 
                    setEspStatus('Disconnected');
                    setIsEspConnected(false);
                }
            }
        };

        const statusInterval = setInterval(checkEspStatus, 10 * 1000); 

        return () => {
            mqttClient.end();
            clearInterval(statusInterval);
        };
    }, [isEspConnected]);

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
        <div className="wrapper">
            <button className="dataview-back-button" onClick={() => window.location.href = "/"}>Back</button>
            <button className="button top-right-button" onClick={() => window.location.href = "/last30days"}>Last 30 Days Data</button>
            <div className="container">
                <div className="data-view-status">
                    <div className={`data-view-status-box ${espStatus === 'Connected' ? 'data-view-status-connected' : 'data-view-status-disconnected'}`}></div>
                    ESP32 Status: <span>{espStatus}</span>
                </div>
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
                                    <td>{item.Temperature !== 'N/A' ? `${item.Temperature} °C` : '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {popupVisible && (
                <div className="popup">
                    <p>{popupMessage}</p>
                </div>
            )}
        </div>
    );
};

export default Dataview;
