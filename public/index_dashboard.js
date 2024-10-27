$(document).ready(function() {

    function getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    const error = getQueryParam('error');
    if (error) {
        alert(error);
    }

    const currentPath = window.location.pathname;

 
    $(".links a").each(function() {
        if ($(this).attr("href") === currentPath) {
            $(this).addClass("active");
            $(this).find("svg").removeClass("text-[#405052]").addClass("text-[#002226]"); 

        }
    });

    $('.logout-link').on('click', function(event) {
        event.preventDefault();

        $.ajax({
            url: '/logout',
            type: 'POST',
            success: function(response) {
                if (response.success) {
                    window.location.href = '/login'; 
                }
            },
            error: function(xhr, status, error) {
                console.error('Logout failed:', error);
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

    $('.delete-btn').on('click', function() {
        const transactionId = $(this).data('transaction-id');
        deleteTransaction(transactionId);
    });

    function deleteTransaction(transactionId) {
        $.ajax({
            url: `/delete_transaction?transactionId=${transactionId}`,
            type: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(response) {
                // Check for success in response
                if (response.success) {
                    window.location.reload(); // Reload page on success
                } else {
                    alert('Failed to delete transaction: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error deleting transaction:', error);
                alert('Error deleting transaction: ' + error);
            }
        });
    }
    
});
