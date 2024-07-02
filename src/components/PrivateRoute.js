//This code is Created by Hendrich H M
// You could adjust this code to your needs
// However, you can't remove the author's because it's against the law
// This code is Copyright of the author

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ token }) => {
    return token ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
