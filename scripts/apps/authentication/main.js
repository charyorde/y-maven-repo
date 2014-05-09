/**
 * jive.Authentication.Main
 *
 * Main class for controlling XHR-based user authentication.
 *
 * @depends path=/resources/scripts/apps/authentication/views/login_modal_view.js
 * @depends path=/resources/scripts/apps/authentication/models/authentication_source.js
 */

jive.namespace('Authentication');

jive.Authentication.Main = jive.oo.Class.extend(function(protect) {

    this.init = function(options) {

        var main = this;
        main.options = options;

        $j(function () {
            main.authenticationSource = options.authenticationSource || new jive.Authentication.Source();
            main.loginModalView = new jive.Authentication.LoginModalView(options);

            main.loginModalView.addListener('login', function (credentials, promise) {
                main.authenticationSource.login(credentials).addCallback(function () {
                    promise.emitSuccess();
                });
            });
        });

    };


});