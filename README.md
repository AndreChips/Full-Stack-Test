# Project Setup and Running Guide

## Project Overview
Frontend Frameworks using React.js and Tailwind CSS
Backend Frameworks using Express and xampp MySQL

## Prerequisites

1. **Node.js and npm**: Ensure that Node.js and npm are installed. You can download them from [Node.js official website](https://nodejs.org/).
2. **XAMPP**: Ensure that XAMPP is installed and running, with MySQL enabled. You can download XAMPP from [Apache Friends](https://www.apachefriends.org/index.html).

## Project Structure

project-root/
├── client/ # Frontend React application
├── server/ # Backend Express application
└── database/ # SQL files for the database

## Step by Step
1. Run npm install on both the client and server folder.
2. Run npm start to run both client and server.
3. Run XAMPP and start Apache and MySQL.
4. Import the auth_db.sql file to localhost/phpmyadmin.
5. The Project should run after these steps.

## Notes
Google Auth and Facebook Auth is still being implemented.

## Project Description ( According to Exams Task )
1. Users are able to Sign Up ( Google Auth and Facebook in Progress ).
2. Password Validation with these instructions.
  ● contains at least one lower character
  ● contains at least one upper character
  ● contains at least one digit character
  ● contains at least one special character
  ● contains at least 8 characters
3. Email Verification ( In Progress ).
4. Users are able to Sign In ( Google Auth and Facebook in Progress ).
5. User Profile where Users are able to see their email and are able to change their name.
6. Reset Password where Users can change their password.
7. Cookies and Logout where Users are still able to access dashboard without being logged out, and also users are able to log out.
8. User Database Dashboard that displays timestamp of the user logged in, the number of times they logged in, and timestamp of the user logged out.
9. User Statistics that displays the total number of users who have signed up, number of users with active sessions, and also average number of active sessions in the past 7 days.
