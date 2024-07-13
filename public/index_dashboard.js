$(document).ready(function() {
  $('.links a').each(function() {
    const img = $(this).find('img');;
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