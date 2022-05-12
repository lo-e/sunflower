(function() {
    @require      https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js

    $('.abc').each(function (index, element) {
        console.log('yes each')
        return false
    })
    console.log('v0.0.8')
})()