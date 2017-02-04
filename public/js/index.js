// 导航切换
$('.navbar-nav').children('li')
    .on('click', function() {
        $(this).addClass('active')
            .siblings().removeClass('active');
    })
