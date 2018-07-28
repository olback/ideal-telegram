/**
 *  encm © 2018
 */

'use strict';

const socket = io.connect(window.location.origin);

let online = [];
let typing = [];
let selected = null;

/*
 *  Define functions
 */
function toast(msg, time = 5000) {

    const dialog = document.getElementById('toast');
    dialog.innerHTML = msg;
    // dialog.show();
    dialog.style.display = 'block';

    setTimeout(() => {

        // dialog.close();
        dialog.style.display = 'none';

    }, time);

}

function modal(t, p) {

    const m = document.getElementById('modal');

    m.children[0].innerHTML = t;
    m.children[1].innerHTML = p;
    m.style.display = 'block';

    m.children[2].onclick = () => {
        m.style.display = 'none';
    }

}

function friendsList(username = null) {

    const fl = document.getElementById('friends-list');

    fl.innerHTML = '';

    // TODO: Clean up this mess...
    let a = JSON.parse(window.localStorage.getItem('friends'));
    for (let i = 0; i < a.length; i++) {

        if (a[i].username === username) {
            if (online.indexOf(a[i].username) >= 0) {
                fl.innerHTML += `<div class="friend active online">${escapeHtml(a[i].username)}</div>`;
            } else {
                fl.innerHTML += `<div class="friend active">${escapeHtml(a[i].username)}</div>`;
            }
        } else {
            // fl.innerHTML += `<div onclick="selectFriend('${a[i].username}')"class="friend">${a[i].username}</div>`;
            if (online.indexOf(a[i].username) >= 0) {
                if (a[i].unread) {
                    fl.innerHTML += `<div class="friend online unread" onclick="selectFriend('${escapeHtml(a[i].username)}')">${escapeHtml(a[i].username)}</div>`;
                } else {
                    fl.innerHTML += `<div class="friend online" onclick="selectFriend('${escapeHtml(a[i].username)}')">${escapeHtml(a[i].username)}</div>`;
                }
            } else {
                // fl.innerHTML += `<div class="friend" onclick="selectFriend('${escapeHtml(a[i].username)}')">${escapeHtml(a[i].username)}</div>`;
                if (a[i].unread) {
                    fl.innerHTML += `<div class="friend unread" onclick="selectFriend('${escapeHtml(a[i].username)}')">${escapeHtml(a[i].username)}</div>`;
                } else {
                    fl.innerHTML += `<div class="friend" onclick="selectFriend('${escapeHtml(a[i].username)}')">${escapeHtml(a[i].username)}</div>`;
                }
            }
        }
    }

}

function selectFriend(username = null) {

    let a = JSON.parse(window.localStorage.getItem('friends'));
    const h1 = document.getElementById('h1-name');

    if (typeof username === 'string') {

        for (let i = 0; i < a.length; i++) {

            if (a[i].username === username) {
                friendsList(a[i].username);
                h1.innerHTML = escapeHtml(a[i].username);
                selected = a[i].username;

                for (let f of a) {

                    if (f.username === username) {

                        f.unread = false;
                        localStorage.setItem('friends', JSON.stringify(a));

                    }

                }

            }

        }

    } else {

        if (a.length > 0) {
            friendsList(a[0].username);
            h1.innerHTML = escapeHtml(a[0].username);
            selected = a[0].username;
        } else {
            friendsList();
            h1.innerHTML = 'Chat';
            selected = null;
        }

    }

    renderChat(username);

}

function renderChat(username) {

    // <div class="message"><span>olback</span>message</div>

    const co = document.getElementById('chat-output');
    const cm = JSON.parse(window.sessionStorage.getItem(username));

    co.innerHTML = '';

    if (!username || cm === null) {
        co.innerHTML = '<div class="chat-info">No messages</div>';
        return;
    }

    for (let i = 0; i < cm.length; i++) {
        // co.innerHTML += `<div class="message"><span>${cm[i].from}</span>${cm[i].message}</div>`;
        appendChat(cm[i].from, cm[i].message);
    }

    co.scrollTo({
        top: co.scrollHeight,
        behavior: 'smooth'
    });

}

function appendChat(username, message) {

    const co = document.getElementById('chat-output');

    if (co.children.length === 1 && co.children[0].innerText === 'No messages' && co.children[0].classList.contains('chat-info')) {
        co.innerHTML = '';
    }

    co.innerHTML += `<div class="message"><span>${escapeHtml(username)}</span>${escapeChat(message)}</div>`;
    co.scrollTo({
        top: co.scrollHeight + 100,
        behavior: 'smooth'
    });

}

async function sendMessage(to, message) {

    if (to === null) {
        return toast('No receiver specified');
    }

    const from = window.localStorage.getItem('username');

    let m = {
        to: to,
        from: from,
        message: null
    }

    let friend = null;

    let a = JSON.parse(window.localStorage.getItem('friends'));

    for (let i = 0; i < a.length; i++) {

        if (a[i].username === to) {
            friend = a[i];
            break;
        }

    }

    const options = {
        data: message,
        publicKeys: openpgp.key.readArmored(atob(friend.public_key)).keys
    }

    openpgp.encrypt(options)
        .then(ciphertext => {
            m.message = btoa(ciphertext.data); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        })
        .then(() => {
            socket.emit('message', m);
            appendChat(m.from, message);
        });

}

function notify(title, body = undefined) {
    Notification.requestPermission(result => {
        if (result === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: body,
                    icon: '/img/icon.png',
                    vibrate: [200, 100, 200],
                    tag: 'encm'
                });
            });
            // Play sound
            new Audio('/audio/notif.ogg').play();
        }
    });
}

function setDarkTheme(b) {

    if (b) {

        // --backgound-color-main: #1f1f1f;
        // --background-color-secondary: #333;
        // --border-color: #222;
        // --text-color-primary: #ddd;
        // --text-color-primary-hover: #fff; 
        // --text-color-secondary: #ccc;
        // --text-bcolor-secondary-hover: #111;
        // --dialog-background-color: #111;
        // --input-bcolor: #565656;

        document.documentElement.style.setProperty('--background-color-main', '#1f1f1f');
        document.documentElement.style.setProperty('--background-color-secondary', '#333');
        document.documentElement.style.setProperty('--border-color', '#222');
        document.documentElement.style.setProperty('--text-color-primary', '#ddd');
        document.documentElement.style.setProperty('--text-color-primary-hover', '#fff');
        document.documentElement.style.setProperty('--text-color-secondary', '#ccc');
        document.documentElement.style.setProperty('--text-bcolor-secondary-hover', '#111');
        document.documentElement.style.setProperty('--dialog-background-color', '#111');
        document.documentElement.style.setProperty('--input-bcolor', '#565656');

        document.getElementById('theme-switch').classList.replace('fa-moon', 'fa-sun');
        // window.localStorage.setItem('dark', true);
        // window.localStorage.settings.dark = true;
        let s = JSON.parse(window.localStorage.getItem('settings'));
        s.dark = true;
        window.localStorage.setItem('settings', JSON.stringify(s));


    } else {

        // --background-color-main: #fff;
        // --background-color-secondary: #f9f9f9;
        // --border-color: #e9e9e9;
        // --text-color-primary: #333;
        // --text-color-primary-hover: #111;
        // --text-color-secondary: #555;
        // --text-bcolor-secondary-hover: #ccc;
        // --dialog-background-color: #555;
        // --input-bcolor: #fff;

        document.documentElement.style.setProperty('--background-color-main', '#fff');
        document.documentElement.style.setProperty('--background-color-secondary', '#f9f9f9');
        document.documentElement.style.setProperty('--border-color', '#e9e9e9');
        document.documentElement.style.setProperty('--text-color-primary', '#333');
        document.documentElement.style.setProperty('--text-color-primary-hover', '#111');
        document.documentElement.style.setProperty('--text-color-secondary', '#555');
        document.documentElement.style.setProperty('--text-bcolor-secondary-hover', '#ccc');
        document.documentElement.style.setProperty('--dialog-background-color', '#555');
        document.documentElement.style.setProperty('--input-bcolor', '#fff');

        // document.getElementById('theme-switch').classList.replace('fa-moon', 'fa-sun');
        document.getElementById('theme-switch').classList.replace('fa-sun', 'fa-moon');
        // window.localStorage.setItem('dark', false);
        let s = JSON.parse(window.localStorage.getItem('settings'));
        s.dark = false;
        window.localStorage.setItem('settings', JSON.stringify(s));

    }

}

function escapeChat(unsafe, allowed = ['b', 'i', 'strong', 'em']) {

    // return unsafe
    // .replace(/&/g, "&amp;")
    // .replace(/</g, "&lt;")
    // .replace(/>/g, "&gt;")
    // .replace(/"/g, "&quot;")
    // .replace(/'/g, "&#039;")
    // .replace(/(https?:\/\/[^\s]+)/g, url => {
    //     return '<a href="' + url + '">' + url + '</a>';
    // });

    let str =  escapeHtml(unsafe)
    // .replace(/(https?:\/\/[^\s]+)/g, url => {
    .replace(/([a-zA-Z]{2,10}:\/\/[^\s]+)/g, url => {
        return '<a target="_blank" rel="noopener" href="' + url + '">' + url + '</a>';
    });

    for (let c of allowed) {

        const reg1 = new RegExp(`&lt;${c}&gt;`, 'g');
        str = str.replace(reg1, `<${c}>`);

        const reg2 = new RegExp(`&lt;/${c}&gt;`, 'g');
        str = str.replace(reg2, `</${c}>`);

    }

    return str;

}

function escapeHtml(unsafe) {
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/*
 *  Event listeners
 */
document.getElementById('send').onclick = () => {

    const i = document.getElementById('new-message');

    if (i.value.trim() === '') {
        toast('Cannot send empty messages');
        return;
    }

    if (selected === null) {
        return toast('No receiver specified');
    }

    sendMessage(selected, i.value);
    Encm.sessionStoreMessage(selected, window.localStorage.getItem('username'), i.value);
    i.value = '';

}

document.getElementById('new-message').onkeypress = e => {

    if (e.code === 'Enter') {

        document.getElementById('send').onclick();
        // document.getElementById('send').focus();

    }
}

document.getElementById('new-message').onfocus = () => {

    if (selected !== null) {

        let m = {
            to: selected,
            from: window.localStorage.getItem('username'),
            typing: true
        }

        socket.emit('typing', m);

    }

}

document.getElementById('new-message').onblur = () => {

    if (selected !== null) {

        let m = {
            to: selected,
            from: window.localStorage.getItem('username'),
            typing: false
        }

        socket.emit('typing', m);

    }

}

document.getElementById('open-delete').onclick = () => {

    const m = document.getElementById('delete-friend');
    const i = document.getElementById('delete-input');
    const b = document.getElementById('delete-button');

    m.style.display = 'block';

    b.onclick = () => {

        if (i.value !== '') {

            const r = Encm.delFriend(i.value);

            toast(r.msg);

            if (i.value === selected) {
                selected = null;
            }

            if (!r.error) {
                selectFriend(selected);
                i.value = '';
                b.innerHTML = 'Close';
            }

            m.style.display = 'none';

        } else {

            m.style.display = 'none';

        }

    }

    i.onkeyup = () => {

        if (i.value !== '') {
            b.innerHTML = 'Delete';
        } else {
            b.innerHTML = 'Close';
        }

    }

}

document.getElementById('open-export-json').onclick = () => {

    const j = {
        username: window.localStorage.getItem('username'),
        public_key: btoa(window.localStorage.getItem('pgp.public'))
    }

    modal('Export', `<code>${JSON.stringify(j)}</code>`);

}

document.getElementById('add-friend').onclick = () => {

    const m = document.getElementById('import');
    const i = document.getElementById('import-json');
    const b = document.getElementById('import-json-button');


    b.onclick = () => {

        if (i.value !== '') {

            try {

                const j = JSON.parse(i.value);

                if (Encm.isFriend(j.username)) {
                    m.style.display = 'none';
                    throw `${j.username} is already in your friends list.`;
                }

                Encm.addFriend(j.username, j.public_key);
                m.style.display = 'none';
                toast(`Contact successfully ${j.username} imported.`);
                i.value = '';
                selectFriend(selected);
                b.innerHTML = 'Close';

            } catch (e) {

                toast(e);

            }

        } else {

            m.style.display = 'none';

        }

    }

    i.onkeyup = () => {

        if (i.value !== '') {
            b.innerHTML = 'Import';
        } else {
            b.innerHTML = 'Close';
        }

    }

    m.style.display = 'block';

}

document.getElementById('theme-switch').onclick = e => {

    if (e.target.classList.contains('fa-sun')) {

        setDarkTheme(false);

    } else {

        setDarkTheme(true);

    }

    // setDarkTheme(!window.localStorage.getItem('dark'));

}

/*
 *  Run on load
 */

selectFriend();
renderChat(selected);

socket.on('message', async (data) => {

    const passphrase = window.localStorage.getItem('pgp.passphrase');
    const privKeyObj = openpgp.key.readArmored(window.localStorage.getItem('pgp.private')).keys[0];
    await privKeyObj.decrypt(passphrase);

    const options = {
        message: openpgp.message.readArmored(atob(data.message)), // parse armored message
        privateKeys: [privKeyObj] // for decryption
    }

    openpgp.decrypt(options).then(plaintext => {
        //console.log(plaintext.data);
        if (data.from === selected) {
            appendChat(data.from, plaintext.data);
        }
        Encm.sessionStoreMessage(data.from, data.from, plaintext.data);
        notify(`New message from ${data.from}`, plaintext.data);
        return plaintext.data;
    });

    if (data.from !== selected) {

        const fl = JSON.parse(localStorage.getItem('friends'));

        for (let f of fl) {

            if (f.username === data.from) {
                f.unread = true;
                localStorage.setItem('friends', JSON.stringify(fl));
            }

        }

    }

});

socket.on('typing', data => {

    const i = document.getElementById('new-message');

    if (data.typing) {
        // i.placeholder = `${data.from} is typing...`;
        typing.push(data.from);
    } else {
        // i.placeholder = 'Message...';
        let index = typing.indexOf(data.from);
        if (index >= 0) typing.splice(index, 1);
    }

    if (typing.length > 0) {
        i.placeholder = `${typing.join(', ')} is typing...`;
    } else {
        i.placeholder = 'Message...'
    }

});

socket.on('online', data => {

    friendsList(selected);
    online = data;

});

socket.on('err', data => {

    toast(data.msg);

});

// Request permission to use notifications
if (Notification.permission !== 'granted') {

    Notification.requestPermission(p => {

        if (p === 'granted') {

            toast('Notifications enabled');

        } else {

            toast('Notifications disabled');

        }

    });

}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        }).then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.error('ServiceWorker registration failed: ', err);
        });
    });
}

// Handle theme settings
if (window.localStorage.getItem('settings') === null) {

    window.localStorage.setItem('settings', JSON.stringify({
        dark: false
    }));

} else {

    let s = JSON.parse(window.localStorage.getItem('settings'));

    setDarkTheme(s.dark);

}

// Make sure to let the server know we're alive
socket.emit('login', window.localStorage.getItem('username'));
setInterval(() => {
    socket.emit('login', window.localStorage.getItem('username'));
}, 1E3) // 6E4
