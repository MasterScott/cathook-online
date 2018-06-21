const host = 'http://localhost:8000';
const passwordKey = '947c36f2d82ce498a3d7e9e9c04da0b19716ff5fb5167d508bc3e07ee2c1deb8';

const request = {
    get: async function get(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.send();
        });
    },
    post: async function post(url, data) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4)
                {
                    if (xhr.status >= 200 && xhr.status < 300)
                        resolve(xhr);
                    else reject(xhr);
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        });
    }
}
