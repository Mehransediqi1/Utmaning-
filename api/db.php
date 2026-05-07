<?php

$conn = new mysqli("localhost", "root", "", "slope_games");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

?>