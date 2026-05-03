<?php
include 'db.php';

$name = $_POST['client_name'];
$address = $_POST['address'];
$phone = $_POST['phone'];
$car_license = $_POST['car_license'];
$engine = $_POST['engine_number'];
$date = $_POST['appointment_date'];
$mechanic = $_POST['mechanic_id'];

// Check duplicate appointment
$check = $conn->prepare("SELECT * FROM appointments WHERE car_license=? AND appointment_date=?");
$check->bind_param("ss", $car_license, $date);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo "You already have an appointment on this date.";
    exit;
}

// Check mechanic capacity
$count = $conn->prepare("SELECT COUNT(*) AS total FROM appointments WHERE mechanic_id=? AND appointment_date=?");
$count->bind_param("is", $mechanic, $date);
$count->execute();
$data = $count->get_result()->fetch_assoc();

if ($data['total'] >= 4) {
    echo "Mechanic is fully booked!";
    exit;
}

// Insert appointment
$stmt = $conn->prepare("INSERT INTO appointments (client_name, address, phone, car_license, engine_number, appointment_date, mechanic_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssi", $name, $address, $phone, $car_license, $engine, $date, $mechanic);
$stmt->execute();

echo "Appointment booked successfully!";
?>
