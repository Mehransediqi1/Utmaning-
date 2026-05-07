<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"];
$score = $data["score"];

$stmt = $conn->prepare("INSERT INTO scores (username, score) VALUES (?, ?)");

$stmt->bind_param("si", $username, $score);

$stmt->execute();

echo json_encode([
    "status" => "success"
]);

?>