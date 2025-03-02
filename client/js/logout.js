
// Suggested code may be subject to a license. Learn more: ~LicenseLog:2335585028.
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", logout);
});

// call the logout route app.use("/api/auth/logout", logoutRoutes);
async function logout() {
try {
    const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const data = await response.json();
      console.log(data);
      // Delete Session storage
      sessionStorage.removeItem("userId");
      

} catch (error) {
    console.error("Error during logout:", error);
}
}
