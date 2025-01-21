import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container text-center mt-5">
            <h1 className="display-4">Welcome to Bicycle Stand Locker</h1>
            <p className="lead">Please login or sign up to continue</p>
            <div className="d-flex justify-content-center mt-4">
                <Link to="/login" className="btn btn-primary mx-2">
                    Login
                </Link>
                <Link to="/register" className="btn btn-secondary mx-2">
                    Sign Up
                </Link>
            </div>
        </div>
    );
};

export default Home;
