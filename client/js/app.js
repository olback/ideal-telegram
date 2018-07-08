/**
 *  encm © 2018
 */

const socket = io.connect('http://localhost:5000');

let online = [];
let selected = null;

// Define functions
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

    let a = JSON.parse(window.localStorage.getItem('encm.friends'));
    for (let i = 0; i < a.length; i++) {

        if (a[i].username === username) {
            fl.innerHTML += `<div class="friend active">${a[i].username}</div>`;
        } else {
            fl.innerHTML += `<div onclick="selectFriend('${a[i].username}')"class="friend">${a[i].username}</div>`;
        }
    }

}

function selectFriend(username = null) {

    let a = JSON.parse(window.localStorage.getItem('encm.friends'));
    const h1 = document.getElementById('h1-name');

    if (typeof username === 'string') {

        for (let i = 0; i < a.length; i++) {

            if (a[i].username === username) {
                friendsList(a[i].username);
                h1.innerHTML = a[i].username;
                selected = a[i].username;
            }

        }

    } else {

        if (a.length > 0) {
            friendsList(a[0].username);
            h1.innerHTML = a[0].username;
            selected = a[0].username;
        } else {
            friendsList();
            h1.innerHTML = 'Chat';
            selected = null;
        }

    }

}

// Add event listeners
document.getElementById('open-delete').onclick = () => {

    const m = document.getElementById('delete-friend');
    const i = document.getElementById('delete-input');
    const b = document.getElementById('delete-button');

    m.style.display = 'block';

    b.onclick = () => {

        if (i.value !== '') {

            const r = Encm.delFriend(i.value);
            console.log(r);

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

    i.onkeyup = (e) => {

        if (i.value !== '') {
            b.innerHTML = 'Delete';
        } else {
            b.innerHTML = 'Close';
        }

    }

}

document.getElementById('open-export-json').onclick = () => {

    const j = {
        username: window.localStorage.getItem('encm.name'),
        public_key: btoa(window.localStorage.getItem('pgp.public'))
    }

    modal('Export', `<code>${JSON.stringify(j)}</code>`);

}

document.getElementById('open-import-json').onclick = () => {

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

    i.onkeyup = (e) => {

        if (i.value !== '') {
            b.innerHTML = 'Import';
        } else {
            b.innerHTML = 'Close';
        }

    }

    m.style.display = 'block';

}
document.getElementById('add-friend').onclick = document.getElementById('open-import-json').onclick;


// friendsList();
selectFriend();

///////////////////////////////////////////////////////////////////////////

const encryptDecryptFunction = async() => {
    const passphrase = window.localStorage.getItem('pgp.passphrase');
    const privKeyObj = openpgp.key.readArmored(window.localStorage.getItem('pgp.private')).keys[0];
    await privKeyObj.decrypt(passphrase);
    
    const options = {
        data: 'Hello, World!',                             // input as String (or Uint8Array)
        publicKeys: openpgp.key.readArmored(window.localStorage.getItem('pgp.public')).keys,  // for encryption
    }
    
    openpgp.encrypt(options).then(ciphertext => {
        encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        return encrypted;
    })
    .then(encrypted => {
        const options = {
            message: openpgp.message.readArmored(encrypted),     // parse armored message
            privateKeys: [privKeyObj]                            // for decryption
        }
         
        openpgp.decrypt(options).then(plaintext => {
            console.log(plaintext.data);
            return plaintext.data; // 'Hello, World!'
        })
       
    });
}

// encryptDecryptFunction();



