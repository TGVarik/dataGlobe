$(document).ready(function(){
	$.get('/api/get-friends').then(function(response){
		var friends = JSON.parse(response);
		friends = friends.data;
		setInterval(function(){
			if(friends.length){
				window.drawing.createGraph(friends.pop());
			}
		}, 0)
	});

  $('.mutual').on('click', function(){
    $.get('/api/get-user').then(function(response){
      friendList = JSON.parse(response).friends;
      var getMutual = function(idArray){
        var currentFriend = idArray.pop();
        var payload = {id: currentFriend};
        $.post('/api/get-mutual', payload).then(function(response){
          console.log('response: ', response)
          var mutualList = JSON.parse(response);
          var loadMutual = function(list){
            var currentMutual = list.pop();
            window.drawing.addEdge(currentFriend, currentMutual);
            if(list.length){
              return loadMutual(list);
            } else {
              return;
            }
          }
          if(mutualList.length){
            loadMutual(mutualList);
          }
        })
        if(idArray.length){
            return getMutual(idArray);
        } else {
            return;
        }
      }
      getMutual(friendList);
    })
  });

  $('.connect').on('click', function(){
    $.get('/api/get-user').then(function(response){
      var user = JSON.parse(response);
      window.drawing.addUser(user, true);
    })
  });

  $('.fly').on('click', function(){
    $.get('/api/get-user').then(function(response){
      var friends = JSON.parse(response).friends;
      var current;
      var currentNode;
      var i = 0;
      setInterval(function(){
        if(i === friends.length){
          i = 0;
        }
        current = friends[i];
        currentNode = window.drawing.getNode(current);
        while(!currentNode){
          i += 1;
          if(i === friends.length){
            i = 0;
          }
          current = friends[i];
          currentNode = window.drawing.getNode(current);
          console.log('skipped: ',currentNode);
        }
        window.drawing.goToNode(current);
        FBData.get('newsFeed',current, function(data){
          data = JSON.parse(data);
          // display posts
          displayInfo(data);
        })
        i += 1;
      }, 4000)
    })
  });
  $('.newsFeed').on('click', function(){
    FBData.get('newsFeed', 'me', function(data){
      data = JSON.parse(data);
      console.log(data);
    })
  });
///// for info display //////////////////////////////////////////////////
var infoHTMLlog = [];
var $infoHTML = $('<div class="panel panel-default info-box"><div class="panel-heading info-header"></div><div class="panel-body info-data"></div></div>');
  var displayInfo = function(data){
    var $infoHTMLClone = $infoHTML.clone();
    var $info = $infoHTMLClone.find('.info-data');
    var header = $infoHTMLClone.find('.info-header');
    if(data.posts){
      var posts = data.posts.data;
      var num = Math.min(posts.length, 2);
      for(var i = 0; i < num; i++){
        var post = posts[i];
        header.text(post.from.name);
        if(post.message){
          $info.append('<p>'+post.message+'</p>')
          $info.append('<p>'+post.created_time+'</p>')
        }
        if(post.picture){
          $info.append('<img class="info-img" src="'+post.picture+'"></img>');
          $info.append('<p>'+post.created_time+'</p>')
        }
        if(post.story){
          $info.append('<p>'+post.story+'</p>');
          if(post.link){
            $info.append('<p><a href="'+post.link+'">Take a Look</a><p>')
            }
          }
        }
      } else {
        var name = window.drawing.getCurrent().data.name;
        header.text(name);
        $info.append('<p>No new updates.</p>');
      }
    $('.panel-wrapper').prepend($infoHTMLClone);
    infoHTMLlog.push($infoHTMLClone);
    if(infoHTMLlog.length > 2){
      infoHTMLlog[0].fadeOut("slow");
      infoHTMLlog.shift();
    }
  }
//////////////////////////////////////////////////////////////////////////
});