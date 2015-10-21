$( document ).ready(function() {
	$.getJSON('/data.json', function(data) {
		$.each(data.touristdata.attractions, function(index, value) {
		   $('#attractions').append("<a onclick='goToDetail(" + value.id + ")' style='color:inherit' href='form3detail.html'><li style='list-style:none' class='collection-item avatar'><img class = 'circle' src = '" + value.photo + "' /><span class='title'>" + value.name + "</span><p>" + value.address + "</p></li></a>");
		});

 	 });
});


function goToDetail(id) {
  localStorage.setItem('id', id);
  return true;
}
