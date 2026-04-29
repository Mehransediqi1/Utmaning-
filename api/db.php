<?php
$conn = new mysqli("localhost", "root", "", "slope_game");

if ($conn->connect_error) {
  die("Connection failed");
}
?>