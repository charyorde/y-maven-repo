/**
 * Olark chat integration controller
 */
$j(function() {
    var user = $j('body').data('user');

    // initialize chat
    olark.identify($j(document.body).data('chatKey'));

    // opens all links in chat in a new window
    $j('body').on('click', 'a', function(e) {
        e.preventDefault();
        window.open(this.getAttribute('href'));
    });

    // Automatically send the user name and email address
    // TODO possibly need to trigger once per visit
    olark('api.visitor.updateEmailAddress', { emailAddress: user.email });
    olark('api.visitor.updateFullName', { fullName: user.displayName });

    // Listen for messages from the Operater
    olark('api.chat.onMessageToVisitor', function() {
        $j(document.body).trigger('onMessageToVisitor');
    });
});
