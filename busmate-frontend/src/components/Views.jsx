import { Route, Routes } from "react-router-dom";
import Login from "./Auth/Login.jsx";
import SignUp from "./Auth/SignUp";
import Home from "./Home";
import Dashboard from "./Dashboard";

const Views = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
};

export default Views;