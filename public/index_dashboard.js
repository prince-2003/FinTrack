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
      
      
    

    
    $('section').each(function() {
        var sectionId = $(this).attr('id');
        var topMenuHeight = $(this).outerHeight() + 15;

        
        var viewportHeight = $(window).height();
        var sidebarHeight = topMenuHeight < viewportHeight ? viewportHeight : topMenuHeight;
        console.log('topMenuHeight:', topMenuHeight);
        console.log('viewportHeight:', viewportHeight);

        
        $(".sidebar").css("height", sidebarHeight);

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
    $('#type').change(function() {
        if ($(this).val() === 'credit') {
            $('#category').hide().prop('disabled', true);  
            $('#category-credit').show().prop('disabled', false); 
        } else {
            $('#category').show().prop('disabled', false);  
            $('#category-credit').hide().prop('disabled', true);  
        }
    });

    
    $('#category-credit').prop('disabled', true).hide(); 
    $('#category').prop('disabled', false).show();  

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
