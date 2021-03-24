$(document).ready( function(){
	$('.slider-wrapper').slick({
		slidesToShow: 4,
		infinite: false,
		arrows: false,
		prevArrow: $('.slider-prev'),
		nextArrow: $('.slider-next'),
		dots: false,
		responsive: [
			{
				breakpoint: 768,
				settings: {
					slidesToShow: 2,
					arrows: true,
					prevArrow: $('.slider-prev'),
					nextArrow: $('.slider-next')
				}
			},
			{
				breakpoint: 576,
				settings: {
					slidesToShow: 1,
					arrows: true,
					prevArrow: $('.slider-prev'),
					nextArrow: $('.slider-next')
				}
			}
		]			
	})
});