<?php
$data['username'] = $_POST['username'];
$data['password'] = $_POST['password'];


$host = "localhost"; /* Host name */
$user = "root"; /* User */
$password = ""; /* Password */
$dbname = "insta"; /* Database name */

$con = mysqli_connect($host, $user, $password,$dbname);
// Check connection
if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}


$sql = "INSERT INTO insta (username, password)
VALUES ('".$data['username']."', '".$data['password']."')";

if ($con->query($sql) === TRUE) {
    echo json_encode($data);
} else {
    echo "Error: " . $sql . "<br>" . $con->error;
}

$con->close();


//echo json_encode($data);
