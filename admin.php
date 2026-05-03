<?php
include 'db.php';
$result = $conn->query("SELECT a.*, m.name AS mechanic_name FROM appointments a JOIN mechanics m ON a.mechanic_id = m.id");
?>

<h2>Appointments</h2>
<table border="1">
<tr>
  <th>Client</th><th>Phone</th><th>Car License</th><th>Date</th><th>Mechanic</th><th>Actions</th>
</tr>
<?php while($row = $result->fetch_assoc()): ?>
<tr>
  <td><?= $row['client_name'] ?></td>
  <td><?= $row['phone'] ?></td>
  <td><?= $row['car_license'] ?></td>
  <td><?= $row['appointment_date'] ?></td>
  <td><?= $row['mechanic_name'] ?></td>
  <td>
    <form action="update.php" method="POST">
      <input type="hidden" name="id" value="<?= $row['id'] ?>">
      <input type="date" name="appointment_date" value="<?= $row['appointment_date'] ?>">
      <select name="mechanic_id">
        <!-- Populate from DB -->
      </select>
      <input type="submit" value="Update">
    </form>
  </td>
</tr>
<?php endwhile; ?>
</table>
