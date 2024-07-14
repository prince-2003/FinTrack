$(document).ready(function() {
    $('section').each(function() {
        var sectionId = $(this).attr('id');
        var topMenuHeight = $(this).outerHeight() + 15;
        $(".sidebar").css("height", topMenuHeight);
    
        var links = $('.links a');
    
        links.each(function() {
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
    
    



  $('.card').each(function() {
      const img = $(this).find('.card-img');
      const originalSrc = img.attr('src');
      const hoverSrc = img.data('hover-img');

      $(this).hover(
          function() {
              console.log(`Hovering over: ${originalSrc}`);
              img.attr('src', hoverSrc);
          },
          function() {
              console.log(`Mouse out: ${originalSrc}`);
              img.attr('src', originalSrc);
          }
      );
  });
  
});