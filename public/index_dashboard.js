$(document).ready(function() {

    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    const error = getQueryParam('error');
    if (error) {
        alert(error);
    }
    
    $('#logout-link').on('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
      
        $.ajax({
          url: '/logout',
          type: 'POST',
          success: function(response) {
            if (response.success) {
              window.location.href = '/login'; // Redirect to the login page
            }
          },
          error: function(xhr, status, error) {
            console.error('Logout failed:', error);
          }
        });
      });
      
      
    

    // Handle sidebar link hover and active state
    $('section').each(function() {
        var sectionId = $(this).attr('id');
        var topMenuHeight = $(this).outerHeight() + 15;
        $(".sidebar").css("height", topMenuHeight);
    
        $('.links a').each(function() {
            var link = $(this);
            var img = link.find('img');
            var linkText = link.text().trim();
            var originalSrc = img.attr('src');
            var hoverSrc = img.data('hover-img');
    
            link.hover(
                function() {
                    img.attr('src', hoverSrc);
                },
                function() {
                    if (!link.hasClass('active')) {
                        img.attr('src', originalSrc);
                    }
                }
            );
    
            if (linkText === sectionId) {
                link.addClass('active');
                img.attr('src', hoverSrc);
            } else {
                link.removeClass('active');
                img.attr('src', originalSrc);
            }
        });
    });

    // Handle modal functionality
    var modal = $("#myModal");
    var btn = $(".open");
    var span = $(".close");

    btn.click(function() {
        modal.show();
    });
    span.click(function() {
        modal.hide();
    });
    $(window).click(function(event) {
        if ($(event.target).is(modal)) {
            modal.hide();
        }
    });

    // Handle card hover effect
    $('.card').each(function() {
        const img = $(this).find('.card-img');
        const originalSrc = img.attr('src');
        const hoverSrc = img.data('hover-img');

        $(this).hover(
            function() {
                img.attr('src', hoverSrc);
            },
            function() {
                img.attr('src', originalSrc);
            }
        );
    });
});
