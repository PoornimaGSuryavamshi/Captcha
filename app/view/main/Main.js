/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Captcha.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'Captcha.view.main.MainController',
        'Captcha.view.main.MainModel',
        'Captcha.view.main.List'
    ],

    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'fa-th-list'
    },

    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },

    defaults: {
        bodyPadding: 20,
        tabConfig: {
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 120
                }
            }
        }
    },

    items: [{
        title: 'Home',
        iconCls: 'fa-home',
        // The following grid shares a store with the classic version's grid as well!
        items: [{
            xtype: 'mainlist'
        }]
    }, {
        title: 'Users',
        iconCls: 'fa-user',
        items: [{
            xtype: 'grid',
            title: 'Simpsons',
            store:
            {
                fields: ['name', 'email', 'phone'],
                data: [
                    { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                    { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                    { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                    { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
                ]
            },
            columns: [
                { text: 'Name', dataIndex: 'name' },
                { text: 'Email', dataIndex: 'email', flex: 1 },
                { text: 'Phone', dataIndex: 'phone' }
            ],
            height: 180,
            width: 400,
            scrollable: 'y'
        }]
    }, {
        title: 'Groups',
        iconCls: 'fa-users',
        items: [{
            xtype: 'panel',
            title: 'example',
            height: 150,
            scrollable: 'y',

            bodyStyle: {
                background: 'red',
                padding: '10px'
            },
            items: [{
                xtype: 'grid',
                title: 'Simpsons',
                store:
                {
                    fields: ['name', 'email', 'phone'],
                    data: [
                        { name: 'Lisa', email: 'lisa@simpsons.com', phone: '555-111-1224' },
                        { name: 'Bart', email: 'bart@simpsons.com', phone: '555-222-1234' },
                        { name: 'Homer', email: 'homer@simpsons.com', phone: '555-222-1244' },
                        { name: 'Marge', email: 'marge@simpsons.com', phone: '555-222-1254' }
                    ]
                },
                columns: [
                    { text: 'Name', dataIndex: 'name' },
                    { text: 'Email', dataIndex: 'email', flex: 1 },
                    { text: 'Phone', dataIndex: 'phone' }
                ],
                height: 300,
                width: 400,
                scrollable: 'y'
            }]

        }]
    }, {
        title: 'Settings',
        iconCls: 'fa-cog',
        bind: {
            html: '{loremIpsum}'
        }
    }]
});
