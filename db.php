<?php
// db.php - Database connection for CSE-391_A3

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'carshop';

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
?>
