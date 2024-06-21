import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';
import './Dataview.css';

const Dataview = () => {
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const esp32LastSeenRef = useRef(new Date());
    const [popupMessage, setPopupMessage] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [espStatus, setEspStatus] = useState('Disconnected');

    useEffect(() => {
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

        mqttClient.on('connect', () => {
            console.log('Connected to broker');
            mqttClient.subscribe(['skripsi/byhendrich/dashtoesp', 'skripsi/byhendrich/esptodash', 'skripsi/byhendrich/esp32status'], { qos: 2 }, (error) => {
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

                        // Update the last seen timestamp when a status message is received
                        esp32LastSeenRef.current = new Date();
                    }
                } else if (topic === 'skripsi/byhendrich/esptodash') {
                    setData(prevData => [parsedMessage, ...prevData]);
                }
            } catch (e) {
                console.error('Error parsing JSON message:', e);
            }
        });

        const checkEspStatus = () => {
            if (esp32LastSeenRef.current) {
                const now = new Date();
                const diff = now - esp32LastSeenRef.current;
                if (diff > 10 * 1000) { // If more than 10 sec have passed without a status message
                    setEspStatus('Disconnected');
                }
            }
        };

        const statusInterval = setInterval(checkEspStatus, 10 * 1000); // Check every 10 seconds
        fetchData(); // Initial fetch
        const dataInterval = setInterval(fetchData, 10 * 60 * 1000); // Fetch every 10 minutes

        return () => {
            mqttClient.end();
            clearInterval(statusInterval);
            clearInterval(dataInterval);
        };
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/data');
            console.log('Data fetched from backend:', response.data); // Add this line
            const data = response.data.map(item => ({
                Timestamp: item.waktu,
                Unit: item.nilai.Unit,
                Setpoint: item.nilai.Setpoint,
                Temperature: item.nilai.Temperature,
            }));
            setData(data.reverse()); // Reverse if you want the latest data first
            setIsFetching(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsFetching(false); // Ensure loading state is turned off in case of error
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
        <div className="wrapper">
            <button className="dataview-back-button" onClick={() => window.location.href = "/"}>Back</button>
            <button className="button top-right-button" onClick={() => window.location.href = "/last30days"}>View Last 30 Days Data</button>
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
                                    <td>{item.Temperature}</td>
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