import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Insertdata from './components/Insertdata';
import Dataview from './components/Dataview';
import Last30days from './components/Last30days';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Insertdata />} />
                <Route path="/data" element={<Dataview />} />
                <Route path="/last30days" element={<Last30days />} />
            </Routes>
        </Router>
    );
};

export default App;
