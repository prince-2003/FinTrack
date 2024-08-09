$(document).ready(function() {
    $('#showSignup').on('click', function(e) {
        e.preventDefault();
        $('#loginForm').addClass('hidden');
        $('#signupForm').removeClass('hidden');
    });

    $('#showLogin').on('click', function(e) {
        e.preventDefault();
        $('#signupForm').addClass('hidden');
        $('#loginForm').removeClass('hidden');
    });

    window.showHiddenSection = function() {
        var signupForm = $('#signupForm');
        var fullName = signupForm.find('input[name="fullName"]').val().trim();
        var userId = signupForm.find('input[name="userId"]').val().trim();
        var email = signupForm.find('input[name="email"]').val().trim();
        var password = signupForm.find('input[name="password"]').val().trim();
        // Check if all fields are filled
        if (fullName && userId && email && password) {
            $('.user').addClass('hidden');
            // Update h1 text
            $('h1').text(`Hi, ${fullName}`);
            
            // Hide social icons
            $('.social-icons').addClass('hidden');
            
            // Update form message text
            $('.form-message-container span').text('Setup your dashboard');
            $('.portfolio').removeClass('hidden');
        } else {
            alert('Please fill in all the fields.');
        }
       
    };
    
});
