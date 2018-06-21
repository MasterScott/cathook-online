document.getElementById('register').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const mail = document.getElementById('mail').value;
    const invite = document.getElementById('invite').value;

    try {
        const res = await request.post(`${host}/user/register`, {
            username: username,
            password: sha256.hmac(passwordKey, password),
            mail: mail,
            invite: invite
        });
        document.getElementById('error').innerHTML = 'Registration successful';
        localStorage.api_key = res.responseText;
    } catch (e) {
        document.getElementById('error').innerHTML = 'Error: ' + e.status + ' ' + e.responseText;
    }
});
