//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Insertdata from './components/Insertdata';
import Dataview from './components/Dataview';
import Last30days from './components/Last30days';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route element={<PrivateRoute token={token} />}>
                    <Route path="/insertdata" element={<Insertdata />} />
                    <Route path="/data" element={<Dataview />} />
                    <Route path="/last30days" element={<Last30days />} />
                </Route>
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
};

export default App;
