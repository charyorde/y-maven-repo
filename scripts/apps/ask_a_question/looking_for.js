$j(function() {
    var yes = $j('#ask_a_question_looking_for_yes');
    yes.click(function(e) {
        e.preventDefault();
        $j(this).parents('.jive-info-box').fadeOut();
    });
});
