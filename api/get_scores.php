<?php
include "db.php";

$result = $conn->query("SELECT username, score FROM scores ORDER BY score DESC LIMIT 10");

$scores = [];

while ($row = $result->fetch_assoc()) {
  $scores[] = $row;
}

echo json_encode($scores);
?>