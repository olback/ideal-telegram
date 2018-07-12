/**
 *  encm © 2018
 */

'use strict';

class Encm {

    static addFriend(username, public_key) {

        let a = JSON.parse(window.localStorage.getItem('friends'));

        for (let f of a) {

            if (f.username === username) {

                return {
                    error: true,
                    msg: 'Friend already added'
                }

            }

        }

        a.push({
            username,
            public_key
        });

        window.localStorage.setItem('friends', JSON.stringify(a));

        return {
            error: false,
            msg: 'Friend added'
        }

    }

    static delFriend(username) {

        let a = JSON.parse(window.localStorage.getItem('friends'));

        for (let i = 0; i < a.length; i++) {

            if (a[i].username === username) {

                a.splice(i, 1);
                window.localStorage.setItem('friends', JSON.stringify(a));
                window.sessionStorage.removeItem(username);

                return {
                    error: false,
                    msg: 'Friend deleted'
                }

            }

        }

        return {
            error: true,
            msg: 'Friend not found'
        }

    }

    static updatePubkey(username, public_key) {

        let a = JSON.parse(window.localStorage.getItem('friends'));

        for (let i = 0; i < a.length; i++) {

            if (a[i].username === username) {

                a[i].public_key = public_key;
                window.localStorage.setItem('friends', JSON.stringify(a));

                return {
                    error: false,
                    msg: 'Friend updated'
                }

            }

        }

        return {
            error: true,
            msg: 'Friend not found'
        }

    }

    static isFriend(username) {

        let a = JSON.parse(window.localStorage.getItem('friends'));

        for (let i = 0; i < a.length; i++) {

            if (a[i].username === username) {
                return true;
            }

        }

    }

    static sessionStoreMessage(store, username, message) {

        if (window.sessionStorage.getItem(store) === null) {
            window.sessionStorage.setItem(store, '[]');
        }

        let a = JSON.parse(window.sessionStorage.getItem(store));

        a.push({
            from: username,
            message: message
        });

        // Only store 100 messages
        if (a.length > 100) {
            a.splice(0, 1);
        }

        window.sessionStorage.setItem(store, JSON.stringify(a));

    }

}

if (window.localStorage.getItem('friends') === null) {

    window.localStorage.setItem('friends', '[]');

}

if (window.localStorage.getItem('username') === null) {

    let p = null;

    while(!p) {

        p = prompt('Enter a username:');

    }

    window.localStorage.setItem('username', p);

}

if (window.localStorage.getItem('pgp.passphrase') === null) {

    window.localStorage.setItem('pgp.passphrase', window.crypto.getRandomValues(new Uint32Array(32)).join(''));

}

if (window.localStorage.getItem('pgp.public') === null || window.localStorage.getItem('pgp.private') === null) {

    let options = {
        userIds: [{
            name: 'olback'
        }], // multiple user IDs
        curve: 'ed25519',
        // numBits: 4096,
        passphrase: window.localStorage.getItem('pgp.passphrase') // protects the private key
    };

    openpgp.generateKey(options).then(key => {
        // privkey = key.privateKeyArmored; // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
        // pubkey = key.publicKeyArmored;   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
        // console.log('Private:', privkey);
        // console.log('Public:', pubkey);
        window.localStorage.setItem('pgp.private', key.privateKeyArmored);
        window.localStorage.setItem('pgp.public', key.publicKeyArmored);
    });

}
