import React, { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
//import axios from './axiosConfig';
import './Insertdata.css';

const Insertdata = () => {
    const [temperatureUnit, setTemperatureUnit] = useState('c');
    const [desiredTemperature, setDesiredTemperature] = useState('');
    const [popupMessage, setPopupMessage] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [client, setClient] = useState(null);
    const esp32LastSeenRef = useRef(new Date());
    const [espStatus, setEspStatus] = useState('Disconnected');

    useEffect(() => {
        const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
        setClient(mqttClient);

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
                if (topic === 'skripsi/byhendrich/esp32status' && parsedMessage.status) {
                    setEspStatus(parsedMessage.status === 'Connected' ? 'Connected' : 'Disconnected');
                    setPopupMessage(`ESP32 is ${parsedMessage.status}`);
                    setPopupVisible(true);
                    setTimeout(() => setPopupVisible(false), 3000);
                        
                    esp32LastSeenRef.current = new Date();
                }
                
            } catch (e) {
                console.error('Error parsing JSON message:', e);
            }
        });

        const checkEspStatus = () => {
            if (esp32LastSeenRef.current) {
                const now = new Date();
                const diff = now - esp32LastSeenRef.current;
                if (diff > 30 * 1000) { 
                    setEspStatus('Disconnected');
                }
            }
        };

        const statusInterval = setInterval(checkEspStatus, 30 * 1000); 

        return () => {
            mqttClient.end();
            clearInterval(statusInterval);
        };
        
    }, []);

    const handleSendClick = () => {
        if (!temperatureUnit || !desiredTemperature) {
            setPopupMessage('All fields are required');
            setPopupVisible(true);
            setTimeout(() => setPopupVisible(false), 3000);
            return;
        }

        if (temperatureUnit.toLowerCase() !== 'c' && temperatureUnit.toLowerCase() !== 'f') {
            setPopupMessage('Temperature unit must be either "c" or "f".');
            setPopupVisible(true);
            setTimeout(() => setPopupVisible(false), 3000);
            return;
        }

        const data = {
            Unit: temperatureUnit,
            Setpoint: desiredTemperature,
            Timestamp: new Date().toISOString()
        };

        console.log("Data to be sent:", data);

        const message = JSON.stringify(data);
        console.log("Sending data:", message);
        client.publish('skripsi/byhendrich/dashtoesp', message);

        setPopupMessage('Data sent successfully');
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 3000);
    };

    const handleTemperatureUnitChange = (e) => {
        const newUnit = e.target.value.toLowerCase();
        if (newUnit === 'c' || newUnit === 'f') {
            let newTemperature = desiredTemperature;
            if (temperatureUnit === 'c' && newUnit === 'f' && newTemperature !== '') {
                newTemperature = (desiredTemperature * 9 / 5) + 32;
            } else if (temperatureUnit === 'f' && newUnit === 'c' && newTemperature !== '') {
                newTemperature = (desiredTemperature - 32) * 5 / 9;
            }
            setTemperatureUnit(newUnit);
            setDesiredTemperature(newTemperature ? parseFloat(newTemperature).toFixed(1) : '');
        } else {
            setTemperatureUnit('');
        }
    };

    const handleDesiredTemperatureChange = (e) => {
        setDesiredTemperature(e.target.value);
    };

    const handleBlur = () => {
        if (desiredTemperature < 25) {
            setDesiredTemperature(25);
        } else if (desiredTemperature > 650) {
            setDesiredTemperature(650);
        }
    };

    return (
        <div className="container">
            <h1>Control Panel</h1>
            <div>
                <label htmlFor="Temperature-unit">Temperature Unit (c / f)</label>
                <input
                    type="text"
                    id="Temperature-unit"
                    placeholder="c/f"
                    value={temperatureUnit}
                    onChange={handleTemperatureUnitChange}
                />
            </div>
            <div>
                <label htmlFor="Desired-temperature">Desired Temperature (Setpoint)</label>
                <input
                    type="number"
                    id="Desired-temperature"
                    placeholder="setpoint"
                    name="desired-temperature"
                    min="25"
                    max="650"
                    value={desiredTemperature}
                    onChange={handleDesiredTemperatureChange}
                    onBlur={handleBlur}
                />
            </div>
            <button className="start-button" onClick={handleSendClick}>Send</button>
            <button className="dataview-button" onClick={() => window.location.href = "/data"}>View Data</button>
            <div className="insert-data-status">
                <div className={`insert-data-status-box ${espStatus === 'Connected' ? 'insert-data-status-connected' : 'insert-data-status-disconnected'}`}></div>
                ESP32 Status: <span>{espStatus}</span>
            </div>
            {popupVisible && <div className="popup">{popupMessage}</div>}
        </div>
    );
};

export default Insertdata;
