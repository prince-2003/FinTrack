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
    
    // $.ajax({
    //     url: 'http://localhost:3000/transactions', // Replace with your actual API endpoint
    //     method: 'GET',
    //     dataType: 'json',
    //     success: function(data) {
    //         console.log('Data fetched:', data); // Log the fetched data for debugging
    //         const transactionsDiv = $('#transactions');
    //         if (data && data.length > 0) {
    //             data.forEach(transaction => {
    //                 console.log('Processing transaction:', transaction); // Log each transaction
    //                 const transactionCard = $('<div>').addClass('transaction-card');
    //                 transactionCard.html(`
    //                     <div>Amount: &#8377; ${transaction.amount}</div>
    //                     <div>Type: ${transaction.type}</div>
    //                 `);
    //                 transactionsDiv.append(transactionCard);
    //             });
    //         } else {
    //             console.log('No transactions found'); // Log if no transactions are found
    //             transactionsDiv.html('<p>No transactions found</p>');
    //         }
    //     },
    //     error: function(error) {
    //         console.error('Error fetching transactions:', error); // Log error details
    //         $('#transactions').html('<p>Failed to load transactions</p>');
    //     }
    // });

    var modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("openModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Optional: Handle form submission here
    document.getElementById("transactionForm").onsubmit = function(event) {
        event.preventDefault();
        // Handle form data submission (e.g., via AJAX or other methods)
        // Close the modal after submission
        modal.style.display = "none";
    }


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