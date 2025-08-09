document.getElementById("appointmentForm").addEventListener("submit", function(e) {
  let phone = document.querySelector("input[name='phone']").value;
  let engine = document.querySelector("input[name='engine_number']").value;

  if (isNaN(phone) || isNaN(engine)) {
    alert("Phone and Engine Number must be numeric.");
    e.preventDefault();
  }
});
