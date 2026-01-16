import express from 'express';
import app from './App.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT,"0.0.0.0",()=>{
    console.log("Server running on http://localhost:5000");
    
})