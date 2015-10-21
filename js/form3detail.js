var id = localStorage.getItem('id');
var data;

$( document ).ready(function() {
  $.getJSON('/data.json', function(data) {
    $.each(data.touristdata.attractions, function(index, value) {
      if (value.id == id) {
        data = value;
        bindUI(data);
      }
    });

  });
});


function bindUI(data) {
  $('#navBarTitle').text(data.name);
  $('#desc').text(data.description);
  $('#openinghours').text(data.openinghours);
  $('#phone').attr('href','tel:' + data.phone);
  $('#attractionImage').attr('src', data.photo);
}
