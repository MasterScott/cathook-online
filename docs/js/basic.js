const host = 'http://localhost:8000';
const passwordKey = '947c36f2d82ce498a3d7e9e9c04da0b19716ff5fb5167d508bc3e07ee2c1deb8';

function toQueryString(object)
{
    return Object.keys(object).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(object[k])}`).join('&');
}

let local_user = null;
let api_key = null;
let is_admin = false;
let has_groups = {};

try {
    local_user = JSON.parse(localStorage.getItem('user'));
    api_key = local_user.api_key;
    for (const g of local_user.groups)
    {
        if (g.name == 'admin')
            is_admin = true;
        has_groups[g.name] = true;
    }
} catch (e) {}

const request = {
    perform: async function perform(method, endpoint, body, qs) {
        return new Promise((resolve, reject) => {
            if (qs == null)
                qs = {};
            qs.key = api_key;
            const xhr = new XMLHttpRequest();
            console.log('request', endpoint);
            xhr.open(method, host + endpoint + '?' + toQueryString(qs), true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4)
                {
                    if (xhr.status >= 200 && xhr.status < 300)
                        resolve(xhr);
                    else reject(xhr);
                }
            }
            if (body)
                xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(body ? JSON.stringify(body) : null);
        });
    },

    get: async function get(endpoint) {
        return await this.perform('GET', endpoint, null);
    },
    post: async function post(endpoint, data) {
        return await this.perform('POST', endpoint, data);
    },
    put: async function put(endpoint, data) {
        return await this.perform('PUT', endpoint, data);
    },
    delete: async function(endpoint, data) {
        return await this.perform('DELETE', endpoint, data);
    }
}

async function fillSoftwareSelect(element)
{
    const softwareXhr = await request.get('/software');
    const software = JSON.parse(softwareXhr.responseText);
    software.push({
        id: null,
        name: 'none'
    });
    for (const s of software)
    {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerHTML = s.name;
        element.appendChild(opt);
    }
}

async function fillGroupSelect(element)
{
    const groupsXhr = await request.get('/group');
    const groups = JSON.parse(groupsXhr.responseText);
    for (const g of groups)
    {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.innerHTML = g.name;
        element.appendChild(opt);
    }
}

function $(selector) {
    return document.querySelector(selector);
}
function c$(name) {
    return document.createElement(name);
}
function T(text) {
    return document.createTextNode(text);
}
function status(text) {
    const s = $('#status');
    if (!s)
        return;
    s.innerHTML = '';
    s.appendChild(T(text));
}

window.addEventListener('error', (e) => {
    console.log('Error', e);

    if (e.error instanceof XMLHttpRequest)
        status(`Request error: ${e.error.status} - ${e.error.responseText}`);
    else
        status(`Error: ${e.message}`);
});

/*
classes used:
- hidden
- show-if-logged-in
- show-if-own
- show-if-admin
- show-only-own
- show-if-group-color
- show-if-group-can_invite
- show-if-group-can_verify
*/
function revealHidden(own_page) {
    const logged_in = (local_user != null);
    document.querySelectorAll('.hidden').forEach((el) => {
        if (el.classList.contains('show-only-own') && !own_page)
            return;
        if (el.classList.contains('show-if-own') && !own_page && !is_admin)
            return;
        if (is_admin)
            return el.classList.remove('hidden');
        for (let i = 0; i < el.classList.length; ++i) {
            const c = el.classList[i];
            if (logged_in && (c == 'show-if-logged-in'))
                return el.classList.remove('hidden');
            if (c.startsWith('show-if-group-'))
                if (has_groups[c.substr('show-if-group-'.length)])
                    return el.classList.remove('hidden');
            if (c.startsWith('show-if-own') && own_page)
                return el.classList.remove('hidden');
        }
    });
}