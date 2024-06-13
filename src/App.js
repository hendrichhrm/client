import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Insertdata from './components/Insertdata';
import Dataview from './components/Dataview';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="" element={<Insertdata />} />
                <Route path="/data" element={<Dataview />} />
            </Routes>
        </Router>
    );
};

export default App;
