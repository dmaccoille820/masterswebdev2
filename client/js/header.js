
function setUsernameInHeader() {
  const username = getCookie('user_name');
  if (username) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }
}

export {setUsernameInHeader};
