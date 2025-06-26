Ext.define('Captcha.store.Personnel', {
    extend: 'Ext.data.Store',

    alias: 'store.personnel',

    // model: 'Captcha.model.Personnel',
    fields: ['id', 'show'],
    data: [
        { id: 0, show: 'Battlestar Galactica' },
        { id: 1, show: 'Doctor Who' },
        { id: 2, show: 'Farscape' },
        { id: 3, show: 'Firefly' },
        { id: 4, show: 'Star Trek' },
        { id: 5, show: 'Star Wars: Christmas Special' }
    ],

    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            rootProperty: 'items'
        }
    }
});
