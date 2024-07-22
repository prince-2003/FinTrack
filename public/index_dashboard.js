$(document).ready(function() {
    function fetchDataAndRenderChart() {
        $.ajax({
            url: '/chart',
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                const categories = data.map(item => item.category);
                console.log('Data:', categories);
                const seriesData = data.map(item => item.total);
                console.log('Data:', seriesData);
                var options = {
                    chart: {
                        type: 'pie',
                        height: 225
                    },
                    labels: categories,
                    dataLabels: {
                        enabled: true,
                        style: {
                            colors: ['#fff'], 
                            fontSize: '10px', 
                            fontFamily: 'Montserrat, sans-serif' 
                        }
                    },
                    stroke: {
                        show: true,
                        width: 2,
                        colors: ['transparent']
                    },
                    fill: {
                        opacity: 1
                    },
                    legend: {
                        labels: {
                            colors: '#fff', 
                            fontSize: '14px', 
                            fontFamily: 'Montserrat, sans-serif'
                        }
                    },
                    colors: ['#85ec68', '#ff5722', '#2196f3', '#ffc107', '#9c27b0'] // Example colors for pie slices
                };
                
                var chart = new ApexCharts(document.querySelector("#chart"), { ...options, series: seriesData });
                chart.render();
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
            }
        });
    }

    fetchDataAndRenderChart();

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

    // Reset form function
    function resetForm(formId) {
        document.getElementById(formId).reset();
    }

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
